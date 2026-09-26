import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { randomUUID } from 'node:crypto'
import { DAY_MS, type Session, startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer()
})
after(async () => {
  await api.stop()
})

const PRICE = 45_000
const POST_URL = 'https://www.linkedin.com/posts/dana_pipeline-activity-123'
const BOOKING_KEYS = [
  'acceptedAt', 'brand', 'brief', 'closedAt', 'createdAt', 'creator', 'deadline', 'destinationUrl', 'id',
  'postUrl', 'priceCents', 'refundReason', 'status', 'submittedAt', 'trackingUrl', 'verifiedVia',
]

const inDays = (days: number) => new Date(Date.now() + days * DAY_MS).toISOString()

type Action = 'accept' | 'decline' | 'submit' | 'approve'

async function scenario({ balance = 100_000, price = PRICE } = {}) {
  const [brand, creator] = await Promise.all([api.fundedBrand(balance), api.listedCreator({ priceCents: price })])

  const book = (overrides: Record<string, unknown> = {}) =>
    api.call('POST', '/bookings', {
      token: brand.token,
      body: {
        creatorId: creator.user.id,
        brief: 'Please post about our pipeline analytics launch.',
        destinationUrl: 'https://acme.example/launch',
        deadline: inDays(7),
        ...overrides,
      },
    })

  const act = (session: Session, id: string, action: Action, body?: unknown) =>
    api.call('POST', `/bookings/${id}/${action}`, { token: session.token, body })

  const run = {
    accept: (id: string) => act(creator, id, 'accept'),
    decline: (id: string) => act(creator, id, 'decline'),
    submit: (id: string, postUrl: unknown = POST_URL) => act(creator, id, 'submit', { postUrl }),
    approve: (id: string) => act(brand, id, 'approve'),
  }

  async function bookingIn(state: 'requested' | 'accepted' | 'submitted' | 'paid' | 'declined'): Promise<string> {
    const res = await book()
    assert.equal(res.status, 201, JSON.stringify(res.body))
    const id: string = res.body.booking.id
    const steps: Record<typeof state, (() => Promise<unknown>)[]> = {
      requested: [],
      accepted: [() => run.accept(id)],
      submitted: [() => run.accept(id), () => run.submit(id)],
      paid: [() => run.accept(id), () => run.submit(id), () => run.approve(id)],
      declined: [() => run.decline(id)],
    }
    for (const step of steps[state]) await step()
    return id
  }

  const get = (id: string, as: Session = brand) => api.call('GET', `/bookings/${id}`, { token: as.token })
  const history = async (session: Session) =>
    (await api.call('GET', '/wallet/transactions', { token: session.token })).body.transactions as {
      type: string
      amountCents: number
      bookingId: string | null
    }[]

  return { brand, creator, book, act, run, bookingIn, get, history }
}

const events = (booking: { timeline: { event: string }[] }) => booking.timeline.map((e) => e.event)

