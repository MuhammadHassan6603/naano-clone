import { type FormEvent, type ReactNode, useState } from 'react'
import { api, toApiError } from '../lib/api'
import type { Creator, OwnProfile, User } from '../lib/types'
import { Button } from './ui/Button'
import { TextArea, TextField, inputClass } from './ui/Field'
import { Notice } from './ui/Feedback'
import { LinkedInIcon } from './ui/Icons'

type Form = { linkedinUrl: string; niche: string; bio: string; audience: string; price: string; followers: string }
type Errors = Partial<Record<keyof Form, string>>

const MAX_PRICE_DOLLARS = 100_000
const MAX_FOLLOWERS = 100_000_000
const PROFILE_LINK = /^(https?:\/\/)?([a-z0-9-]+\.)?linkedin\.com\/in\/[^/?#\s]{3,}/i

const toForm = (profile: OwnProfile | undefined): Form => ({
  linkedinUrl: profile?.linkedinUrl ?? '',
  niche: profile?.niche ?? '',
  bio: profile?.bio ?? '',
  audience: profile?.audience ?? '',
  price: profile?.priceCents ? String(profile.priceCents / 100) : '',
  followers: profile?.linkedinUrl ? String(profile.followers) : '',
})

function validate(form: Form): Errors {
  const price = Number(form.price)
  const followers = Number(form.followers)
  return {
    linkedinUrl: !form.linkedinUrl.trim()
      ? 'Add your LinkedIn profile link so brands can see who you are.'
      : !PROFILE_LINK.test(form.linkedinUrl.trim())
        ? 'Use your profile link, like https://www.linkedin.com/in/your-name'
        : undefined,
    followers:
      form.followers.trim() === '' || !Number.isInteger(followers) || followers < 0
        ? 'Enter your LinkedIn follower count as a whole number, like 12500.'
        : followers > MAX_FOLLOWERS
          ? 'That is more followers than we can show.'
          : undefined,
    niche: form.niche ? undefined : 'Pick the niche you post about.',
    price:
      !form.price || !Number.isFinite(price) || price < 0.01
        ? 'Set your price per post in dollars.'
        : price > MAX_PRICE_DOLLARS
          ? `The price can be at most $${MAX_PRICE_DOLLARS.toLocaleString('en-US')}.`
          : undefined,
    audience: form.audience.trim().length > 200 ? 'Keep it under 200 characters.' : undefined,
    bio: form.bio.trim().length > 1000 ? 'Keep it under 1000 characters.' : undefined,
  }
}

type Props = {
  user: User
  profile?: OwnProfile
  niches: string[]
  reliability?: Creator['reliability']
  submitLabel: string
  extraActions?: ReactNode
  layout?: (form: ReactNode, preview: Creator) => ReactNode
  onSaved?: (creator: Creator) => void
}

export function CreatorProfileForm({ user, profile, niches, reliability, submitLabel, extraActions, layout, onSaved }: Props) {
  const [form, setForm] = useState<Form>(() => toForm(profile))
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

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
    linkedinUrl: PROFILE_LINK.test(form.linkedinUrl.trim()) ? form.linkedinUrl.trim() : null,
    reliability: reliability ?? { delivered: 0, total: 0 },
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.values(found).some(Boolean)) return
    setPending(true)
    setResult(null)
    try {
      const { creator } = await api<{ creator: Creator }>('/creators/me/profile', {
        method: 'PUT',
        body: {
          linkedinUrl: form.linkedinUrl.trim(),
          niche: form.niche,
          bio: form.bio.trim(),
          audience: form.audience.trim(),
          priceCents: Math.round(Number(form.price) * 100),
          followers: Number(form.followers),
        },
      })
      if (creator.linkedinUrl) setForm((current) => ({ ...current, linkedinUrl: creator.linkedinUrl! }))
      setResult({ tone: 'success', text: 'Saved. Your card is live on the marketplace.' })
      onSaved?.(creator)
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.status === 409 || /LinkedIn/.test(apiError.message)) setErrors((current) => ({ ...current, linkedinUrl: apiError.message }))
      setResult({ tone: 'error', text: apiError.message })
    } finally {
      setPending(false)
    }
  }

  const formElement = (
    <form onSubmit={save} noValidate className="space-y-5">
      {result && <Notice tone={result.tone}>{result.text}</Notice>}
      <TextField
        label="LinkedIn profile link"
        type="url"
        inputMode="url"
        autoComplete="url"
        placeholder="https://www.linkedin.com/in/your-name"
        value={form.linkedinUrl}
        onChange={(event) => set('linkedinUrl')(event.target.value)}
        error={errors.linkedinUrl}
        hint="Brands can open it from your card, so there's no doubt who you are."
        trailing={<LinkedInIcon className="size-5 text-[#0a66c2]" />}
      />
      <TextField
        label="LinkedIn followers"
        type="number"
        inputMode="numeric"
        min={0}
        step="1"
        placeholder="12500"
        value={form.followers}
        onChange={(event) => set('followers')(event.target.value)}
        error={errors.followers}
        hint="As shown on your LinkedIn profile. Brands can check it through your link."
      />
      <div className="space-y-1.5">
        <label htmlFor="niche" className="text-xs font-semibold tracking-wide text-[#5c5b57] uppercase">
          Niche
        </label>
        <select id="niche" className={inputClass} value={form.niche} onChange={(e) => set('niche')(e.target.value)} aria-invalid={errors.niche ? true : undefined}>
          <option value="">Choose one</option>
          {niches.map((niche) => (
            <option key={niche} value={niche}>
              {niche}
            </option>
          ))}
        </select>
        {errors.niche && <p className="text-sm text-danger">{errors.niche}</p>}
      </div>
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
        label="Who reads your posts"
        placeholder="SaaS founders and sales leaders, seed to Series B"
        value={form.audience}
        onChange={(e) => set('audience')(e.target.value)}
        error={errors.audience}
        aside={<span className="text-xs text-muted">{form.audience.trim().length}/200</span>}
      />
      <TextArea
        label="About you"
        rows={4}
        placeholder="What you write about and why brands should work with you."
        value={form.bio}
        onChange={(e) => set('bio')(e.target.value)}
        error={errors.bio}
        aside={<span className="text-xs text-muted">{form.bio.trim().length}/1000</span>}
      />
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
        {extraActions}
      </div>
    </form>
  )
  return <>{layout ? layout(formElement, preview) : formElement}</>
}
