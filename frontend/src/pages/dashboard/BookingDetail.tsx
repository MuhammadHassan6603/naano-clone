import { type FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { StatusBadge } from '../../components/dashboard/BookingBits'
import { BookingTimeline } from '../../components/dashboard/BookingTimeline'
import { ClickInsights } from '../../components/dashboard/ClickInsights'
import { ConfirmButton } from '../../components/dashboard/ConfirmButton'
import { CopyField } from '../../components/dashboard/CopyField'
import { Panel } from '../../components/dashboard/DashboardLayout'
import { Button, ButtonLink } from '../../components/ui/Button'
import { TextField } from '../../components/ui/Field'
import { ErrorState, LoadingState, Notice } from '../../components/ui/Feedback'
import { ArrowLeftIcon, ExternalIcon } from '../../components/ui/Icons'
import { api, toApiError } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { autoApproveAt, counterpart, linkedInPostProblem, moneyLine, nextStepText } from '../../lib/bookings'
import { firstName, formatDateTime, formatMoney } from '../../lib/format'
import { usePageTitle } from '../../lib/navigation'
import type { BookingDetail as Detail, Role } from '../../lib/types'
import { useApi } from '../../lib/useApi'

type Action = 'accept' | 'decline' | 'submit' | 'approve'

const DONE: Record<Action, string> = {
  accept: 'Accepted. Your tracked link is ready below.',
  decline: 'Declined. The brand has been refunded.',
  submit: 'Post submitted. You get paid once it is verified.',
  approve: 'Approved. The creator has been paid.',
}

function useBookingActions(id: string, onUpdated: (booking: Detail) => void, onFailed: () => void) {
  const [pending, setPending] = useState<Action | null>(null)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  async function run(action: Action, body?: unknown) {
    setPending(action)
    setMessage(null)
    try {
      const result = await api<{ booking: Detail }>(`/bookings/${id}/${action}`, { method: 'POST', body })
      onUpdated(result.booking)
      setMessage({ tone: 'success', text: DONE[action] })
    } catch (error) {
      setMessage({ tone: 'error', text: toApiError(error).message })
      onFailed()
    } finally {
      setPending(null)
    }
  }
  return { pending, message, run }
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 font-medium break-all text-accent hover:underline">
      {children}
      <ExternalIcon className="size-3.5 shrink-0" />
    </a>
  )
}

function SubmitPost({ onSubmit, pending }: { onSubmit: (postUrl: string) => void; pending: boolean }) {
  const [postUrl, setPostUrl] = useState('')
  const [error, setError] = useState<string>()
  function submit(event: FormEvent) {
    event.preventDefault()
    const problem = linkedInPostProblem(postUrl)
    setError(problem)
    if (!problem) onSubmit(postUrl.trim())
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <TextField
        label="Link to your LinkedIn post"
        type="url"
        inputMode="url"
        placeholder="https://www.linkedin.com/posts/…"
        value={postUrl}
        onChange={(e) => {
          setPostUrl(e.target.value)
          setError(undefined)
        }}
        error={error}
      />
      <Button type="submit" loading={pending}>
        Submit the post
      </Button>
    </form>
  )
}

function Actions({ booking, role, actions }: { booking: Detail; role: Role; actions: ReturnType<typeof useBookingActions> }) {
  const { pending, run } = actions
  const price = formatMoney(booking.priceCents)
  const creator = firstName(booking.creator.name)

  if (role === 'brand' && booking.status === 'submitted') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {booking.postUrl && (
          <a href={booking.postUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-[0.9375rem] font-semibold text-ink hover:border-ink/25">
            Check the post <ExternalIcon />
          </a>
        )}
        <ConfirmButton
          label={`Approve and pay ${price}`}
          confirmLabel={`Yes, pay ${creator} ${price}`}
          question={`This releases ${price} from escrow to ${creator}. It can't be undone.`}
          onConfirm={() => void run('approve')}
          pending={pending === 'approve'}
        />
      </div>
    )
  }
  if (role === 'creator' && booking.status === 'requested') {
    return (
      <div className="flex flex-wrap items-start gap-3">
        <Button onClick={() => void run('accept')} loading={pending === 'accept'} disabled={pending !== null}>
          Accept the brief
        </Button>
        <ConfirmButton
          variant="secondary"
          label="Decline"
          confirmLabel="Yes, decline"
          question={`Decline this request? ${booking.brand.name} gets the full ${price} back right away.`}
          onConfirm={() => void run('decline')}
          pending={pending === 'decline'}
        />
      </div>
    )
  }
  if (role === 'creator' && booking.status === 'accepted') {
    return (
      <div className="space-y-5">
        {booking.trackingUrl && (
          <div className="space-y-2">
            <CopyField label="Your tracked link" value={booking.trackingUrl} />
            <p className="text-sm text-muted">Put this link in your post. It sends readers to the brand's page and counts every click.</p>
          </div>
        )}
        <SubmitPost pending={pending === 'submit'} onSubmit={(postUrl) => void run('submit', { postUrl })} />
      </div>
    )
  }
  return null
}

