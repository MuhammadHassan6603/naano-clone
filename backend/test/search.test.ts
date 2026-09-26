import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { randomUUID } from 'node:crypto'
import { startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer()
})
after(async () => {
  await api.stop()
})

const token = () => `zq${randomUUID().slice(0, 6)}`
const get = async (query: string) => (await api.call('GET', `/creators?${query}`)).body
const names = (body: any) => body.creators.map((c: any) => c.name)

describe('searching creators', () => {
  test('matches name, niche, audience and bio, ignoring case', async () => {
    const tag = token()
    await Promise.all([
      api.listedCreator({ niche: 'RevOps' }, `Alice ${tag}`),
      api.listedCreator({ niche: 'SEO', audience: `Growth teams ${tag.toUpperCase()}` }, 'Bob Searchtest'),
      api.listedCreator({ niche: 'HR', bio: `I write about hiring ${tag}` }, 'Cara Searchtest'),
      api.listedCreator({ niche: 'AI' }, 'Dan Searchtest'),
    ])
    const body = await get(`q=${tag}`)
    assert.deepEqual(names(body).sort(), [`Alice ${tag}`, 'Bob Searchtest', 'Cara Searchtest'])
    assert.equal(body.total, 3)
    assert.equal(body.q, tag)
  })

  test('every word must match, and filters still apply', async () => {
    const tag = token()
    await Promise.all([
      api.listedCreator({ niche: 'RevOps', audience: `SaaS founders ${tag}` }, 'Eve Searchtest'),
      api.listedCreator({ niche: 'Sales', audience: `Agency owners ${tag}` }, 'Finn Searchtest'),
    ])
    assert.deepEqual(names(await get(`q=${encodeURIComponent(`saas ${tag}`)}`)), ['Eve Searchtest'])
    assert.deepEqual(names(await get(`q=${encodeURIComponent(`revops ${tag}`)}`)), ['Eve Searchtest'])
    assert.deepEqual(names(await get(`q=${tag}&niche=Sales`)), ['Finn Searchtest'])
    assert.deepEqual(names(await get(`q=${encodeURIComponent(`${tag} nothing-matches-this`)}`)), [])
    assert.equal((await get(`q=${encodeURIComponent('   ')}`)).q, '')
  })

  test('rejects an overly long search', async () => {
    const res = await api.call('GET', `/creators?q=${'x'.repeat(101)}`)
    assert.equal(res.status, 400)
    assert.match(res.body.error, /at most 100/)
  })
})

describe('paging creators', () => {
  test('splits results into pages and reports the totals', async () => {
    const tag = token()
    for (let i = 0; i < 5; i += 1) await api.listedCreator({ priceCents: 10_000 + i }, `Page${i} ${tag}`)
    const first = await get(`q=${tag}&sort=price&pageSize=2`)
    assert.deepEqual([first.total, first.page, first.pages, first.pageSize], [5, 1, 3, 2])
    assert.deepEqual(names(first), [`Page0 ${tag}`, `Page1 ${tag}`])
    assert.deepEqual(names(await get(`q=${tag}&sort=price&pageSize=2&page=2`)), [`Page2 ${tag}`, `Page3 ${tag}`])
    const last = await get(`q=${tag}&sort=price&pageSize=2&page=99`)
    assert.equal(last.page, 3)
    assert.deepEqual(names(last), [`Page4 ${tag}`])
    const unpaged = await get(`q=${tag}`)
    assert.deepEqual([unpaged.creators.length, unpaged.pages, unpaged.pageSize], [5, 1, 5])
  })

  test('an empty result is one empty page', async () => {
    const body = await get(`q=${token()}&pageSize=9`)
    assert.deepEqual([body.total, body.page, body.pages, body.creators.length], [0, 1, 1, 0])
  })

  test('rejects bad page numbers', async () => {
    for (const query of ['pageSize=0', 'pageSize=51', 'page=0', 'page=abc', 'pageSize=2.5']) {
      assert.equal((await api.call('GET', `/creators?${query}`)).status, 400, query)
    }
  })
})
