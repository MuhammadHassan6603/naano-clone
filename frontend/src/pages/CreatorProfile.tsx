import { Link, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { HowItWorksList } from '../components/HowItWorks'
import { Page } from '../components/Layout'
import { ReliabilityExplainer, ReliabilityLine } from '../components/Reliability'
import { Button, ButtonLink } from '../components/ui/Button'
import { ErrorState, LoadingState } from '../components/ui/Feedback'
import { ArrowLeftIcon } from '../components/ui/Icons'
import { useAuth } from '../lib/auth'
import { firstName, formatCount, formatMoney } from '../lib/format'
import { usePageTitle, withNext } from '../lib/navigation'
import type { Creator, User } from '../lib/types'
import { useApi } from '../lib/useApi'

function BookingAction({ creator, user }: { creator: Creator; user: User | null }) {
  const bookPath = `/book/${creator.id}`
  const name = firstName(creator.name)

  if (!user) {
    return (
      <div className="space-y-3">
        <ButtonLink to={withNext('/signup?role=brand', bookPath)} size="lg" className="w-full">
          Book {name}
        </ButtonLink>
        <p className="text-center text-sm text-muted">
          Already have a brand account?{' '}
          <Link to={withNext('/login', bookPath)} className="font-semibold text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    )
  }
  if (user.role === 'creator') {
    return (
      <p className="rounded-xl bg-page p-3 text-sm leading-6 text-muted">
        {user.id === creator.id
          ? 'This is your public card. Brands book you from this page.'
          : "You're signed in as a creator. Only brands can book creators."}
      </p>
    )
  }
  return (
    <ButtonLink to={bookPath} size="lg" className="w-full">
      Book {name}
    </ButtonLink>
  )
}

export default function CreatorProfile() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const { data, error, slow, reload } = useApi<{ creator: Creator }>(`/creators/${encodeURIComponent(id)}`)
  usePageTitle(data?.creator.name ?? 'Creator')

  const back = (
    <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
      <ArrowLeftIcon /> All creators
    </Link>
  )

  if (error && !data) {
    const missing = error.status === 404
    return (
      <Page>
        {back}
        <ErrorState
          title={missing ? 'Creator not found' : "Couldn't load this creator"}
          message={
            missing
              ? "This creator doesn't exist or hasn't set a price yet, so they aren't listed."
              : error.message
          }
          action={
            missing ? (
              <ButtonLink to="/" variant="secondary">
                Browse all creators
              </ButtonLink>
            ) : (
              <Button onClick={reload}>Try again</Button>
            )
          }
        />
      </Page>
    )
  }
  if (!data) {
    return (
      <Page>
        {back}
        <LoadingState label="Loading creator…" slow={slow} />
      </Page>
    )
  }

  const { creator } = data
  return (
    <Page>
      {back}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <article className="space-y-6 rounded-[28px] border border-[#e4e5e7] bg-white/95 backdrop-blur p-5 shadow-float sm:p-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar name={creator.name} seed={creator.id} size="lg" />
            <div className="min-w-0">
              <h1 className="display text-[2rem] sm:text-[2.6rem]">{creator.name}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                <span className="rounded-md bg-accent-soft px-2 py-0.5 font-semibold text-accent-strong">
                  {creator.niche}
                </span>
                <span>{formatCount(creator.followers)} followers on LinkedIn</span>
              </p>
            </div>
          </header>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">About</h2>
            <p className="leading-7 whitespace-pre-line">{creator.bio || `${creator.name} hasn't written a bio yet.`}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Who reads their posts</h2>
            <p className="leading-7">{creator.audience || 'Audience not described yet.'}</p>
          </section>

          <HowItWorksList />
        </article>

        <aside className="space-y-5 rounded-[28px] border border-[#e4e5e7] bg-white/95 backdrop-blur p-5 shadow-float sm:p-6 lg:sticky lg:top-24">
          <div>
            <p className="text-sm text-muted">Price per post</p>
            <p className="text-4xl font-bold tracking-tight text-ink">{formatMoney(creator.priceCents)}</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Fixed price. It is held in escrow when you book and only paid to {firstName(creator.name)} after the
              post is verified live.
            </p>
          </div>
          <div className="space-y-2 border-t border-line pt-5">
            <p className="text-sm font-semibold text-ink">Track record</p>
            <ReliabilityLine reliability={creator.reliability} />
          </div>
          <BookingAction creator={creator} user={user} />
          <div className="border-t border-line pt-5">
            <ReliabilityExplainer />
          </div>
        </aside>
      </div>
    </Page>
  )
}
