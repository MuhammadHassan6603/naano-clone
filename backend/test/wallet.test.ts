import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { db } from '../src/db.js'
import { startServer } from './helpers.js'

let api: Awaited<ReturnType<typeof startServer>>

before(async () => {
  api = await startServer()
})
after(async () => {
  await api.stop()
})

describe('GET /wallet', () => {
  test('every new account starts at zero and reconciled', async () => {
    for (const role of ['brand', 'creator'] as const) {
      const session = await api.signup(role)
      assert.deepEqual(await api.wallet(session), { availableCents: 0, heldCents: 0, reconciled: true })
    }
  })

  test('requires a login', async () => {
    assert.equal((await api.call('GET', '/wallet')).status, 401)
  })

  test('reports reconciled: false if the stored balance drifts from the ledger', async () => {
    const brand = await api.fundedBrand(10_000)
    // Simulate a bug that changed the balance without writing a ledger row.
    await db.wallet.update({ where: { userId: brand.user.id }, data: { availableCents: { increment: 1 } } })
    assert.deepEqual(await api.wallet(brand), { availableCents: 10_001, heldCents: 0, reconciled: false })
  })
})

describe('POST /wallet/topup', () => {
  test('adds to available and writes one topup ledger row', async () => {
    const brand = await api.signup('brand')
    const res = await api.call('POST', '/wallet/topup', { token: brand.token, body: { amountCents: 25_000 } })
    assert.equal(res.status, 200)
    assert.deepEqual(res.body, { availableCents: 25_000, heldCents: 0, reconciled: true })

    const history = await api.call('GET', '/wallet/transactions', { token: brand.token })
    assert.equal(history.body.transactions.length, 1)
    assert.equal(history.body.transactions[0].type, 'topup')
    assert.equal(history.body.transactions[0].amountCents, 25_000)
    assert.equal(history.body.transactions[0].bookingId, null)
  })

  test('accepts the exact minimum and maximum', async () => {
    const brand = await api.signup('brand')
    for (const amountCents of [100, 1_000_000]) {
      const res = await api.call('POST', '/wallet/topup', { token: brand.token, body: { amountCents } })
      assert.equal(res.status, 200)
    }
    assert.equal((await api.wallet(brand)).availableCents, 1_000_100)
  })

  test('parallel top-ups are all counted (no lost updates)', async () => {
    const brand = await api.signup('brand')
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        api.call('POST', '/wallet/topup', { token: brand.token, body: { amountCents: 1_000 } }),
      ),
    )
    assert.ok(results.every((r) => r.status === 200))
    assert.deepEqual(await api.wallet(brand), { availableCents: 5_000, heldCents: 0, reconciled: true })
  })

  const invalid: [string, unknown][] = [
    ['below the minimum', 99],
    ['above the maximum', 1_000_001],
    ['zero', 0],
    ['negative', -500],
    ['fractional', 150.5],
    ['sent as text', '500'],
    ['missing', undefined],
  ]
  for (const [label, amountCents] of invalid) {
    test(`rejects an amount ${label} with 400 and changes nothing`, async () => {
      const brand = await api.signup('brand')
      const res = await api.call('POST', '/wallet/topup', { token: brand.token, body: { amountCents } })
      assert.equal(res.status, 400)
      assert.deepEqual(await api.wallet(brand), { availableCents: 0, heldCents: 0, reconciled: true })
    })
  }

  test('creators cannot top up (403) and anonymous callers get 401', async () => {
    const creator = await api.signup('creator')
    const res = await api.call('POST', '/wallet/topup', { token: creator.token, body: { amountCents: 1_000 } })
    assert.equal(res.status, 403)
    assert.equal((await api.call('POST', '/wallet/topup', { body: { amountCents: 1_000 } })).status, 401)
  })
})

describe('GET /wallet/transactions', () => {
  test('lists only the caller’s own rows, newest first', async () => {
    const brand = await api.signup('brand')
    const other = await api.fundedBrand(7_777)
    for (const amountCents of [100, 200, 300]) {
      await api.call('POST', '/wallet/topup', { token: brand.token, body: { amountCents } })
    }
    const res = await api.call('GET', '/wallet/transactions', { token: brand.token })
    assert.equal(res.status, 200)
    assert.deepEqual(
      res.body.transactions.map((t: { amountCents: number }) => t.amountCents),
      [300, 200, 100],
    )
    assert.ok(!JSON.stringify(res.body).includes(other.user.id))
    assert.deepEqual(Object.keys(res.body.transactions[0]).sort(), ['amountCents', 'bookingId', 'createdAt', 'id', 'type'])
  })
})

describe('ledger', () => {
  test('rows cannot be updated or deleted, even by direct SQL', async () => {
    const brand = await api.fundedBrand(1_000)
    const row = await db.transaction.findFirstOrThrow({ where: { userId: brand.user.id } })
    await assert.rejects(
      db.transaction.update({ where: { id: row.id }, data: { amountCents: 1 } }),
      /append-only: UPDATE is not allowed/,
    )
    await assert.rejects(db.transaction.delete({ where: { id: row.id } }), /append-only: DELETE is not allowed/)
  })
})
