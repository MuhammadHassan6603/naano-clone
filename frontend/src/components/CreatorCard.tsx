import { Link } from 'react-router-dom'
import { formatCount, formatMoney } from '../lib/format'
import type { Creator } from '../lib/types'
import { Avatar } from './Avatar'
import { ReliabilityLine } from './Reliability'
import { ArrowRightIcon } from './ui/Icons'

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link
      to={`/creators/${creator.id}`}
      className="group flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-colors hover:border-accent/50"
    >
      <div className="flex items-start gap-3">
        <Avatar name={creator.name} seed={creator.id} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{creator.name}</h3>
          <span className="mt-1 inline-block rounded-md bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-strong">
            {creator.niche}
          </span>
        </div>
      </div>

      <p className="line-clamp-2 min-h-12 text-sm leading-6 text-body">
        {creator.audience || 'Audience not described yet.'}
      </p>

      <dl className="grid grid-cols-2 gap-3 rounded-xl bg-page p-3">
        <div>
          <dt className="text-xs text-muted">Price per post</dt>
          <dd className="text-lg font-bold text-ink">{formatMoney(creator.priceCents)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Followers</dt>
          <dd className="text-lg font-bold text-ink">{formatCount(creator.followers)}</dd>
        </div>
      </dl>

      <ReliabilityLine reliability={creator.reliability} />

      <span className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2.5">
        View profile and book
        <ArrowRightIcon className="size-4 transition-all" />
      </span>
    </Link>
  )
}

export function CreatorCardSkeleton() {
  return (
    <div aria-hidden className="flex h-full animate-pulse flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
      <div className="flex gap-3">
        <div className="size-12 rounded-full bg-line" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-2/3 rounded bg-line" />
          <div className="h-4 w-1/4 rounded bg-line" />
        </div>
      </div>
      <div className="h-12 rounded bg-line" />
      <div className="h-16 rounded-xl bg-line" />
      <div className="h-6 rounded bg-line" />
    </div>
  )
}