export default function BookingDetail() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const query = useApi<{ booking: Detail }>(`/bookings/${encodeURIComponent(id)}`, { refreshOnFocus: true })
  const actions = useBookingActions(id, (booking) => query.replace({ booking }), query.reload)
  const booking = query.data?.booking
  const role = user?.role
  usePageTitle(booking && role ? `Booking with ${counterpart(booking, role).name}` : 'Booking')

  const back = (
    <Link to="/dashboard/bookings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
      <ArrowLeftIcon /> All bookings
    </Link>
  )

  if (!role) return null
  if (!booking) {
    const error = query.error
    return (
      <>
        {back}
        {error ? (
          <ErrorState
            title={error.status === 404 ? 'Booking not found' : error.status === 403 ? "This booking isn't yours" : "Couldn't load this booking"}
            message={error.status === 404 || error.status === 403 ? 'It may have been opened from an old or shared link.' : error.message}
            action={error.status === 404 || error.status === 403 ? <ButtonLink to="/dashboard/bookings" variant="secondary">Back to bookings</ButtonLink> : <Button onClick={query.reload}>Try again</Button>}
          />
        ) : (
          <LoadingState label="Loading booking…" slow={query.slow} />
        )}
      </>
    )
  }

  const other = counterpart(booking, role)
  const autoAt = autoApproveAt(booking)

  return (
    <>
      {back}
      <div className="mt-4 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar name={other.name} seed={other.id} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">{role === 'brand' ? 'Booking with' : 'Booked by'}</p>
          <h1 className="font-jakarta truncate text-[1.6rem] font-extrabold tracking-tight text-ink">{other.name}</h1>
        </div>
        <StatusBadge booking={booking} role={role} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="space-y-6">
          <Panel title="What happens now" guide="next-step">
            <p className="leading-7 text-body">{nextStepText(booking, role)}</p>
            {actions.message && (
              <div className="mt-4">
                <Notice tone={actions.message.tone}>{actions.message.text}</Notice>
              </div>
            )}
            <div className="mt-5 empty:hidden">
              <Actions booking={booking} role={role} actions={actions} />
            </div>
          </Panel>

          <Panel title="Timeline" guide="timeline">
            <BookingTimeline booking={booking} />
          </Panel>

          <Panel title="The brief" guide="brief">
            <p className="leading-7 whitespace-pre-line text-body">{booking.brief}</p>
            <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
              <div>
                <dt className="text-muted">Readers land on</dt>
                <dd><ExternalLink href={booking.destinationUrl}>{booking.destinationUrl}</ExternalLink></dd>
              </div>
              {booking.postUrl && (
                <div>
                  <dt className="text-muted">The LinkedIn post</dt>
                  <dd><ExternalLink href={booking.postUrl}>{booking.postUrl}</ExternalLink></dd>
                </div>
              )}
            </dl>
          </Panel>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Panel title="Money" guide="money">
            <p className="text-3xl font-bold tracking-tight text-ink">{formatMoney(booking.priceCents)}</p>
            <p className={`mt-1 text-sm font-semibold ${booking.status === 'paid' ? 'text-good' : booking.status === 'refunded' ? 'text-muted' : 'text-held'}`}>
              {moneyLine(booking, role)}
            </p>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Booked</dt>
                <dd className="text-right text-ink">{formatDateTime(booking.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Post deadline</dt>
                <dd className="text-right text-ink">{formatDateTime(booking.deadline)}</dd>
              </div>
              {booking.status === 'submitted' && autoAt && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Auto-approves</dt>
                  <dd className="text-right text-ink">{formatDateTime(autoAt.toISOString())}</dd>
                </div>
              )}
            </dl>
          </Panel>

          <Panel title="Link insights" guide="insights">
            {role === 'brand' && booking.trackingUrl && (
              <div className="mb-5">
                <CopyField label="Tracked link in the post" value={booking.trackingUrl} />
              </div>
            )}
            <ClickInsights booking={booking} />
          </Panel>
        </div>
      </div>
    </>
  )
}
