import { useSearchParams } from 'react-router-dom'
import { CreatorCard, CreatorCardSkeleton } from '../components/CreatorCard'
import { HowItWorksCards } from '../components/HowItWorks'
import { CloudBackdrop } from '../components/Layout'
import { ReliabilityExplainer } from '../components/Reliability'
import { Button, ButtonLink, buttonClass } from '../components/ui/Button'
import { EmptyState, ErrorState, Notice, SlowServerHint } from '../components/ui/Feedback'
import { inputClass } from '../components/ui/Field'
import { ArrowRightIcon, LinkedInIcon, ShieldIcon } from '../components/ui/Icons'
import { CLOUD_LAYER, asset } from '../lib/assets'
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

function SectionPill({ children }: { children: string }) {
  return (
    <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[rgba(17,19,24,0.08)] bg-white/70 px-3 py-1.5 text-[0.75rem] font-[650] tracking-[0.02em] text-[#555b63] shadow-[0_8px_30px_rgba(68,111,133,0.07)]">
      <span className="size-[7px] rounded-full bg-[#76badd] shadow-[0_0_0_4px_rgba(118,186,221,0.13)]" />
      {children}
    </div>
  )
}

function Hero({ user }: { user: User | null }) {
  return (
    <section className="relative isolate flex min-h-[640px] flex-col justify-center overflow-hidden pt-16 lg:min-h-svh">
      <CloudBackdrop tall />
      <div className="mx-auto flex max-w-[1100px] flex-col items-center px-5 py-16 text-center sm:px-8">
        <div className="flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 shadow-[0_2px_14px_rgb(17_19_24/0.06)] backdrop-blur-sm">
          <span className="flex size-[18px] items-center justify-center rounded-[4px] bg-[#0a66c2] text-white">
            <LinkedInIcon className="size-[11px]" />
          </span>
          <span className="text-[0.8125rem] font-medium text-ink sm:text-[0.9375rem]">
            The LinkedIn creator marketplace, backed by escrow
          </span>
        </div>

        <h1 className="display mt-7 max-w-[980px] text-[2.35rem] sm:text-[3.6rem] lg:text-[4.6rem]">
          Book B2B creators.
          <br /> Pay only when the post is live.
        </h1>

        <p className="mt-5 max-w-[38rem] text-[1.0625rem] leading-[1.55] text-pretty text-body sm:text-[1.2rem]">
          Brands pay LinkedIn creators a fixed price per post. The money is held the moment you book, released to the
          creator once the post is verified live, and refunded if it never goes up.
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:gap-6">
          <a href="#creators" className={buttonClass('primary', 'lg', 'group w-full sm:w-auto')}>
            Browse creators
            <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          {user ? (
            <a href="#how-it-works" className="group inline-flex items-center gap-2 font-semibold text-ink underline-offset-4 hover:underline">
              See how escrow works
              <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          ) : (
            <ButtonLink to="/login" variant="secondary" size="lg" className="w-full sm:w-auto">
              Try a demo account
            </ButtonLink>
          )}
        </div>

        <p className="mt-7 flex items-center gap-2 text-[0.9375rem] text-[#55575e]">
          <ShieldIcon className="text-[#7b818b]" />
          {user
            ? user.role === 'brand'
              ? `Signed in as ${user.name}. Pick a creator below to book a post.`
              : `Signed in as ${user.name}. This is what brands see; only brands can book.`
            : 'No account needed to browse. Demo money only, no card required.'}
        </p>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        <header className="mx-auto max-w-[760px] text-center">
          <SectionPill>How it works</SectionPill>
          <h2 className="display mt-5 text-[2.1rem] sm:text-[3rem]">Your money moves only when the post does.</h2>
          <p className="mx-auto mt-4 max-w-[620px] text-[1.0625rem] leading-[1.52] text-[#525861]">
            Naano admits that booked posts don't always get published. Here, every booking is held in escrow until the
            post is proven live.
          </p>
        </header>
        <div className="mt-10">
          <HowItWorksCards />
        </div>
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
    <>
      <Hero user={user} />
      <HowItWorksSection />

      <section
        id="creators"
        aria-labelledby="creators-heading"
        className="relative overflow-hidden px-4 pt-12 pb-20 sm:px-8 lg:pt-16"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 60%, rgba(208,237,251,0.35), rgba(0,0,0,0) 44%), linear-gradient(#FCFCFB 0%, #F8FCFE 62%, #FFFFFF 100%)',
        }}
      >
        <div className="mx-auto max-w-[1280px]">
          <header className="mx-auto max-w-[820px] text-center">
            <SectionPill>The creator marketplace</SectionPill>
            <h2 id="creators-heading" className="display mt-5 text-[2.1rem] sm:text-[3rem]">
              Work with creators who deliver.
            </h2>
            <p className="mx-auto mt-4 max-w-[620px] text-[1.0625rem] leading-[1.52] text-[#525861]">
              Every card shows the creator's price, reach and delivery record, counted from real bookings.
            </p>
          </header>

          <div className="relative isolate mt-10 overflow-hidden rounded-[28px] border border-[rgba(139,189,215,0.32)] bg-[linear-gradient(#DFF3FC_0%,#EDF9FE_72%,#FFFFFF_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_42px_90px_-48px_rgba(69,119,145,0.38)] sm:p-8 lg:rounded-[40px] lg:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-[55%] bg-cover bg-bottom bg-no-repeat opacity-60 [filter:saturate(0.8)_brightness(1.08)]"
              style={{ backgroundImage: `url(${asset(CLOUD_LAYER, 1920)})` }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.92),rgba(0,0,0,0)_39%),linear-gradient(rgba(233,248,255,0.1),rgba(255,255,255,0.22))]"
            />

            <div className="space-y-5">
              <div className="glass flex flex-col gap-4 rounded-[22px] p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <p className="text-sm font-semibold text-ink" aria-live="polite">
                    {data ? `${plural(data.creators.length, 'creator')}${filtered ? ' match your filters' : ' available'}` : 'Loading creators…'}
                  </p>
                  {data && (
                    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by niche">
                      <div className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap">
                        {['', ...data.niches].map((option) => (
                          <button
                            key={option || 'all'}
                            type="button"
                            aria-pressed={niche === option}
                            onClick={() => update('niche', option)}
                            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                              niche === option ? 'border-ink bg-ink text-white' : 'border-[#d1d5db] bg-white text-[#374151] hover:border-ink/40'
                            }`}
                          >
                            {option || 'All niches'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-3 sm:flex">
                  <label className="flex flex-col gap-1 text-[11px] font-semibold tracking-wide text-[#5c5b57] uppercase">
                    Price
                    <select className={`${inputClass} py-2.5 normal-case`} value={maxPrice} onChange={(event) => update('max', event.target.value)}>
                      {PRICE_CAPS.map((cap) => (
                        <option key={cap.value} value={cap.value}>
                          {cap.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-[11px] font-semibold tracking-wide text-[#5c5b57] uppercase">
                    Sort
                    <select className={`${inputClass} py-2.5 normal-case`} value={sort} onChange={(event) => update('sort', event.target.value)}>
                      {SORTS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {error && data && (
                <Notice tone="error" title="Couldn't refresh the list">
                  {error.message}{' '}
                  <button type="button" className="font-semibold underline" onClick={reload}>
                    Try again
                  </button>
                </Notice>
              )}

              {!data && error ? (
                <div className="glass rounded-[22px]">
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
                </div>
              ) : !data ? (
                <div className="space-y-4">
                  {slow && (
                    <div className="glass rounded-[18px] p-4">
                      <SlowServerHint />
                    </div>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
                    {Array.from({ length: 6 }, (_, index) => (
                      <CreatorCardSkeleton key={index} />
                    ))}
                  </div>
                </div>
              ) : data.creators.length === 0 ? (
                <div className="glass rounded-[22px]">
                  <EmptyState
                    title="No creators match these filters"
                    message="Try another niche or a higher price limit."
                    action={<Button onClick={clearFilters}>Clear filters</Button>}
                  />
                </div>
              ) : (
                <ul className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
                  {data.creators.map((creator) => (
                    <li key={creator.id}>
                      <CreatorCard creator={creator} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-[860px] text-center">
            <ReliabilityExplainer />
          </div>
        </div>
      </section>
    </>
  )
}
