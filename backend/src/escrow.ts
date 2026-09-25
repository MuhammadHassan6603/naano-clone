import { randomBytes } from 'node:crypto'
import { db } from './db.js'
import { env } from './env.js'
import { HttpError, conflict, notFound } from './errors.js'
import { listed } from './creators.js'
import type { Prisma } from './generated/prisma/client.js'
import type { BookingStatus, RefundReason, VerifiedVia } from './generated/prisma/enums.js'

export type Tx = Prisma.TransactionClient
export type EscrowOptions = { at?: Date; tx?: Tx }

export const TX_LIMITS = { maxWait: 10_000, timeout: 20_000 }

const inTx = <T>(tx: Tx | undefined, fn: (tx: Tx) => Promise<T>) => (tx ? fn(tx) : db.$transaction(fn, TX_LIMITS))

export const MIN_TOPUP_CENTS = 100
export const MAX_TOPUP_CENTS = 1_000_000

const newTrackingCode = () => randomBytes(6).toString('base64url')

const autoApproveCutoff = (at: Date) => new Date(at.getTime() - env.autoApproveMs)

export async function topUp(brandId: string, amountCents: number, { at = new Date(), tx }: EscrowOptions = {}) {
  await inTx(tx, async (tx) => {
    await tx.wallet.update({
      where: { userId: brandId },
      data: { availableCents: { increment: amountCents } },
    })
    await tx.transaction.create({ data: { userId: brandId, type: 'topup', amountCents, createdAt: at } })
  })
}

export type NewBooking = {
  brandId: string
  creatorId: string
  brief: string
  destinationUrl: string
  deadline: Date
}

export function createBooking(input: NewBooking, { at = new Date(), tx }: EscrowOptions = {}): Promise<string> {
  return inTx(tx, async (tx) => {
    const creator = await tx.user.findFirst({
      where: { id: input.creatorId, ...listed },
      select: { profile: { select: { priceCents: true } } },
    })
    const priceCents = creator?.profile?.priceCents
    if (!priceCents) throw notFound('Creator not found')

    const hold = await tx.wallet.updateMany({
      where: { userId: input.brandId, availableCents: { gte: priceCents } },
      data: { availableCents: { decrement: priceCents }, heldCents: { increment: priceCents } },
    })
    if (hold.count === 0) throw conflict('Not enough available balance to book this creator')

    const booking = await tx.booking.create({
      data: { ...input, priceCents, trackingCode: newTrackingCode(), createdAt: at },
      select: { id: true },
    })
    await tx.transaction.create({
      data: { userId: input.brandId, bookingId: booking.id, type: 'hold', amountCents: priceCents, createdAt: at },
    })
    return booking.id
  })
}

export async function accept(bookingId: string, { at = new Date(), tx }: EscrowOptions = {}) {
  await inTx(tx, (tx) =>
    transition(tx, bookingId, 'accept', at, {
      where: { status: 'requested', deadline: { gte: at } },
      data: { status: 'accepted', acceptedAt: at },
    }),
  )
}

export async function submit(
  bookingId: string,
  post: { postUrl: string; submitIpHash: string },
  { at = new Date(), tx }: EscrowOptions = {},
) {
  await inTx(tx, (tx) =>
    transition(tx, bookingId, 'submit', at, {
      where: { status: 'accepted', deadline: { gte: at } },
      data: { status: 'submitted', ...post, submittedAt: at },
    }),
  )
}

export const decline = (bookingId: string, options?: EscrowOptions) => refund(bookingId, 'declined', options)

export const approve = (bookingId: string, options?: EscrowOptions) => pay(bookingId, 'brand', options)

const PAY_VERB: Record<VerifiedVia, string> = { brand: 'approve', click: 'verify', timeout: 'auto-approve' }

