import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { randomBytes, randomUUID } from 'node:crypto'
import { createApp } from '../src/app.js'
import { db } from '../src/db.js'
import type { BookingStatus, RefundReason, Role } from '../src/generated/prisma/enums.js'

if (process.env.TEST_DATABASE !== '1') {
  throw new Error('Refusing to run: tests need TEST_DATABASE=1 in .env, set only for the Neon test branch.')
}

export const TEST_DOMAIN = `run-${randomUUID().slice(0, 8)}.test.naano.dev`
export const PASSWORD = 'correct horse battery'
export const DAY_MS = 86_400_000

export const testEmail = (label: string) => `${label}-${randomUUID().slice(0, 8)}@${TEST_DOMAIN}`

export const linkedinFor = (label = 'creator') => `https://www.linkedin.com/in/${label}-${randomUUID().slice(0, 8)}`


export type Reply = { status: number; body: any; headers: Headers }
export type Session = { token: string; user: { id: string; email: string; name: string; role: Role } }

export const defaultProfile = {
  niche: 'RevOps',
  bio: 'I write about pipeline hygiene.',
  audience: 'SaaS founders, seed to Series B',
  priceCents: 45_000,
  followers: 12_000,
}

const testUsers = { email: { endsWith: `@${TEST_DOMAIN}` } }

export async function startServer(options: Parameters<typeof createApp>[0] = {}) {
  const server: Server = createApp(options).listen(0)
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

  async function call(
    method: string,
    path: string,
    { body, token, raw, headers }: { body?: unknown; token?: string; raw?: string; headers?: Record<string, string> } = {},
  ): Promise<Reply> {
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(body !== undefined || raw !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
      redirect: 'manual',
    })
    const text = await res.text()
    const isJson = res.headers.get('content-type')?.includes('application/json')
    return { status: res.status, body: isJson && text ? JSON.parse(text) : text || null, headers: res.headers }
  }

  async function signup(role: Role, name = `Test ${role}`): Promise<Session> {
    const res = await call('POST', '/auth/signup', {
      body: { email: testEmail(role), password: PASSWORD, name, role },
    })
    if (res.status !== 201) throw new Error(`signup failed: ${res.status} ${JSON.stringify(res.body)}`)
    return res.body
  }

  async function listedCreator(profile: Partial<typeof defaultProfile & { linkedinUrl: string }> = {}, name?: string): Promise<Session> {
    const session = await signup('creator', name)
    const res = await call('PUT', '/creators/me/profile', {
      token: session.token,
      body: { linkedinUrl: linkedinFor(), ...defaultProfile, ...profile },
    })
    assert.equal(res.status, 200, JSON.stringify(res.body))
    return session
  }

  async function fundedBrand(amountCents: number): Promise<Session> {
    const session = await signup('brand')
    const res = await call('POST', '/wallet/topup', { token: session.token, body: { amountCents } })
    assert.equal(res.status, 200, JSON.stringify(res.body))
    return session
  }

  const wallet = async (session: Session) => (await call('GET', '/wallet', { token: session.token })).body

  async function stop() {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
    const testBookings = { OR: [{ brand: testUsers }, { creator: testUsers }] }
    await db.$transaction(
      async (tx) => {
        await tx.$executeRaw`ALTER TABLE "transactions" DISABLE TRIGGER "transactions_no_update_or_delete"`
        await tx.transaction.deleteMany({ where: { OR: [{ user: testUsers }, { booking: testBookings }] } })
        await tx.click.deleteMany({ where: { booking: testBookings } })
        await tx.notification.deleteMany({ where: { user: testUsers } })
        await tx.messageRead.deleteMany({ where: { OR: [{ booking: testBookings }, { user: testUsers }] } })
        await tx.message.deleteMany({ where: { OR: [{ booking: testBookings }, { sender: testUsers }] } })
        await tx.booking.deleteMany({ where: testBookings })
        await tx.user.deleteMany({ where: testUsers })
        await tx.$executeRaw`ALTER TABLE "transactions" ENABLE TRIGGER "transactions_no_update_or_delete"`
      },
      { maxWait: 60_000, timeout: 120_000 },
    )
    await db.$disconnect()
  }

  return { call, signup, listedCreator, fundedBrand, wallet, stop }
}

type Outcome =
  | { status: Exclude<BookingStatus, 'paid' | 'refunded'> }
  | { status: 'paid' }
  | { status: 'refunded'; reason: RefundReason }

export function insertBooking(brandId: string, creatorId: string, outcome: Outcome) {
  const hasPost = outcome.status === 'submitted' || outcome.status === 'paid'
  return db.booking.create({
    data: {
      brandId,
      creatorId,
      brief: 'Test brief for a booking',
      destinationUrl: 'https://example.com',
      priceCents: 10_000,
      status: outcome.status,
      deadline: new Date(Date.now() + DAY_MS),
      trackingCode: randomBytes(6).toString('base64url'),
      postUrl: hasPost ? 'https://www.linkedin.com/posts/test' : null,
      verifiedVia: outcome.status === 'paid' ? 'brand' : null,
      refundReason: outcome.status === 'refunded' ? outcome.reason : null,
    },
  })
}
