import type { ReactNode } from 'react'
import { AlertIcon, CheckIcon, InfoIcon } from './Icons'

export function Spinner({ className = 'size-4' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`${className} inline-block animate-spin rounded-full border-2 border-current border-r-transparent`}
    />
  )
}

type Tone = 'info' | 'success' | 'warning' | 'error'

const tones: Record<Tone, { box: string; icon: ReactNode }> = {
  info: { box: 'border-accent/25 bg-accent-soft text-ink', icon: <InfoIcon className="text-accent" /> },
  success: { box: 'border-good/25 bg-good-soft text-ink', icon: <CheckIcon className="text-good" /> },
  warning: { box: 'border-held/25 bg-held-soft text-ink', icon: <AlertIcon className="text-held" /> },
  error: { box: 'border-danger/25 bg-danger-soft text-ink', icon: <AlertIcon className="text-danger" /> },
}

export function Notice({ tone = 'info', title, children }: { tone?: Tone; title?: string; children?: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-xl border p-4 text-sm leading-6 ${tones[tone].box}`}
    >
      <span className="mt-1 shrink-0">{tones[tone].icon}</span>
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-body">{children}</div>}
      </div>
    </div>
  )
}

export function SlowServerHint() {
  return (
    <p className="text-sm text-muted">
      The demo server runs on a free plan that sleeps when nobody is using it. The first request can take up to a
      minute while it wakes up.
    </p>
  )
}

export function LoadingState({ label, slow = false }: { label: string; slow?: boolean }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <Spinner className="size-6 text-accent" />
      <p className="font-medium text-ink">{label}</p>
      {slow && <SlowServerHint />}
    </div>
  )
}

export function ErrorState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
        <AlertIcon className="size-6" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm leading-6 text-muted">{message}</p>
      {action}
    </div>
  )
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-14 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm leading-6 text-muted">{message}</p>
      {action}
    </div>
  )
}
