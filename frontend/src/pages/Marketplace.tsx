import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CreatorCard, CreatorCardSkeleton } from '../components/CreatorCard'
import { HowItWorksCards } from '../components/HowItWorks'
import { CloudBackdrop } from '../components/Layout'
import { ReliabilityExplainer } from '../components/Reliability'
import { Button, ButtonLink, buttonClass } from '../components/ui/Button'
import { EmptyState, ErrorState, Notice, SlowServerHint } from '../components/ui/Feedback'
import { inputClass } from '../components/ui/Field'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, LinkedInIcon, SearchIcon, ShieldIcon, TargetIcon } from '../components/ui/Icons'
import { CLOUD_LAYER, asset } from '../lib/assets'
import { useAuth } from '../lib/auth'
import { formatMoney, plural } from '../lib/format'
import { usePageTitle } from '../lib/navigation'
import type { Creator, CreatorSort, Target, User } from '../lib/types'
import { useApi } from '../lib/useApi'

const SORTS: { value: CreatorSort; label: string }[] = [
  { value: 'fit', label: 'Best fit first' },
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

type CreatorsResponse = {
  creators: Creator[]
  total: number
  page: number
  pages: number
  niches: string[]
  sort: CreatorSort
  target: Target | null
}

const PAGE_SIZE = 9
const SEARCH_DELAY_MS = 300

function pageList(page: number, pages: number): (number | 'gap')[] {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages))
  const sorted = [...wanted].sort((a, b) => a - b)
  return sorted.flatMap((n, index) => (index > 0 && n - sorted[index - 1] > 1 ? ['gap' as const, n] : [n]))
}

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null
  const pill = 'flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors'
  return (
    <nav aria-label="Creator pages" className="glass flex items-center justify-between gap-2 rounded-[22px] p-2">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} className={`${pill} gap-1 text-ink enabled:hover:bg-white disabled:opacity-40`}>
        <ChevronLeftIcon /> <span className="max-sm:sr-only">Previous</span>
      </button>
      <ol className="flex items-center gap-1">
        {pageList(page, pages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={`${pill} ${item === page ? 'bg-ink text-white' : 'text-ink hover:bg-white'}`}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ol>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === pages} className={`${pill} gap-1 text-ink enabled:hover:bg-white disabled:opacity-40`}>
        <span className="max-sm:sr-only">Next</span> <ChevronRightIcon />
      </button>
    </nav>
  )
}

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
    <section className="relative isolate overflow-hidden pt-16">
      <CloudBackdrop tall />
      <div className="mx-auto flex max-w-[1100px] flex-col items-center px-5 pt-12 pb-14 text-center sm:px-8 sm:pt-16 sm:pb-16">
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
            <ButtonLink to="/dashboard" variant="secondary" size="lg" className="w-full sm:w-auto">
              Open your dashboard
            </ButtonLink>
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
    <section id="how-it-works" className="px-5 pt-4 pb-12 sm:px-8 lg:pb-16">
      <div className="mx-auto max-w-[1200px]">
        <header className="mx-auto max-w-[760px] text-center">
          <SectionPill>How it works</SectionPill>
          <h2 className="display mt-5 text-[2.1rem] sm:text-[3rem]">Your money moves only when the post does.</h2>
          <p className="mx-auto mt-4 max-w-[620px] text-[1.0625rem] leading-[1.52] text-[#525861]">
            Naano admits that booked posts don't always get published. Here, every booking is held in escrow until the
            post is proven live.
          </p>
        </header>
        <div className="mt-8">
          <HowItWorksCards />
        </div>
      </div>
    </section>
  )
}

function describeTarget(target: Target) {
  const parts = []
  if (target.niches.length) parts.push(target.niches.join(', '))
  if (target.audience) parts.push(`“${target.audience}”`)
  if (target.budgetCents) parts.push(`up to ${formatMoney(target.budgetCents)} a post`)
  return parts.join(' · ')
}

function TargetStrip({ target }: { target: Target | null }) {
  return (
    <div className="glass flex flex-col gap-3 rounded-[18px] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
          <TargetIcon />
        </span>
        {target ? (
          <p className="min-w-0 text-sm leading-6 text-body">
            <span className="font-semibold text-ink">Ranked for who you sell to:</span> <span className="break-words">{describeTarget(target)}</span>. Each card
            shows why the creator fits, or doesn't.
          </p>
        ) : (
          <p className="text-sm leading-6 text-body">
            <span className="font-semibold text-ink">See why each creator fits you.</span> Tell us your niches, audience and budget, and every card
            explains the match.
          </p>
        )}
      </div>
      <Link to="/dashboard/audience" className={buttonClass(target ? 'secondary' : 'primary', 'sm', 'shrink-0 self-start sm:self-auto')}>
        {target ? 'Edit' : 'Set it up'}
      </Link>
    </div>
  )
}

