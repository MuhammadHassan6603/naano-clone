import { Link } from 'react-router-dom'
import { formatCount, formatMoney } from '../lib/format'
import type { Creator } from '../lib/types'
import { Avatar } from './Avatar'
import { FitChips } from './FitReasons'
import { ArrowRightIcon, LinkedInIcon } from './ui/Icons'

function Stat({ label, value, divider = false }: { label: string; value: string; divider?: boolean }) {
  return (
    <div className={`flex min-w-0 flex-col items-center justify-center px-2 py-4 text-center ${divider ? 'border-x border-[#e7e8eb]' : ''}`}>
      <dd className="w-full truncate text-[19px] font-bold tracking-[-0.025em] text-ink">{value}</dd>
      <dt className="mt-0.5 text-[11px] leading-4 text-[#8a909b]">{label}</dt>
    </div>
  )
}

const cardClass =
  'group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[#e4e5e7] bg-white shadow-float transition-[border-color,box-shadow,transform] duration-300'
const interactiveClass =
  'hover:-translate-y-1 hover:border-[#9fb9f7] hover:shadow-[0_30px_72px_rgba(37,62,117,0.18),0_8px_22px_rgba(49,91,194,0.09)]'

const badgeClass = 'absolute top-3 left-4 z-10 inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-white/75 bg-white/90 px-2 text-[#0a66c2]'

function LinkedInBadge({ creator, preview }: { creator: Creator; preview: boolean }) {
  if (!creator.linkedinUrl) {
    return (
      <span className={badgeClass} title="LinkedIn profile not linked">
        <LinkedInIcon className="size-4" />
      </span>
    )
  }
  const label = <span className="text-[11px] font-semibold">View profile</span>
  if (preview) {
    return (
      <span className={badgeClass}>
        <LinkedInIcon className="size-4" />
        {label}
      </span>
    )
  }
  return (
    <a
      href={creator.linkedinUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${badgeClass} transition-colors hover:bg-white`}
      aria-label={`${creator.name} on LinkedIn (opens in a new tab)`}
    >
      <LinkedInIcon className="size-4" />
      {label}
    </a>
  )
}

export function CreatorCard({ creator, preview = false }: { creator: Creator; preview?: boolean }) {
  return (
    <div className={`${cardClass} ${preview ? '' : interactiveClass}`}>
      <CardBody creator={creator} preview={preview} />
    </div>
  )
}

function CardBody({ creator, preview }: { creator: Creator; preview: boolean }) {
  const { delivered, total } = creator.reliability
  return (
    <>
      <div className="relative h-[72px] bg-[radial-gradient(circle_at_12%_8%,rgba(255,255,255,0.25),transparent_28%),radial-gradient(circle_at_88%_86%,rgba(137,174,255,0.42),transparent_36%),linear-gradient(135deg,#0C3EBE_0%,#1959EF_57%,#6691FF_100%)]">
        <span className="absolute -top-16 -right-12 size-32 rounded-full border border-white/15" />
        <LinkedInBadge creator={creator} preview={preview} />
        <span className="absolute top-3.5 right-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-accent-strong">
          {creator.niche}
        </span>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <Avatar name={creator.name} seed={creator.id} size="ring" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-12 pb-5 text-center">
        <h3 className="truncate text-[20px] leading-tight font-bold tracking-[-0.03em]">{creator.name}</h3>
        <p className="mx-auto mt-2 line-clamp-2 min-h-12 max-w-[300px] text-[14px] leading-6 text-[#5f6673]">
          {creator.audience || 'Audience not described yet.'}
        </p>
        {creator.fit && <FitChips fit={creator.fit} className="mt-3 justify-center" />}
        <div className="mx-auto mt-3 flex w-full max-w-[280px] items-center gap-3 text-left">
          <span className="shrink-0 text-xs font-medium text-[#8a909b]">Delivered</span>
          <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#e8ebf1]">
            <span
              className="block h-full rounded-full bg-[linear-gradient(90deg,#2563EB,#7C8DF6)]"
              style={{ width: total ? `${(delivered / total) * 100}%` : '0%' }}
            />
          </span>
          <span className="shrink-0 text-xs font-semibold text-[#6b7280]">{total ? `${delivered} of ${total}` : 'New'}</span>
        </div>
      </div>

      <dl className="grid grid-cols-3 border-t border-[#e7e8eb] bg-[#fcfcfd]">
        <Stat label="Followers" value={formatCount(creator.followers)} />
        <Stat label="Price / post" value={formatMoney(creator.priceCents)} divider />
        <Stat label={total ? 'Delivered' : 'Track record'} value={total ? `${delivered}/${total}` : 'New'} />
      </dl>

      {preview ? (
        <span className="flex items-center justify-center border-t border-[#e7e8eb] py-3 text-sm font-semibold text-accent">This is how brands see you</span>
      ) : (
        <Link
          to={`/creators/${creator.id}`}
          className="flex items-center justify-center gap-1.5 border-t border-[#e7e8eb] py-3 text-sm font-semibold text-accent transition-[gap] group-hover:gap-2.5 after:absolute after:inset-0 after:rounded-[28px] after:content-['']"
        >
          View profile and book
          <ArrowRightIcon className="size-4" />
        </Link>
      )}
    </>
  )
}

export function CreatorCardSkeleton() {
  return (
    <div aria-hidden className="flex h-full animate-pulse flex-col overflow-hidden rounded-[28px] border border-[#e4e5e7] bg-white">
      <div className="h-[72px] bg-[#dbe5fb]" />
      <div className="flex flex-col items-center gap-3 px-5 pt-12 pb-5">
        <div className="h-5 w-1/2 rounded bg-line" />
        <div className="h-10 w-3/4 rounded bg-line" />
        <div className="h-2 w-2/3 rounded bg-line" />
      </div>
      <div className="h-16 border-t border-line bg-[#fcfcfd]" />
    </div>
  )
}
