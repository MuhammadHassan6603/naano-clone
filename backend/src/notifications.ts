import { db } from './db.js'
import type { Tx } from './escrow.js'
import type { VerifiedVia } from './generated/prisma/enums.js'

export type BookingParties = {
  id: string
  priceCents: number
  brand: { id: string; name: string }
  creator: { id: string; name: string }
}

export type BookingEvent =
  | { kind: 'booked' }
  | { kind: 'accepted' }
  | { kind: 'declined' }
  | { kind: 'expired' }
  | { kind: 'submitted' }
  | { kind: 'paid'; via: VerifiedVia }

type Note = { userId: string; kind: string; title: string; body: string; link: string }

const wholeMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const exactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const money = (cents: number) => (cents % 100 === 0 ? wholeMoney : exactMoney).format(cents / 100)
const first = (name: string) => name.trim().split(/\s+/)[0] ?? name

export function bookingNotes(booking: BookingParties, event: BookingEvent): Note[] {
  const link = `/dashboard/bookings/${booking.id}`
  const price = money(booking.priceCents)
  const brand = booking.brand.name
  const creator = booking.creator.name
  const toBrand = (title: string, body: string) => ({ userId: booking.brand.id, kind: event.kind, title, body, link })
  const toCreator = (title: string, body: string) => ({ userId: booking.creator.id, kind: event.kind, title, body, link })

  switch (event.kind) {
    case 'booked':
      return [toCreator(`New booking from ${brand}`, `${price} is already held in escrow for you. Accept or decline the brief.`)]
    case 'accepted':
      return [toBrand(`${creator} accepted your brief`, `${first(creator)} is writing the post. Your ${price} stays in escrow until it is verified.`)]
    case 'declined':
      return [toBrand(`${creator} declined your booking`, `The full ${price} is back in your available balance.`)]
    case 'expired':
      return [
        toBrand(`Booking with ${creator} expired`, `No post before the deadline, so the full ${price} was refunded to you.`),
        toCreator(`Booking from ${brand} expired`, `The deadline passed without a post, so ${brand} was refunded.`),
      ]
    case 'submitted':
      return [toBrand(`${creator} posted`, `Check the post and approve it to pay ${price}. It is approved automatically after 72 hours.`)]
    case 'paid': {
      const why = {
        brand: `${brand} approved your post.`,
        click: 'A real reader clicked your tracked link, so the post was verified.',
        timeout: '72 hours passed without an objection, so the post was approved automatically.',
      }[event.via]
      const notes = [toCreator(`You were paid ${price}`, why)]
      if (event.via !== 'brand') {
        notes.push(
          toBrand(
            `Post by ${creator} verified`,
            event.via === 'click' ? `A reader clicked the tracked link, so ${price} was released to ${first(creator)}.` : `72 hours passed, so ${price} was released to ${first(creator)}.`,
          ),
        )
      }
      return notes
    }
  }
}

export async function notify(tx: Tx, notes: Note[], at: Date) {
  if (notes.length) await tx.notification.createMany({ data: notes.map((note) => ({ ...note, createdAt: at })) })
}

export async function notifyBooking(tx: Tx, bookingId: string, event: BookingEvent, at: Date) {
  const booking = await tx.booking.findUniqueOrThrow({
    where: { id: bookingId },
    select: { id: true, priceCents: true, brand: { select: { id: true, name: true } }, creator: { select: { id: true, name: true } } },
  })
  await notify(tx, bookingNotes(booking, event), at)
}

export function messageNote(booking: BookingParties, senderId: string, body: string): Note {
  const fromBrand = senderId === booking.brand.id
  const sender = fromBrand ? booking.brand.name : booking.creator.name
  const flat = body.replace(/\s+/g, ' ').trim()
  return {
    userId: fromBrand ? booking.creator.id : booking.brand.id,
    kind: 'message',
    title: `New message from ${sender}`,
    body: flat.length > 140 ? `${flat.slice(0, 140).trimEnd()}…` : flat,
    link: `/dashboard/bookings/${booking.id}`,
  }
}

const LIST_LIMIT = 30

const view = (row: { id: string; kind: string; title: string; body: string; link: string; createdAt: Date; readAt: Date | null }) => ({
  id: row.id,
  kind: row.kind,
  title: row.title,
  body: row.body,
  link: row.link,
  createdAt: row.createdAt,
  read: row.readAt !== null,
})

export async function listNotifications(userId: string, since?: Date) {
  const [rows, unread] = await Promise.all([
    db.notification.findMany({
      where: { userId, ...(since && { createdAt: { gt: since } }) },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: LIST_LIMIT,
    }),
    db.notification.count({ where: { userId, readAt: null } }),
  ])
  return { notifications: rows.map(view), unread }
}

export async function markRead(userId: string, ids?: string[]) {
  await db.notification.updateMany({ where: { userId, readAt: null, ...(ids && { id: { in: ids } }) }, data: { readAt: new Date() } })
  return db.notification.count({ where: { userId, readAt: null } })
}
