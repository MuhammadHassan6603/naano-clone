import type { ReactNode } from 'react'
import { CLOUD_LAYER, asset } from '../lib/assets'
import { BadgeCheckIcon, LockIcon, SendIcon, UndoIcon } from './ui/Icons'

type Step = { icon: ReactNode; title: string; body: string }

const steps: Step[] = [
  {
    icon: <LockIcon className="size-5" />,
    title: 'The brand books, and the money is held',
    body: "The creator's fixed price leaves the brand's available balance and is locked in escrow. Nobody can spend it.",
  },
  {
    icon: <SendIcon className="size-5" />,
    title: 'The creator posts on LinkedIn',
    body: 'They accept the brief, publish in their own voice with a tracked link, and submit the post URL before the deadline.',
  },
  {
    icon: <BadgeCheckIcon className="size-5" />,
    title: 'Verified live, then paid',
    body: 'The brand approves it, or the first real reader clicks the tracked link, or 72 hours pass with no objection.',
  },
]

export function RefundNote() {
  return (
    <p className="flex gap-3 rounded-[18px] border border-held/20 bg-[#fffaf1] p-4 text-sm leading-6 text-body">
      <UndoIcon className="mt-1 size-4 shrink-0 text-held" />
      <span>
        <span className="font-semibold text-ink">If the post never happens, the brand gets the money back.</span> A
        declined request or a missed deadline returns the full amount automatically. There is no platform fee in this
        demo: the creator receives the full price.
      </span>
    </p>
  )
}

export function HowItWorksCards() {
  return (
    <div className="space-y-4">
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="glass relative isolate flex min-h-[230px] flex-col overflow-hidden rounded-[22px] p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[-29px] top-[58%] bottom-[-42px] -z-10 bg-cover bg-bottom bg-no-repeat opacity-80 [filter:saturate(0.72)_brightness(1.1)_contrast(0.94)]"
              style={{ backgroundImage: `url(${asset(CLOUD_LAYER, 640)})` }}
            />
            <span className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-white text-accent shadow-[0_8px_20px_rgba(53,89,108,0.14)]">
                {step.icon}
              </span>
              <span className="text-[13px] font-bold tracking-[0.14em] text-[#7b818b]">STEP {index + 1}</span>
            </span>
            <strong className="mt-5 text-[1.125rem] font-bold tracking-[-0.025em] text-[#17181c]">{step.title}</strong>
            <span className="mt-2 text-[0.875rem] leading-[1.55] text-[#5b636c]">{step.body}</span>
          </li>
        ))}
      </ol>
      <RefundNote />
    </div>
  )
}

export function HowItWorksList() {
  return (
    <section aria-labelledby="booking-steps" className="space-y-4">
      <h2 id="booking-steps" className="text-base font-semibold">
        How a booking works
      </h2>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">{step.icon}</span>
            <div>
              <p className="text-sm font-semibold text-ink">
                {index + 1}. {step.title}
              </p>
              <p className="mt-0.5 text-sm leading-6 text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <RefundNote />
    </section>
  )
}
