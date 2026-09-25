import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { setTimeout as sleep } from 'node:timers/promises'
import { randomUUID } from 'node:crypto'
import { db } from '../src/db.js'
import { startSweepLoop } from '../src/jobs.js'
import { isAutomated } from '../src/tracking.js'
import { DAY_MS, type Session, startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer()
})
after(async () => {
  await api.stop()
})

const PRICE = 20_000
const DESTINATION = 'https://acme.example/launch?utm_source=linkedin'
const BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
const CREATOR_IP = '203.0.113.10'

async function scenario() {
  const [brand, creator] = await Promise.all([api.fundedBrand(100_000), api.listedCreator({ priceCents: PRICE })])
  const as = (session: Session, method: string, path: string, body?: unknown, headers?: Record<string, string>) =>
    api.call(method, path, { token: session.token, body, headers })

  async function booking(state: 'requested' | 'accepted' | 'submitted' | 'declined') {
    const res = await as(brand, 'POST', '/bookings', {
      creatorId: creator.user.id,
      brief: 'Please post about our pipeline analytics launch.',
      destinationUrl: DESTINATION,
      deadline: new Date(Date.now() + 7 * DAY_MS).toISOString(),
    })
    assert.equal(res.status, 201)
    const id: string = res.body.booking.id
    if (state === 'declined') await as(creator, 'POST', `/bookings/${id}/decline`)
    if (state === 'accepted' || state === 'submitted') await as(creator, 'POST', `/bookings/${id}/accept`)
    if (state === 'submitted') {
      const submitted = await as(creator, 'POST', `/bookings/${id}/submit`, { postUrl: 'https://www.linkedin.com/posts/x' }, {
        'X-Forwarded-For': CREATOR_IP,
      })
      assert.equal(submitted.status, 200)
    }
    const code = (await db.booking.findUniqueOrThrow({ where: { id } })).trackingCode
    return { id, path: `/r/${code}` }
  }

  const click = (path: string, { ip = '198.51.100.7', ua = BROWSER }: { ip?: string; ua?: string } = {}) =>
    api.call('GET', path, { headers: { 'User-Agent': ua, 'X-Forwarded-For': ip } })

  const clicks = (id: string) => db.click.count({ where: { bookingId: id } })
  const status = async (id: string) => (await db.booking.findUniqueOrThrow({ where: { id } })).status
  const stats = (id: string, session: Session = brand) => as(session, 'GET', `/bookings/${id}/stats`)

  return { brand, creator, booking, click, clicks, status, stats }
}

/** Click recording runs after the redirect is sent, so wait for it to land. */
async function eventually(check: () => Promise<boolean>, what: string, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await check()) return
    await sleep(250)
  }
  assert.fail(`timed out waiting for: ${what}`)
}

/** For "nothing happens" checks: give background work time to finish before asserting. */
const settle = () => sleep(3_000)

