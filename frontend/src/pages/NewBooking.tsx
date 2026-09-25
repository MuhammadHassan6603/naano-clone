import { type FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { Page } from '../components/Layout'
import { TopUpForm } from '../components/TopUpForm'
import { Button, ButtonLink } from '../components/ui/Button'
import { TextArea, TextField, inputClass } from '../components/ui/Field'
import { ErrorState, LoadingState, Notice, SlowServerHint } from '../components/ui/Feedback'
import { ArrowLeftIcon, CheckIcon, LockIcon } from '../components/ui/Icons'
import { api, toApiError } from '../lib/api'
import { firstName, formatDateTime, formatMoney } from '../lib/format'
import { usePageTitle } from '../lib/navigation'
import type { Booking, Creator, Wallet } from '../lib/types'
import { useApi } from '../lib/useApi'
import { lengthProblem, webUrlProblem } from '../lib/validation'

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE
const MAX_DEADLINE = 60 * DAY

const DEADLINES = [
  { value: 'demo', label: '2 minutes', note: 'demo', ms: 2 * MINUTE },
  { value: '3d', label: '3 days', ms: 3 * DAY },
  { value: '7d', label: '7 days', ms: 7 * DAY },
  { value: '14d', label: '14 days', ms: 14 * DAY },
  { value: 'custom', label: 'Pick a date', ms: 0 },
] as const

type DeadlineChoice = (typeof DEADLINES)[number]['value']

const toLocalInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * MINUTE)
  return local.toISOString().slice(0, 16)
}

function resolveDeadline(choice: DeadlineChoice, custom: string): { date?: Date; problem?: string } {
  if (choice !== 'custom') return { date: new Date(Date.now() + (DEADLINES.find((d) => d.value === choice)?.ms ?? 0)) }
  if (!custom) return { problem: 'Pick a date and time.' }
  const date = new Date(custom)
  if (Number.isNaN(date.getTime())) return { problem: 'That date is not valid.' }
  if (date.getTime() <= Date.now()) return { problem: 'The deadline has to be in the future.' }
  if (date.getTime() > Date.now() + MAX_DEADLINE) return { problem: 'The deadline can be at most 60 days away.' }
  return { date }
}

type Errors = { brief?: string; destinationUrl?: string; deadline?: string }

