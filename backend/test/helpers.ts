import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { randomUUID } from 'node:crypto'
import { createApp } from '../src/app.js'
import { db } from '../src/db.js'

export const TEST_DOMAIN = 'test.naano.dev'

export const testEmail = (label: string) => `${label}-${randomUUID().slice(0, 8)}@${TEST_DOMAIN}`

export type Reply = { status: number; body: any; headers: Headers }

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

  async function stop() {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
    await db.user.deleteMany({ where: { email: { endsWith: `@${TEST_DOMAIN}` } } })
    await db.$disconnect()
  }

  return { call, stop }
}
