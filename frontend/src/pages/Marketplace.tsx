import { useSearchParams } from 'react-router-dom'
import { CreatorCard, CreatorCardSkeleton } from '../components/CreatorCard'
import { HowItWorks } from '../components/HowItWorks'
import { Page } from '../components/Layout'
import { ReliabilityExplainer } from '../components/Reliability'
import { Button, ButtonLink, buttonClass } from '../components/ui/Button'
import { EmptyState, ErrorState, Notice, SlowServerHint } from '../components/ui/Feedback'
import { inputClass } from '../components/ui/Field'
import { useAuth } from '../lib/auth'
import { plural } from '../lib/format'
import { usePageTitle } from '../lib/navigation'
import type { Creator, CreatorSort, User } from '../lib/types'
import { useApi } from '../lib/useApi'

const SORTS: { value: CreatorSort; label: string }[] = [
  { value: 'reliability', label: 'Most reliable first' },
  { value: 'price', label: 'Lowest price first' },
  { value: 'followers', label: 'Most followers first' },
]

const PRICE_CAPS = [
  { value: '', label: 'Any price' },
  { value: '30000', label: 'Up to $300' },
  { value: '50000', label: 'Up to $500' },
  { value: '100000', label: 'Up to $1,000' },
]

type CreatorsResponse = { creators: Creator[]; niches: string[] }

function Intro({ user }: { user: User | null }) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
      <div className="space-y-5">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          LinkedIn creator marketplace, backed by escrow
        </p>
        <h1 className="text-[2rem] leading-tight font-bold tracking-tight sm:text-5xl">
          Book B2B creators. Pay only when the post is live.
        </h1>
        <p className="max-w-xl text-base leading-7 text-body sm:text-lg">
          Brands pay LinkedIn creators a fixed price per post. The money is held the moment you book, released to the
          creator once the post is verified live, and refunded if it never goes up.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="#creators" className={buttonClass('primary', 'lg')}>
            Browse creators
          </a>
          {!user && (
            <ButtonLink to="/login" variant="secondary" size="lg">
              Try a demo account
            </ButtonLink>
          )}
        </div>
        {user ? (
          <p className="text-sm text-muted">
            Signed in as <span className="font-semibold text-ink">{user.name}</span>.{' '}
            {user.role === 'brand'
              ? 'Pick a creator below to book a post.'
              : 'This is what brands see. Only brands can book creators.'}
          </p>
        ) : (
          <p className="text-sm text-muted">No account needed to browse. You only sign up when you book.</p>
        )}
      </div>
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <HowItWorks compact />
      </div>
    </section>
  )
}

export default function Marketplace() {
  usePageTitle('Creator marketplace')
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()

  const niche = params.get('niche') ?? ''
  const maxPrice = PRICE_CAPS.some((cap) => cap.value === params.get('max')) ? (params.get('max') ?? '') : ''
  const sort = SORTS.find((option) => option.value === params.get('sort'))?.value ?? 'reliability'

  const query = new URLSearchParams()
  if (niche) query.set('niche', niche)
  if (maxPrice) query.set('maxPriceCents', maxPrice)
  if (sort !== 'reliability') query.set('sort', sort)
  const { data, error, loading, slow, reload } = useApi<CreatorsResponse>(`/creators?${query}`)

  const update = (key: 'niche' | 'max' | 'sort', value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const filtered = Boolean(niche || maxPrice)
  const clearFilters = () => setParams(sort === 'reliability' ? {} : { sort }, { replace: true })

  return (
    <Page>
      <Intro user={user} />

      <section id="creators" aria-labelledby="creators-heading" className="mt-14 scroll-mt-20 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="creators-heading" className="text-2xl font-bold tracking-tight">
              Creators
            </h2>
            <p className="mt-1 text-sm text-muted" aria-live="polite">
              {data ? `${plural(data.creators.length, 'creator')}${filtered ? ' match your filters' : ''}` : 'Loading creators…'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
              Price
              <select className={inputClass} value={maxPrice} onChange={(event) => update('max', event.target.value)}>
                {PRICE_CAPS.map((cap) => (
                  <option key={cap.value} value={cap.value}>
                    {cap.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
              Sort
              <select className={inputClass} value={sort} onChange={(event) => update('sort', event.target.value)}>
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {data && (
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by niche">
            <div className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap">
              {['', ...data.niches].map((option) => (
                <button
                  key={option || 'all'}
                  type="button"
                  aria-pressed={niche === option}
                  onClick={() => update('niche', option)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                    niche === option
                      ? 'border-accent bg-accent text-white'
                      : 'border-line-strong bg-surface text-ink hover:border-ink/40'
                  }`}
                >
                  {option || 'All niches'}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && data && (
          <Notice tone="error" title="Couldn't refresh the list">
            {error.message}{' '}
            <button type="button" className="font-semibold underline" onClick={reload}>
              Try again
            </button>
          </Notice>
        )}

        {!data && error ? (
          <ErrorState
            title="Couldn't load creators"
            message={error.message}
            action={
              <div className="flex gap-3">
                <Button onClick={reload}>Try again</Button>
                {filtered && (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            }
          />
        ) : !data ? (
          <div className="space-y-4">
            {slow && <SlowServerHint />}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
              {Array.from({ length: 6 }, (_, index) => (
                <CreatorCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : data.creators.length === 0 ? (
          <EmptyState
            title="No creators match these filters"
            message="Try another niche or a higher price limit."
            action={<Button onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <ul
            className={`grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}
            aria-busy={loading}
          >
            {data.creators.map((creator) => (
              <li key={creator.id}>
                <CreatorCard creator={creator} />
              </li>
            ))}
          </ul>
        )}

        <ReliabilityExplainer />
      </section>
    </Page>
  )
}
