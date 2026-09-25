import type { ReactNode } from 'react'
import { Page } from '../components/Layout'
import { TopUpForm } from '../components/TopUpForm'
import { Button, ButtonLink } from '../components/ui/Button'
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback'
import { AlertIcon, CheckIcon, LockIcon, WalletIcon } from '../components/ui/Icons'
import { useAuth } from '../lib/auth'
import { formatDateTime, formatMoney } from '../lib/format'
import { usePageTitle } from '../lib/navigation'
import type { Transaction, TransactionType, User, Wallet as WalletData } from '../lib/types'
import { useApi } from '../lib/useApi'

const ENTRY: Record<TransactionType, { label: string; effect: (cents: number) => string; tone: string }> = {
  topup: { label: 'Added demo money', effect: (c) => `+${formatMoney(c)} available`, tone: 'text-good' },
  hold: { label: 'Held for a booking', effect: (c) => `${formatMoney(c)} moved into escrow`, tone: 'text-held' },
  release: { label: 'Paid to the creator', effect: (c) => `−${formatMoney(c)} from escrow`, tone: 'text-ink' },
  payout: { label: 'Payment for a verified post', effect: (c) => `+${formatMoney(c)} available`, tone: 'text-good' },
  refund: { label: 'Refunded from escrow', effect: (c) => `+${formatMoney(c)} back to available`, tone: 'text-good' },
}

function Balance({ icon, label, cents, note, tone = 'text-ink' }: { icon: ReactNode; label: string; cents: number; note: string; tone?: string }) {
  return (
    <div className="rounded-[28px] border border-[#e4e5e7] bg-white/95 backdrop-blur p-5 shadow-float sm:p-6">
      <p className="flex items-center gap-2 text-sm font-semibold text-muted">
        {icon}
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${tone}`}>{formatMoney(cents)}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{note}</p>
    </div>
  )
}

function History({ user, transactions }: { user: User; transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No money movements yet"
        message={
          user.role === 'brand'
            ? 'Add demo money above, then book a creator. Every movement will be listed here.'
            : "When a brand's post by you is verified, the payment shows up here."
        }
      />
    )
  }
  return (
    <ul className="divide-y divide-line">
      {transactions.map((entry) => {
        const meta = ENTRY[entry.type]
        return (
          <li key={entry.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-ink">{meta.label}</p>
              <p className="text-sm text-muted">
                {formatDateTime(entry.createdAt)}
                {entry.bookingId && <> · Booking {entry.bookingId.slice(0, 8)}</>}
              </p>
            </div>
            <p className={`text-sm font-semibold sm:text-right ${meta.tone}`}>{meta.effect(entry.amountCents)}</p>
          </li>
        )
      })}
    </ul>
  )
}

function WalletView({ user }: { user: User }) {
  const walletQuery = useApi<WalletData>('/wallet')
  const historyQuery = useApi<{ transactions: Transaction[] }>('/wallet/transactions')
  const refresh = () => {
    walletQuery.reload()
    historyQuery.reload()
  }

  const wallet = walletQuery.data
  if (!wallet) {
    return walletQuery.error ? (
      <ErrorState title="Couldn't load your wallet" message={walletQuery.error.message} action={<Button onClick={refresh}>Try again</Button>} />
    ) : (
      <LoadingState label="Loading your wallet…" slow={walletQuery.slow} />
    )
  }

  const brand = user.role === 'brand'
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Balance
          icon={<WalletIcon />}
          label="Available"
          cents={wallet.availableCents}
          note={brand ? 'Free to use for new bookings.' : 'Earned from posts that were verified live.'}
        />
        {brand ? (
          <Balance
            icon={<LockIcon className="text-held" />}
            label="Held in escrow"
            cents={wallet.heldCents}
            tone="text-held"
            note="Locked in open bookings. Paid to the creator when the post is verified, or refunded to you if it isn't."
          />
        ) : (
          <div className="rounded-[28px] border border-[#e4e5e7] bg-white/95 backdrop-blur p-5 text-sm leading-6 text-muted shadow-float sm:p-6">
            <p className="font-semibold text-ink">How you get paid</p>
            <p className="mt-2">
              A brand's money is held in escrow the moment they book you. Once your post is verified live (the brand
              approves it, a real reader clicks your tracked link, or 72 hours pass with no objection), the full price
              lands here. Withdrawals to a bank account are out of scope for this demo.
            </p>
          </div>
        )}
      </div>

      <p className={`flex items-center gap-2 text-sm ${wallet.reconciled ? 'text-good' : 'text-danger'}`}>
        {wallet.reconciled ? <CheckIcon /> : <AlertIcon />}
        {wallet.reconciled
          ? 'Your balance matches the ledger: every cent is accounted for by the history below.'
          : "Your balance doesn't match the ledger. This should never happen; please report it."}
      </p>

      {brand && (
        <section className="rounded-[28px] border border-[#e4e5e7] bg-white/95 backdrop-blur p-5 shadow-float sm:p-6">
          <h2 className="text-lg font-semibold">Add demo money</h2>
          <p className="mt-1 mb-5 text-sm text-muted">
            This demo has no card payments. Top-ups create real ledger entries so you can book creators.
          </p>
          <TopUpForm onDone={refresh} />
        </section>
      )}

      <section className="rounded-[28px] border border-[#e4e5e7] bg-white/95 backdrop-blur p-5 shadow-float sm:p-6">
        <h2 className="text-lg font-semibold">History</h2>
        <p className="mt-1 text-sm text-muted">Newest first. Entries are never edited or deleted.</p>
        <div className="mt-2">
          {historyQuery.data ? (
            <History user={user} transactions={historyQuery.data.transactions} />
          ) : historyQuery.error ? (
            <Notice tone="error" title="Couldn't load the history">
              {historyQuery.error.message}{' '}
              <button type="button" className="font-semibold underline" onClick={historyQuery.reload}>
                Try again
              </button>
            </Notice>
          ) : (
            <LoadingState label="Loading history…" />
          )}
        </div>
        {brand && historyQuery.data?.transactions.length === 0 && (
          <div className="flex justify-center">
            <ButtonLink to="/" variant="secondary">
              Browse creators
            </ButtonLink>
          </div>
        )}
      </section>
    </div>
  )
}

export default function Wallet() {
  usePageTitle('Wallet')
  const { user } = useAuth()
  if (!user) return null
  return (
    <Page>
      <h1 className="display text-[2rem] sm:text-[2.6rem]">Wallet</h1>
      <p className="mt-1 mb-6 text-muted">
        {user.role === 'brand'
          ? 'Your demo balance, the money held for open bookings, and every movement in between.'
          : 'Payments for your verified posts.'}
      </p>
      <WalletView user={user} />
    </Page>
  )
}
