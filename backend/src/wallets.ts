import { db } from './db.js'
import { unauthorized } from './errors.js'
import type { TransactionType } from './generated/prisma/enums.js'

export type WalletView = { availableCents: number; heldCents: number; reconciled: boolean }

/**
 * The stored balance plus a check that it equals what the append-only ledger says.
 * Both reads share one REPEATABLE READ snapshot, so a concurrent booking can't make
 * them disagree for a moment.
 */
export async function getWallet(userId: string): Promise<WalletView> {
  const [wallet, sums] = await db.$transaction(
    async (tx) => [
      await tx.wallet.findUnique({ where: { userId } }),
      await tx.transaction.groupBy({ by: ['type'], where: { userId }, _sum: { amountCents: true } }),
    ] as const,
    { isolationLevel: 'RepeatableRead' },
  )
  if (!wallet) throw unauthorized('Account no longer exists')

  const total = (type: TransactionType) => sums.find((row) => row.type === type)?._sum.amountCents ?? 0
  const available = total('topup') - total('hold') + total('payout') + total('refund')
  const held = total('hold') - total('release') - total('refund')

  return {
    availableCents: wallet.availableCents,
    heldCents: wallet.heldCents,
    reconciled: available === wallet.availableCents && held === wallet.heldCents,
  }
}

export function listTransactions(userId: string) {
  return db.transaction.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 100,
    select: { id: true, type: true, amountCents: true, bookingId: true, createdAt: true },
  })
}
