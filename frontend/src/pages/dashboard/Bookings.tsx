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
  const tab: BookingTab = TABS.some((t) => t.value === requested) ? (requested as BookingTab) : 'action'
  const all = data?.bookings ?? []
  const shown = all.filter((b) => inTab(b, tab, role))

  return (
    <>
      <DashboardHeader
        title="Bookings"
        subtitle={role === 'brand' ? 'Every creator you booked and where each post stands.' : 'Every brand that booked you and what you need to do next.'}
        actions={role === 'brand' ? <ButtonLink to="/#creators">Book a creator</ButtonLink> : undefined}
      />
      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Booking filters">
        <div className="flex w-max gap-2">
          {TABS.map((option) => {
            const count = all.filter((b) => inTab(b, option.value, role)).length
            const active = option.value === tab
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setParams(option.value === 'action' ? {} : { tab: option.value }, { replace: true })}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? 'bg-ink text-white' : 'bg-white text-[#4b5563] ring-1 ring-line hover:text-ink'
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
      <Panel>
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
