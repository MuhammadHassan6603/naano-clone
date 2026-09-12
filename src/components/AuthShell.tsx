import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GlobeThin } from './Icons'

export const Noise = () => <div className="bg-noise" aria-hidden />

export const BrandRow = ({ className = 'mb-8' }: { className?: string }) => (
  <div className={`flex items-center justify-between ${className}`}>
    <Link to="/" className="shrink-0">
      <img src="https://naano.com/logo.svg" alt="naano" width={36} height={28} className="h-7 w-auto" />
    </Link>
    <button
      type="button"
      aria-label="Switch language"
      className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 transition-colors duration-100 hover:bg-[#F1F1EF]"
    >
      <GlobeThin className="shrink-0 text-[#6B6D74]" />
      <span className="block h-[18px] w-5 text-center text-[13px] leading-[18px] font-semibold tracking-[0.02em] text-[#17181C] uppercase">
        EN
      </span>
    </button>
  </div>
)

const social =
  'flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#E5E7EB] bg-white text-[15px] font-semibold text-[#111827] shadow-[0_2px_6px_rgba(15,23,42,0.05)] transition-all hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'

export const SocialButton = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick?: () => void
}) => (
  <button type="button" className={social} onClick={onClick}>
    {icon}
    <span>{label}</span>
  </button>
)

export const AuthAside = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="hidden flex-1 items-center justify-center bg-[#2563eb] p-12 text-white lg:flex">
    <div className="max-w-sm">
      <h2 className="font-jakarta mb-4 text-3xl font-bold">{title}</h2>
      {children}
    </div>
  </div>
)