describe('GET /r/:code', () => {
  test('redirects to the brand’s page and counts a human click', async () => {
    const s = await scenario()
    const { id, path } = await s.booking('accepted')
    const res = await s.click(path)
    assert.equal(res.status, 302)
    assert.equal(res.headers.get('location'), DESTINATION)
    await eventually(async () => (await s.clicks(id)) === 1, 'one recorded click')
  })

  test('the first human click on a submitted post pays the creator', async () => {
    const s = await scenario()
    const { id, path } = await s.booking('submitted')
    assert.equal((await s.click(path)).status, 302)
    await eventually(async () => (await s.status(id)) === 'paid', 'payment by click')

    const booking = await api.call('GET', `/bookings/${id}`, { token: s.brand.token })
    assert.equal(booking.body.booking.verifiedVia, 'click')
    assert.equal(booking.body.booking.timeline.find((e: { event: string }) => e.event === 'verified').via, 'click')
    assert.deepEqual(await api.wallet(s.creator), { availableCents: PRICE, heldCents: 0, reconciled: true })
    assert.deepEqual(await api.wallet(s.brand), { availableCents: 80_000, heldCents: 0, reconciled: true })
  })

  test('a click from the creator’s own IP is counted but does not pay; a different visitor then does', async () => {
    const s = await scenario()
    const { id, path } = await s.booking('submitted')
    await s.click(path, { ip: CREATOR_IP })
    await eventually(async () => (await s.clicks(id)) === 1, 'self-click recorded')
    await settle()
    assert.equal(await s.status(id), 'submitted')

    await s.click(path, { ip: '192.0.2.44' })
    await eventually(async () => (await s.status(id)) === 'paid', 'payment by an outside click')
  })

  test('later clicks on a paid booking are counted and never pay twice', async () => {
    const s = await scenario()
    const { id, path } = await s.booking('submitted')
    await s.click(path, { ip: '192.0.2.1' })
    await eventually(async () => (await s.status(id)) === 'paid', 'first payment')
    await Promise.all([s.click(path, { ip: '192.0.2.2' }), s.click(path, { ip: '192.0.2.3' })])
    await eventually(async () => (await s.clicks(id)) === 3, 'three clicks')
    assert.equal(await db.transaction.count({ where: { bookingId: id, type: 'payout' } }), 1)
    assert.deepEqual(await api.wallet(s.creator), { availableCents: PRICE, heldCents: 0, reconciled: true })
  })

  test('many people clicking at once still pays exactly once', async () => {
    const s = await scenario()
    const { id, path } = await s.booking('submitted')
    await Promise.all(Array.from({ length: 5 }, (_, i) => s.click(path, { ip: `192.0.2.${100 + i}` })))
    await eventually(async () => (await s.clicks(id)) === 5, 'five clicks')
    await settle()
    assert.equal(await db.transaction.count({ where: { bookingId: id, type: 'payout' } }), 1)
    assert.deepEqual(await api.wallet(s.creator), { availableCents: PRICE, heldCents: 0, reconciled: true })
  })

  const bots: [string, string][] = [
    ['LinkedIn’s preview crawler', 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)'],
    ['Facebook’s crawler', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'],
    ['Slack’s unfurler', 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)'],
    ['WhatsApp’s preview', 'WhatsApp/2.23.20.0'],
    ['curl', 'curl/8.7.1'],
    ['an empty user agent', ''],
  ]
  for (const [label, ua] of bots) {
    test(`${label} is redirected but not counted and never pays`, async () => {
      const s = await scenario()
      const { id, path } = await s.booking('submitted')
      const res = await s.click(path, { ua })
      assert.equal(res.status, 302)
      assert.equal(res.headers.get('location'), DESTINATION)
      await settle()
      assert.equal(await s.clicks(id), 0)
      assert.equal(await s.status(id), 'submitted')
    })
  }

  test('before the creator accepts, the link redirects but nothing is counted', async () => {
    const s = await scenario()
    for (const state of ['requested', 'declined'] as const) {
      const { id, path } = await s.booking(state)
      assert.equal((await s.click(path)).status, 302)
      await settle()
      assert.equal(await s.clicks(id), 0, state)
    }
  })

  test('unknown and malformed codes are 404', async () => {
    for (const code of ['AAAAAAAA', 'short', 'has space', '../../etc']) {
      const res = await api.call('GET', `/r/${encodeURIComponent(code)}`, { headers: { 'User-Agent': BROWSER } })
      assert.equal(res.status, 404, code)
    }
  })
})

describe('GET /bookings/:id/stats', () => {
  test('counts total and unique visitors, grouped by UTC day', async () => {
    const s = await scenario()
    const { id, path } = await s.booking('accepted')
    for (const ip of ['192.0.2.1', '192.0.2.1', '192.0.2.2']) await s.click(path, { ip })
    await eventually(async () => (await s.clicks(id)) === 3, 'three clicks')
    await db.click.create({
      data: { bookingId: id, ipHash: 'older-visitor', userAgent: BROWSER, clickedAt: new Date('2026-09-01T23:30:00Z') },
    })

    const res = await s.stats(id)
    assert.equal(res.status, 200)
    assert.equal(res.body.totalClicks, 4)
    assert.equal(res.body.uniqueClicks, 3)
    assert.deepEqual(res.body.byDay[0], { date: '2026-09-01', clicks: 1 })
    assert.equal(res.body.byDay.at(-1).clicks, 3)
    assert.deepEqual(await s.stats(id, s.creator).then((r) => r.body), res.body, 'both parties see the same stats')
  })

  test('a booking with no clicks has zero stats', async () => {
    const s = await scenario()
    const { id } = await s.booking('requested')
    assert.deepEqual((await s.stats(id)).body, { totalClicks: 0, uniqueClicks: 0, byDay: [] })
  })

  test('outsiders get 403, unknown ids 404, anonymous 401', async () => {
    const s = await scenario()
    const { id } = await s.booking('accepted')
    const outsider = await api.signup('brand')
    assert.equal((await s.stats(id, outsider)).status, 403)
    assert.equal((await s.stats(randomUUID())).status, 404)
    assert.equal((await api.call('GET', `/bookings/${id}/stats`)).status, 401)
  })
})

describe('background sweep loop', () => {
  test('settles an overdue booking on its own, without any request', async () => {
    const s = await scenario()
    const { id } = await s.booking('requested')
    await db.booking.update({ where: { id }, data: { deadline: new Date(Date.now() - 1_000) } })

    const stop = startSweepLoop(200)
    try {
      await eventually(async () => (await s.status(id)) === 'refunded', 'refund by the background loop', 30_000)
    } finally {
      stop()
    }
    assert.deepEqual(await api.wallet(s.brand), { availableCents: 100_000, heldCents: 0, reconciled: true })
  })
})

describe('bot detection', () => {
  test('real browsers are humans; crawlers, scripts and blanks are not', () => {
    assert.equal(isAutomated(BROWSER), false)
    assert.equal(isAutomated('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/128.0 Mobile Safari/537.36'), false)
    for (const ua of ['LinkedInBot/1.0', 'Googlebot/2.1', 'python-requests/2.32', 'node', 'undici', '  ', undefined]) {
      assert.equal(isAutomated(ua), true, String(ua))
    }
  })
})
