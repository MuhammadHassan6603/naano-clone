import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthShell, authTitle } from '../components/AuthShell'
import { CreatorProfileForm } from '../components/CreatorProfileForm'
import { Button } from '../components/ui/Button'
import { ErrorState, LoadingState } from '../components/ui/Feedback'
import { useAuth } from '../lib/auth'
import { DASHBOARD, safeNext, usePageTitle } from '../lib/navigation'
import type { Creator, OwnProfile, Target, User } from '../lib/types'
import { useApi } from '../lib/useApi'
import { AudienceForm } from './dashboard/Audience'

function Skip({ onSkip }: { onSkip: () => void }) {
  return (
    <Button type="button" variant="secondary" onClick={onSkip}>
      Skip for now
    </Button>
  )
}

const skipNote = <p className="mt-4 text-sm leading-6 text-muted">You can complete or edit this any time from your dashboard.</p>

function CreatorStep({ user, done }: { user: User; done: () => void }) {
  const me = useApi<{ user: User; profile?: OwnProfile }>('/auth/me')
  const market = useApi<{ creators: Creator[]; niches: string[] }>('/creators')
  if (me.data && market.data) {
    return (
      <>
        <CreatorProfileForm
          user={user}
          profile={me.data.profile}
          niches={market.data.niches}
          submitLabel="Save and go live"
          onSaved={done}
          extraActions={<Skip onSkip={done} />}
        />
        {skipNote}
      </>
    )
  }
  const error = me.error ?? market.error
  if (error) {
    return (
      <ErrorState
        title="Couldn't load this step"
        message={error.message}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => {
                me.reload()
                market.reload()
              }}
            >
              Try again
            </Button>
            <Skip onSkip={done} />
          </div>
        }
      />
    )
  }
  return <LoadingState label="Loading…" slow={me.slow || market.slow} />
}

function BrandStep({ done }: { done: () => void }) {
  const target = useApi<{ profile: Target; niches: string[] }>('/brands/me/profile')
  if (target.data) {
    return (
      <>
        <AudienceForm target={target.data.profile} niches={target.data.niches} onSaved={done} submitLabel="Save and continue" extraActions={<Skip onSkip={done} />} />
        {skipNote}
      </>
    )
  }
  if (target.error) {
    return (
      <ErrorState
        title="Couldn't load this step"
        message={target.error.message}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={target.reload}>Try again</Button>
            <Skip onSkip={done} />
          </div>
        }
      />
    )
  }
  return <LoadingState label="Loading…" slow={target.slow} />
}

const asides = {
  creator: {
    title: 'Get found by brands.',
    body: (
      <div className="space-y-4 text-[#dbeafe]">
        <p>Your card is what brands see on the marketplace. A complete card is what gets you booked.</p>
        <ul className="space-y-3">
          <li className="rounded-2xl border border-white/20 bg-white/10 p-4">
            <span className="block font-semibold text-white">Your LinkedIn, one click away</span>
            Add your LinkedIn profile link and follower count. Brands can open your profile straight from your card,
            so there's no doubt who you are.
          </li>
          <li className="rounded-2xl border border-white/20 bg-white/10 p-4">
            <span className="block font-semibold text-white">Your price, paid in full</span>
            Brands pay exactly your price. It is held in escrow when they book and paid to you once your post is
            verified.
          </li>
        </ul>
      </div>
    ),
  },
  brand: {
    title: 'Find creators who fit.',
    body: (
      <div className="space-y-4 text-[#dbeafe]">
        <p>Tell us who you sell to, and every creator card explains why that creator fits you, or doesn't.</p>
        <ul className="space-y-3">
          <li className="rounded-2xl border border-white/20 bg-white/10 p-4">
            <span className="block font-semibold text-white">Plain reasons, no score</span>
            "RevOps niche", "Audience: SaaS, founders", "Within your $600 budget". You see every reason, including the
            misses.
          </li>
        </ul>
      </div>
    ),
  },
}

export default function Welcome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next')) ?? DASHBOARD
  const creator = user?.role === 'creator'
  usePageTitle(creator ? 'Complete your profile' : 'Who you sell to')
  if (!user) return null
  const done = () => navigate(next, { replace: true })
  const aside = asides[user.role]

  return (
    <AuthShell asideTitle={aside.title} aside={aside.body}>
      <section>
        <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
          Step 2 of 2 · Account created
        </p>
        <h1 className={`${authTitle} mt-3`}>{creator ? 'Complete your profile' : 'Who do you sell to?'}</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          {creator
            ? 'This is the card brands see on the marketplace. It goes live as soon as you save.'
            : 'Describe your buyers once, and every creator card will explain the fit.'}
        </p>
        {creator ? <CreatorStep user={user} done={done} /> : <BrandStep done={done} />}
      </section>
    </AuthShell>
  )
}
