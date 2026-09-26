import { type FormEvent, type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { DashboardHeader, Panel } from '../../components/dashboard/DashboardLayout'
import { FitChips } from '../../components/FitReasons'
import { Button, ButtonLink } from '../../components/ui/Button'
import { TextField } from '../../components/ui/Field'
import { EmptyState, ErrorState, LoadingState, Notice, Spinner } from '../../components/ui/Feedback'
import { api, toApiError } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { formatMoney } from '../../lib/format'
import { usePageTitle } from '../../lib/navigation'
import type { Creator, Target } from '../../lib/types'
import { useApi } from '../../lib/useApi'

type Form = { niches: string[]; audience: string; budget: string }
type Errors = { audience?: string; budget?: string }

const MAX_BUDGET_DOLLARS = 100_000

const toForm = (target: Target): Form => ({
  niches: target.niches,
  audience: target.audience,
  budget: target.budgetCents ? String(target.budgetCents / 100) : '',
})

function validate(form: Form): Errors {
  const budget = Number(form.budget)
  return {
    audience: form.audience.trim().length > 200 ? 'Keep it under 200 characters.' : undefined,
    budget:
      form.budget.trim() === ''
        ? undefined
        : !Number.isFinite(budget) || budget < 1
          ? 'Use an amount in dollars, like 500.'
          : budget > MAX_BUDGET_DOLLARS
            ? `The budget can be at most $${MAX_BUDGET_DOLLARS.toLocaleString('en-US')}.`
            : undefined,
  }
}

function TopMatches({ creators, loading }: { creators: Creator[] | undefined; loading: boolean }) {
  if (!creators) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Spinner /> Finding your best matches…
      </p>
    )
  }
  const top = creators.filter((creator) => creator.fit).slice(0, 3)
  if (!top.length) return <p className="text-sm leading-6 text-muted">Save who you sell to and your best matches appear here.</p>
  return (
    <ul className={`divide-y divide-line transition-opacity ${loading ? 'opacity-60' : ''}`}>
      {top.map((creator) => (
        <li key={creator.id} className="py-3.5 first:pt-0 last:pb-0">
          <Link to={`/creators/${creator.id}`} className="group flex items-start gap-3">
            <Avatar name={creator.name} seed={creator.id} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink group-hover:underline">{creator.name}</p>
              <p className="text-sm text-muted">
                {creator.niche} · {formatMoney(creator.priceCents)} a post
              </p>
              {creator.fit && <FitChips fit={creator.fit} className="mt-2" />}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function AudienceForm({
  target,
  niches,
  onSaved,
  submitLabel = 'Save',
  extraActions = (
    <ButtonLink to="/#creators" variant="ghost">
      See creators ranked by fit
    </ButtonLink>
  ),
}: {
  target: Target
  niches: string[]
  onSaved: () => void
  submitLabel?: string
  extraActions?: ReactNode
}) {
  const [form, setForm] = useState<Form>(() => toForm(target))
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const change = (next: Partial<Form>) => {
    setForm((current) => ({ ...current, ...next }))
    setResult(null)
  }
  const toggle = (niche: string) =>
    change({ niches: form.niches.includes(niche) ? form.niches.filter((n) => n !== niche) : [...form.niches, niche] })

  async function save(event: FormEvent) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (found.audience || found.budget) return
    setPending(true)
    setResult(null)
    try {
      const saved = await api<{ profile: Target }>('/brands/me/profile', {
        method: 'PUT',
        body: {
          niches: form.niches,
          audience: form.audience.trim(),
          budgetCents: form.budget.trim() ? Math.round(Number(form.budget) * 100) : null,
        },
      })
      setForm(toForm(saved.profile))
      const empty = !saved.profile.niches.length && !saved.profile.audience && !saved.profile.budgetCents
      setResult({
        tone: 'success',
        text: empty ? 'Cleared. Creator cards no longer show fit reasons.' : 'Saved. Every creator card now explains why they fit you.',
      })
      onSaved()
    } catch (error) {
      setResult({ tone: 'error', text: toApiError(error).message })
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={save} noValidate className="space-y-6">
      {result && <Notice tone={result.tone}>{result.text}</Notice>}
      <fieldset className="space-y-2.5">
        <legend className="text-xs font-semibold tracking-wide text-[#5c5b57] uppercase">Niches you want to reach</legend>
        <p className="text-sm text-muted">Pick any that fit. Leave them all off to ignore niche.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {niches.map((niche) => {
            const on = form.niches.includes(niche)
            return (
              <button
                key={niche}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(niche)}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  on ? 'border-ink bg-ink text-white' : 'border-[#d1d5db] bg-white text-[#374151] hover:border-ink/40'
                }`}
              >
                {niche}
              </button>
            )
          })}
        </div>
      </fieldset>
      <TextField
        label="Who you sell to"
        placeholder="SaaS founders and sales leaders"
        value={form.audience}
        maxLength={200}
        onChange={(event) => {
          change({ audience: event.target.value })
          setErrors((current) => ({ ...current, audience: undefined }))
        }}
        error={errors.audience}
        hint="We look for these words in each creator's audience description."
        aside={<span className="text-xs text-muted">{form.audience.trim().length}/200</span>}
      />
      <TextField
        label="Budget per post (USD, optional)"
        type="number"
        inputMode="decimal"
        min={1}
        step="1"
        placeholder="500"
        value={form.budget}
        onChange={(event) => {
          change({ budget: event.target.value })
          setErrors((current) => ({ ...current, budget: undefined }))
        }}
        error={errors.budget}
        hint="Creators above it are still shown, with how far over they are."
      />
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
        {extraActions}
      </div>
    </form>
  )
}

export default function Audience() {
  usePageTitle('Who you sell to')
  const { user } = useAuth()
  const target = useApi<{ profile: Target; niches: string[] }>(user?.role === 'brand' ? '/brands/me/profile' : null)
  const matches = useApi<{ creators: Creator[] }>(user?.role === 'brand' ? '/creators?sort=fit' : null)

  if (!user) return null
  if (user.role !== 'brand') {
    return <EmptyState title="This page is for brands" message="Brands describe who they sell to here, so each creator card can explain the fit." />
  }

  return (
    <>
      <DashboardHeader
        title="Who you sell to"
        subtitle="Describe your buyers once. Every creator card then shows why that creator fits you, or doesn't."
      />
      {target.data ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <Panel guide="audience-form">
            <AudienceForm target={target.data.profile} niches={target.data.niches} onSaved={matches.reload} />
          </Panel>
          <div className="space-y-6 lg:sticky lg:top-6">
            <Panel title="Your best matches">
              <TopMatches creators={matches.data?.creators} loading={matches.loading} />
            </Panel>
            <Panel title="How fit works">
              <ul className="space-y-2 text-sm leading-6 text-muted">
                <li>
                  <span className="font-semibold text-ink">Niche:</span> does the creator post in one of your niches?
                </li>
                <li>
                  <span className="font-semibold text-ink">Audience:</span> which of your words appear in who reads them.
                </li>
                <li>
                  <span className="font-semibold text-ink">Budget:</span> is their price within yours, and if not, by how much.
                </li>
              </ul>
              <p className="mt-3 text-sm leading-6 text-muted">No hidden score. You see every reason, including the misses.</p>
            </Panel>
          </div>
        </div>
      ) : target.error ? (
        <ErrorState title="Couldn't load your settings" message={target.error.message} action={<Button onClick={target.reload}>Try again</Button>} />
      ) : (
        <LoadingState label="Loading…" slow={target.slow} />
      )}
    </>
  )
}
