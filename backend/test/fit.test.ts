import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { explainFit, hasTarget } from '../src/fit.js'
import { NICHES } from '../src/creators.js'
import { startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer()
})
after(async () => {
  await api.stop()
})

const creator = { niche: 'RevOps', audience: 'SaaS founders and sales leaders, seed to Series B', priceCents: 45_000 }

describe('explainFit', () => {
  test('matching niche, shared audience words and budget', () => {
    const fit = explainFit(creator, { niches: ['RevOps', 'Sales'], audience: 'Founders of SaaS companies', budgetCents: 50_000 })
    assert.deepEqual(fit, {
      matched: 3,
      reasons: [
        { kind: 'niche', match: true, label: 'RevOps niche' },
        { kind: 'audience', match: true, label: 'Audience: SaaS, founders' },
        { kind: 'budget', match: true, label: 'Within your $500 budget' },
      ],
    })
  })

  test('misses are explained honestly', () => {
    const fit = explainFit(creator, { niches: ['SEO'], audience: 'Nurses and doctors', budgetCents: 30_000 })
    assert.deepEqual(fit, {
      matched: 0,
      reasons: [
        { kind: 'niche', match: false, label: 'RevOps, outside your niches' },
        { kind: 'audience', match: false, label: 'Different audience' },
        { kind: 'budget', match: false, label: '$150 over your budget' },
      ],
    })
  })

  test('a price equal to the budget is within it, and cents are shown exactly', () => {
    assert.equal(explainFit(creator, { niches: [], audience: '', budgetCents: 45_000 }).reasons[0].label, 'Within your $450 budget')
    assert.equal(explainFit({ ...creator, priceCents: 45_050 }, { niches: [], audience: '', budgetCents: 45_000 }).reasons[0].label, '$0.50 over your budget')
  })

  test('audience matching ignores filler words and plurals, and shows the creator’s own words', () => {
    const fit = explainFit(creator, { niches: [], audience: 'the leader of a sales team', budgetCents: null })
    assert.deepEqual(fit.reasons, [{ kind: 'audience', match: true, label: 'Audience: sales, leaders' }])
    const filler = explainFit(creator, { niches: [], audience: 'and the for with companies', budgetCents: null })
    assert.equal(filler.reasons[0].match, false)
  })

  test('only the parts the brand filled in are judged', () => {
    assert.deepEqual(explainFit(creator, { niches: ['RevOps'], audience: '  ', budgetCents: null }).reasons.map((r) => r.kind), ['niche'])
    assert.equal(hasTarget({ niches: [], audience: ' ', budgetCents: null }), false)
    assert.equal(hasTarget(null), false)
    assert.equal(hasTarget({ niches: [], audience: '', budgetCents: 100 }), true)
  })
})

describe('the brand’s target', () => {
  test('needs a brand login', async () => {
    assert.equal((await api.call('GET', '/brands/me/profile')).status, 401)
    const creatorSession = await api.signup('creator')
    const res = await api.call('GET', '/brands/me/profile', { token: creatorSession.token })
    assert.equal(res.status, 403)
  })

  test('starts empty, saves, and can be cleared', async () => {
    const brand = await api.signup('brand')
    const empty = await api.call('GET', '/brands/me/profile', { token: brand.token })
    assert.deepEqual(empty.body, { profile: { niches: [], audience: '', budgetCents: null }, niches: [...NICHES] })

    const saved = await api.call('PUT', '/brands/me/profile', {
      token: brand.token,
      body: { niches: ['Sales', 'RevOps', 'Sales'], audience: '  SaaS founders  ', budgetCents: 60_000 },
    })
    assert.equal(saved.status, 200)
    assert.deepEqual(saved.body, { profile: { niches: ['RevOps', 'Sales'], audience: 'SaaS founders', budgetCents: 60_000 }, niches: [...NICHES] })
    assert.deepEqual((await api.call('GET', '/brands/me/profile', { token: brand.token })).body, saved.body)

    const cleared = await api.call('PUT', '/brands/me/profile', { token: brand.token, body: { niches: [], audience: '', budgetCents: null } })
    assert.deepEqual(cleared.body.profile, { niches: [], audience: '', budgetCents: null })
  })

  test('rejects bad input', async () => {
    const brand = await api.signup('brand')
    const good = { niches: ['RevOps'], audience: 'SaaS founders', budgetCents: 50_000 }
    const cases: [Record<string, unknown>, RegExp][] = [
      [{ ...good, niches: 'RevOps' }, /niches must be a list/],
      [{ ...good, niches: ['Crypto'] }, /niches must be a list/],
      [{ ...good, niches: [1] }, /niches must be a list/],
      [{ ...good, audience: 'x'.repeat(201) }, /at most 200/],
      [{ ...good, audience: 5 }, /audience is required/],
      [{ ...good, budgetCents: 50 }, /between 100/],
      [{ ...good, budgetCents: 10.5 }, /whole number/],
      [{ ...good, budgetCents: '500' }, /whole number/],
    ]
    for (const [body, error] of cases) {
      const res = await api.call('PUT', '/brands/me/profile', { token: brand.token, body })
      assert.equal(res.status, 400, JSON.stringify(body))
      assert.match(res.body.error, error)
    }
  })
})

