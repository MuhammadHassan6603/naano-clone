import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { db } from '../src/db.js'
import { approve, sweep } from '../src/escrow.js'
import { DAY_MS, type Session, startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer()
})
after(async () => {
  await api.stop()
})

const PRICE = 30_000
const HOUR_MS = 3_600_000
const POST_URL = 'https://www.linkedin.com/posts/test-post'

async function scenario() {
  const [brand, creator] = await Promise.all([api.fundedBrand(100_000), api.listedCreator({ priceCents: PRICE })])
  const call = (session: Session, method: string, path: string, body?: unknown) =>
    api.call(method, path, { token: session.token, body })

  async function booked(): Promise<string> {
    const res = await call(brand, 'POST', '/bookings', {
      creatorId: creator.user.id,
      brief: 'Please post about our pipeline analytics launch.',
      destinationUrl: 'https://acme.example',
      deadline: new Date(Date.now() + 7 * DAY_MS).toISOString(),
    })
    assert.equal(res.status, 201, JSON.stringify(res.body))
    return res.body.booking.id
  }
  const accept = (id: string) => call(creator, 'POST', `/bookings/${id}/accept`)
  const submit = (id: string) => call(creator, 'POST', `/bookings/${id}/submit`, { postUrl: POST_URL })
  const get = async (id: string) => (await call(brand, 'GET', `/bookings/${id}`)).body.booking

  // Time travel for tests: move a booking's clock fields instead of waiting for real time to pass.
  const setTimes = (id: string, data: { deadline?: Date; submittedAt?: Date }) =>
    db.booking.update({ where: { id }, data })

  const ledger = (userId: string, type: 'refund' | 'payout') =>
    db.transaction.count({ where: { userId, type } })

  return { brand, creator, call, booked, accept, submit, get, setTimes, ledger }
}

const past = (ms: number) => new Date(Date.now() - ms)
const events = (booking: { timeline: { event: string }[] }) => booking.timeline.map((e) => e.event)

describe('deadlines', () => {
  test('accepting after the deadline is refused and the brand is refunded', async () => {
    const s = await scenario()
    const id = await s.booked()
    await s.setTimes(id, { deadline: past(1_000) })

    const res = await s.accept(id)
    assert.equal(res.status, 409)
    assert.equal(res.body.error, "Can't accept: this booking is expired and refunded")

    const booking = await s.get(id)
    assert.equal(booking.status, 'refunded')
    assert.equal(booking.refundReason, 'expired')
    assert.deepEqual(events(booking), ['booked', 'expired', 'refunded'])
    assert.deepEqual(await api.wallet(s.brand), { availableCents: 100_000, heldCents: 0, reconciled: true })

    const card = await api.call('GET', `/creators/${s.creator.user.id}`)
    assert.deepEqual(card.body.creator.reliability, { delivered: 0, total: 1 }, 'an expiry counts as a miss')
  })

  test('an accepted booking that misses its deadline is refunded, and a late submit is refused', async () => {
    const s = await scenario()
    const id = await s.booked()
    assert.equal((await s.accept(id)).status, 200)
    await s.setTimes(id, { deadline: past(1_000) })

    const res = await s.submit(id)
    assert.equal(res.status, 409)
    assert.equal(res.body.error, "Can't submit: this booking is expired and refunded")
    assert.equal((await s.get(id)).status, 'refunded')
    assert.deepEqual(await api.wallet(s.brand), { availableCents: 100_000, heldCents: 0, reconciled: true })
    assert.deepEqual(await api.wallet(s.creator), { availableCents: 0, heldCents: 0, reconciled: true })
  })

  test('simply reading an overdue booking settles it', async () => {
    const s = await scenario()
    const id = await s.booked()
    await s.setTimes(id, { deadline: past(1_000) })
    assert.equal((await s.get(id)).status, 'refunded')
  })

  test('listing bookings settles overdue ones too', async () => {
    const s = await scenario()
    const id = await s.booked()
    await s.setTimes(id, { deadline: past(1_000) })
    const list = await s.call(s.creator, 'GET', '/bookings')
    assert.equal(list.body.bookings.find((b: { id: string }) => b.id === id).status, 'refunded')
  })

  test('a submitted post is never expired by the deadline: the creator delivered in time', async () => {
    const s = await scenario()
    const id = await s.booked()
    await s.accept(id)
    await s.submit(id)
    await s.setTimes(id, { deadline: past(DAY_MS) })
    assert.equal((await s.get(id)).status, 'submitted')
  })
})

