import { Link } from 'react-router-dom'

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className="flex shrink-0 items-center gap-2" aria-label="Naano Rebuild home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-accent" />
        <path d="M9 23V9h3.2l7.6 9.3V9H23v14h-3.2L12.2 13.7V23z" fill="white" />
      </svg>
      <span className="text-[17px] font-bold tracking-tight text-ink">naano</span>
      <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-accent-strong uppercase">
        Rebuild
      </span>
    </Link>
  )
}
