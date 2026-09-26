import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { randomUUID } from 'node:crypto'
import { db } from '../src/db.js'
import { MAX_MESSAGES_PER_MINUTE } from '../src/messages.js'
import { DAY_MS, type Session, insertBooking, startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer()
})
after(async () => {
  await api.stop()
})

async function setup() {
  const [brand, creator, stranger] = await Promise.all([
    api.fundedBrand(100_000),
    api.listedCreator({ priceCents: 20_000 }, 'Chat Creator'),
    api.signup('brand', 'Stranger Brand'),
  ])
  const res = await api.call('POST', '/bookings', {
    token: brand.token,
    body: {
      creatorId: creator.user.id,
      brief: 'Please write about our new pipeline analytics dashboard.',
      destinationUrl: 'https://acme.example',
      deadline: new Date(Date.now() + 7 * DAY_MS).toISOString(),
    },
  })
  assert.equal(res.status, 201)
  return { brand, creator, stranger, id: res.body.booking.id as string }
}

const send = (session: Session, id: string, body: unknown) => api.call('POST', `/bookings/${id}/messages`, { token: session.token, body: { body } })
const thread = (session: Session, id: string) => api.call('GET', `/bookings/${id}/messages`, { token: session.token })
const unread = async (session: Session) => (await api.call('GET', '/bookings/unread', { token: session.token })).body.unread
const unreadOn = async (session: Session, id: string) =>
  (await api.call('GET', '/bookings', { token: session.token })).body.bookings.find((b: any) => b.id === id).unreadMessages

describe('who can read and write', () => {
  test('only the two sides of the booking', async () => {
    const { brand, creator, stranger, id } = await setup()
    assert.equal((await api.call('GET', `/bookings/${id}/messages`)).status, 401)
    assert.equal((await thread(stranger, id)).status, 403)
    assert.equal((await send(stranger, id, 'let me in')).status, 403)
    assert.equal((await thread(brand, randomUUID())).status, 404)
    assert.equal((await thread(brand, 'nope')).status, 404)
    assert.equal((await thread(brand, id)).status, 200)
    assert.equal((await thread(creator, id)).status, 200)
    assert.equal(await db.message.count({ where: { bookingId: id } }), 0)
  })
})

describe('sending and reading', () => {
  test('messages come back in order, marked as mine or theirs', async () => {
    const { brand, creator, id } = await setup()
    assert.deepEqual((await thread(brand, id)).body, { messages: [] })

    const first = await send(brand, id, '  Hi! Can you mention the free trial?  ')
    assert.equal(first.status, 201)
    assert.equal(first.body.message.body, 'Hi! Can you mention the free trial?')
    assert.equal(first.body.message.mine, true)
    assert.deepEqual(first.body.message.sender, { id: brand.user.id, name: brand.user.name })
    await send(creator, id, 'Yes, happy to.\nDraft by Friday.')

    const asCreator = (await thread(creator, id)).body.messages
    assert.deepEqual(asCreator.map((m: any) => [m.body, m.mine]), [
      ['Hi! Can you mention the free trial?', false],
      ['Yes, happy to.\nDraft by Friday.', true],
    ])
    const asBrand = (await thread(brand, id)).body.messages
    assert.deepEqual(asBrand.map((m: any) => m.mine), [true, false])
    assert.ok(new Date(asBrand[0].createdAt) <= new Date(asBrand[1].createdAt))
  })

  test('rejects empty, too long and malformed messages', async () => {
    const { brand, id } = await setup()
    for (const [body, error] of [
      ['   ', /at least 1/],
      ['x'.repeat(2001), /at most 2000/],
      [42, /body is required/],
    ] as const) {
      const res = await send(brand, id, body)
      assert.equal(res.status, 400)
      assert.match(res.body.error, error)
    }
    assert.equal((await send(brand, id, 'x'.repeat(2000))).status, 201)
    const raw = await api.call('POST', `/bookings/${id}/messages`, { token: brand.token, raw: '{"body":' })
    assert.equal(raw.status, 400)
  })

  test('the database refuses an oversized message even without the API', async () => {
    const { brand, id } = await setup()
    await assert.rejects(db.message.create({ data: { bookingId: id, senderId: brand.user.id, body: 'x'.repeat(2001) } }))
    await assert.rejects(db.message.create({ data: { bookingId: id, senderId: brand.user.id, body: '' } }))
  })

  test('conversation stays open after the booking closes', async () => {
    const [brand, creator] = await Promise.all([api.signup('brand'), api.listedCreator()])
    const closed = await insertBooking(brand.user.id, creator.user.id, { status: 'refunded', reason: 'declined' })
    assert.equal((await send(brand, closed.id, 'Thanks anyway!')).status, 201)
  })

  test('sending too fast is limited per person', async () => {
    const { brand, creator, id } = await setup()
    for (let i = 0; i < MAX_MESSAGES_PER_MINUTE; i += 1) assert.equal((await send(brand, id, `m${i}`)).status, 201)
    const limited = await send(brand, id, 'one more')
    assert.equal(limited.status, 429)
    assert.match(limited.body.error, /very quickly/)
    assert.equal((await send(creator, id, 'I can still reply')).status, 201)
  })
})

describe('unread counts', () => {
  test('count the other side’s messages until they are read', async () => {
    const { brand, creator, id } = await setup()
    assert.equal(await unread(creator), 0)
    await send(brand, id, 'one')
    await send(brand, id, 'two')
    assert.equal(await unread(creator), 2)
    assert.equal(await unreadOn(creator, id), 2)
    assert.equal(await unread(brand), 0)
    assert.equal(await unreadOn(brand, id), 0)

    await thread(creator, id)
    assert.equal(await unread(creator), 0)
    assert.equal(await unreadOn(creator, id), 0)

    await send(brand, id, 'three')
    assert.equal(await unread(creator), 1)
    await send(creator, id, 'reply')
    assert.equal(await unread(creator), 0)
    assert.equal(await unread(brand), 1)
  })

  test('add up across bookings and never include other people’s', async () => {
    const [brand, creator, otherBrand] = await Promise.all([api.signup('brand'), api.listedCreator(), api.signup('brand')])
    const a = await insertBooking(brand.user.id, creator.user.id, { status: 'requested' })
    const b = await insertBooking(brand.user.id, creator.user.id, { status: 'accepted' })
    const theirs = await insertBooking(otherBrand.user.id, creator.user.id, { status: 'requested' })
    await send(creator, a.id, 'a1')
    await send(creator, b.id, 'b1')
    await send(creator, b.id, 'b2')
    await send(creator, theirs.id, 'not for you')
    assert.equal(await unread(brand), 3)
    assert.equal(await unread(otherBrand), 1)
    assert.equal(await unreadOn(brand, b.id), 2)
  })
})
