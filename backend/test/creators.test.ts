import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { randomUUID } from 'node:crypto'
import { reliabilityScore } from '../src/creators.js'
import { type Session, defaultProfile as validProfile, insertBooking, linkedinFor, startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer()
})
after(async () => {
  await api.stop()
})

const PUBLIC_KEYS = ['audience', 'bio', 'followers', 'id', 'linkedinUrl', 'name', 'niche', 'priceCents', 'reliability']

const saveProfile = (session: Session, profile: Record<string, unknown> = validProfile) =>
  api.call('PUT', '/creators/me/profile', { token: session.token, body: { linkedinUrl: linkedinFor(), ...profile } })

const listedCreator = (...args: Parameters<typeof api.listedCreator>) => api.listedCreator(...args)

const ids = (res: { body: { creators: { id: string }[] } }) => res.body.creators.map((c) => c.id)

describe('PUT /creators/me/profile', () => {
  test('a creator saves a profile and gets back their public card', async () => {
    const session = await api.signup('creator', 'Dana')
    const linkedinUrl = linkedinFor('dana')
    const res = await saveProfile(session, { ...validProfile, bio: '  trimmed  ', linkedinUrl })
    assert.equal(res.status, 200)
    assert.deepEqual(res.body.creator, {
      id: session.user.id,
      name: 'Dana',
      ...validProfile,
      bio: 'trimmed',
      linkedinUrl,
      reliability: { delivered: 0, total: 0 },
    })
  })

  test('saving again replaces the profile, and /auth/me shows it', async () => {
    const session = await listedCreator()
    const res = await saveProfile(session, { ...validProfile, priceCents: 99_900, bio: '' })
    assert.equal(res.status, 200)
    assert.equal(res.body.creator.priceCents, 99_900)

    const me = await api.call('GET', '/auth/me', { token: session.token })
    assert.equal(me.body.profile.priceCents, 99_900)
    assert.equal(me.body.profile.bio, '')
  })

  test('a brand gets 403 and no token gets 401', async () => {
    const brand = await api.signup('brand')
    assert.equal((await saveProfile(brand)).status, 403)
    assert.equal((await api.call('PUT', '/creators/me/profile', { body: validProfile })).status, 401)
  })

  const invalid: [string, Record<string, unknown>, RegExp][] = [
    ['an unknown niche', { niche: 'Crypto' }, /niche must be one of/],
    ['a zero price', { priceCents: 0 }, /priceCents must be between 1/],
    ['a negative price', { priceCents: -500 }, /priceCents must be between 1/],
    ['a fractional price', { priceCents: 12.5 }, /priceCents must be a whole number/],
    ['a price sent as a string', { priceCents: '45000' }, /priceCents must be a whole number/],
    ['a price over the cap', { priceCents: 10_000_001 }, /priceCents must be between/],
    ['negative followers', { followers: -1 }, /followers must be between 0/],
    ['a bio over 1000 characters', { bio: 'x'.repeat(1001) }, /bio must be at most 1000/],
    ['a missing audience', { audience: undefined }, /audience is required/],
  ]
  for (const [label, override, message] of invalid) {
    test(`rejects ${label} with 400 and changes nothing`, async () => {
      const session = await listedCreator()
      const res = await saveProfile(session, { ...validProfile, ...override })
      assert.equal(res.status, 400)
      assert.match(res.body.error, message)
      const current = await api.call('GET', `/creators/${session.user.id}`)
      assert.equal(current.body.creator.priceCents, validProfile.priceCents)
    })
  }
})