export async function pay(bookingId: string, via: VerifiedVia, { at = new Date(), tx }: EscrowOptions = {}) {
  await inTx(tx, async (tx) => {
    const booking = await transition(tx, bookingId, PAY_VERB[via], at, {
      where:
        via === 'timeout'
          ? { status: 'submitted', submittedAt: { lte: autoApproveCutoff(at) } }
          : { status: 'submitted' },
      data: { status: 'paid', verifiedVia: via, closedAt: at },
    })
    await tx.wallet.update({
      where: { userId: booking.brandId },
      data: { heldCents: { decrement: booking.priceCents } },
    })
    await tx.wallet.update({
      where: { userId: booking.creatorId },
      data: { availableCents: { increment: booking.priceCents } },
    })
    await tx.transaction.createMany({
      data: [
        { userId: booking.brandId, bookingId, type: 'release', amountCents: booking.priceCents, createdAt: at },
        { userId: booking.creatorId, bookingId, type: 'payout', amountCents: booking.priceCents, createdAt: at },
      ],
    })
  })
}

export async function refund(bookingId: string, reason: RefundReason, { at = new Date(), tx }: EscrowOptions = {}) {
  await inTx(tx, async (tx) => {
    const booking = await transition(tx, bookingId, reason === 'declined' ? 'decline' : 'expire', at, {
      where:
        reason === 'declined'
          ? { status: 'requested' }
          : { status: { in: ['requested', 'accepted'] }, deadline: { lt: at } },
      data: { status: 'refunded', refundReason: reason, closedAt: at },
    })
    await tx.wallet.update({
      where: { userId: booking.brandId },
      data: { heldCents: { decrement: booking.priceCents }, availableCents: { increment: booking.priceCents } },
    })
    await tx.transaction.create({
      data: { userId: booking.brandId, bookingId, type: 'refund', amountCents: booking.priceCents, createdAt: at },
    })
  })
}

export async function sweep({ at = new Date(), bookingId }: { at?: Date; bookingId?: string } = {}) {
  const scope = bookingId ? { id: bookingId } : {}
  const [overdue, ignored] = await Promise.all([
    db.booking.findMany({
      where: { ...scope, status: { in: ['requested', 'accepted'] }, deadline: { lt: at } },
      select: { id: true },
    }),
    db.booking.findMany({
      where: { ...scope, status: 'submitted', submittedAt: { lte: autoApproveCutoff(at) } },
      select: { id: true },
    }),
  ])
  for (const { id } of overdue) await refund(id, 'expired', { at }).catch(ignoreConflict)
  for (const { id } of ignored) await pay(id, 'timeout', { at }).catch(ignoreConflict)
}

export function ignoreConflict(err: unknown) {
  if (!(err instanceof HttpError && err.status === 409)) throw err
}

async function transition(
  tx: Tx,
  bookingId: string,
  verb: string,
  at: Date,
  change: { where: Prisma.BookingWhereInput; data: Prisma.BookingUpdateManyMutationInput },
) {
  const { count } = await tx.booking.updateMany({ where: { id: bookingId, ...change.where }, data: change.data })
  if (count === 0) throw await explainRefusal(tx, bookingId, verb, at)
  return tx.booking.findUniqueOrThrow({
    where: { id: bookingId },
    select: { brandId: true, creatorId: true, priceCents: true },
  })
}

const STATE: Record<Exclude<BookingStatus, 'refunded'>, string> = {
  requested: 'still waiting for the creator to accept',
  accepted: 'accepted, but the post has not been submitted',
  submitted: 'already submitted',
  paid: 'already paid',
}

async function explainRefusal(tx: Tx, bookingId: string, verb: string, at: Date): Promise<HttpError> {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
    select: { status: true, refundReason: true, deadline: true },
  })
  if (!booking) return notFound('Booking not found')
  const open = booking.status === 'requested' || booking.status === 'accepted'
  if (open && booking.deadline < at) return conflict(`Can't ${verb}: the deadline has passed`)
  const state = booking.status === 'refunded' ? `${booking.refundReason} and refunded` : STATE[booking.status]
  return conflict(`Can't ${verb}: this booking is ${state}`)
}
