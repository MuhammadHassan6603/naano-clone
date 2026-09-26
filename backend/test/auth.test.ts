import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import jwt from 'jsonwebtoken'
import { db } from '../src/db.js'
import { PASSWORD, startServer, testEmail } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer()
})
after(async () => {
  await api.stop()
})

const signup = (overrides: Record<string, unknown> = {}) =>
  api.call('POST', '/auth/signup', {
    body: { email: testEmail('user'), password: PASSWORD, name: 'Test User', role: 'brand', ...overrides },
  })

describe('server basics', () => {
  test('GET /health confirms the database is reachable', async () => {
    const res = await api.call('GET', '/health')
    assert.equal(res.status, 200)
    assert.deepEqual(res.body, { ok: true })
  })

  test('unknown routes return a JSON 404', async () => {
    const res = await api.call('GET', '/nope')
    assert.equal(res.status, 404)
    assert.match(res.body.error, /No route/)
  })

  test('malformed JSON is a 400, not a 500', async () => {
    const res = await api.call('POST', '/auth/signup', { raw: '{"email": ' })
    assert.equal(res.status, 400)
    assert.equal(res.body.error, 'Request body is not valid JSON')
  })

  test('CORS allows the configured frontend origin only', async () => {
    const allowed = await api.call('GET', '/health', { headers: { Origin: 'http://localhost:5173' } })
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173')
    const other = await api.call('GET', '/health', { headers: { Origin: 'https://evil.example' } })
    assert.equal(other.headers.get('access-control-allow-origin'), null)
  })
})

describe('POST /auth/signup', () => {
  test('a brand gets a token, a public user and an empty wallet, and no profile', async () => {
    const email = testEmail('brand')
    const res = await signup({ email })
    assert.equal(res.status, 201)
    assert.equal(typeof res.body.token, 'string')
    assert.deepEqual(Object.keys(res.body.user).sort(), ['createdAt', 'email', 'id', 'name', 'role'])
    assert.equal(res.body.user.email, email)
    assert.equal(res.body.user.role, 'brand')

    const row = await db.user.findUniqueOrThrow({
      where: { id: res.body.user.id },
      include: { wallet: true, profile: true },
    })
    assert.deepEqual(
      { available: row.wallet?.availableCents, held: row.wallet?.heldCents },
      { available: 0, held: 0 },
    )
    assert.equal(row.profile, null)
    assert.notEqual(row.passwordHash, PASSWORD)
    assert.match(row.passwordHash, /^\$2[aby]\$10\$/)
  })

  test('a creator also gets an empty, unlisted profile', async () => {
    const res = await signup({ role: 'creator' })
    assert.equal(res.status, 201)
    const row = await db.user.findUniqueOrThrow({
      where: { id: res.body.user.id },
      include: { wallet: true, profile: true },
    })
    assert.ok(row.wallet)
    assert.equal(row.profile?.priceCents, null)
  })

  test('email is trimmed and lowercased, so case variants are the same account', async () => {
    const email = testEmail('case')
    const first = await signup({ email: `  ${email.toUpperCase()}  ` })
    assert.equal(first.status, 201)
    assert.equal(first.body.user.email, email)

    const again = await signup({ email })
    assert.equal(again.status, 409)
    assert.equal(again.body.error, 'An account with this email already exists')
  })

  test('two signups racing for one email: exactly one succeeds', async () => {
    const email = testEmail('race')
    const results = await Promise.all([signup({ email }), signup({ email })])
    assert.deepEqual(results.map((r) => r.status).sort(), [201, 409])
    assert.equal(await db.user.count({ where: { email } }), 1)
  })

  const invalid: [string, Record<string, unknown>, RegExp][] = [
    ['missing name', { name: undefined }, /name is required/],
    ['blank name', { name: '   ' }, /name must be at least 1/],
    ['bad email', { email: 'not-an-email' }, /valid email/],
    ['unknown role', { role: 'admin' }, /role must be one of: brand, creator/],
    ['short password', { password: 'short' }, /at least 8/],
    ['password over 72 bytes', { password: 'é'.repeat(37) }, /at most 72 bytes/],
    ['non-string password', { password: 12345678 }, /password is required/],
  ]
  for (const [label, overrides, message] of invalid) {
    test(`rejects ${label} with 400`, async () => {
      const res = await signup(overrides)
      assert.equal(res.status, 400)
      assert.match(res.body.error, message)
    })
  }

  test('rejects a JSON array body with 400', async () => {
    const res = await api.call('POST', '/auth/signup', { body: [] })
    assert.equal(res.status, 400)
  })

  test('ignores fields the client should not control', async () => {
    const res = await signup({ id: '00000000-0000-0000-0000-000000000000', passwordHash: 'x' })
    assert.equal(res.status, 201)
    assert.notEqual(res.body.user.id, '00000000-0000-0000-0000-000000000000')
  })
})