describe('GET /creators', () => {
  test('lists creators with a price, never brands or unpriced creators, and never emails', async () => {
    const priced = await listedCreator()
    const unpriced = await api.signup('creator')
    const brand = await api.signup('brand')

    const res = await api.call('GET', '/creators')
    assert.equal(res.status, 200)
    assert.ok(ids(res).includes(priced.user.id))
    assert.ok(!ids(res).includes(unpriced.user.id))
    assert.ok(!ids(res).includes(brand.user.id))
    for (const creator of res.body.creators) assert.deepEqual(Object.keys(creator).sort(), PUBLIC_KEYS)
    assert.deepEqual(res.body.niches, ['AI', 'DevTools', 'Founders', 'HR', 'Marketing', 'RevOps', 'Sales', 'SEO'])
  })

  test('needs no login', async () => {
    assert.equal((await api.call('GET', '/creators')).status, 200)
  })

  test('filters by niche', async () => {
    const hr = await listedCreator({ niche: 'HR' })
    const seo = await listedCreator({ niche: 'SEO' })
    const res = await api.call('GET', '/creators?niche=HR')
    assert.equal(res.status, 200)
    assert.ok(ids(res).includes(hr.user.id))
    assert.ok(!ids(res).includes(seo.user.id))
    assert.ok(res.body.creators.every((c: { niche: string }) => c.niche === 'HR'))
  })

  test('filters by max price, inclusive', async () => {
    const cheap = await listedCreator({ priceCents: 20_000 })
    const pricey = await listedCreator({ priceCents: 20_001 })
    const res = await api.call('GET', '/creators?maxPriceCents=20000')
    assert.ok(ids(res).includes(cheap.user.id))
    assert.ok(!ids(res).includes(pricey.user.id))
    assert.ok(res.body.creators.every((c: { priceCents: number }) => c.priceCents <= 20_000))
  })

  test('sorts by price (cheapest first) and by followers (largest first)', async () => {
    await listedCreator({ priceCents: 30_000, followers: 1 })
    await listedCreator({ priceCents: 10_000, followers: 50 })

    const byPrice = (await api.call('GET', '/creators?sort=price')).body.creators
    for (let i = 1; i < byPrice.length; i++) assert.ok(byPrice[i - 1].priceCents <= byPrice[i].priceCents)

    const byFollowers = (await api.call('GET', '/creators?sort=followers')).body.creators
    for (let i = 1; i < byFollowers.length; i++) assert.ok(byFollowers[i - 1].followers >= byFollowers[i].followers)
  })

  const badQueries: [string, string][] = [
    ['an unknown niche', 'niche=Crypto'],
    ['a non-numeric max price', 'maxPriceCents=cheap'],
    ['a zero max price', 'maxPriceCents=0'],
    ['an unknown sort', 'sort=newest'],
    ['a repeated parameter', 'niche=HR&niche=SEO'],
  ]
  for (const [label, query] of badQueries) {
    test(`rejects ${label} with 400`, async () => {
      assert.equal((await api.call('GET', `/creators?${query}`)).status, 400)
    })
  }
})

describe('reliability score', () => {
  test('ranks by confidence: a longer perfect record beats a single delivery', () => {
    const records = [[1, 1], [0, 0], [2, 4], [5, 5], [0, 1], [4, 5], [3, 3]]
    const ranked = records
      .map(([delivered, total]) => ({ delivered, total }))
      .sort((a, b) => reliabilityScore(b) - reliabilityScore(a))
      .map(({ delivered, total }) => `${delivered}/${total}`)
    assert.deepEqual(ranked, ['5/5', '3/3', '4/5', '1/1', '2/4', '0/1', '0/0'])
  })

  test('counts paid as delivered, expired as a miss, and ignores declined and open bookings', async () => {
    const brand = await api.signup('brand')
    const creator = await listedCreator()
    for (const outcome of [
      { status: 'paid' },
      { status: 'paid' },
      { status: 'refunded', reason: 'expired' },
      { status: 'refunded', reason: 'declined' },
      { status: 'requested' },
      { status: 'accepted' },
      { status: 'submitted' },
    ] as const) {
      await insertBooking(brand.user.id, creator.user.id, outcome)
    }

    const res = await api.call('GET', `/creators/${creator.user.id}`)
    assert.deepEqual(res.body.creator.reliability, { delivered: 2, total: 3 })
  })

  test('default sort puts the better track record first and new creators last', async () => {
    const brand = await api.signup('brand')
    const niche = 'Founders'
    const perfect = await listedCreator({ niche, followers: 10 })
    const mixed = await listedCreator({ niche, followers: 999_999 })
    const newcomer = await listedCreator({ niche, followers: 5_000_000 })

    await insertBooking(brand.user.id, perfect.user.id, { status: 'paid' })
    await insertBooking(brand.user.id, mixed.user.id, { status: 'paid' })
    await insertBooking(brand.user.id, mixed.user.id, { status: 'refunded', reason: 'expired' })

    const res = await api.call('GET', `/creators?niche=${niche}`)
    const order = ids(res).filter((id) => [perfect, mixed, newcomer].some((s) => s.user.id === id))
    assert.deepEqual(order, [perfect.user.id, mixed.user.id, newcomer.user.id])
  })
})

describe('GET /creators/:id', () => {
  test('returns the public card', async () => {
    const creator = await listedCreator()
    const res = await api.call('GET', `/creators/${creator.user.id}`)
    assert.equal(res.status, 200)
    assert.deepEqual(Object.keys(res.body.creator).sort(), PUBLIC_KEYS)
  })

  test('404s for an unknown id, a malformed id, a brand, and an unpriced creator', async () => {
    const brand = await api.signup('brand')
    const unpriced = await api.signup('creator')
    for (const id of [randomUUID(), 'not-a-uuid', brand.user.id, unpriced.user.id]) {
      const res = await api.call('GET', `/creators/${id}`)
      assert.equal(res.status, 404, `expected 404 for ${id}`)
      assert.equal(res.body.error, 'Creator not found')
    }
  })
})
