import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

const base = (process.argv[2] ?? 'http://localhost:4000').replace(/\/+$/, '')
const PRICE = 25_000
const run = randomUUID().slice(0, 8)

async function call(method: string, path: string, token?: string, body?: unknown) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return { status: res.status, body: (await res.json()) as any }
}

async function expect(label: string, status: number, promise: ReturnType<typeof call>) {
  const res = await promise
  assert.equal(res.status, status, `${label}: expected ${status}, got ${res.status} ${JSON.stringify(res.body)}`)
  console.log(`  ✓ ${label} (${status})`)
  return res.body
}

async function wallet(label: string, token: string, availableCents: number, heldCents: number) {
  const body = await expect(`${label} wallet`, 200, call('GET', '/wallet', token))
  assert.deepEqual(body, { availableCents, heldCents, reconciled: true }, label)
  console.log(`    ${label}: ${availableCents / 100} available, ${heldCents / 100} held, ledger reconciles`)
}

console.log(`escrow check against ${base}\n`)

const signup = (role: 'brand' | 'creator') =>
  expect(`sign up ${role}`, 201, call('POST', '/auth/signup', undefined, {
    email: `${role}-${run}@check.naano.dev`,
    password: 'escrow check password',
    name: `Check ${role} ${run}`,
    role,
  }))
const brand = await signup('brand')
const creator = await signup('creator')

await expect('creator sets a price', 200, call('PUT', '/creators/me/profile', creator.token, {
  niche: 'Sales', bio: 'Escrow check account.', audience: 'Test audience', priceCents: PRICE, followers: 1,
  linkedinUrl: `https://www.linkedin.com/in/escrow-check-${Date.now()}`,
}))
await expect('brand tops up $1,000', 200, call('POST', '/wallet/topup', brand.token, { amountCents: 100_000 }))

const book = (label: string, status = 201) =>
  expect(label, status, call('POST', '/bookings', brand.token, {
    creatorId: creator.user.id,
    brief: 'Escrow check: post about our launch.',
    destinationUrl: 'https://example.com/launch',
    deadline: new Date(Date.now() + 86_400_000).toISOString(),
  }))
const bookingAction = (token: string, id: string, action: string, body?: unknown) =>
  call('POST', `/bookings/${id}/${action}`, token, body)

console.log('\nhappy path')
const first = (await book('book the creator')).booking.id
await wallet('brand', brand.token, 75_000, PRICE)
await expect('approve before submit is refused', 409, bookingAction(brand.token, first, 'approve'))
await expect('creator accepts', 200, bookingAction(creator.token, first, 'accept'))
await expect('creator submits the post', 200, bookingAction(creator.token, first, 'submit', {
  postUrl: 'https://www.linkedin.com/posts/escrow-check',
}))
const paid = await expect('brand approves', 200, bookingAction(brand.token, first, 'approve'))
assert.equal(paid.booking.status, 'paid')
await expect('approving twice is refused', 409, bookingAction(brand.token, first, 'approve'))
await wallet('brand', brand.token, 75_000, 0)
await wallet('creator', creator.token, PRICE, 0)

console.log('\ndecline and refund')
const second = (await book('book again')).booking.id
await wallet('brand', brand.token, 50_000, PRICE)
const declined = await expect('creator declines', 200, bookingAction(creator.token, second, 'decline'))
assert.equal(declined.booking.refundReason, 'declined')
await wallet('brand', brand.token, 75_000, 0)

console.log('\nrace: 4 bookings at once, money for 3')
const results = await Promise.all(
  Array.from({ length: 4 }, () =>
    call('POST', '/bookings', brand.token, {
      creatorId: creator.user.id,
      brief: 'Escrow check: racing booking.',
      destinationUrl: 'https://example.com/race',
      deadline: new Date(Date.now() + 86_400_000).toISOString(),
    }),
  ),
)
const statuses = results.map((r) => r.status).sort()
assert.deepEqual(statuses, [201, 201, 201, 409], `race statuses ${statuses}`)
console.log(`  ✓ statuses ${statuses.join(', ')}`)
await wallet('brand', brand.token, 0, 75_000)

console.log('\nall escrow checks passed')