describe('POST /auth/login', () => {
  const email = testEmail('login')
  before(async () => {
    assert.equal((await signup({ email, role: 'creator' })).status, 201)
  })

  test('correct credentials return a token and the user', async () => {
    const res = await api.call('POST', '/auth/login', { body: { email, password: PASSWORD } })
    assert.equal(res.status, 200)
    assert.equal(res.body.user.email, email)
    assert.equal(res.body.user.role, 'creator')
    assert.equal(res.body.user.passwordHash, undefined)
    assert.equal(typeof res.body.token, 'string')
  })

  test('email match is case-insensitive', async () => {
    const res = await api.call('POST', '/auth/login', { body: { email: email.toUpperCase(), password: PASSWORD } })
    assert.equal(res.status, 200)
  })

  test('wrong password and unknown email give the identical 401', async () => {
    const wrong = await api.call('POST', '/auth/login', { body: { email, password: 'wrong password' } })
    const unknown = await api.call('POST', '/auth/login', {
      body: { email: testEmail('nobody'), password: PASSWORD },
    })
    assert.equal(wrong.status, 401)
    assert.equal(unknown.status, 401)
    assert.deepEqual(wrong.body, unknown.body)
  })

  test('missing password is a 401, not a crash', async () => {
    const res = await api.call('POST', '/auth/login', { body: { email } })
    assert.equal(res.status, 401)
  })
})

describe('GET /auth/me', () => {
  test('returns the brand with no profile key', async () => {
    const { body } = await signup()
    const res = await api.call('GET', '/auth/me', { token: body.token })
    assert.equal(res.status, 200)
    assert.deepEqual(res.body, { user: body.user })
  })

  test('returns the creator with their own profile', async () => {
    const { body } = await signup({ role: 'creator' })
    const res = await api.call('GET', '/auth/me', { token: body.token })
    assert.equal(res.status, 200)
    assert.deepEqual(res.body.profile, { niche: null, bio: '', audience: '', priceCents: null, followers: 0, linkedinUrl: null })
  })

  const secret = process.env.JWT_SECRET as string
  const badTokens: [string, () => string | undefined][] = [
    ['no token', () => undefined],
    ['a garbage token', () => 'not.a.token'],
    ['a token signed with another secret', () => jwt.sign({ role: 'brand' }, 'x'.repeat(40), { subject: 'u' })],
    ['an expired token', () => jwt.sign({ role: 'brand' }, secret, { subject: 'u', expiresIn: -10 })],
    ['an unsigned alg:none token', () => jwt.sign({ role: 'brand' }, '', { subject: 'u', algorithm: 'none' })],
    ['a token with a forged role', () => jwt.sign({ role: 'admin' }, secret, { subject: 'u' })],
  ]
  for (const [label, make] of badTokens) {
    test(`rejects ${label} with 401`, async () => {
      const res = await api.call('GET', '/auth/me', { token: make() })
      assert.equal(res.status, 401)
    })
  }

  test('a valid token for a deleted account is a 401', async () => {
    const { body } = await signup()
    await db.user.delete({ where: { id: body.user.id } })
    const res = await api.call('GET', '/auth/me', { token: body.token })
    assert.equal(res.status, 401)
  })
})

describe('database invariants', () => {
  test('a wallet can never go negative, even if app code tries', async () => {
    const { body } = await signup()
    await assert.rejects(
      db.wallet.update({ where: { userId: body.user.id }, data: { availableCents: -1 } }),
      /wallets_available_non_negative/,
    )
  })
})
