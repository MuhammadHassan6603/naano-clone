import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { randomUUID } from 'node:crypto'
import { db } from '../src/db.js'
import { pay, refund } from '../src/escrow.js'
import { DAY_MS, type Session, startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer()
})
after(async () => {
  await api.stop()
})

const list = async (session: Session, query = '') => (await api.call('GET', `/notifications${query}`, { token: session.token })).body
const titles = async (session: Session) => (await list(session)).notifications.map((n: any) => n.title)

async function setup() {
  const [brand, creator, stranger] = await Promise.all([
    api.fundedBrand(100_000),
    api.listedCreator({ priceCents: 45_000 }, 'Maya Notetest'),
    api.signup('brand', 'Stranger Co'),
  ])
  await db.user.update({ where: { id: brand.user.id }, data: { name: 'Acme Notetest' } })
  const book = async () => {
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
    return res.body.booking.id as string
  }
  const act = (session: Session, id: string, action: string, body?: unknown) => api.call('POST', `/bookings/${id}/${action}`, { token: session.token, body })
  return { brand, creator, stranger, book, act }
}

describe('each booking step tells the other side', () => {
  test('booking, accepting, posting and approving', async () => {
    const { brand, creator, stranger, book, act } = await setup()
    const id = await book()
    const link = `/dashboard/bookings/${id}`
    let creatorNotes = (await list(creator)).notifications
    assert.equal(creatorNotes.length, 1)
    assert.deepEqual(
      { ...creatorNotes[0], id: undefined, createdAt: undefined },
      { id: undefined, createdAt: undefined, kind: 'booked', title: 'New booking from Acme Notetest', body: '$450 is already held in escrow for you. Accept or decline the brief.', link, read: false },
    )
    assert.deepEqual(await titles(brand), [])

    await act(creator, id, 'accept')
    assert.deepEqual(await titles(brand), ['Maya Notetest accepted your brief'])
    await act(creator, id, 'submit', { postUrl: 'https://www.linkedin.com/posts/maya' })
    assert.deepEqual(await titles(brand), ['Maya Notetest posted', 'Maya Notetest accepted your brief'])
    await act(brand, id, 'approve')
    creatorNotes = (await list(creator)).notifications
    assert.deepEqual(creatorNotes.map((n: any) => [n.title, n.body]), [
      ['You were paid $450', 'Acme Notetest approved your post.'],
      ['New booking from Acme Notetest', '$450 is already held in escrow for you. Accept or decline the brief.'],
    ])
    assert.equal((await titles(brand)).length, 2)
    assert.ok([...creatorNotes, ...(await list(brand)).notifications].every((n: any) => n.link === link))
    assert.deepEqual(await titles(stranger), [])
  })

  test('declining refunds and tells the brand', async () => {
    const { brand, creator, book, act } = await setup()
    const id = await book()
    await act(creator, id, 'decline')
    const [note] = (await list(brand)).notifications
    assert.deepEqual([note.kind, note.title, note.body], ['declined', 'Maya Notetest declined your booking', 'The full $450 is back in your available balance.'])
  })

  test('expiry and automatic payment tell both sides', async () => {
    const { brand, creator, book, act } = await setup()
    const expiring = await book()
    await refund(expiring, 'expired', { at: new Date(Date.now() + 8 * DAY_MS) })
    assert.ok((await titles(brand)).includes('Booking with Maya Notetest expired'))
    assert.ok((await titles(creator)).includes('Booking from Acme Notetest expired'))

    const clicked = await book()
    await act(creator, clicked, 'accept')
    await act(creator, clicked, 'submit', { postUrl: 'https://www.linkedin.com/posts/maya-2' })
    await pay(clicked, 'click')
    const paid = (await list(creator)).notifications.find((n: any) => n.kind === 'paid')
    assert.deepEqual([paid.title, paid.body], ['You were paid $450', 'A real reader clicked your tracked link, so the post was verified.'])
    const verified = (await list(brand)).notifications.find((n: any) => n.kind === 'paid')
    assert.deepEqual([verified.title, verified.body], ['Post by Maya Notetest verified', 'A reader clicked the tracked link, so $450 was released to Maya.'])
  })

  test('a failed step creates no notification', async () => {
    const { brand, creator, book, act } = await setup()
    const id = await book()
    assert.equal((await act(brand, id, 'approve')).status, 409)
    assert.equal((await act(creator, id, 'submit', { postUrl: 'https://www.linkedin.com/posts/early' })).status, 409)
    assert.deepEqual(await titles(brand), [])
    assert.deepEqual(await titles(creator), ['New booking from Acme Notetest'])
  })
})

describe('messages', () => {
  test('notify only the other side, with a short preview', async () => {
    const { brand, creator, stranger, book } = await setup()
    const id = await book()
    const long = `Hi Maya! ${'Please mention the free trial. '.repeat(10)}`
    await api.call('POST', `/bookings/${id}/messages`, { token: brand.token, body: { body: long } })
    const [note] = (await list(creator)).notifications
    assert.equal(note.kind, 'message')
    assert.equal(note.title, 'New message from Acme Notetest')
    assert.ok(note.body.endsWith('…') && note.body.length <= 141)
    assert.equal(note.link, `/dashboard/bookings/${id}`)
    assert.deepEqual(await titles(brand), [])
    assert.deepEqual(await titles(stranger), [])
    await api.call('POST', `/bookings/${id}/messages`, { token: creator.token, body: { body: 'Sure thing' } })
    assert.deepEqual((await list(brand)).notifications.map((n: any) => [n.title, n.body]), [['New message from Maya Notetest', 'Sure thing']])
  })
})

describe('reading and marking', () => {
  test('counts unread, filters by time, and marks read', async () => {
    const { brand, creator, book, act } = await setup()
    const id = await book()
    await act(creator, id, 'accept')
    await act(creator, id, 'submit', { postUrl: 'https://www.linkedin.com/posts/maya-3' })
    const all = await list(brand)
    assert.equal(all.unread, 2)
    const newest = all.notifications[0]
    const older = all.notifications[1]
    assert.deepEqual((await list(brand, `?since=${encodeURIComponent(older.createdAt)}`)).notifications.map((n: any) => n.id), [newest.id])

    const one = await api.call('POST', '/notifications/read', { token: brand.token, body: { ids: [older.id] } })
    assert.deepEqual(one.body, { unread: 1 })
    const everything = await api.call('POST', '/notifications/read', { token: brand.token, body: {} })
    assert.deepEqual(everything.body, { unread: 0 })
    assert.ok((await list(brand)).notifications.every((n: any) => n.read))
    assert.equal((await list(creator)).unread, 1)
  })

  test('only the owner can mark their notifications', async () => {
    const { brand, creator, book } = await setup()
    await book()
    const [note] = (await list(creator)).notifications
    await api.call('POST', '/notifications/read', { token: brand.token, body: { ids: [note.id] } })
    assert.equal((await list(creator)).unread, 1)
  })

  test('validates input and needs a login', async () => {
    const { brand } = await setup()
    assert.equal((await api.call('GET', '/notifications')).status, 401)
    assert.equal((await api.call('GET', '/notifications?since=yesterday', { token: brand.token })).status, 400)
    for (const ids of ['all', [1], ['not-a-uuid'], Array.from({ length: 101 }, () => randomUUID())]) {
      assert.equal((await api.call('POST', '/notifications/read', { token: brand.token, body: { ids } })).status, 400, JSON.stringify(ids).slice(0, 40))
    }
    assert.equal((await api.call('POST', '/notifications/read', { token: brand.token })).status, 200)
  })
})
