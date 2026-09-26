import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { type Tone, counterpart, moneyLine, statusLabel } from '../../lib/bookings'
import { formatDateTime } from '../../lib/format'
import type { Booking, Role } from '../../lib/types'
import { Avatar } from '../Avatar'
import { ArrowRightIcon, MessageIcon } from '../ui/Icons'

const toneClass: Record<Tone, string> = {
  neutral: 'bg-[#f1f2f4] text-[#3f4652]',
  info: 'bg-accent-soft text-accent-strong',
  warning: 'bg-held-soft text-held',
  success: 'bg-good-soft text-good',
  muted: 'bg-[#f1f2f4] text-[#6b7280]',
}

export function StatusBadge({ booking, role }: { booking: Booking; role: Role }) {
  const { label, tone } = statusLabel(booking, role)
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${toneClass[tone]}`}>
      {label}
    </span>
  )
}

export function StatCard({ label, value, note, tone = 'text-ink', icon }: { label: string; value: string; note?: string; tone?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgb(17_19_24/0.04)]">
      <p className="flex items-center gap-2 text-sm font-medium text-muted">
        {icon}
        {label}
      </p>
      <p className={`mt-2 text-[1.75rem] leading-none font-bold tracking-tight ${tone}`}>{value}</p>
      {note && <p className="mt-2 text-sm leading-5 text-muted">{note}</p>}
    </div>
  )
}

function whenLine(booking: Booking): string {
  if (booking.status === 'paid' || booking.status === 'refunded') return `Closed ${formatDateTime(booking.closedAt ?? booking.createdAt)}`
  if (booking.status === 'submitted') return `Posted ${formatDateTime(booking.submittedAt ?? booking.createdAt)}`
  return `Deadline ${formatDateTime(booking.deadline)}`
}

export function BookingRow({ booking, role }: { booking: Booking; role: Role }) {
  const other = counterpart(booking, role)
  return (
    <li>
      <Link
        to={`/dashboard/bookings/${booking.id}`}
        className="group flex items-center gap-4 rounded-xl px-2 py-3.5 transition-colors hover:bg-[#f6f7f9] sm:px-3"
      >
        <Avatar name={other.name} seed={other.id} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="truncate font-semibold text-ink">{other.name}</p>
            <StatusBadge booking={booking} role={role} />
            {Boolean(booking.unreadMessages) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-white">
                <MessageIcon className="size-3" />
                {booking.unreadMessages} new {booking.unreadMessages === 1 ? 'message' : 'messages'}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-muted">
            {moneyLine(booking, role)} · {whenLine(booking)}
          </p>
        </div>
        <ArrowRightIcon className="size-4 shrink-0 text-[#9ca3af] transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
      </Link>
    </li>
  )
}

export function BookingList({ bookings, role, empty }: { bookings: Booking[]; role: Role; empty: ReactNode }) {
  if (bookings.length === 0) return <>{empty}</>
  return <ul className="-mx-2 divide-y divide-line sm:-mx-3">{bookings.map((b) => <BookingRow key={b.id} booking={b} role={role} />)}</ul>
}