function Summary({ creator, wallet }: { creator: Creator; wallet: Wallet }) {
  const enough = wallet.availableCents >= creator.priceCents
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={creator.name} seed={creator.id} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{creator.name}</p>
          <p className="text-sm text-muted">{creator.niche}</p>
        </div>
      </div>
      <dl className="space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Price for one post</dt>
          <dd className="font-semibold text-ink">{formatMoney(creator.priceCents)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Your available balance</dt>
          <dd className="font-semibold text-ink">{formatMoney(wallet.availableCents)}</dd>
        </div>
        {enough && (
          <>
            <div className="flex justify-between gap-3 border-t border-line pt-2">
              <dt className="text-muted">Available after booking</dt>
              <dd className="font-semibold text-ink">{formatMoney(wallet.availableCents - creator.priceCents)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-muted">
                <LockIcon className="size-3.5 text-held" /> Held in escrow after booking
              </dt>
              <dd className="font-semibold text-held">{formatMoney(wallet.heldCents + creator.priceCents)}</dd>
            </div>
          </>
        )}
      </dl>
      <p className="rounded-xl bg-page p-3 text-sm leading-6 text-muted">
        The price is locked in escrow, not paid. {firstName(creator.name)} is paid only after the post is verified live.
        If they decline or miss the deadline, it comes straight back to your available balance.
      </p>
    </div>
  )
}

function Success({ booking }: { booking: Booking }) {
  const name = firstName(booking.creator.name)
  return (
    <Page narrow>
      <section className="rounded-3xl border border-line bg-surface p-6 text-center shadow-card sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-good-soft text-good">
          <CheckIcon className="size-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Request sent to {name}</h1>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-body">
          <span className="font-semibold text-held">{formatMoney(booking.priceCents)} is now held in escrow.</span>{' '}
          {name} has until {formatDateTime(booking.deadline)} to accept, publish the post and submit its link.
        </p>
        <ol className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm leading-6 text-muted">
          <li>1. {name} accepts or declines. Declining refunds you right away.</li>
          <li>2. {name} publishes the post with your tracked link and submits it.</li>
          <li>3. You approve it, or it is verified by the first real click or after 72 hours. Then {name} is paid.</li>
        </ol>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink to="/wallet">See your wallet</ButtonLink>
          <ButtonLink to="/" variant="secondary">
            Browse more creators
          </ButtonLink>
        </div>
      </section>
    </Page>
  )
}

export default function NewBooking() {
  const { creatorId = '' } = useParams()
  const creatorQuery = useApi<{ creator: Creator }>(`/creators/${encodeURIComponent(creatorId)}`)
  const walletQuery = useApi<Wallet>('/wallet')
  const creator = creatorQuery.data?.creator
  usePageTitle(creator ? `Book ${creator.name}` : 'Book a creator')

  const [brief, setBrief] = useState('')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [deadlineChoice, setDeadlineChoice] = useState<DeadlineChoice>('7d')
  const [customDeadline, setCustomDeadline] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [booked, setBooked] = useState<Booking | null>(null)

  const back = (
    <Link
      to={creator ? `/creators/${creator.id}` : '/'}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
    >
      <ArrowLeftIcon /> {creator ? `Back to ${firstName(creator.name)}` : 'All creators'}
    </Link>
  )

  if (booked) return <Success booking={booked} />

  const loadError = creatorQuery.error ?? walletQuery.error
  if (loadError && !(creator && walletQuery.data)) {
    const missing = creatorQuery.error?.status === 404
    return (
      <Page>
        {back}
        <ErrorState
          title={missing ? 'Creator not found' : "Couldn't load the booking form"}
          message={missing ? "This creator isn't listed, so they can't be booked." : loadError.message}
          action={
            missing ? (
              <ButtonLink to="/" variant="secondary">
                Browse creators
              </ButtonLink>
            ) : (
              <Button
                onClick={() => {
                  creatorQuery.reload()
                  walletQuery.reload()
                }}
              >
                Try again
              </Button>
            )
          }
        />
      </Page>
    )
  }
  if (!creator || !walletQuery.data) {
    return (
      <Page>
        {back}
        <LoadingState label="Preparing the booking form…" slow={creatorQuery.slow || walletQuery.slow} />
      </Page>
    )
  }

  const wallet = walletQuery.data
  const shortfall = creator.priceCents - wallet.availableCents
  const enough = shortfall <= 0

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!creator) return
    const deadline = resolveDeadline(deadlineChoice, customDeadline)
    const found: Errors = {
      brief: lengthProblem(brief, { min: 20, max: 5000, what: 'The brief' }),
      destinationUrl: webUrlProblem(destinationUrl),
      deadline: deadline.problem,
    }
    setErrors(found)
    if (Object.values(found).some(Boolean) || !deadline.date) return

    setPending(true)
    setServerError(null)
    try {
      const result = await api<{ booking: Booking }>('/bookings', {
        method: 'POST',
        body: {
          creatorId: creator.id,
          brief: brief.trim(),
          destinationUrl: destinationUrl.trim(),
          deadline: deadline.date.toISOString(),
        },
      })
      setBooked(result.booking)
    } catch (error) {
      const apiError = toApiError(error)
      setServerError(apiError.message)
      if (apiError.status === 409) walletQuery.reload()
      if (apiError.status === 404) creatorQuery.reload()
    } finally {
      setPending(false)
    }
  }

  return (
    <Page>
      {back}
      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Book {creator.name}</h1>
      <p className="mt-1 text-muted">One LinkedIn post, written by {firstName(creator.name)} in their own voice.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <form onSubmit={submit} noValidate className="space-y-6 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8">
          {serverError && <Notice tone="error">{serverError}</Notice>}

          <TextArea
            label="Brief"
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            error={errors.brief}
            maxLength={5000}
            rows={6}
            placeholder="What should the post cover? Key message, what to link, anything to avoid."
            aside={<span className="text-xs text-muted">{brief.trim().length}/5000</span>}
            hint="At least 20 characters. The creator writes the post; this tells them what matters to you."
          />

          <TextField
            label="Where should readers land?"
            type="url"
            inputMode="url"
            placeholder="https://yourcompany.com/launch"
            value={destinationUrl}
            onChange={(event) => setDestinationUrl(event.target.value)}
            error={errors.destinationUrl}
            hint="The creator gets a tracked link that sends readers here, so every click is counted."
          />

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-ink">Deadline to publish</legend>
            <div className="flex flex-wrap gap-2">
              {DEADLINES.map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                    deadlineChoice === option.value
                      ? 'border-accent bg-accent-soft text-accent-strong'
                      : 'border-line-strong text-ink hover:border-ink/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="deadline"
                    value={option.value}
                    checked={deadlineChoice === option.value}
                    onChange={() => {
                      setDeadlineChoice(option.value)
                      setErrors((current) => ({ ...current, deadline: undefined }))
                    }}
                    className="sr-only"
                  />
                  {option.label}
                  {'note' in option && <span className="ml-1.5 font-normal text-muted">({option.note})</span>}
                </label>
              ))}
            </div>
            {deadlineChoice === 'custom' && (
              <input
                type="datetime-local"
                aria-label="Deadline date and time"
                className={`${inputClass} sm:max-w-xs`}
                min={toLocalInput(new Date(Date.now() + MINUTE))}
                max={toLocalInput(new Date(Date.now() + MAX_DEADLINE))}
                value={customDeadline}
                onChange={(event) => {
                  setCustomDeadline(event.target.value)
                  setErrors((current) => ({ ...current, deadline: undefined }))
                }}
              />
            )}
            {errors.deadline ? (
              <p className="text-sm text-danger">{errors.deadline}</p>
            ) : (
              <p className="text-sm leading-6 text-muted">
                The creator must accept, publish and submit the post before this. If they don't, you're refunded
                automatically.{' '}
                {deadlineChoice === 'demo' && 'The 2-minute option exists so you can watch an expiry and refund happen live.'}
              </p>
            )}
          </fieldset>

          <div className="border-t border-line pt-6">
            <Button type="submit" size="lg" loading={pending} disabled={!enough} className="w-full sm:w-auto">
              Hold {formatMoney(creator.priceCents)} and send request
            </Button>
            {!enough && (
              <p className="mt-2 text-sm text-muted">Add money to your wallet first (see the panel on the right).</p>
            )}
            {pending && <div className="mt-3"><SlowServerHint /></div>}
          </div>
        </form>

        <aside className="order-first space-y-5 lg:sticky lg:top-24 lg:order-none">
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
            <Summary creator={creator} wallet={wallet} />
          </div>
          {!enough && (
            <div className="space-y-4 rounded-3xl border border-held/30 bg-surface p-5 shadow-card sm:p-6">
              <Notice tone="warning" title={`You need ${formatMoney(shortfall)} more`}>
                Your available balance is {formatMoney(wallet.availableCents)}. Add demo money to book {firstName(creator.name)}.
              </Notice>
              <TopUpForm suggestedCents={Math.ceil(shortfall / 10_000) * 10_000} onDone={walletQuery.reload} />
            </div>
          )}
        </aside>
      </div>
    </Page>
  )
}
