import { db } from './db.js'
import { unreadByBooking } from './messages.js'
import type { Prisma } from './generated/prisma/client.js'
import type { BookingStatus, Role, VerifiedVia } from './generated/prisma/enums.js'

export const BOOKING_STATUSES = ['requested', 'accepted', 'submitted', 'paid', 'refunded'] as const satisfies readonly BookingStatus[]

const party = { select: { id: true, name: true } } as const

const bookingSelect = {
  id: true,
  status: true,
  brief: true,
  destinationUrl: true,
  priceCents: true,
  deadline: true,
  postUrl: true,
  trackingCode: true,
  verifiedVia: true,
  refundReason: true,
  createdAt: true,
  acceptedAt: true,
  submittedAt: true,
  closedAt: true,
  brand: party,
  creator: party,
} satisfies Prisma.BookingSelect

type BookingRow = Prisma.BookingGetPayload<{ select: typeof bookingSelect }>

export type TimelineEvent = {
  at: Date
  event: 'booked' | 'accepted' | 'submitted' | 'verified' | 'paid' | 'declined' | 'expired' | 'refunded'
  via?: VerifiedVia
}

function timeline(row: BookingRow): TimelineEvent[] {
  const events: TimelineEvent[] = [{ at: row.createdAt, event: 'booked' }]
  if (row.acceptedAt) events.push({ at: row.acceptedAt, event: 'accepted' })
  if (row.submittedAt) events.push({ at: row.submittedAt, event: 'submitted' })
  if (row.closedAt && row.status === 'paid' && row.verifiedVia) {
    events.push({ at: row.closedAt, event: 'verified', via: row.verifiedVia }, { at: row.closedAt, event: 'paid' })
  }
  if (row.closedAt && row.status === 'refunded') {
    events.push(
      row.refundReason === 'expired'
        ? { at: row.deadline, event: 'expired' }
        : { at: row.closedAt, event: 'declined' },
      { at: row.closedAt, event: 'refunded' },
    )
  }
  return events
}

function toPublic({ trackingCode, ...row }: BookingRow, trackingBase: string) {
  return {
    ...row,
    trackingUrl: row.acceptedAt ? `${trackingBase}/r/${trackingCode}` : null,
  }
}

export type PublicBooking = ReturnType<typeof toPublic>

export async function findBooking(id: string, trackingBase: string) {
  const row = await db.booking.findUnique({ where: { id }, select: bookingSelect })
  return row && { ...toPublic(row, trackingBase), timeline: timeline(row) }
}

export async function listBookings(
  viewer: { userId: string; role: Role },
  status: BookingStatus | undefined,
  trackingBase: string,
) {
  const rows = await db.booking.findMany({
    where: {
      ...(viewer.role === 'brand' ? { brandId: viewer.userId } : { creatorId: viewer.userId }),
      ...(status && { status }),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: bookingSelect,
  })
  const unread = await unreadByBooking(viewer.userId, rows.map((row) => row.id))
  return rows.map((row) => ({ ...toPublic(row, trackingBase), unreadMessages: unread.get(row.id) ?? 0 }))
}
