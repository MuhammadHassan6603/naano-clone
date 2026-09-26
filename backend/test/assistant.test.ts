import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import { after, before, describe, test } from 'node:test'
import { readFile, readdir } from 'node:fs/promises'
import { createApp } from '../src/app.js'
import { db } from '../src/db.js'
import { GEMINI_MODELS, SCREENS, SUGGESTIONS, geminiModel, guessIntent, type Intent, type Model } from '../src/assistant.js'
import { MAX_QUESTIONS_PER_WINDOW } from '../src/routes/assistant.js'
import { DAY_MS, type Session, insertBooking, startServer } from './helpers.js'

const prompts: string[] = []
let current: Model | null = null
let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer({
    assistantModel: async (prompt) => {
      prompts.push(prompt)
      if (!current) throw new Error('no model scripted')
      return current(prompt)
    },
  })
})
after(async () => {
  await api.stop()
})

const routeTo = (intent: Intent | Record<string, unknown>) => {
  current = async () => JSON.stringify(intent)
}

const ask = (session: Session | null, text: string, extra: Record<string, unknown> = {}) =>
  api.call('POST', '/assistant', { token: session?.token, body: { messages: [{ role: 'user', text }], timeZone: 'UTC', ...extra } })

async function reply(session: Session, intent: Intent | Record<string, unknown>, extra: Record<string, unknown> = {}) {
  routeTo(intent)
  const res = await ask(session, 'a question the model classifies', extra)
  assert.equal(res.status, 200, JSON.stringify(res.body))
  return res.body as { reply: string; action?: { path: string; label: string; highlight?: string; auto: boolean } }
}

async function book(brand: Session, creator: Session) {
  const res = await api.call('POST', '/bookings', {
    token: brand.token,
    body: {
      creatorId: creator.user.id,
      brief: 'Please write about our new pipeline analytics dashboard.',
      destinationUrl: 'https://acme.example',
      deadline: new Date(Date.now() + 7 * DAY_MS).toISOString(),
    },
  })
  assert.equal(res.status, 201, JSON.stringify(res.body))
  return res.body.booking.id as string
}

const as = (session: Session, action: string, id: string, body?: unknown) =>
  api.call('POST', `/bookings/${id}/${action}`, { token: session.token, body })

