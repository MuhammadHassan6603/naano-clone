import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import type { AddressInfo } from 'node:net'
import { createApp } from '../src/app.js'
import { pay } from '../src/escrow.js'
import { openStreams } from '../src/events.js'
import { DAY_MS, type Session, startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>
let base = ''
let server: ReturnType<ReturnType<typeof createApp>['listen']>

before(async () => {
  api = await startServer()
  server = createApp().listen(0)
  await new Promise<void>((resolve) => server.once('listening', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})
after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
  await api.stop()
})

type Listener = { updates: () => number; waitFor: (count: number, ms?: number) => Promise<void>; close: () => void; status: number }

async function listen(session?: Session): Promise<Listener> {
  const controller = new AbortController()
  const res = await fetch(`${base}/events`, { headers: session ? { Authorization: `Bearer ${session.token}` } : {}, signal: controller.signal })
  let updates = 0
  const waiters: (() => void)[] = []
  if (res.ok && res.body) {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    void (async () => {
      try {
        for (;;) {
          const { value, done } = await reader.read()
          if (done) return
          updates += (decoder.decode(value).match(/event: update/g) ?? []).length
          waiters.splice(0).forEach((wake) => wake())
        }
      } catch {
        return
      }
    })()
  } else {
    await res.body?.cancel()
  }
  return {
    status: res.status,
    updates: () => updates,
    waitFor: async (count, ms = 3000) => {
      const deadline = Date.now() + ms
      while (updates < count) {
        if (Date.now() > deadline) throw new Error(`expected ${count} updates, got ${updates}`)
        await new Promise<void>((resolve) => {
          waiters.push(resolve)
          setTimeout(resolve, 100)
        })
      }
    },
    close: () => controller.abort(),
  }
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 600))

async function setup() {
  const [brand, creator, stranger] = await Promise.all([api.fundedBrand(100_000), api.listedCreator({ priceCents: 20_000 }), api.signup('brand')])
  const act = (session: Session, path: string, body?: unknown) => fetch(`${base}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  }).then(async (res) => ({ status: res.status, body: await res.json() }))
  const book = async () => {
    const res = await act(brand, '/bookings', {
      creatorId: creator.user.id,
      brief: 'Please write about our new pipeline analytics dashboard.',
      destinationUrl: 'https://acme.example',
      deadline: new Date(Date.now() + 7 * DAY_MS).toISOString(),
    })
    assert.equal(res.status, 201)
    return res.body.booking.id as string
  }
  return { brand, creator, stranger, act, book }
}

describe('the live update stream', () => {
  test('needs a login and opens as an event stream', async () => {
    const anonymous = await listen()
    assert.equal(anonymous.status, 401)
    const { brand } = await setup()
    const res = await fetch(`${base}/events`, { headers: { Authorization: `Bearer ${brand.token}` } })
    assert.equal(res.status, 200)
    assert.match(res.headers.get('content-type') ?? '', /text\/event-stream/)
    await res.body?.cancel()
  })

  test('each step reaches both people at once (so every open tab updates), and nobody else', async () => {
    const { brand, creator, stranger, act, book } = await setup()
    const [brandStream, creatorStream, strangerStream] = await Promise.all([listen(brand), listen(creator), listen(stranger)])
    const both = (n: number) => Promise.all([brandStream.waitFor(n, 1000), creatorStream.waitFor(n, 1000)])
    const id = await book()
    await both(1)
    await act(creator, `/bookings/${id}/accept`)
    await both(2)
    await act(creator, `/bookings/${id}/messages`, { body: 'Draft coming tomorrow' })
    await both(3)
    await act(brand, `/bookings/${id}/messages`, { body: 'Great, thanks' })
    await both(4)
    await act(creator, `/bookings/${id}/submit`, { postUrl: 'https://www.linkedin.com/posts/live' })
    await both(5)
    await act(brand, `/bookings/${id}/approve`)
    await both(6)
    await settle()
    assert.equal(strangerStream.updates(), 0)
    assert.deepEqual([brandStream.updates(), creatorStream.updates()], [6, 6])
    for (const stream of [brandStream, creatorStream, strangerStream]) stream.close()
  })

  test('background payments reach both sides, and a failed action sends nothing', async () => {
    const { brand, creator, act, book } = await setup()
    const id = await book()
    await act(creator, `/bookings/${id}/accept`)
    await act(creator, `/bookings/${id}/submit`, { postUrl: 'https://www.linkedin.com/posts/click' })
    const [brandStream, creatorStream] = await Promise.all([listen(brand), listen(creator)])
    assert.equal((await act(creator, `/bookings/${id}/accept`)).status, 409)
    await settle()
    assert.deepEqual([brandStream.updates(), creatorStream.updates()], [0, 0])
    await pay(id, 'click')
    await Promise.all([brandStream.waitFor(1, 1000), creatorStream.waitFor(1, 1000)])
    brandStream.close()
    creatorStream.close()
  })

  test('every open tab of a user gets it, and closed tabs are forgotten', async () => {
    const { brand, creator, book } = await setup()
    const tabs = await Promise.all([listen(creator), listen(creator)])
    assert.equal(openStreams(creator.user.id), 2)
    await book()
    await Promise.all(tabs.map((tab) => tab.waitFor(1, 1000)))
    tabs.forEach((tab) => tab.close())
    const deadline = Date.now() + 3000
    while (openStreams(creator.user.id) > 0 && Date.now() < deadline) await new Promise((r) => setTimeout(r, 50))
    assert.equal(openStreams(creator.user.id), 0)
    assert.ok(brand)
  })
})
