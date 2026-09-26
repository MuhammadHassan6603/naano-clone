import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { api, isAbort, toApiError } from '../lib/api'
import type { Creator, OwnProfile, User } from '../lib/types'
import { Button } from './ui/Button'
import { TextArea, TextField, inputClass } from './ui/Field'
import { Notice, Spinner } from './ui/Feedback'
import { CheckIcon, LinkedInIcon, LockIcon } from './ui/Icons'

type Form = { linkedinUrl: string; niche: string; bio: string; audience: string; price: string; followers: string }
type Errors = Partial<Record<keyof Form, string>>
type Found = { url: string; name: string; followers: number }

type Link =
  | { kind: 'empty' }
  | { kind: 'checking' }
  | { kind: 'verified'; found: Found }
  | { kind: 'manual'; message: string }
  | { kind: 'rejected'; message: string }

const MAX_PRICE_DOLLARS = 100_000
const PROFILE_LINK = /^(https?:\/\/)?([a-z0-9-]+\.)?linkedin\.com\/in\/[^/?#\s]{3,}/i
const count = new Intl.NumberFormat('en-US')

const toForm = (profile: OwnProfile | undefined): Form => ({
  linkedinUrl: profile?.linkedinUrl ?? '',
  niche: profile?.niche ?? '',
  bio: profile?.bio ?? '',
  audience: profile?.audience ?? '',
  price: profile?.priceCents ? String(profile.priceCents / 100) : '',
  followers: profile?.linkedinUrl ? String(profile.followers) : '',
})

const initialLink = (profile: OwnProfile | undefined): Link => {
  if (!profile?.linkedinUrl) return { kind: 'empty' }
  if (profile.followersVerifiedAt) {
    return { kind: 'verified', found: { url: profile.linkedinUrl, name: profile.linkedinName ?? '', followers: profile.followers } }
  }
  return { kind: 'manual', message: 'Your followers are self-reported. Check the link again to verify them from LinkedIn.' }
}

function validate(form: Form, link: Link): Errors {
  const price = Number(form.price)
  const followers = Number(form.followers)
  return {
    linkedinUrl: !form.linkedinUrl.trim()
      ? 'Add your LinkedIn profile link so brands can see who you are.'
      : !PROFILE_LINK.test(form.linkedinUrl.trim())
        ? 'Use your profile link, like https://www.linkedin.com/in/your-name'
        : link.kind === 'rejected'
          ? link.message
          : undefined,
    followers:
      link.kind === 'manual' && (form.followers.trim() === '' || !Number.isInteger(followers) || followers < 0)
        ? 'Enter your follower count as a whole number, like 12500.'
        : link.kind === 'empty'
          ? 'Add your LinkedIn link first so we can read your followers.'
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
  const [link, setLink] = useState<Link>(() => initialLink(profile))
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const lookup = useRef<AbortController | null>(null)
  const checkedUrl = useRef(profile?.linkedinUrl ?? '')

  const set = (key: keyof Form) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setResult(null)
  }

  async function check(raw: string, force = false) {
    const url = raw.trim()
    if (!PROFILE_LINK.test(url) || (!force && url === checkedUrl.current && link.kind !== 'empty')) return
    checkedUrl.current = url
    lookup.current?.abort()
    const controller = new AbortController()
    lookup.current = controller
    setLink({ kind: 'checking' })
    setErrors((current) => ({ ...current, linkedinUrl: undefined, followers: undefined }))
    try {
      const { linkedin } = await api<{ linkedin: Found }>('/creators/me/linkedin', { method: 'POST', body: { url }, signal: controller.signal })
      setLink({ kind: 'verified', found: linkedin })
      setForm((current) => ({ ...current, linkedinUrl: linkedin.url, followers: String(linkedin.followers) }))
      checkedUrl.current = linkedin.url
    } catch (error) {
      if (isAbort(error)) return
      const apiError = toApiError(error)
      if (apiError.status === 422 || apiError.status === 503 || apiError.status === 0) {
        setLink({ kind: 'manual', message: apiError.status === 0 ? "We couldn't reach the server to check LinkedIn. Enter your followers yourself; they'll show as self-reported." : apiError.message })
        setForm((current) => ({ ...current, followers: '' }))
      } else {
        setLink({ kind: 'rejected', message: apiError.message })
        setErrors((current) => ({ ...current, linkedinUrl: apiError.message }))
      }
    }
  }

  useEffect(() => {
    const url = form.linkedinUrl.trim()
    if (!PROFILE_LINK.test(url) || url === checkedUrl.current) return
    const timer = window.setTimeout(() => void check(url), 700)
    return () => window.clearTimeout(timer)
  })

  useEffect(() => () => lookup.current?.abort(), [])

  const followers = link.kind === 'verified' ? link.found.followers : Math.max(0, Math.floor(Number(form.followers) || 0))
  const preview: Creator = {
    id: user.id,
    name: user.name,
    niche: form.niche || 'Your niche',
    bio: form.bio,
    audience: form.audience,
    priceCents: Math.round((Number(form.price) || 0) * 100),
    followers,
    followersVerified: link.kind === 'verified',
    linkedinUrl: link.kind === 'verified' ? link.found.url : form.linkedinUrl.trim() || null,
    reliability: reliability ?? { delivered: 0, total: 0 },
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (link.kind === 'checking') return
    const found = validate(form, link)
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
          followers,
        },
      })
      if (creator.followersVerified && creator.linkedinUrl) {
        setLink((current) => ({
          kind: 'verified',
          found: { url: creator.linkedinUrl!, name: current.kind === 'verified' ? current.found.name : '', followers: creator.followers },
        }))
      }
      setResult({ tone: 'success', text: 'Saved. Your card is live on the marketplace.' })
      onSaved?.(creator)
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.status === 409) setErrors((current) => ({ ...current, linkedinUrl: apiError.message }))
      setResult({ tone: 'error', text: apiError.message })
    } finally {
      setPending(false)
    }
  }

  const followerHint =
    link.kind === 'verified' ? (
      <span className="flex items-center gap-1.5 text-good">
        <CheckIcon className="size-3.5 shrink-0" />
        Verified from LinkedIn{link.found.name ? ` · ${link.found.name}` : ''}. This can't be edited.
      </span>
    ) : link.kind === 'checking' ? (
      <span className="flex items-center gap-1.5">
        <Spinner className="size-3.5" /> Getting your LinkedIn data…
      </span>
    ) : link.kind === 'manual' ? (
      <span>
        {link.message}{' '}
        <button type="button" className="font-semibold text-accent underline" onClick={() => void check(form.linkedinUrl, true)}>
          Check again
        </button>
      </span>
    ) : (
      'Filled in automatically from your LinkedIn profile.'
    )

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
        onChange={(event) => {
          set('linkedinUrl')(event.target.value)
          if (link.kind !== 'checking') setLink({ kind: 'empty' })
          checkedUrl.current = ''
        }}
        onBlur={() => void check(form.linkedinUrl)}
        error={errors.linkedinUrl}
        hint="Brands can open it from your card, so there's no doubt who you are."
        trailing={<LinkedInIcon className="size-5 text-[#0a66c2]" />}
      />
      <TextField
        label="LinkedIn followers"
        type={link.kind === 'verified' ? 'text' : 'number'}
        inputMode="numeric"
        min={0}
        step="1"
        value={link.kind === 'verified' ? count.format(link.found.followers) : link.kind === 'manual' ? form.followers : ''}
        placeholder={link.kind === 'checking' ? 'Getting your LinkedIn data…' : link.kind === 'manual' ? '12500' : 'Add your LinkedIn link first'}
        readOnly={link.kind === 'verified'}
        disabled={link.kind === 'checking' || link.kind === 'empty' || link.kind === 'rejected'}
        aria-readonly={link.kind === 'verified' || undefined}
        onChange={(event) => set('followers')(event.target.value)}
        error={errors.followers}
        hint={followerHint}
        className={link.kind === 'verified' ? 'cursor-not-allowed bg-[#f6f7f9] font-semibold' : ''}
        trailing={link.kind === 'verified' ? <LockIcon className="size-4 text-muted" /> : link.kind === 'checking' ? <Spinner className="size-4 text-accent" /> : undefined}
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
        <Button type="submit" loading={pending} disabled={link.kind === 'checking'}>
          {submitLabel}
        </Button>
        {extraActions}
      </div>
    </form>
  )
  return <>{layout ? layout(formElement, preview) : formElement}</>
}
