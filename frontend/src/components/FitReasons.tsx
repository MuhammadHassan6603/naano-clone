import type { Fit } from '../lib/types'
import { CheckIcon, MinusIcon } from './ui/Icons'

export function FitChips({ fit, className = '' }: { fit: Fit; className?: string }) {
  return (
    <ul aria-label="Why they fit you" className={`flex flex-wrap gap-1.5 ${className}`}>
      {fit.reasons.map((reason) => (
        <li
          key={reason.kind}
          className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-[12px] leading-4 font-semibold ${
            reason.match ? 'bg-good-soft text-good' : 'bg-[#f1f2f4] text-[#6b7280]'
          }`}
        >
          {reason.match ? <CheckIcon className="size-3 shrink-0" /> : <MinusIcon className="size-3 shrink-0" />}
          <span className="truncate">{reason.label}</span>
          <span className="sr-only">{reason.match ? '(fits)' : '(does not fit)'}</span>
        </li>
      ))}
    </ul>
  )
}

export function FitList({ fit }: { fit: Fit }) {
  return (
    <ul className="space-y-2.5">
      {fit.reasons.map((reason) => (
        <li key={reason.kind} className="flex items-start gap-2.5 text-sm leading-5">
          <span
            className={`mt-px flex size-5 shrink-0 items-center justify-center rounded-full ${
              reason.match ? 'bg-good-soft text-good' : 'bg-[#f1f2f4] text-[#6b7280]'
            }`}
          >
            {reason.match ? <CheckIcon className="size-3" /> : <MinusIcon className="size-3" />}
          </span>
          <span className={reason.match ? 'text-ink' : 'text-muted'}>{reason.label}</span>
        </li>
      ))}
    </ul>
  )
}

export const fitSummary = (fit: Fit) =>
  fit.matched === fit.reasons.length
    ? 'Matches everything you set'
    : fit.matched === 0
      ? 'Matches none of what you set'
      : `Matches ${fit.matched} of the ${fit.reasons.length} things you set`
