import { useId, useState } from 'react'
import { inputClass } from '../ui/Field'
import { CheckIcon, CopyIcon } from '../ui/Icons'

export function CopyField({ label, value }: { label: string; value: string }) {
  const id = useId()
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      ;(document.getElementById(id) as HTMLInputElement | null)?.select()
    }
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-wide text-[#5c5b57] uppercase">
        {label}
      </label>
      <div className="flex gap-2">
        <input id={id} readOnly value={value} onFocus={(e) => e.target.select()} className={`${inputClass} font-mono text-[13px]`} />
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-line-strong bg-white px-3 text-sm font-semibold text-ink hover:border-ink/40"
        >
          {copied ? <CheckIcon className="text-good" /> : <CopyIcon />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
