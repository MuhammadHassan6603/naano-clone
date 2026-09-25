import { Link } from 'react-router-dom'
import { LOGO, asset } from '../lib/assets'

export function Logo({ onClick, className = 'h-[26px] max-sm:h-[22px]' }: { onClick?: () => void; className?: string }) {
  return (
    <Link to="/" onClick={onClick} className="flex shrink-0 items-center" aria-label="naano home">
      <img src={asset(LOGO, 384)} alt="naano" width={123} height={26} className={`w-auto ${className}`} />
    </Link>
  )
}