describe('POST /bookings', () => {
  test('holds the price in escrow and opens a requested booking', async () => {
    const s = await scenario()
    const res = await s.book()
    assert.equal(res.status, 201)
    const booking = res.body.booking
    assert.deepEqual(Object.keys(booking).sort(), [...BOOKING_KEYS, 'timeline'].sort())
    assert.equal(booking.status, 'requested')
    assert.equal(booking.priceCents, PRICE)
    assert.deepEqual(booking.brand, { id: s.brand.user.id, name: s.brand.user.name })
    assert.deepEqual(booking.creator, { id: s.creator.user.id, name: s.creator.user.name })
    assert.equal(booking.trackingUrl, null)
    assert.deepEqual(events(booking), ['booked'])

    assert.deepEqual(await api.wallet(s.brand), { availableCents: 55_000, heldCents: PRICE, reconciled: true })
    assert.deepEqual(await api.wallet(s.creator), { availableCents: 0, heldCents: 0, reconciled: true })
    const [hold] = await s.history(s.brand)
    assert.deepEqual({ type: hold.type, amountCents: hold.amountCents, bookingId: hold.bookingId }, {
      type: 'hold',
      amountCents: PRICE,
      bookingId: booking.id,
    })
  })

  test('an exact balance is enough and leaves zero available', async () => {
    const s = await scenario({ balance: PRICE })
    assert.equal((await s.book()).status, 201)
    assert.deepEqual(await api.wallet(s.brand), { availableCents: 0, heldCents: PRICE, reconciled: true })
  })

  test('one cent short is a 409 that changes nothing', async () => {
    const s = await scenario({ balance: PRICE - 1 })
    const res = await s.book()
    assert.equal(res.status, 409)
    assert.equal(res.body.error, 'Not enough available balance to book this creator')
    assert.deepEqual(await api.wallet(s.brand), { availableCents: PRICE - 1, heldCents: 0, reconciled: true })
    assert.deepEqual((await api.call('GET', '/bookings', { token: s.brand.token })).body.bookings, [])
  })

  test('held money cannot be spent again', async () => {
    const s = await scenario({ balance: 100_000, price: 60_000 })
    assert.equal((await s.book()).status, 201)
    assert.equal((await s.book()).status, 409)
  })

  test('two bookings racing for the same money: exactly one wins', async () => {
    const s = await scenario({ balance: 100_000, price: 60_000 })
    const results = await Promise.all([s.book(), s.book()])
    assert.deepEqual(results.map((r) => r.status).sort(), [201, 409])
    assert.deepEqual(await api.wallet(s.brand), { availableCents: 40_000, heldCents: 60_000, reconciled: true })
    assert.equal((await api.call('GET', '/bookings', { token: s.brand.token })).body.bookings.length, 1)
  })

  test('the price comes from the creator’s profile, never from the client', async () => {
    const s = await scenario()
    const res = await s.book({ priceCents: 1 })
    assert.equal(res.body.booking.priceCents, PRICE)
  })

  test('a later price change does not touch an existing booking', async () => {
    const s = await scenario()
    const id = await s.bookingIn('requested')
    await api.call('PUT', '/creators/me/profile', {
      token: s.creator.token,
      body: { niche: 'RevOps', bio: '', audience: '', priceCents: 99_000, followers: 1 },
    })
    assert.equal((await s.get(id)).body.booking.priceCents, PRICE)
  })

  test('a 2-minute demo deadline is accepted', async () => {
    const s = await scenario()
    const res = await s.book({ deadline: new Date(Date.now() + 2 * 60_000).toISOString() })
    assert.equal(res.status, 201)
  })

  test('404 when the creator is unknown, malformed, a brand, or has no price', async () => {
    const s = await scenario()
    const unpriced = await api.signup('creator')
    for (const creatorId of [randomUUID(), 'not-a-uuid', s.brand.user.id, unpriced.user.id]) {
      const res = await s.book({ creatorId })
      assert.equal(res.status, 404, `creatorId ${creatorId}`)
      assert.equal(res.body.error, 'Creator not found')
    }
    assert.deepEqual(await api.wallet(s.brand), { availableCents: 100_000, heldCents: 0, reconciled: true })
  })

  test('creators cannot book (403) and anonymous callers get 401', async () => {
    const s = await scenario()
    const asCreator = await api.call('POST', '/bookings', {
      token: s.creator.token,
      body: { creatorId: s.creator.user.id, brief: 'x'.repeat(30), destinationUrl: 'https://a.example', deadline: inDays(1) },
    })
    assert.equal(asCreator.status, 403)
    assert.equal((await api.call('POST', '/bookings', { body: {} })).status, 401)
  })

  const invalid: [string, Record<string, unknown>, RegExp][] = [
    ['a brief under 20 characters', { brief: 'x'.repeat(19) }, /brief must be at least 20/],
    ['a brief over 5000 characters', { brief: 'x'.repeat(5001) }, /brief must be at most 5000/],
    ['a destination that is not a URL', { destinationUrl: 'not a url' }, /destinationUrl must be a valid URL/],
    ['an ftp destination', { destinationUrl: 'ftp://files.example/x' }, /must be an http\(s\) URL/],
    ['a javascript: destination', { destinationUrl: 'javascript:alert(1)' }, /must be an http\(s\) URL/],
    ['a deadline in the past', { deadline: inDays(-1) }, /deadline must be in the future/],
    ['a deadline beyond 60 days', { deadline: inDays(61) }, /within 60 days/],
    ['a deadline that is not a date', { deadline: 'next friday' }, /ISO 8601/],
    ['a missing creatorId', { creatorId: undefined }, /creatorId is required/],
    ['a missing brief', { brief: undefined }, /brief is required/],
  ]
  for (const [label, overrides, message] of invalid) {
    test(`rejects ${label} with 400`, async () => {
      const s = await scenario()
      const res = await s.book(overrides)
      assert.equal(res.status, 400)
      assert.match(res.body.error, message)
      assert.deepEqual(await api.wallet(s.brand), { availableCents: 100_000, heldCents: 0, reconciled: true })
    })
  }
})

