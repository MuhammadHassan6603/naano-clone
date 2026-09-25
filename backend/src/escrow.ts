/**
 * The only module that moves money or changes a booking's status.
 *
 * Every operation is one database transaction built around a conditional update:
 * the WHERE clause states the precondition (status, deadline, balance), and if it
 * matches no row we refuse with 409. Postgres locks the row and re-checks the
 * condition, so two racing requests can never both succeed. Rows are always locked
 * in the same order (booking, brand wallet, creator wallet), which rules out deadlocks.
 *
 * Every function takes an optional `at` so the seed can write history in the past.
 */
import { randomBytes } from 'node:crypto'
import { db } from './db.js'
import { env } from './env.js'
import { HttpError, conflict, notFound } from './errors.js'
import { listed } from './creators.js'
import type { Prisma } from './generated/prisma/client.js'
import type { BookingStatus, RefundReason, VerifiedVia } from './generated/prisma/enums.js'

type Tx = Prisma.TransactionClient

// Generous limits: each transaction is a handful of round trips to Neon.
const inTx = <T>(fn: (tx: Tx) => Promise<T>) => db.$transaction(fn, { maxWait: 10_000, timeout: 20_000 })

export const MIN_TOPUP_CENTS = 100
export const MAX_TOPUP_CENTS = 1_000_000

// 48 random bits: collisions are negligible at this scale, and the unique index would catch one.
const newTrackingCode = () => randomBytes(6).toString('base64url')

const autoApproveCutoff = (at: Date) => new Date(at.getTime() - env.autoApproveMs)

// ─── Wallet ──────────────────────────────────────────────────────────────────

export async function topUp(brandId: string, amountCents: number, at = new Date()): Promise<void> {
  await inTx(async (tx) => {
    await tx.wallet.update({
      where: { userId: brandId },
      data: { availableCents: { increment: amountCents } },
    })
    await tx.transaction.create({ data: { userId: brandId, type: 'topup', amountCents, createdAt: at } })
  })
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export type NewBooking = {
  brandId: string
  creatorId: string
  brief: string
  destinationUrl: string
  deadline: Date
}

/** Holds the creator's current price from the brand's wallet and opens the booking. */
export function createBooking(input: NewBooking, at = new Date()): Promise<string> {
  return inTx(async (tx) => {
    const creator = await tx.user.findFirst({
      where: { id: input.creatorId, ...listed },
      select: { profile: { select: { priceCents: true } } },
    })
    // The price is read here, never taken from the client, and copied onto the booking.
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

export async function accept(bookingId: string, at = new Date()): Promise<void> {
  await inTx((tx) =>
    transition(tx, bookingId, 'accept', at, {
      where: { status: 'requested', deadline: { gte: at } },
      data: { status: 'accepted', acceptedAt: at },
    }),
  )
}

export async function submit(
  bookingId: string,
  post: { postUrl: string; submitIpHash: string },
  at = new Date(),
): Promise<void> {
  await inTx((tx) =>
    transition(tx, bookingId, 'submit', at, {
      where: { status: 'accepted', deadline: { gte: at } },
      data: { status: 'submitted', ...post, submittedAt: at },
    }),
  )
}

export const decline = (bookingId: string, at = new Date()) => refund(bookingId, 'declined', at)

export const approve = (bookingId: string, at = new Date()) => pay(bookingId, 'brand', at)

const PAY_VERB: Record<VerifiedVia, string> = { brand: 'approve', click: 'verify', timeout: 'auto-approve' }

/** Verified delivery: releases the brand's held money and pays the creator. */
export async function pay(bookingId: string, via: VerifiedVia, at = new Date()): Promise<void> {
  await inTx(async (tx) => {
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

/** Returns the held money to the brand: the creator declined, or the deadline passed. */
export async function refund(bookingId: string, reason: RefundReason, at = new Date()): Promise<void> {
  await inTx(async (tx) => {
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

// ─── Sweep ───────────────────────────────────────────────────────────────────

/**
 * Expires overdue bookings (refund) and auto-approves posts the brand ignored (pay).
 * Runs on a timer and before booking reads, because a sleeping free-tier server may
 * have missed the timer. Losing a race to a user action is expected and ignored.
 */
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
  for (const { id } of overdue) await refund(id, 'expired', at).catch(ignoreConflict)
  for (const { id } of ignored) await pay(id, 'timeout', at).catch(ignoreConflict)
}

function ignoreConflict(err: unknown) {
  if (!(err instanceof HttpError && err.status === 409)) throw err
}

// ─── Internals ───────────────────────────────────────────────────────────────

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
