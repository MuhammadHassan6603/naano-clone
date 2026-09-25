import type { Reliability } from '../lib/types'

export function ReliabilityLine({ reliability }: { reliability: Reliability }) {
  const { delivered, total } = reliability
  if (total === 0) {
    return <p className="text-sm text-muted">New creator · no finished bookings yet</p>
  }
  const perfect = delivered === total
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-ink">
        <span className="font-semibold">
          Delivered {delivered} of {total}
        </span>{' '}
        <span className="text-muted">booked {total === 1 ? 'post' : 'posts'}</span>
      </p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-line"
        role="img"
        aria-label={`${delivered} of ${total} bookings delivered`}
      >
        <div
          className={`h-full rounded-full ${perfect ? 'bg-good' : 'bg-held'}`}
          style={{ width: `${(delivered / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

export function ReliabilityExplainer() {
  return (
    <p className="text-sm leading-6 text-muted">
      <span className="font-semibold text-ink">How reliability is counted:</span> a booking counts as delivered when the
      creator was paid for a verified post, and as missed when the deadline passed without one. Declined requests don't
      count against anyone. The number comes straight from real bookings in the database.
    </p>
  )
}