describe('booking lifecycle', () => {
  test('happy path: book → accept → submit → approve pays the creator', async () => {
    const s = await scenario()
    const id = await s.bookingIn('requested')

    const accepted = await s.run.accept(id)
    assert.equal(accepted.status, 200)
    assert.equal(accepted.body.booking.status, 'accepted')
    assert.match(accepted.body.booking.trackingUrl, /\/r\/[A-Za-z0-9_-]{8}$/)

    const submitted = await s.run.submit(id)
    assert.equal(submitted.status, 200)
    assert.equal(submitted.body.booking.status, 'submitted')
    assert.equal(submitted.body.booking.postUrl, POST_URL)

    const paid = await s.run.approve(id)
    assert.equal(paid.status, 200)
    const booking = paid.body.booking
    assert.equal(booking.status, 'paid')
    assert.equal(booking.verifiedVia, 'brand')
    assert.ok(booking.closedAt)
    assert.deepEqual(events(booking), ['booked', 'accepted', 'submitted', 'verified', 'paid'])
    assert.equal(booking.timeline[3].via, 'brand')

    assert.deepEqual(await api.wallet(s.brand), { availableCents: 55_000, heldCents: 0, reconciled: true })
    assert.deepEqual(await api.wallet(s.creator), { availableCents: PRICE, heldCents: 0, reconciled: true })
    assert.deepEqual((await s.history(s.brand)).map((t) => t.type), ['release', 'hold', 'topup'])
    assert.deepEqual((await s.history(s.creator)).map((t) => [t.type, t.amountCents, t.bookingId]), [['payout', PRICE, id]])

    const card = await api.call('GET', `/creators/${s.creator.user.id}`)
    assert.deepEqual(card.body.creator.reliability, { delivered: 1, total: 1 })
  })

  test('decline returns the full amount to the brand', async () => {
    const s = await scenario()
    const id = await s.bookingIn('requested')
    const res = await s.run.decline(id)
    assert.equal(res.status, 200)
    assert.equal(res.body.booking.status, 'refunded')
    assert.equal(res.body.booking.refundReason, 'declined')
    assert.deepEqual(events(res.body.booking), ['booked', 'declined', 'refunded'])

    assert.deepEqual(await api.wallet(s.brand), { availableCents: 100_000, heldCents: 0, reconciled: true })
    assert.deepEqual(await api.wallet(s.creator), { availableCents: 0, heldCents: 0, reconciled: true })
    assert.deepEqual((await s.history(s.brand)).map((t) => t.type), ['refund', 'hold', 'topup'])

    const card = await api.call('GET', `/creators/${s.creator.user.id}`)
    assert.deepEqual(card.body.creator.reliability, { delivered: 0, total: 0 }, 'a decline is not a missed delivery')
  })

  const outOfOrder: [string, 'requested' | 'accepted' | 'submitted' | 'paid' | 'declined', Action, RegExp][] = [
    ['approve before the creator accepted', 'requested', 'approve', /Can't approve: this booking is still waiting for the creator/],
    ['submit before accepting', 'requested', 'submit', /Can't submit: this booking is still waiting/],
    ['approve before the post is submitted', 'accepted', 'approve', /Can't approve: this booking is accepted, but the post has not been submitted/],
    ['accept twice', 'accepted', 'accept', /Can't accept: this booking is accepted/],
    ['decline after accepting', 'accepted', 'decline', /Can't decline: this booking is accepted/],
    ['submit twice', 'submitted', 'submit', /Can't submit: this booking is already submitted/],
    ['accept after declining', 'declined', 'accept', /Can't accept: this booking is declined and refunded/],
    ['approve a declined booking', 'declined', 'approve', /Can't approve: this booking is declined and refunded/],
    ['approve twice', 'paid', 'approve', /Can't approve: this booking is already paid/],
    ['submit after payment', 'paid', 'submit', /Can't submit: this booking is already paid/],
    ['decline after payment', 'paid', 'decline', /Can't decline: this booking is already paid/],
  ]
  for (const [label, state, action, message] of outOfOrder) {
    test(`refuses to ${label} with 409 and moves no money`, async () => {
      const s = await scenario()
      const id = await s.bookingIn(state)
      const before = { booking: (await s.get(id)).body.booking, brand: await api.wallet(s.brand), creator: await api.wallet(s.creator) }

      const res = await s.run[action](id)
      assert.equal(res.status, 409)
      assert.match(res.body.error, message)

      assert.deepEqual((await s.get(id)).body.booking, before.booking)
      assert.deepEqual(await api.wallet(s.brand), before.brand)
      assert.deepEqual(await api.wallet(s.creator), before.creator)
      assert.ok(before.brand.reconciled && before.creator.reconciled)
    })
  }

  test('only the right side can act, and outsiders are refused', async () => {
    const s = await scenario()
    const outsiderBrand = await api.signup('brand')
    const outsiderCreator = await api.signup('creator')
    const id = await s.bookingIn('requested')

    for (const action of ['accept', 'decline', 'submit'] as const) {
      const res = await s.act(s.brand, id, action, { postUrl: POST_URL })
      assert.equal(res.status, 403, `brand ${action}`)
      assert.equal(res.body.error, 'Only the creator on this booking can do this')
    }
    await s.run.accept(id)
    await s.run.submit(id)
    const creatorApproves = await s.act(s.creator, id, 'approve')
    assert.equal(creatorApproves.status, 403)
    assert.equal(creatorApproves.body.error, 'Only the brand on this booking can do this')

    for (const [who, action] of [[outsiderBrand, 'approve'], [outsiderCreator, 'accept']] as const) {
      const res = await s.act(who, id, action)
      assert.equal(res.status, 403)
      assert.equal(res.body.error, 'This booking belongs to someone else')
    }
    assert.equal((await s.get(id, outsiderBrand)).status, 403)
    assert.equal((await s.get(id)).body.booking.status, 'submitted', 'nothing an outsider did changed the booking')
  })

  test('unknown and malformed booking ids are 404, anonymous is 401', async () => {
    const s = await scenario()
    for (const id of [randomUUID(), 'not-a-uuid']) {
      const res = await s.get(id)
      assert.equal(res.status, 404)
      assert.equal(res.body.error, 'Booking not found')
      assert.equal((await s.run.approve(id)).status, 404)
    }
    assert.equal((await api.call('GET', `/bookings/${randomUUID()}`)).status, 401)
  })

  const badPosts: [string, unknown][] = [
    ['an http (not https) LinkedIn link', 'http://www.linkedin.com/posts/x'],
    ['a look-alike domain', 'https://linkedin.com.evil.example/posts/x'],
    ['LinkedIn only in the path', 'https://evil.example/linkedin.com/posts/x'],
    ['text that is not a URL', 'my post'],
    ['a missing postUrl', undefined],
  ]
  for (const [label, postUrl] of badPosts) {
    test(`submit rejects ${label} with 400 and stays accepted`, async () => {
      const s = await scenario()
      const id = await s.bookingIn('accepted')
      const res = await s.act(s.creator, id, 'submit', { postUrl })
      assert.equal(res.status, 400)
      assert.equal((await s.get(id)).body.booking.status, 'accepted')
    })
  }

  test('submit accepts the bare linkedin.com domain', async () => {
    const s = await scenario()
    const id = await s.bookingIn('accepted')
    assert.equal((await s.run.submit(id, 'https://linkedin.com/feed/update/urn:li:activity:1')).status, 200)
  })
})

describe('GET /bookings', () => {
  test('each side sees only its own bookings, newest first, without timelines', async () => {
    const s = await scenario()
    const other = await api.fundedBrand(100_000)
    const first = await s.bookingIn('requested')
    const second = await s.bookingIn('requested')
    const othersBooking = await api.call('POST', '/bookings', {
      token: other.token,
      body: { creatorId: s.creator.user.id, brief: 'x'.repeat(25), destinationUrl: 'https://o.example', deadline: inDays(3) },
    })
    assert.equal(othersBooking.status, 201)

    const list = async (session: Session) =>
      (await api.call('GET', '/bookings', { token: session.token })).body.bookings as { id: string }[]

    assert.deepEqual((await list(s.brand)).map((b) => b.id), [second, first])
    assert.deepEqual((await list(other)).map((b) => b.id), [othersBooking.body.booking.id])
    assert.equal((await list(s.creator)).length, 3)
    assert.deepEqual(Object.keys((await list(s.brand))[0]).sort(), [...BOOKING_KEYS, 'unreadMessages'].sort())
  })

  test('filters by status and rejects unknown or repeated filters', async () => {
    const s = await scenario()
    await s.bookingIn('requested')
    const acceptedId = await s.bookingIn('accepted')

    const accepted = await api.call('GET', '/bookings?status=accepted', { token: s.creator.token })
    assert.deepEqual(accepted.body.bookings.map((b: { id: string }) => b.id), [acceptedId])
    for (const query of ['status=pending', 'status=paid&status=refunded']) {
      assert.equal((await api.call('GET', `/bookings?${query}`, { token: s.brand.token })).status, 400, query)
    }
  })

  test('both parties get the same booking from GET /bookings/:id', async () => {
    const s = await scenario()
    const id = await s.bookingIn('accepted')
    const asBrand = await s.get(id, s.brand)
    const asCreator = await s.get(id, s.creator)
    assert.equal(asBrand.status, 200)
    assert.deepEqual(asBrand.body, asCreator.body)
  })
})
