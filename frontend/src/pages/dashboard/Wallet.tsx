import { Link } from 'react-router-dom'
import { StatCard } from '../../components/dashboard/BookingBits'
import { DashboardHeader, Panel } from '../../components/dashboard/DashboardLayout'
import { TopUpForm } from '../../components/TopUpForm'
import { Button, ButtonLink } from '../../components/ui/Button'
import { ErrorState, LoadingState, Notice } from '../../components/ui/Feedback'
import { AlertIcon, CheckIcon, LockIcon, WalletIcon } from '../../components/ui/Icons'
import { useAuth } from '../../lib/auth'
import { formatDateTime, formatMoney } from '../../lib/format'
import { usePageTitle } from '../../lib/navigation'
import type { Transaction, TransactionType, User, Wallet as WalletData } from '../../lib/types'
import { useApi } from '../../lib/useApi'

const ENTRY: Record<TransactionType, { label: string; effect: (cents: number) => string; tone: string }> = {
  topup: { label: 'Added demo money', effect: (c) => `+${formatMoney(c)} available`, tone: 'text-good' },
  hold: { label: 'Held for a booking', effect: (c) => `${formatMoney(c)} moved into escrow`, tone: 'text-held' },
  release: { label: 'Paid to the creator', effect: (c) => `−${formatMoney(c)} from escrow`, tone: 'text-ink' },
  payout: { label: 'Payment for a verified post', effect: (c) => `+${formatMoney(c)} available`, tone: 'text-good' },
  refund: { label: 'Refunded from escrow', effect: (c) => `+${formatMoney(c)} back to available`, tone: 'text-good' },
}

function History({ user, transactions }: { user: User; transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <p className="py-6 text-center text-sm leading-6 text-muted">
        {user.role === 'brand'
          ? 'No money movements yet. Add demo money, then book a creator.'
          : "Nothing yet. When a brand's post by you is verified, the payment shows up here."}
      </p>
    )
  }
  return (
    <ul className="divide-y divide-line">
      {transactions.map((entry) => {
        const meta = ENTRY[entry.type]
        return (
          <li key={entry.id} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-ink">{meta.label}</p>
              <p className="text-sm text-muted">
                {formatDateTime(entry.createdAt)}
                {entry.bookingId && (
                  <>
                    {' · '}
                    <Link to={`/dashboard/bookings/${entry.bookingId}`} className="font-medium text-accent hover:underline">
                      View booking
                    </Link>
                  </>
                )}
              </p>
            </div>
            <p className={`text-sm font-semibold sm:text-right ${meta.tone}`}>{meta.effect(entry.amountCents)}</p>
          </li>
        )
      })}
    </ul>
  )
}

export default function Wallet() {
  usePageTitle('Wallet')
  const { user } = useAuth()
  const wallet = useApi<WalletData>('/wallet', { refreshOnFocus: true })
  const history = useApi<{ transactions: Transaction[] }>('/wallet/transactions', { refreshOnFocus: true })
  if (!user) return null

  const brand = user.role === 'brand'
  const refresh = () => {
    wallet.reload()
    history.reload()
  }

  return (
    <>
      <DashboardHeader
        title="Wallet"
        subtitle={brand ? 'Your demo balance, the money held for open bookings, and every movement.' : 'Payments for your verified posts.'}
      />
      {!wallet.data ? (
        wallet.error ? (
          <ErrorState title="Couldn't load your wallet" message={wallet.error.message} action={<Button onClick={refresh}>Try again</Button>} />
        ) : (
          <LoadingState label="Loading your wallet…" slow={wallet.slow} />
        )
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              icon={<WalletIcon />}
              label={brand ? 'Available' : 'Earned'}
              value={formatMoney(wallet.data.availableCents)}
              tone={brand ? 'text-ink' : 'text-good'}
              note={brand ? 'Free to use for new bookings.' : 'Paid for posts that were verified live.'}
            />
            {brand ? (
              <StatCard
                icon={<LockIcon className="text-held" />}
                label="Held in escrow"
                value={formatMoney(wallet.data.heldCents)}
                tone="text-held"
                note="Paid to the creator when the post is verified, or refunded to you if it isn't."
              />
            ) : (
              <div className="rounded-2xl border border-line bg-white p-5 text-sm leading-6 text-muted">
                <p className="font-semibold text-ink">How you get paid</p>
                <p className="mt-1">
                  The brand's money is held in escrow the moment they book you. Once your post is verified (the brand
                  approves it, a real reader clicks your link, or 72 hours pass), the full price lands here. Withdrawals
                  are out of scope for this demo.
                </p>
              </div>
            )}
          </div>

          <p className={`flex items-center gap-2 text-sm ${wallet.data.reconciled ? 'text-good' : 'text-danger'}`}>
            {wallet.data.reconciled ? <CheckIcon /> : <AlertIcon />}
            {wallet.data.reconciled
              ? 'Your balance matches the ledger: every cent is accounted for by the history below.'
              : "Your balance doesn't match the ledger. This should never happen; please report it."}
          </p>

          {brand && (
            <Panel title="Add demo money">
              <p className="-mt-2 mb-5 text-sm text-muted">This demo has no card payments. Top-ups create real ledger entries so you can book creators.</p>
              <TopUpForm onDone={refresh} />
            </Panel>
          )}

          <Panel title="History" action={brand ? <ButtonLink to="/#creators" variant="ghost" size="sm">Book a creator</ButtonLink> : undefined}>
            <p className="-mt-2 mb-2 text-sm text-muted">Newest first. Entries are never edited or deleted.</p>
            {history.data ? (
              <History user={user} transactions={history.data.transactions} />
            ) : history.error ? (
              <Notice tone="error" title="Couldn't load the history">
                {history.error.message}{' '}
                <button type="button" className="font-semibold underline" onClick={history.reload}>
                  Try again
                </button>
              </Notice>
            ) : (
              <LoadingState label="Loading history…" />
            )}
          </Panel>
        </div>
      )}
    </>
  )
}
