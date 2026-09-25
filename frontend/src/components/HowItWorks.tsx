import type { ReactNode } from 'react'
import { BadgeCheckIcon, LockIcon, SendIcon, UndoIcon } from './ui/Icons'

type Step = { icon: ReactNode; title: string; body: string }

const steps: Step[] = [
  {
    icon: <LockIcon />,
    title: 'The brand books, and the money is held',
    body: "The creator's fixed price leaves the brand's available balance and is locked in escrow. Nobody can spend it.",
  },
  {
    icon: <SendIcon />,
    title: 'The creator posts on LinkedIn',
    body: 'They accept the brief, publish in their own voice with a tracked link, and submit the post URL before the deadline.',
  },
  {
    icon: <BadgeCheckIcon />,
    title: 'Verified live, then paid',
    body: 'The brand approves it, or the first real reader clicks the tracked link, or 72 hours pass with no objection. Then the creator is paid.',
  },
]

export function HowItWorks({ compact = false }: { compact?: boolean }) {
  return (
    <section aria-labelledby="how-it-works" className="space-y-4">
      <h2 id="how-it-works" className={compact ? 'text-base font-semibold' : 'text-xl font-semibold'}>
        How a booking works
      </h2>
      <ol className={`grid gap-3 ${compact ? '' : 'md:grid-cols-3'}`}>
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              {step.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                {index + 1}. {step.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="flex gap-3 rounded-2xl border border-held/25 bg-held-soft p-4 text-sm leading-6 text-body">
        <UndoIcon className="mt-1 size-4 shrink-0 text-held" />
        <span>
          <span className="font-semibold text-ink">If the post never happens, the brand gets the money back.</span> A
          declined request or a missed deadline returns the full amount automatically. There is no platform fee in this
          demo: the creator receives the full price.
        </span>
      </p>
    </section>
  )
}