export default function Marketplace() {
  usePageTitle('Creator marketplace')
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()

  const niche = params.get('niche') ?? ''
  const maxPrice = PRICE_CAPS.some((cap) => cap.value === params.get('max')) ? (params.get('max') ?? '') : ''
  const chosenSort = SORTS.find((option) => option.value === params.get('sort'))?.value
  const q = (params.get('q') ?? '').slice(0, 100)
  const page = Math.max(1, Math.floor(Number(params.get('page'))) || 1)
  const [search, setSearch] = useState(q)

  useEffect(() => {
    setSearch((current) => (current.trim() === q ? current : q))
  }, [q])

  useEffect(() => {
    const value = search.trim()
    if (value === q) return
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(params)
      if (value) next.set('q', value)
      else next.delete('q')
      next.delete('page')
      setParams(next, { replace: true })
    }, SEARCH_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [search, q, params, setParams])

  const query = new URLSearchParams()
  if (niche) query.set('niche', niche)
  if (maxPrice) query.set('maxPriceCents', maxPrice)
  if (chosenSort) query.set('sort', chosenSort)
  if (q) query.set('q', q)
  query.set('page', String(page))
  query.set('pageSize', String(PAGE_SIZE))
  const { data, error, loading, slow, reload } = useApi<CreatorsResponse>(`/creators?${query}`)
  const sort = data?.sort ?? chosenSort ?? 'reliability'
  const sorts = SORTS.filter((option) => option.value !== 'fit' || data?.target)

  const update = (key: 'niche' | 'max' | 'sort', value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next, { replace: true })
  }
  const goToPage = (target: number) => {
    const next = new URLSearchParams(params)
    if (target > 1) next.set('page', String(target))
    else next.delete('page')
    setParams(next)
    document.getElementById('creators-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const filtered = Boolean(niche || maxPrice || q)
  const clearFilters = () => {
    setSearch('')
    setParams(chosenSort ? { sort: chosenSort } : {}, { replace: true })
  }
  const countLine = !data
    ? 'Loading creators…'
    : q
      ? `${plural(data.total, 'creator')} ${data.total === 1 ? 'matches' : 'match'} “${q}”`
      : `${plural(data.total, 'creator')}${niche || maxPrice ? ' match your filters' : ' available'}`

  return (
    <>
      <Hero user={user} />
      <HowItWorksSection />

      <section
        id="creators"
        aria-labelledby="creators-heading"
        className="relative overflow-hidden px-4 pt-4 pb-14 sm:px-8"
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

          <div className="relative isolate mt-8 overflow-hidden rounded-[28px] border border-[rgba(139,189,215,0.32)] bg-[linear-gradient(#DFF3FC_0%,#EDF9FE_72%,#FFFFFF_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_42px_90px_-48px_rgba(69,119,145,0.38)] sm:p-8 lg:rounded-[40px] lg:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-[55%] bg-cover bg-bottom bg-no-repeat opacity-60 [filter:saturate(0.8)_brightness(1.08)]"
              style={{ backgroundImage: `url(${asset(CLOUD_LAYER, 1920)})` }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.92),rgba(0,0,0,0)_39%),linear-gradient(rgba(233,248,255,0.1),rgba(255,255,255,0.22))]"
            />

            <div id="creators-list" className="scroll-mt-24 space-y-5">
              <form role="search" onSubmit={(event) => event.preventDefault()} className="glass flex items-center gap-2 rounded-[22px] p-2 pl-4">
                <SearchIcon className="size-5 shrink-0 text-muted" />
                <label htmlFor="creator-search" className="sr-only">
                  Search creators
                </label>
                <input
                  id="creator-search"
                  type="search"
                  value={search}
                  maxLength={100}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search creators by name, niche or audience"
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-[#8a909b] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="rounded-full p-2 text-muted hover:bg-ink/5 hover:text-ink">
                    <CloseIcon className="size-4" />
                  </button>
                )}
              </form>

              <div className="glass flex flex-col gap-4 rounded-[22px] p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <p className="text-sm font-semibold text-ink" aria-live="polite">
                    {countLine}
                    {data && data.pages > 1 && <span className="font-normal text-muted"> · page {data.page} of {data.pages}</span>}
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
                      {sorts.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {user?.role === 'brand' && data && <TargetStrip target={data.target} />}

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
                    title={q ? `No creators match “${q}”` : 'No creators match these filters'}
                    message={q ? 'Check the spelling, or try a niche or an audience like “founders”.' : 'Try another niche or a higher price limit.'}
                    action={<Button onClick={clearFilters}>{q ? 'Clear search' : 'Clear filters'}</Button>}
                  />
                </div>
              ) : (
                <>
                  <ul className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
                    {data.creators.map((creator) => (
                      <li key={creator.id}>
                        <CreatorCard creator={creator} />
                      </li>
                    ))}
                  </ul>
                  <Pagination page={data.page} pages={data.pages} onChange={goToPage} />
                </>
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
