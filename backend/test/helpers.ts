import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { randomBytes, randomUUID } from 'node:crypto'
import { createApp } from '../src/app.js'
import { db } from '../src/db.js'
import type { BookingStatus, RefundReason, Role } from '../src/generated/prisma/enums.js'

export const TEST_DOMAIN = 'test.naano.dev'
export const PASSWORD = 'correct horse battery'

export const testEmail = (label: string) => `${label}-${randomUUID().slice(0, 8)}@${TEST_DOMAIN}`

export type Reply = { status: number; body: any; headers: Headers }
export type Session = { token: string; user: { id: string; email: string; name: string; role: Role } }

const testUsers = { email: { endsWith: `@${TEST_DOMAIN}` } }

export async function startServer() {
  const server: Server = createApp().listen(0)
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
    })
    const text = await res.text()
    return { status: res.status, body: text ? JSON.parse(text) : null, headers: res.headers }
  }

  async function signup(role: Role, name = `Test ${role}`): Promise<Session> {
    const res = await call('POST', '/auth/signup', {
      body: { email: testEmail(role), password: PASSWORD, name, role },
    })
    if (res.status !== 201) throw new Error(`signup failed: ${res.status} ${JSON.stringify(res.body)}`)
    return res.body
  }

  async function stop() {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
    await db.booking.deleteMany({ where: { OR: [{ brand: testUsers }, { creator: testUsers }] } })
    await db.user.deleteMany({ where: testUsers })
    await db.$disconnect()
  }

  return { call, signup, stop }
}

type Outcome = { status: Exclude<BookingStatus, 'paid' | 'refunded'> } | { status: 'paid' } | { status: 'refunded'; reason: RefundReason }

/** Inserts a booking in a final or in-between state directly, without moving money. Test data only. */
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
      deadline: new Date(Date.now() + 86_400_000),
      trackingCode: randomBytes(6).toString('base64url'),
      postUrl: hasPost ? 'https://www.linkedin.com/posts/test' : null,
      verifiedVia: outcome.status === 'paid' ? 'brand' : null,
      refundReason: outcome.status === 'refunded' ? outcome.reason : null,
    },
  })
}
