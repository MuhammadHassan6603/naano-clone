import type { BookingDetail, ClickStats } from '../../lib/types'
import { useApi } from '../../lib/useApi'
import { Notice, Spinner } from '../ui/Feedback'

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

function Bars({ byDay }: { byDay: ClickStats['byDay'] }) {
  const recent = byDay.slice(-14)
  const max = Math.max(...recent.map((d) => d.clicks), 1)
  return (
    <div className="mt-5">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">Clicks per day</p>
      <ul className="mt-3 flex h-32 items-end gap-2" aria-label="Clicks per day">
        {recent.map((day) => (
          <li key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-xs font-semibold text-ink">{day.clicks}</span>
            <span
              className="w-full max-w-10 rounded-t-md bg-[linear-gradient(180deg,#6691FF,#2563EB)]"
              style={{ height: `${Math.max((day.clicks / max) * 100, 6)}%` }}
            />
            <span className="w-full truncate text-center text-[11px] text-muted">{shortDate.format(new Date(`${day.date}T00:00:00Z`))}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ClickInsights({ booking }: { booking: BookingDetail }) {
  const stats = useApi<ClickStats>(booking.acceptedAt ? `/bookings/${booking.id}/stats` : null, { refreshOnFocus: true })

  if (!booking.acceptedAt) {
    return (
      <p className="text-sm leading-6 text-muted">
        Insights start once the creator accepts and gets the tracked link. Every human click on it is counted here.
      </p>
    )
  }
  if (stats.error && !stats.data) {
    return (
      <Notice tone="error" title="Couldn't load the click stats">
        {stats.error.message}{' '}
        <button type="button" onClick={stats.reload} className="font-semibold underline">
          Try again
        </button>
      </Notice>
    )
  }
  if (!stats.data) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Spinner /> Loading clicks…
      </p>
    )
  }

  const { totalClicks, uniqueClicks, byDay } = stats.data
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button type="button" onClick={stats.reload} disabled={stats.loading} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline disabled:opacity-60">
          {stats.loading && <Spinner />}
          Refresh
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#f6f7f9] p-4">
          <dt className="text-sm text-muted">Total clicks</dt>
          <dd className="mt-1 text-2xl font-bold text-ink">{totalClicks}</dd>
        </div>
        <div className="rounded-xl bg-[#f6f7f9] p-4">
          <dt className="text-sm text-muted">Unique visitors</dt>
          <dd className="mt-1 text-2xl font-bold text-ink">{uniqueClicks}</dd>
        </div>
      </dl>
      {byDay.length > 0 ? (
        <Bars byDay={byDay} />
      ) : (
        <p className="mt-4 text-sm text-muted">No clicks yet. They appear here as soon as readers open the tracked link.</p>
      )}
      <p className="mt-4 text-xs leading-5 text-muted">
        Link-preview bots (LinkedIn, Slack, WhatsApp) are ignored, so these are real visits.
      </p>
    </div>
  )
}
