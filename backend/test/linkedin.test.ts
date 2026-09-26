import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { profileUrl } from '../src/linkedin.js'
import { type Session, defaultProfile, linkedinFor, startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>
const outbound: string[] = []
const realFetch = globalThis.fetch

before(async () => {
  globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input)
    if (url.includes('linkedin.com')) outbound.push(url)
    return realFetch(input, init)
  }) as typeof fetch
  api = await startServer()
})
after(async () => {
  await api.stop()
  globalThis.fetch = realFetch
})

const save = (session: Session, body: Record<string, unknown>) =>
  api.call('PUT', '/creators/me/profile', { token: session.token, body: { ...defaultProfile, ...body } })

describe('reading a LinkedIn profile link', () => {
  test('accepts the usual shapes and keeps one canonical form', () => {
    for (const input of [
      'https://www.linkedin.com/in/Dana-Creator',
      'linkedin.com/in/dana-creator/',
      'www.linkedin.com/in/dana-creator',
      'http://uk.linkedin.com/in/dana-creator?trk=public_profile',
      '  https://www.linkedin.com/IN/dana-creator/details/experience/  ',
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
})

describe('saving a profile with a LinkedIn link', () => {
  test('stores the canonical link and the followers exactly as typed, without contacting LinkedIn', async () => {
    const creator = await api.signup('creator')
    const url = linkedinFor('dana')
    const res = await save(creator, { linkedinUrl: url.replace('https://www.', ''), followers: 4_321 })
    assert.equal(res.status, 200)
    assert.equal(res.body.creator.linkedinUrl, url)
    assert.equal(res.body.creator.followers, 4_321)
    const card = await api.call('GET', `/creators/${creator.user.id}`)
    assert.equal(card.body.creator.linkedinUrl, url)
    const me = await api.call('GET', '/auth/me', { token: creator.token })
    assert.equal(me.body.profile.linkedinUrl, url)
    assert.deepEqual(outbound, [])
  })

  test('the link is required and must be a profile', async () => {
    const creator = await api.signup('creator')
    for (const [body, message] of [
      [{ linkedinUrl: undefined }, /linkedinUrl is required/],
      [{ linkedinUrl: '' }, /linkedinUrl must be at least 1/],
      [{ linkedinUrl: 'https://www.linkedin.com/company/acme' }, /Use your LinkedIn profile link/],
    ] as const) {
      const res = await save(creator, body)
      assert.equal(res.status, 400, JSON.stringify(body))
      assert.match(res.body.error, message)
    }
  })

  test('one LinkedIn profile belongs to one creator', async () => {
    const [first, second] = await Promise.all([api.signup('creator'), api.signup('creator')])
    const url = linkedinFor('taken')
    assert.equal((await save(first, { linkedinUrl: url })).status, 200)
    const res = await save(second, { linkedinUrl: url.toUpperCase().replace('HTTPS://WWW.LINKEDIN.COM/IN/', 'linkedin.com/in/') })
    assert.equal(res.status, 409)
    assert.match(res.body.error, /already linked to another creator/)
    assert.equal((await save(first, { linkedinUrl: url, followers: 10 })).status, 200)
  })

  test('there is no LinkedIn lookup endpoint any more', async () => {
    const creator = await api.signup('creator')
    const res = await api.call('POST', '/creators/me/linkedin', { token: creator.token, body: { url: linkedinFor() } })
    assert.equal(res.status, 404)
  })
})
