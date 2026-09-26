import { db } from './db.js'
import { HttpError } from './errors.js'
import { messageNote, notify } from './notifications.js'
import { TX_LIMITS } from './escrow.js'

export const MAX_MESSAGE_CHARS = 2000
export const MAX_MESSAGES_PER_MINUTE = 20
const THREAD_LIMIT = 200

export type MessageView = { id: string; body: string; createdAt: Date; sender: { id: string; name: string }; mine: boolean }

const messageSelect = { id: true, body: true, createdAt: true, sender: { select: { id: true, name: true } } } as const

const view = (viewerId: string) => (row: Omit<MessageView, 'mine'>): MessageView => ({ ...row, mine: row.sender.id === viewerId })

async function markRead(bookingId: string, userId: string, upTo: Date) {
  await db.$executeRaw`
    INSERT INTO message_reads (booking_id, user_id, read_at) VALUES (${bookingId}::uuid, ${userId}::uuid, ${upTo})
    ON CONFLICT (booking_id, user_id) DO UPDATE SET read_at = GREATEST(message_reads.read_at, EXCLUDED.read_at)`
}

export async function readThread(bookingId: string, viewerId: string): Promise<MessageView[]> {
  const rows = await db.message.findMany({
    where: { bookingId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: THREAD_LIMIT,
    select: messageSelect,
  })
  if (rows.length) await markRead(bookingId, viewerId, rows[0].createdAt)
  return rows.reverse().map(view(viewerId))
}

const recent = new Map<string, number[]>()

function rateLimit(userId: string) {
  const now = Date.now()
  const times = (recent.get(userId) ?? []).filter((at) => now - at < 60_000)
  if (times.length >= MAX_MESSAGES_PER_MINUTE) {
    recent.set(userId, times)
    throw new HttpError(429, 'You are sending messages very quickly. Please wait a moment and try again.')
  }
  times.push(now)
  recent.set(userId, times)
}

export async function sendMessage(bookingId: string, senderId: string, body: string): Promise<MessageView> {
  rateLimit(senderId)
  const row = await db.$transaction(async (tx) => {
    const created = await tx.message.create({ data: { bookingId, senderId, body }, select: messageSelect })
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id: bookingId },
      select: { id: true, priceCents: true, brand: { select: { id: true, name: true } }, creator: { select: { id: true, name: true } } },
    })
    await notify(tx, [messageNote(booking, senderId, body)], created.createdAt)
    return created
  }, TX_LIMITS)
  await markRead(bookingId, senderId, row.createdAt)
  return view(senderId)(row)
}

export async function unreadByBooking(userId: string, bookingIds: string[]): Promise<Map<string, number>> {
  if (!bookingIds.length) return new Map()
  const rows = await db.$queryRaw<{ booking_id: string; unread: number }[]>`
    SELECT m.booking_id, count(*)::int AS unread
    FROM messages m
    LEFT JOIN message_reads r ON r.booking_id = m.booking_id AND r.user_id = ${userId}::uuid
    WHERE m.booking_id = ANY(${bookingIds}::uuid[])
      AND m.sender_id <> ${userId}::uuid
      AND (r.read_at IS NULL OR m.created_at > r.read_at)
    GROUP BY m.booking_id`
  return new Map(rows.map((row) => [row.booking_id, row.unread]))
}

export async function unreadTotal(userId: string): Promise<number> {
  const [row] = await db.$queryRaw<{ unread: number }[]>`
    SELECT count(*)::int AS unread
    FROM messages m
    JOIN bookings b ON b.id = m.booking_id AND (b.brand_id = ${userId}::uuid OR b.creator_id = ${userId}::uuid)
    LEFT JOIN message_reads r ON r.booking_id = m.booking_id AND r.user_id = ${userId}::uuid
    WHERE m.sender_id <> ${userId}::uuid
      AND (r.read_at IS NULL OR m.created_at > r.read_at)`
  return row?.unread ?? 0
}
