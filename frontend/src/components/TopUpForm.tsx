import { type FormEvent, useState } from 'react'
import { api, toApiError } from '../lib/api'
import { formatMoney } from '../lib/format'
import type { Wallet } from '../lib/types'
import { Button } from './ui/Button'
import { TextField } from './ui/Field'
import { Notice } from './ui/Feedback'

const MIN_CENTS = 100
const MAX_CENTS = 1_000_000
const PRESETS = [10_000, 50_000, 100_000]

type TopUpFormProps = {
  onDone: (wallet: Wallet) => void
  suggestedCents?: number
}

export function TopUpForm({ onDone, suggestedCents }: TopUpFormProps) {
  const presets = suggestedCents && !PRESETS.includes(suggestedCents) ? [suggestedCents, ...PRESETS] : PRESETS
  const [dollars, setDollars] = useState(String((suggestedCents ?? PRESETS[1]) / 100))
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const cents = Math.round(Number(dollars) * 100)
  const invalid = !Number.isFinite(cents) || cents < MIN_CENTS || cents > MAX_CENTS

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (invalid) {
      setError(`Enter an amount between ${formatMoney(MIN_CENTS)} and ${formatMoney(MAX_CENTS)}.`)
      return
    }
    setPending(true)
    setError(null)
    setDone(null)
    try {
      const wallet = await api<Wallet>('/wallet/topup', { method: 'POST', body: { amountCents: cents } })
      setDone(`Added ${formatMoney(cents)} to your available balance.`)
      onDone(wallet)
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick amounts">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setDollars(String(preset / 100))
              setError(null)
            }}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
              cents === preset ? 'border-accent bg-accent-soft text-accent-strong' : 'border-line-strong text-ink hover:border-ink/40'
            }`}
          >
            {formatMoney(preset)}
          </button>
        ))}
      </div>
      <TextField
        label="Amount in US dollars"
        type="number"
        inputMode="decimal"
        min={MIN_CENTS / 100}
        max={MAX_CENTS / 100}
        step="0.01"
        value={dollars}
        onChange={(event) => {
          setDollars(event.target.value)
          setError(null)
        }}
        error={error ?? undefined}
        hint={`Demo money: no card is charged. Between ${formatMoney(MIN_CENTS)} and ${formatMoney(MAX_CENTS)} per top-up.`}
      />
      <Button type="submit" loading={pending} className="w-full sm:w-auto">
        Add {invalid ? 'money' : formatMoney(cents)}
      </Button>
      {done && <Notice tone="success">{done}</Notice>}
    </form>
  )
}
