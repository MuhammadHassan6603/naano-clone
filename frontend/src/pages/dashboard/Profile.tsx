import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreatorCard } from '../../components/CreatorCard'
import { DashboardHeader, Panel } from '../../components/dashboard/DashboardLayout'
import { Button } from '../../components/ui/Button'
import { TextArea, TextField, inputClass } from '../../components/ui/Field'
import { EmptyState, ErrorState, LoadingState, Notice } from '../../components/ui/Feedback'
import { api, toApiError } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { usePageTitle } from '../../lib/navigation'
import type { Creator, OwnProfile, User } from '../../lib/types'
import { useApi } from '../../lib/useApi'

type Form = { niche: string; bio: string; audience: string; price: string; followers: string }
type Errors = Partial<Record<keyof Form, string>>

const MAX_PRICE_DOLLARS = 100_000

const toForm = (profile: OwnProfile | undefined): Form => ({
  niche: profile?.niche ?? '',
  bio: profile?.bio ?? '',
  audience: profile?.audience ?? '',
  price: profile?.priceCents ? String(profile.priceCents / 100) : '',
  followers: profile ? String(profile.followers) : '0',
})

function validate(form: Form): Errors {
  const price = Number(form.price)
  const followers = Number(form.followers)
  return {
    niche: form.niche ? undefined : 'Pick the niche you post about.',
    price:
      !form.price || !Number.isFinite(price) || price < 0.01
        ? 'Set your price per post in dollars.'
        : price > MAX_PRICE_DOLLARS
          ? `The price can be at most $${MAX_PRICE_DOLLARS.toLocaleString('en-US')}.`
          : undefined,
    followers: !Number.isInteger(followers) || followers < 0 ? 'Use a whole number, like 12500.' : undefined,
    audience: form.audience.trim().length > 200 ? 'Keep it under 200 characters.' : undefined,
    bio: form.bio.trim().length > 1000 ? 'Keep it under 1000 characters.' : undefined,
  }
}

function ProfileForm({ user, profile, niches, reliability }: { user: User; profile?: OwnProfile; niches: string[]; reliability: Creator['reliability'] }) {
  const [form, setForm] = useState<Form>(() => toForm(profile))
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [listed, setListed] = useState(Boolean(profile?.priceCents && profile.niche))

  const set = (key: keyof Form) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setResult(null)
  }

  const preview: Creator = {
    id: user.id,
    name: user.name,
    niche: form.niche || 'Your niche',
    bio: form.bio,
    audience: form.audience,
    priceCents: Math.round((Number(form.price) || 0) * 100),
    followers: Math.max(0, Math.floor(Number(form.followers) || 0)),
    reliability,
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.values(found).some(Boolean)) return
    setPending(true)
    setResult(null)
    try {
      await api('/creators/me/profile', {
        method: 'PUT',
        body: {
          niche: form.niche,
          bio: form.bio.trim(),
          audience: form.audience.trim(),
          priceCents: Math.round(Number(form.price) * 100),
          followers: Number(form.followers),
        },
      })
      setListed(true)
      setResult({ tone: 'success', text: 'Saved. Your card is live on the marketplace.' })
    } catch (error) {
      setResult({ tone: 'error', text: toApiError(error).message })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <Panel>
        <form onSubmit={save} noValidate className="space-y-5">
          {result && <Notice tone={result.tone}>{result.text}</Notice>}
          <div className="space-y-1.5">
            <label htmlFor="niche" className="text-xs font-semibold tracking-wide text-[#5c5b57] uppercase">
              Niche
            </label>
            <select
              id="niche"
              className={inputClass}
              value={form.niche}
              onChange={(e) => set('niche')(e.target.value)}
              aria-invalid={errors.niche ? true : undefined}
            >
              <option value="">Choose one</option>
              {niches.map((niche) => (
                <option key={niche} value={niche}>
                  {niche}
                </option>
              ))}
            </select>
            {errors.niche && <p className="text-sm text-danger">{errors.niche}</p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Price per post (USD)"
              type="number"
              inputMode="decimal"
              min={1}
              step="1"
              placeholder="450"
              value={form.price}
              onChange={(e) => set('price')(e.target.value)}
              error={errors.price}
              hint="Brands pay exactly this. No platform fee."
            />
            <TextField
              label="LinkedIn followers"
              type="number"
              inputMode="numeric"
              min={0}
              step="1"
              value={form.followers}
              onChange={(e) => set('followers')(e.target.value)}
              error={errors.followers}
            />
          </div>
          <TextField
            label="Who reads your posts"
            placeholder="SaaS founders and sales leaders, seed to Series B"
            value={form.audience}
            onChange={(e) => set('audience')(e.target.value)}
            error={errors.audience}
            aside={<span className="text-xs text-muted">{form.audience.trim().length}/200</span>}
          />
          <TextArea
            label="About you"
            rows={5}
            placeholder="What you write about and why brands should work with you."
            value={form.bio}
            onChange={(e) => set('bio')(e.target.value)}
            error={errors.bio}
            aside={<span className="text-xs text-muted">{form.bio.trim().length}/1000</span>}
          />
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <Button type="submit" loading={pending}>
              {listed ? 'Save changes' : 'Save and go live'}
            </Button>
            {listed && (
              <Link to={`/creators/${user.id}`} className="text-sm font-semibold text-accent hover:underline">
                View your public page
              </Link>
            )}
          </div>
          <p className="text-sm text-muted">A new price only applies to new bookings. Bookings already made keep their price.</p>
        </form>
      </Panel>
      <div className="space-y-3 lg:sticky lg:top-6">
        <p className="text-sm font-semibold text-muted">
          {listed ? 'Live on the marketplace' : 'Preview. Not on the marketplace until you save a niche and price.'}
        </p>
        <CreatorCard creator={preview} preview />
      </div>
    </div>
  )
}

export default function Profile() {
  usePageTitle('My profile')
  const { user } = useAuth()
  const me = useApi<{ user: User; profile?: OwnProfile }>('/auth/me')
  const market = useApi<{ creators: Creator[]; niches: string[] }>('/creators')
  const listed = Boolean(me.data?.profile?.priceCents)
  const card = useApi<{ creator: Creator }>(listed && user ? `/creators/${user.id}` : null)
  const ready = Boolean(me.data && market.data && (!listed || card.data || card.error))

  if (!user) return null
  if (user.role !== 'creator') {
    return <EmptyState title="Only creators have a public profile" message="Brands book creators from the marketplace. Your bookings and wallet are in the menu." />
  }
  const error = me.error ?? market.error

  return (
    <>
      <DashboardHeader title="My profile" subtitle="This is the card brands see on the marketplace. Keep it honest and specific." />
      {ready && me.data && market.data ? (
        <ProfileForm
          user={user}
          profile={me.data.profile}
          niches={market.data.niches}
          reliability={card.data?.creator.reliability ?? { delivered: 0, total: 0 }}
        />
      ) : error ? (
        <ErrorState
          title="Couldn't load your profile"
          message={error.message}
          action={
            <Button
              onClick={() => {
                me.reload()
                market.reload()
              }}
            >
              Try again
            </Button>
          }
        />
      ) : (
        <LoadingState label="Loading your profile…" slow={me.slow || market.slow} />
      )}
    </>
  )
}
