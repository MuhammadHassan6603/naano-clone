import { useState } from 'react'
import { Button } from '../ui/Button'

type ConfirmButtonProps = {
  label: string
  confirmLabel: string
  question: string
  onConfirm: () => void
  pending: boolean
  variant?: 'primary' | 'secondary'
}

export function ConfirmButton({ label, confirmLabel, question, onConfirm, pending, variant = 'primary' }: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false)
  if (!asking) {
    return (
      <Button variant={variant} onClick={() => setAsking(true)} disabled={pending}>
        {label}
      </Button>
    )
  }
  return (
    <div className="w-full rounded-xl border border-line bg-[#f6f7f9] p-4">
      <p className="text-sm font-medium text-ink">{question}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={onConfirm} loading={pending}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={() => setAsking(false)} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