describe('fit on the marketplace', () => {
  async function setup() {
    const [brand, other, revops, seo] = await Promise.all([
      api.signup('brand'),
      api.signup('brand'),
      api.listedCreator({ niche: 'RevOps', audience: 'SaaS founders and sales leaders', priceCents: 45_000 }, 'Fit Revops'),
      api.listedCreator({ niche: 'SEO', audience: 'Content teams at agencies', priceCents: 90_000 }, 'Fit Seo'),
    ])
    await api.call('PUT', '/brands/me/profile', { token: brand.token, body: { niches: ['RevOps'], audience: 'SaaS founders', budgetCents: 50_000 } })
    const ours = (list: any[]) => list.filter((c) => c.id === revops.user.id || c.id === seo.user.id)
    return { brand, other, revops, seo, ours }
  }

  test('anonymous visitors, creators and brands without a target see no fit', async () => {
    const { other, seo, ours } = await setup()
    for (const token of [undefined, other.token, seo.token, 'not-a-real-token']) {
      const res = await api.call('GET', '/creators', { token })
      assert.equal(res.status, 200)
      assert.equal(res.body.target, null)
      assert.equal(res.body.sort, 'reliability')
      assert.ok(ours(res.body.creators).every((c: any) => c.fit === undefined))
    }
  })

  test('a brand with a target gets reasons on every card, ranked by fit', async () => {
    const { brand, revops, seo, ours } = await setup()
    const res = await api.call('GET', '/creators', { token: brand.token })
    assert.equal(res.body.sort, 'fit')
    assert.deepEqual(res.body.target, { niches: ['RevOps'], audience: 'SaaS founders', budgetCents: 50_000 })
    const [first, second] = ours(res.body.creators)
    assert.equal(first.id, revops.user.id)
    assert.equal(second.id, seo.user.id)
    assert.deepEqual(first.fit.reasons.map((r: any) => r.label), ['RevOps niche', 'Audience: SaaS, founders', 'Within your $500 budget'])
    assert.equal(first.fit.matched, 3)
    assert.deepEqual(second.fit.reasons.map((r: any) => r.label), ['SEO, outside your niches', 'Different audience', '$400 over your budget'])
    const matched = res.body.creators.map((c: any) => c.fit.matched)
    assert.deepEqual(matched, [...matched].sort((a: number, b: number) => b - a))
  })

  test('another sort keeps the reasons, and filters still apply', async () => {
    const { brand, ours } = await setup()
    const byPrice = await api.call('GET', '/creators?sort=price', { token: brand.token })
    assert.equal(byPrice.body.sort, 'price')
    const prices = byPrice.body.creators.map((c: any) => c.priceCents)
    assert.deepEqual(prices, [...prices].sort((a: number, b: number) => a - b))
    assert.ok(ours(byPrice.body.creators).every((c: any) => c.fit.reasons.length === 3))
    const seoOnly = await api.call('GET', '/creators?niche=SEO', { token: brand.token })
    assert.ok(seoOnly.body.creators.every((c: any) => c.niche === 'SEO'))
  })

  test('asking for fit without a target falls back to reliability', async () => {
    const { other } = await setup()
    const res = await api.call('GET', '/creators?sort=fit', { token: other.token })
    assert.equal(res.status, 200)
    assert.equal(res.body.sort, 'reliability')
  })

  test('a creator page explains the fit to the brand only', async () => {
    const { brand, other, revops } = await setup()
    const mine = await api.call('GET', `/creators/${revops.user.id}`, { token: brand.token })
    assert.equal(mine.body.creator.fit.matched, 3)
    const theirs = await api.call('GET', `/creators/${revops.user.id}`, { token: other.token })
    assert.equal(theirs.body.creator.fit, undefined)
    const anonymous = await api.call('GET', `/creators/${revops.user.id}`)
    assert.equal(anonymous.body.creator.fit, undefined)
  })

  test('a changed target changes the reasons immediately', async () => {
    const { brand, revops } = await setup()
    await api.call('PUT', '/brands/me/profile', { token: brand.token, body: { niches: ['SEO'], audience: '', budgetCents: 40_000 } })
    const res = await api.call('GET', `/creators/${revops.user.id}`, { token: brand.token })
    assert.deepEqual(res.body.creator.fit, {
      matched: 0,
      reasons: [
        { kind: 'niche', match: false, label: 'RevOps, outside your niches' },
        { kind: 'budget', match: false, label: '$50 over your budget' },
      ],
    })
  })
})

