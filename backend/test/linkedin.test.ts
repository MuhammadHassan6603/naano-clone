import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { parseProfile, profileUrl } from '../src/linkedin.js'
import { type Session, defaultProfile, linkedin, linkedinFor, linkedinPage, startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer()
})
after(async () => {
  await api.stop()
})

const publish = (url: string, name: string, followers: number) => linkedin.pages.set(url, { status: 200, html: linkedinPage(url, name, followers) })
const lookup = (session: Session, url: unknown) => api.call('POST', '/creators/me/linkedin', { token: session.token, body: { url } })
const save = (session: Session, body: Record<string, unknown>) =>
  api.call('PUT', '/creators/me/profile', { token: session.token, body: { ...defaultProfile, ...body } })

describe('reading a LinkedIn profile link', () => {
  test('accepts the usual shapes and keeps one canonical form', () => {
    for (const input of [
      'https://www.linkedin.com/in/Dana-Creator',
      'linkedin.com/in/dana-creator/',
      'http://uk.linkedin.com/in/dana-creator?trk=public_profile',
      '  https://www.linkedin.com/in/dana-creator/details/experience/  ',
    ]) {
      assert.equal(profileUrl(input), 'https://www.linkedin.com/in/dana-creator', input)
    }
  })

  test('rejects anything that is not a personal profile', () => {
    for (const input of [
      'https://www.linkedin.com/company/acme',
      'https://www.linkedin.com/posts/dana_activity-1',
      'https://linkedin.evil.com/in/dana',
      'https://evil-linkedin.com/in/dana',
      'https://www.linkedin.com/in/',
      'https://www.linkedin.com/in/a',
      'not a url at all %%%',
      'https://www.linkedin.com/in/%E0%A4%A',
    ]) {
      assert.throws(() => profileUrl(input), /Use your LinkedIn profile link/, input)
    }
  })

  test('takes the followers of the profile itself, not of other people on the page', () => {
    const url = 'https://www.linkedin.com/in/dana-creator'
    assert.deepEqual(parseProfile(linkedinPage(url, 'Dana Creator', 18_400), url), { url, name: 'Dana Creator', followers: 18_400 })
    assert.equal(parseProfile('<html>Sign in to view</html>', url), null)
    assert.equal(parseProfile('<script type="application/ld+json">{not json</script>', url), null)
  })
})

describe('POST /creators/me/linkedin', () => {
  test('needs a creator login', async () => {
    assert.equal((await api.call('POST', '/creators/me/linkedin', { body: { url: linkedinFor() } })).status, 401)
    const brand = await api.signup('brand')
    assert.equal((await lookup(brand, linkedinFor())).status, 403)
  })

  test('returns the name and follower count from the public profile', async () => {
    const creator = await api.signup('creator')
    const url = linkedinFor('dana')
    publish(url, 'Dana Creator', 18_400)
    const res = await lookup(creator, url.toUpperCase().replace('HTTPS://WWW.LINKEDIN.COM', 'linkedin.com'))
    assert.equal(res.status, 200)
    assert.deepEqual(res.body, { linkedin: { url, name: 'Dana Creator', followers: 18_400 } })
    const before = linkedin.calls.length
    assert.equal((await lookup(creator, url)).status, 200)
    assert.equal(linkedin.calls.length, before)
  })

  test('explains private, missing and blocked profiles', async () => {
    const creator = await api.signup('creator')
    const hidden = linkedinFor('hidden')
    linkedin.pages.set(hidden, { status: 200, html: '<html>Sign in to view</html>' })
    const gone = linkedinFor('gone')
    linkedin.pages.set(gone, { status: 404 })
    const walled = linkedinFor('walled')
    linkedin.pages.set(walled, { status: 200, html: '<html></html>', redirect: 'https://www.linkedin.com/authwall?trk=x' })
    const blocked = linkedinFor('blocked')

    const cases: [string, number, RegExp][] = [
      [hidden, 422, /couldn't find a follower count/],
      [gone, 422, /couldn't find a follower count/],
      [walled, 503, /doesn't show this profile's follower count/],
      [blocked, 503, /doesn't show this profile's follower count/],
    ]
    for (const [url, status, message] of cases) {
      const res = await lookup(creator, url)
      assert.equal(res.status, status, url)
      assert.match(res.body.error, message)
    }
    assert.equal((await lookup(creator, 'https://www.linkedin.com/company/acme')).status, 400)
    assert.equal((await lookup(creator, 42)).status, 400)
  })

  test('a profile linked to another creator cannot be claimed', async () => {
    const [first, second] = await Promise.all([api.signup('creator'), api.signup('creator')])
    const url = linkedinFor('taken')
    publish(url, 'Taken Person', 500)
    assert.equal((await save(first, { linkedinUrl: url })).status, 200)
    const res = await lookup(second, url)
    assert.equal(res.status, 409)
    assert.match(res.body.error, /already linked to another creator/)
    assert.equal((await save(second, { linkedinUrl: url })).status, 409)
    assert.equal((await lookup(first, url)).status, 200)
  })

  test('limits lookups per creator', async () => {
    const creator = await api.signup('creator')
    for (let i = 0; i < 10; i += 1) assert.notEqual((await lookup(creator, linkedinFor('burst'))).status, 429)
    assert.equal((await lookup(creator, linkedinFor('burst'))).status, 429)
  })
})

describe('saving a profile with LinkedIn', () => {
  test('the server sets verified followers itself and ignores the number sent', async () => {
    const creator = await api.signup('creator', 'Dana')
    const url = linkedinFor('verified')
    publish(url, 'Dana Creator', 23_456)
    const res = await save(creator, { linkedinUrl: url, followers: 99_999_999 })
    assert.equal(res.status, 200)
    assert.equal(res.body.creator.followers, 23_456)
    assert.equal(res.body.creator.followersVerified, true)
    assert.equal(res.body.creator.linkedinUrl, url)
    const me = await api.call('GET', '/auth/me', { token: creator.token })
    assert.equal(me.body.profile.linkedinName, 'Dana Creator')
    assert.ok(me.body.profile.followersVerifiedAt)
    const card = await api.call('GET', `/creators/${creator.user.id}`)
    assert.deepEqual([card.body.creator.followers, card.body.creator.followersVerified], [23_456, true])
  })

  test('when LinkedIn will not answer, the typed number is kept and marked unverified', async () => {
    const creator = await api.signup('creator')
    const verifiedUrl = linkedinFor('before')
    publish(verifiedUrl, 'Before', 1_000)
    await save(creator, { linkedinUrl: verifiedUrl })
    const res = await save(creator, { linkedinUrl: linkedinFor('down'), followers: 4_321 })
    assert.equal(res.status, 200)
    assert.deepEqual([res.body.creator.followers, res.body.creator.followersVerified], [4_321, false])
    const me = await api.call('GET', '/auth/me', { token: creator.token })
    assert.equal(me.body.profile.linkedinName, null)
  })

  test('the link is required and must be a profile', async () => {
    const creator = await api.signup('creator')
    for (const [body, message] of [
      [{ linkedinUrl: undefined }, /linkedinUrl is required/],
      [{ linkedinUrl: 'https://www.linkedin.com/company/acme' }, /Use your LinkedIn profile link/],
    ] as const) {
      const res = await save(creator, body)
      assert.equal(res.status, 400)
      assert.match(res.body.error, message)
    }
  })
})