describe('access and input', () => {
  test('needs a login', async () => {
    assert.equal((await ask(null, 'hi')).status, 401)
  })

  test('rejects malformed conversations', async () => {
    const brand = await api.signup('brand')
    const bad: [unknown, RegExp][] = [
      [{}, /messages must be a non-empty list/],
      [{ messages: [] }, /messages must be a non-empty list/],
      [{ messages: 'hi' }, /messages must be a non-empty list/],
      [{ messages: [{ role: 'system', text: 'x' }] }, /role/],
      [{ messages: [{ role: 'user', text: 42 }] }, /role/],
      [{ messages: [null] }, /role/],
      [{ messages: [{ role: 'user', text: '   ' }] }, /cannot be empty/],
      [{ messages: [{ role: 'user', text: 'x'.repeat(2001) }] }, /at most 2000/],
      [{ messages: [{ role: 'user', text: 'hi' }, { role: 'assistant', text: 'hello' }] }, /last message must be from the user/],
      [{ messages: [{ role: 'user', text: 'hi' }], page: 'https://evil.example' }, /page must be a path/],
    ]
    for (const [body, error] of bad) {
      const res = await api.call('POST', '/assistant', { token: brand.token, body })
      assert.equal(res.status, 400, JSON.stringify(body))
      assert.match(res.body.error, error)
    }
  })

  test('an invalid time zone falls back to UTC instead of failing', async () => {
    const brand = await api.signup('brand')
    routeTo({ intent: 'wallet' })
    assert.equal((await ask(brand, 'balance?', { timeZone: 'Mars/Olympus' })).status, 200)
  })

  test('the model gets the recent conversation for context', async () => {
    const brand = await api.signup('brand')
    routeTo({ intent: 'greeting' })
    prompts.length = 0
    const messages = Array.from({ length: 9 }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', text: `m${i}` }))
    assert.equal((await api.call('POST', '/assistant', { token: brand.token, body: { messages } })).status, 200)
    const prompt = prompts.at(-1)!
    assert.ok(!prompt.includes('m2'))
    assert.ok(prompt.includes('assistant: m3'))
    assert.ok(prompt.trimEnd().endsWith('user: m8'))
  })
})

describe('answers come from the database, word for word', () => {
  test('a brand’s wallet', async () => {
    const [brand, creator] = await Promise.all([api.fundedBrand(100_000), api.listedCreator({ priceCents: 20_000 })])
    assert.equal((await reply(brand, { intent: 'wallet' })).reply, 'You have $1,000 available to spend and $0 held in escrow.')
    await book(brand, creator)
    const answer = await reply(brand, { intent: 'wallet' })
    assert.equal(answer.reply, 'You have $800 available to spend and $200 held in escrow for 1 open booking.')
    assert.deepEqual(answer.action, { path: '/dashboard/wallet', label: 'Wallet', highlight: 'balance', auto: false })
    const wallet = await api.wallet(brand)
    assert.deepEqual([wallet.availableCents, wallet.heldCents], [80_000, 20_000])
  })

  test('cents are shown exactly', async () => {
    const brand = await api.fundedBrand(12_345)
    assert.equal((await reply(brand, { intent: 'wallet' })).reply, 'You have $123.45 available to spend and $0 held in escrow.')
  })

  test('a creator’s earnings, open escrow and requests', async () => {
    const [brand, creator] = await Promise.all([api.fundedBrand(100_000), api.listedCreator({ priceCents: 20_000 }, 'Nia Test')])
    const first = await book(brand, creator)
    await book(brand, creator)
    await as(creator, 'accept', first)
    await as(creator, 'submit', first, { postUrl: 'https://www.linkedin.com/posts/nia' })
    await as(brand, 'approve', first)

    assert.equal(
      (await reply(creator, { intent: 'wallet' })).reply,
      "You've earned $200 from 1 verified post. Another $200 is held in escrow for your 1 open booking, paid once each post is verified.",
    )
    const requests = await reply(creator, { intent: 'bookings', status: 'requested' })
    assert.match(requests.reply, /^You have 1 new request, worth \$200 in total: Test brand \(\$200, due .+\)\.$/)
    assert.equal(requests.action?.highlight, 'next-step')
    assert.equal((await reply(creator, { intent: 'bookings' })).reply, 'You have 2 bookings worth $400: 1 new request and 1 paid booking.')
    assert.equal(
      (await reply(creator, { intent: 'bookings', status: 'refunded' })).reply,
      'You have no refunded bookings (declined or expired) right now.',
    )
  })

  test('what needs the brand’s approval, with the auto-approve time', async () => {
    const [brand, creator] = await Promise.all([api.fundedBrand(100_000), api.listedCreator({ priceCents: 90_000 }, 'Priya Test')])
    assert.match((await reply(brand, { intent: 'needs_action' })).reply, /^Nothing needs your approval right now/)
    const id = await book(brand, creator)
    await as(creator, 'accept', id)
    await as(creator, 'submit', id, { postUrl: 'https://www.linkedin.com/posts/priya' })
    const answer = await reply(brand, { intent: 'needs_action' })
    assert.match(answer.reply, /^1 post is waiting for your approval: Priya Test, \$900, posted and waiting for your approval, auto-approves .+\.$/)
    assert.deepEqual(answer.action, { path: `/dashboard/bookings/${id}`, label: 'Booking with Priya Test', highlight: 'next-step', auto: false })
  })

  test('dates are shown in the user’s time zone', async () => {
    const [brand, creator] = await Promise.all([api.signup('brand'), api.listedCreator({}, 'Zed Test')])
    const row = await insertBooking(brand.user.id, creator.user.id, { status: 'requested' })
    await db.booking.update({ where: { id: row.id }, data: { deadline: new Date('2030-01-01T02:00:00Z') } })
    routeTo({ intent: 'bookings', status: 'requested' })
    assert.match((await ask(brand, 'q', { timeZone: 'UTC' })).body.reply, /Jan 1, 2030, 2:00\sAM/)
    assert.match((await ask(brand, 'q', { timeZone: 'Asia/Karachi' })).body.reply, /Jan 1, 2030, 7:00\sAM/)
    assert.match((await ask(brand, 'q', { timeZone: 'America/Los_Angeles' })).body.reply, /Dec 31, 2029, 6:00\sPM/)
  })

  test('clicks in total, per booking, and for the page being viewed', async () => {
    const [brand, priya, maya] = await Promise.all([api.signup('brand'), api.listedCreator({}, 'Priya Test'), api.listedCreator({}, 'Maya Test')])
    const withPriya = await insertBooking(brand.user.id, priya.user.id, { status: 'submitted' })
    const withMaya = await insertBooking(brand.user.id, maya.user.id, { status: 'paid' })
    await db.booking.updateMany({ where: { id: { in: [withPriya.id, withMaya.id] } }, data: { acceptedAt: new Date() } })
    await db.click.createMany({
      data: [
        ...['a', 'b', 'a'].map((ip) => ({ bookingId: withPriya.id, ipHash: ip, userAgent: 'Mozilla' })),
        { bookingId: withMaya.id, ipHash: 'c', userAgent: 'Mozilla' },
      ],
    })
    const total = await reply(brand, { intent: 'clicks' })
    assert.equal(total.reply, 'Your posts got 4 clicks in total across 2 tracked links: Priya Test 3 and Maya Test 1.')
    assert.equal(total.action?.path, `/dashboard/bookings/${withPriya.id}`)

    assert.equal((await reply(brand, { intent: 'clicks', with: 'priya' })).reply, 'The post with Priya Test has 3 clicks from 2 unique visitors.')
    assert.equal((await reply(brand, { intent: 'clicks', with: 'Maya' })).reply, 'The post with Maya Test has 1 click from 1 unique visitor.')
    const here = await reply(brand, { intent: 'clicks' }, { page: `/dashboard/bookings/${withMaya.id}` })
    assert.equal(here.reply, 'The post with Maya Test has 1 click from 1 unique visitor.')
  })

  test('one booking, briefs and the creator profile', async () => {
    const [brand, creator] = await Promise.all([
      api.fundedBrand(100_000),
      api.listedCreator({ priceCents: 45_000, niche: 'RevOps', followers: 12_000 }, 'Lena Test'),
    ])
    const id = await book(brand, creator)
    const detail = await reply(brand, { intent: 'booking', with: 'Lena' })
    assert.match(
      detail.reply,
      /^Your booking with Lena Test, \$450, waiting for the creator to accept, post due by .+\. There is no tracked link yet\. The brief: "Please write about our new pipeline analytics dashboard\."$/,
    )
    assert.equal(detail.action?.path, `/dashboard/bookings/${id}`)

    const briefs = await reply(creator, { intent: 'briefs' })
    assert.equal(briefs.reply, 'Test brand asked ($450): "Please write about our new pipeline analytics dashboard."')

    const profile = await reply(creator, { intent: 'profile' })
    assert.equal(profile.reply, 'Your card is live: RevOps, $450 per post, 12,000 followers (self-reported), audience "SaaS founders, seed to Series B".')
  })
})

describe('names in the question', () => {
  test('a counterpart named in the question narrows the answer, without the AI', async () => {
    const [brand, priya, maya] = await Promise.all([api.signup('brand'), api.listedCreator({}, 'Priya Nairtest'), api.listedCreator({}, 'Maya Okafortest')])
    const withPriya = await insertBooking(brand.user.id, priya.user.id, { status: 'submitted' })
    await insertBooking(brand.user.id, maya.user.id, { status: 'paid' })
    await db.booking.updateMany({ where: { brandId: brand.user.id }, data: { acceptedAt: new Date() } })
    await db.click.createMany({ data: ['a', 'b'].map((ip) => ({ bookingId: withPriya.id, ipHash: ip, userAgent: 'Mozilla' })) })
    current = null
    const original = console.error
    console.error = () => {}
    try {
      const res = await ask(brand, 'how many clicks did priya get')
      assert.equal(res.body.reply, 'The post with Priya Nairtest has 2 clicks from 2 unique visitors.')
      assert.equal(res.body.via, 'keywords')
      const approve = await ask(brand, 'approve priya')
      assert.equal(approve.body.action.path, `/dashboard/bookings/${withPriya.id}`)
      const both = await ask(brand, 'clicks for priya and maya')
      assert.match(both.body.reply, /^Your posts got 2 clicks in total/)
    } finally {
      console.error = original
    }
  })

  test('each answer says whether the AI, a chip or keywords routed it', async () => {
    const brand = await api.signup('brand')
    routeTo({ intent: 'wallet' })
    assert.equal((await ask(brand, 'balance please')).body.via, 'ai')
    assert.equal((await ask(brand, SUGGESTIONS.brand[0])).body.via, 'chip')
  })
})

describe('messages and fit', () => {
  test('unread messages are counted from the database, per person', async () => {
    const [brand, priya, maya] = await Promise.all([api.signup('brand'), api.listedCreator({}, 'Priya Msgtest'), api.listedCreator({}, 'Maya Msgtest')])
    const a = await insertBooking(brand.user.id, priya.user.id, { status: 'accepted' })
    const b = await insertBooking(brand.user.id, maya.user.id, { status: 'requested' })
    assert.equal((await reply(brand, { intent: 'messages' })).reply, 'You have no unread messages. Each booking has its own conversation with the other side.')
    for (const [session, id, body] of [[priya, a.id, 'Draft is ready'], [priya, a.id, 'Sent it over'], [maya, b.id, 'Quick question']] as const) {
      assert.equal((await api.call('POST', `/bookings/${id}/messages`, { token: session.token, body: { body } })).status, 201)
    }
    const all = await reply(brand, { intent: 'messages' })
    assert.equal(all.reply, 'You have 3 unread messages: 2 from Priya Msgtest and 1 from Maya Msgtest.')
    const named = await reply(brand, { intent: 'messages', with: 'Priya' })
    assert.match(named.reply, /^Priya Msgtest's latest message, .+: "Sent it over" You have 2 unread messages from them\.$/)
    assert.deepEqual(named.action, { path: `/dashboard/bookings/${a.id}`, label: 'Booking with Priya Msgtest', highlight: 'messages', auto: false })
    await api.call('GET', `/bookings/${a.id}/messages`, { token: brand.token })
    assert.equal((await reply(brand, { intent: 'messages' })).reply, 'You have 1 unread message: 1 from Maya Msgtest.')
    assert.equal((await reply(priya, { intent: 'messages', with: 'Test brand' })).reply, "Test brand hasn't sent you a message yet.")
  })

  test('the target form is a brand screen', async () => {
    const [brand, creator] = await Promise.all([api.signup('brand'), api.listedCreator()])
    const open = await reply(brand, { intent: 'navigate', screen: 'audience', highlight: 'audience-form' })
    assert.deepEqual(open.action, { path: '/dashboard/audience', label: 'Who you sell to', highlight: 'audience-form', auto: true })
    assert.equal((await reply(creator, { intent: 'navigate', screen: 'audience' })).reply, "That screen isn't part of a creator account.")
    assert.match((await reply(brand, { intent: 'explain', topic: 'fit' })).reply, /^Tell us who you sell to/)
  })
})

describe('privacy: only the caller’s own data', () => {
  test('names outside the caller’s bookings reveal nothing', async () => {
    const [acme, other, priya, stranger] = await Promise.all([
      api.fundedBrand(100_000),
      api.fundedBrand(100_000),
      api.listedCreator({}, 'Priya Test'),
      api.listedCreator({}, 'Secret Creator'),
    ])
    const hidden = await insertBooking(other.user.id, stranger.user.id, { status: 'paid' })
    await db.booking.update({ where: { id: hidden.id }, data: { acceptedAt: new Date(), brief: 'TOP SECRET BRIEF' } })
    await db.click.create({ data: { bookingId: hidden.id, ipHash: 'x', userAgent: 'Mozilla' } })
    await book(acme, priya)

    const probes = [
      { intent: 'clicks', with: 'Secret Creator' },
      { intent: 'booking', with: 'Secret' },
      { intent: 'navigate', screen: 'booking', with: 'Secret Creator' },
      { intent: 'do_action', action: 'approve', with: 'Secret Creator' },
    ]
    for (const probe of probes) {
      const answer = await reply(acme, probe)
      assert.equal(answer.reply, `You don't have a booking with ${probe.with}. I can only see your own bookings, which are with Priya Test.`)
      assert.equal(answer.action, undefined)
    }
    const onTheirPage = await reply(acme, { intent: 'booking' }, { page: `/dashboard/bookings/${hidden.id}` })
    assert.doesNotMatch(JSON.stringify(onTheirPage), /TOP SECRET|Secret Creator/)
    const theirClicks = await reply(acme, { intent: 'clicks' }, { page: `/dashboard/bookings/${hidden.id}` })
    assert.doesNotMatch(JSON.stringify(theirClicks), /Secret/)

    assert.equal(
      (await reply(acme, { intent: 'other_people' })).reply,
      "I can only see your own account, so I can't share anything about other brands or creators.",
    )
    assert.equal((await reply(other, { intent: 'wallet' })).reply, 'You have $1,000 available to spend and $0 held in escrow.')
  })

  test('the AI model never receives account data', async () => {
    const [brand, creator] = await Promise.all([api.fundedBrand(123_400), api.listedCreator({ priceCents: 20_000 }, 'Omar Test')])
    await book(brand, creator)
    prompts.length = 0
    await reply(brand, { intent: 'wallet' })
    const prompt = prompts.at(-1)!
    assert.match(prompt, /The user is a brand/)
    for (const secret of ['1,034', '1034', '$200', 'pipeline analytics', 'Omar', brand.user.email]) {
      assert.ok(!prompt.includes(secret), `the prompt leaked ${secret}`)
    }
  })

  test('screens and actions follow the role', async () => {
    const [brand, creator] = await Promise.all([api.signup('brand'), api.listedCreator()])
    assert.equal((await reply(brand, { intent: 'navigate', screen: 'profile' })).reply, "That screen isn't part of a brand account.")
    assert.equal((await reply(brand, { intent: 'navigate', screen: 'constructor' })).reply, "That screen isn't part of a brand account.")
    assert.equal((await reply(creator, { intent: 'navigate', screen: 'marketplace' })).action?.highlight, 'profile-preview')
    assert.match((await reply(creator, { intent: 'navigate', screen: 'wallet', highlight: 'top-up' })).reply, /^Creators don't add money/)
    assert.match((await reply(creator, { intent: 'do_action', action: 'approve' })).reply, /^Brands approve posts, not creators/)
    assert.match((await reply(brand, { intent: 'do_action', action: 'accept' })).reply, /^Only the creator can do that/)
  })
})

describe('navigation and actions', () => {
  test('opens screens with a validated highlight', async () => {
    const brand = await api.signup('brand')
    const wallet = await reply(brand, { intent: 'navigate', screen: 'wallet', highlight: 'top-up' })
    assert.equal(wallet.reply, "Here's Wallet. I've highlighted the Add demo money form.")
    assert.deepEqual(wallet.action, { path: '/dashboard/wallet', label: 'Wallet', highlight: 'top-up', auto: true })
    const bogus = await reply(brand, { intent: 'navigate', screen: 'wallet', highlight: 'balance-sheet' })
    assert.deepEqual(bogus.action, { path: '/dashboard/wallet', label: 'Wallet', auto: true })
    assert.equal((await reply(brand, { intent: 'navigate', screen: 'bookings', tab: 'done' })).action?.path, '/dashboard/bookings?tab=done')
    assert.equal((await reply(brand, { intent: 'navigate', screen: 'bookings', tab: 'action' })).action?.path, '/dashboard/bookings')
    assert.equal((await reply(brand, { intent: 'navigate', screen: 'marketplace' })).action?.path, '/#creators')
    assert.match((await reply(brand, { intent: 'navigate', screen: 'booking', highlight: 'insights' })).reply, /^You don't have any bookings yet/)
  })

  test('insights open the newest booking that has a tracked link', async () => {
    const [brand, a, b] = await Promise.all([api.signup('brand'), api.listedCreator({}, 'Ana Test'), api.listedCreator({}, 'Ben Test')])
    const tracked = await insertBooking(brand.user.id, a.user.id, { status: 'accepted' })
    await db.booking.update({ where: { id: tracked.id }, data: { acceptedAt: new Date() } })
    await insertBooking(brand.user.id, b.user.id, { status: 'requested' })
    const answer = await reply(brand, { intent: 'navigate', screen: 'booking', highlight: 'insights' })
    assert.equal(answer.reply, "Here's your booking with Ana Test. I've highlighted Link insights.")
    assert.deepEqual(answer.action, { path: `/dashboard/bookings/${tracked.id}`, label: 'Booking with Ana Test', highlight: 'insights', auto: true })
  })

  test('asking it to approve points at the button and moves no money', async () => {
    const [brand, creator] = await Promise.all([api.fundedBrand(100_000), api.listedCreator({ priceCents: 90_000 }, 'Priya Test')])
    assert.equal((await reply(brand, { intent: 'do_action', action: 'approve' })).reply, 'No post is waiting for your approval right now.')
    const id = await book(brand, creator)
    await as(creator, 'accept', id)
    await as(creator, 'submit', id, { postUrl: 'https://www.linkedin.com/posts/priya' })
    const answer = await reply(brand, { intent: 'do_action', action: 'approve', with: 'Priya' })
    assert.equal(
      answer.reply,
      'I can\'t approve and pay for you, so nothing changes until you click. I\'ve opened your booking with Priya Test and highlighted the "Approve and pay $900" button.',
    )
    assert.deepEqual(answer.action, { path: `/dashboard/bookings/${id}`, label: 'Booking with Priya Test', highlight: 'next-step', auto: true })
    assert.equal((await db.booking.findUniqueOrThrow({ where: { id } })).status, 'submitted')
    assert.deepEqual([(await api.wallet(brand)).heldCents, (await api.wallet(creator)).availableCents], [90_000, 0])
  })
})

describe('when the AI is unavailable or wrong', () => {
  test('the suggestion chips never call the model and are answered correctly', async () => {
    const [brand, creator] = await Promise.all([api.fundedBrand(100_000), api.listedCreator({ priceCents: 20_000 }, 'Chip Test')])
    await book(brand, creator)
    current = null
    prompts.length = 0
    assert.equal((await ask(brand, SUGGESTIONS.brand[0])).body.reply, 'You have $800 available to spend and $200 held in escrow for 1 open booking.')
    assert.match((await ask(creator, SUGGESTIONS.creator[0])).body.reply, /^You have 1 new request, worth \$200 in total: Test brand/)
    assert.match((await ask(creator, SUGGESTIONS.creator[2])).body.reply, /^You've earned \$0 from 0 verified posts\. Another \$200 is held/)
    assert.equal((await ask(creator, SUGGESTIONS.creator[3])).body.action.highlight, 'profile-form')
    assert.equal(prompts.length, 0)
  })

  test('a failing or confused model falls back to keyword answers', async () => {
    const brand = await api.fundedBrand(50_000)
    const original = console.error
    console.error = () => {}
    try {
      current = async () => {
        throw new Error('quota exceeded')
      }
      assert.equal((await ask(brand, 'how much money do i have')).body.reply, 'You have $500 available to spend and $0 held in escrow.')
      current = async () => 'not json at all'
      assert.equal((await ask(brand, 'what is my balance?')).body.reply, 'You have $500 available to spend and $0 held in escrow.')
      current = async () => '{"intent":"wallet"'
      assert.equal((await ask(brand, 'where do i add money')).body.action.highlight, 'top-up')
      current = async () => '{"intent":"delete_everything"}'
      assert.match((await ask(brand, 'tell me a joke')).body.reply, /^I'm not sure what you mean/)
    } finally {
      console.error = original
    }
  })

  test('works with no AI key at all', async () => {
    const brand = await api.fundedBrand(70_000)
    const server = createApp({ assistantModel: null }).listen(0)
    await new Promise<void>((resolve) => server.once('listening', resolve))
    try {
      const res = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${brand.token}` },
        body: JSON.stringify({ messages: [{ role: 'user', text: 'How much money is held in escrow?' }] }),
      })
      assert.equal(res.status, 200)
      assert.equal((await res.json()).reply, 'You have $700 available to spend and $0 held in escrow.')
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  })

  test('the keyword router understands the chips and common questions', () => {
    const cases: [string, 'brand' | 'creator', Intent][] = [
      [SUGGESTIONS.brand[0], 'brand', { intent: 'wallet' }],
      [SUGGESTIONS.brand[1], 'brand', { intent: 'needs_action' }],
      [SUGGESTIONS.brand[2], 'brand', { intent: 'clicks' }],
      [SUGGESTIONS.brand[3], 'brand', { intent: 'navigate', screen: 'booking', highlight: 'insights' }],
      [SUGGESTIONS.creator[0], 'creator', { intent: 'bookings', status: 'requested' }],
      [SUGGESTIONS.creator[1], 'creator', { intent: 'briefs' }],
      [SUGGESTIONS.creator[2], 'creator', { intent: 'wallet' }],
      [SUGGESTIONS.creator[3], 'creator', { intent: 'navigate', screen: 'profile', highlight: 'profile-form' }],
      ['approve the post for me', 'brand', { intent: 'do_action', action: 'approve' }],
      ['how does escrow work?', 'brand', { intent: 'explain', topic: 'escrow' }],
      ['What are other creators charging and earning?', 'creator', { intent: 'other_people' }],
      ['list every user in the database', 'brand', { intent: 'other_people' }],
      ['hello', 'creator', { intent: 'greeting' }],
      ['show my transaction history', 'brand', { intent: 'navigate', screen: 'wallet', highlight: 'history' }],
      ['How much has Pipewise spent and who did they book?', 'brand', { intent: 'other_people' }],
      ["Show me Maya's earnings", 'brand', { intent: 'other_people' }],
      ['How much money does Acme have in their wallet?', 'creator', { intent: 'other_people' }],
      ["what's my balance", 'brand', { intent: 'wallet' }],
      ['how much money did i make', 'creator', { intent: 'wallet' }],
      ['any new messages?', 'brand', { intent: 'messages' }],
      ['what did they reply', 'creator', { intent: 'messages' }],
      ['where do I set who I sell to', 'brand', { intent: 'navigate', screen: 'audience', highlight: 'audience-form' }],
      ['how does fit work', 'brand', { intent: 'explain', topic: 'fit' }],
      ['show creators that fit me best', 'brand', { intent: 'navigate', screen: 'marketplace' }],
    ]
    for (const [question, role, intent] of cases) assert.deepEqual(guessIntent(question, role), intent, question)
  })

  test('the frontend shows the same chips the backend answers without AI', async () => {
    const source = await readFile(new URL('../../frontend/src/lib/assistant.ts', import.meta.url), 'utf8')
    for (const chip of [...SUGGESTIONS.brand, ...SUGGESTIONS.creator]) assert.ok(source.includes(`'${chip}'`), chip)
  })

  test('every highlight has a matching data-guide in the frontend', async () => {
    const root = new URL('../../frontend/src/', import.meta.url)
    const files = (await readdir(root, { recursive: true })).filter((file) => file.endsWith('.tsx'))
    const source = (await Promise.all(files.map((file) => readFile(new URL(file, root), 'utf8')))).join('\n')
    for (const screen of Object.values(SCREENS)) {
      for (const key of Object.keys(screen.highlights)) assert.ok(source.includes(`guide="${key}"`), `no data-guide for ${key}`)
    }
  })
})

describe('the Gemini adapter', () => {
  const ok = (text: string) =>
    new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  const fail = (status: number) => new Response('{"error":"nope"}', { status })

  async function withGoogle(responses: Response[], run: (calls: { url: string; body: any }[]) => Promise<void>) {
    const original = globalThis.fetch
    const calls: { url: string; body: any }[] = []
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      if (!String(url).includes('googleapis.com')) return original(url, init)
      calls.push({ url: String(url), body: JSON.parse(String(init?.body)) })
      const next = responses.shift()
      if (!next) throw new Error('network down')
      return next
    }) as typeof fetch
    try {
      await run(calls)
    } finally {
      globalThis.fetch = original
    }
  }

  test('uses Flash-Lite first, in JSON mode with no thinking', async () => {
    await withGoogle([ok('{"intent":"wallet"}')], async (calls) => {
      assert.equal(await geminiModel('key')('prompt'), '{"intent":"wallet"}')
      assert.equal(GEMINI_MODELS[0], 'gemini-2.5-flash-lite')
      assert.ok(calls[0].url.includes(`/${GEMINI_MODELS[0]}:`))
      assert.equal(calls[0].body.generationConfig.responseMimeType, 'application/json')
      assert.equal(calls[0].body.generationConfig.thinkingConfig.thinkingBudget, 0)
    })
  })

  test('moves to the next model on rate limits, missing models and outages', async () => {
    await withGoogle([fail(429), fail(404), ok('{"intent":"greeting"}')], async (calls) => {
      assert.equal(await geminiModel('key')('prompt'), '{"intent":"greeting"}')
      assert.deepEqual(
        calls.map((c) => GEMINI_MODELS.find((m) => c.url.includes(`/${m}:`))),
        GEMINI_MODELS,
      )
      assert.equal(calls[2].body.generationConfig.responseMimeType, undefined)
    })
  })

  test('stops on a bad request and rests for a minute after everything fails', async () => {
    await withGoogle([fail(400)], async (calls) => {
      const model = geminiModel('key')
      await assert.rejects(model('prompt'), /400/)
      assert.equal(calls.length, 1)
      await assert.rejects(model('prompt'), /last minute/)
      assert.equal(calls.length, 1)
    })
  })
})

test('limits each user to a burst of questions', async () => {
  const [brand, other] = await Promise.all([api.signup('brand'), api.signup('brand')])
  routeTo({ intent: 'greeting' })
  for (let i = 0; i < MAX_QUESTIONS_PER_WINDOW; i += 1) assert.equal((await ask(brand, `q${i}`)).status, 200)
  const limited = await ask(brand, 'one more')
  assert.equal(limited.status, 429)
  assert.match(limited.body.error, /try again in a few minutes/)
  assert.equal((await ask(other, 'hi')).status, 200)
})
