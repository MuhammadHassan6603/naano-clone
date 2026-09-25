import { eventText, upcomingSteps } from '../../lib/bookings'
import { formatDateTime } from '../../lib/format'
import type { BookingDetail } from '../../lib/types'
import { CheckIcon } from '../ui/Icons'

const doneTone = {
  refunded: 'bg-[#eef0f3] text-[#6b7280]',
  declined: 'bg-[#eef0f3] text-[#6b7280]',
  expired: 'bg-[#eef0f3] text-[#6b7280]',
  paid: 'bg-good-soft text-good',
} as Record<string, string>

export function BookingTimeline({ booking }: { booking: BookingDetail }) {
  const upcoming = upcomingSteps(booking)
  return (
    <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-line">
      {booking.timeline.map((event, index) => (
        <li key={`${event.event}-${index}`} className="relative flex gap-4">
          <span className={`z-10 grid size-8 shrink-0 place-items-center rounded-full ${doneTone[event.event] ?? 'bg-accent-soft text-accent'}`}>
            <CheckIcon className="size-4" />
          </span>
          <div className="pt-1">
            <p className="text-sm font-semibold text-ink">{eventText(event, booking)}</p>
            <p className="text-sm text-muted">{formatDateTime(event.at)}</p>
          </div>
        </li>
      ))}
      {upcoming.map((step) => (
        <li key={step} className="relative flex gap-4">
          <span className="z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 border-dashed border-line-strong bg-white" />
          <p className="pt-1.5 text-sm font-medium text-muted">{step}</p>
        </li>
      ))}
    </ol>
  )
}
