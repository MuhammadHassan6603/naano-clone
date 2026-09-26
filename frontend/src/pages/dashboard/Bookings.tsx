import { useSearchParams } from 'react-router-dom'
import { BookingList } from '../../components/dashboard/BookingBits'
import { DashboardHeader, Panel } from '../../components/dashboard/DashboardLayout'
import { Button, ButtonLink } from '../../components/ui/Button'
import { ErrorState, LoadingState } from '../../components/ui/Feedback'
import { useAuth } from '../../lib/auth'
import { type BookingTab, TABS, inTab } from '../../lib/bookings'
import { usePageTitle } from '../../lib/navigation'
import type { Booking } from '../../lib/types'
import { useApi } from '../../lib/useApi'

const EMPTY: Record<BookingTab, { brand: string; creator: string }> = {
  action: {
    brand: 'Nothing needs you right now. Posts waiting for your approval show up here.',
    creator: 'Nothing needs you right now. New requests and posts to submit show up here.',
  },
  progress: {
    brand: 'No bookings are waiting on a creator.',
    creator: 'No bookings are waiting on a brand.',
  },
  done: {
    brand: 'Paid and refunded bookings show up here.',
    creator: 'Paid, declined and expired bookings show up here.',
  },
  all: {
    brand: "You haven't booked anyone yet.",
    creator: 'No brand has booked you yet.',
  },
}

export default function Bookings() {
  usePageTitle('Bookings')
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const { data, error, slow, reload } = useApi<{ bookings: Booking[] }>('/bookings', { refreshOnFocus: true })
  if (!user) return null

  const role = user.role
  const requested = params.get('tab')
  const all = data?.bookings ?? []
  const counts = Object.fromEntries(TABS.map((t) => [t.value, all.filter((b) => inTab(b, t.value, role)).length])) as Record<BookingTab, number>
  const chosen = TABS.find((t) => t.value === requested)?.value
  const tab: BookingTab = chosen ?? (data ? (TABS.find((t) => counts[t.value] > 0)?.value ?? 'all') : 'action')
  const shown = all.filter((b) => inTab(b, tab, role))

  return (
    <>
      <DashboardHeader
        title="Bookings"
        subtitle={role === 'brand' ? 'Every creator you booked and where each post stands.' : 'Every brand that booked you and what you need to do next.'}
        actions={role === 'brand' ? <ButtonLink to="/#creators">Book a creator</ButtonLink> : undefined}
      />
      <div data-guide="booking-tabs" className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Booking filters">
        <div className="flex w-max gap-2">
          {TABS.map((option) => {
            const count = counts[option.value]
            const active = option.value === tab
            const empty = Boolean(data) && count === 0 && option.value !== 'all' && !active
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={empty}
                title={empty ? 'Nothing here right now' : undefined}
                onClick={() => setParams({ tab: option.value }, { replace: true })}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                  active ? 'bg-ink text-white' : 'bg-white text-[#4b5563] ring-1 ring-line enabled:hover:text-ink'
                }`}
              >
                {option.label}
                {data && (
                  <span className={`rounded-full px-1.5 text-xs ${active ? 'bg-white/20' : 'bg-[#f1f2f4]'}`}>{count}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <Panel guide="booking-list">
        {data ? (
          <BookingList bookings={shown} role={role} empty={<p className="py-6 text-center text-sm text-muted">{EMPTY[tab][role]}</p>} />
        ) : error ? (
          <ErrorState title="Couldn't load your bookings" message={error.message} action={<Button onClick={reload}>Try again</Button>} />
        ) : (
          <LoadingState label="Loading bookings…" slow={slow} />
        )}
      </Panel>
    </>
  )
}