describe('auto-approve after 72 hours', () => {
  test('a post the brand ignores for 72 hours pays the creator', async () => {
    const s = await scenario()
    const id = await s.booked()
    await s.accept(id)
    await s.submit(id)
    await s.setTimes(id, { submittedAt: past(72 * HOUR_MS + 60_000) })

    const booking = await s.get(id)
    assert.equal(booking.status, 'paid')
    assert.equal(booking.verifiedVia, 'timeout')
    assert.deepEqual(events(booking), ['booked', 'accepted', 'submitted', 'verified', 'paid'])
    assert.equal(booking.timeline[3].via, 'timeout')
    assert.deepEqual(await api.wallet(s.creator), { availableCents: PRICE, heldCents: 0, reconciled: true })
    assert.deepEqual(await api.wallet(s.brand), { availableCents: 70_000, heldCents: 0, reconciled: true })
  })

  test('inside 72 hours nothing happens on its own', async () => {
    const s = await scenario()
    const id = await s.booked()
    await s.accept(id)
    await s.submit(id)
    await s.setTimes(id, { submittedAt: past(71 * HOUR_MS) })
    assert.equal((await s.get(id)).status, 'submitted')
    assert.deepEqual(await api.wallet(s.creator), { availableCents: 0, heldCents: 0, reconciled: true })
  })
})

describe('concurrency', () => {
  test('accept and decline at the same moment: exactly one wins and the money is consistent', async () => {
    const s = await scenario()
    const id = await s.booked()
    const [accepted, declined] = await Promise.all([
      s.accept(id),
      s.call(s.creator, 'POST', `/bookings/${id}/decline`),
    ])
    assert.deepEqual([accepted.status, declined.status].sort(), [200, 409])

    const booking = await s.get(id)
    const brand = await api.wallet(s.brand)
    if (accepted.status === 200) {
      assert.equal(booking.status, 'accepted')
      assert.deepEqual(brand, { availableCents: 70_000, heldCents: PRICE, reconciled: true })
    } else {
      assert.equal(booking.status, 'refunded')
      assert.deepEqual(brand, { availableCents: 100_000, heldCents: 0, reconciled: true })
    }
  })

  test('two approvals at the same moment pay the creator exactly once', async () => {
    const s = await scenario()
    const id = await s.booked()
    await s.accept(id)
    await s.submit(id)
    const results = await Promise.all([
      s.call(s.brand, 'POST', `/bookings/${id}/approve`),
      s.call(s.brand, 'POST', `/bookings/${id}/approve`),
    ])
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409])
    assert.equal(await s.ledger(s.creator.user.id, 'payout'), 1)
    assert.deepEqual(await api.wallet(s.creator), { availableCents: PRICE, heldCents: 0, reconciled: true })
  })

  test('brand approval racing the auto-approve sweep pays exactly once', async () => {
    const s = await scenario()
    const id = await s.booked()
    await s.accept(id)
    await s.submit(id)
    await s.setTimes(id, { submittedAt: past(73 * HOUR_MS) })

    await Promise.all([approve(id).catch(() => 'lost the race'), sweep({ bookingId: id })])
    assert.equal(await s.ledger(s.creator.user.id, 'payout'), 1)
    assert.deepEqual(await api.wallet(s.creator), { availableCents: PRICE, heldCents: 0, reconciled: true })
    assert.deepEqual(await api.wallet(s.brand), { availableCents: 70_000, heldCents: 0, reconciled: true })
  })

  test('two sweeps at once refund an overdue booking exactly once', async () => {
    const s = await scenario()
    const id = await s.booked()
    await s.setTimes(id, { deadline: past(1_000) })

    await Promise.all([sweep({ bookingId: id }), sweep({ bookingId: id })])
    assert.equal(await s.ledger(s.brand.user.id, 'refund'), 1)
    assert.deepEqual(await api.wallet(s.brand), { availableCents: 100_000, heldCents: 0, reconciled: true })
  })
})
