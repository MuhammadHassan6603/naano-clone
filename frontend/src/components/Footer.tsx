import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CLOUDS, FOOTER_CLOUDS, asset } from '../lib/assets'
import { Logo } from './Logo'

const transitionMask = 'linear-gradient(rgba(0,0,0,0) 0%, #000 45%, #000 100%)'
const cloudsMask = 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0) 42%, #000 76%, #000 100%)'

const transitionLayer: CSSProperties = {
  backgroundImage: `url(${asset(FOOTER_CLOUDS, 1920)})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center bottom',
  filter: 'saturate(0.92) brightness(0.96) contrast(1.18)',
  maskImage: transitionMask,
  WebkitMaskImage: transitionMask,
}

const cloudsLayer: CSSProperties = {
  backgroundImage: `url(${asset(CLOUDS, 1920)})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center bottom',
  filter: 'saturate(0.78) brightness(1.03) contrast(1.08)',
  maskImage: cloudsMask,
  WebkitMaskImage: cloudsMask,
}

const linkClass = 'text-[14.5px] leading-[1.3] text-[#526875] transition-colors hover:text-[#111318]'
const headingClass = 'text-[12px] font-bold tracking-[0.16em] text-[#8a969e] uppercase'

const product = [
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'Browse creators', to: '/#creators' },
  { label: 'Create an account', to: '/signup' },
  { label: 'Sign in', to: '/login' },
]

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#E9F7FC_0%,#EDF9FD_48%,#FFFFFF_100%)] px-5 pt-16 sm:px-8 lg:px-[72px] lg:pt-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={transitionLayer} />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] opacity-25" style={cloudsLayer} />

      <div className="relative z-[2] mx-auto grid w-full max-w-[1200px] gap-10 pb-10 md:grid-cols-[1.2fr_0.8fr_1.4fr]">
        <div>
          <Logo className="h-[28px]" />
          <p className="mt-5 max-w-[260px] text-[15px] leading-[1.55] text-[#5f737e]">
            Book LinkedIn creators. Pay only when the post is live.
          </p>
        </div>
        <div className="flex flex-col gap-3.5">
          <span className={headingClass}>Product</span>
          {product.map((link) => (
            <Link key={link.label} to={link.to} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3.5">
          <span className={headingClass}>About this demo</span>
          <p className="text-[14.5px] leading-[1.6] text-[#526875]">
            A rebuild of naano.com made for an 8x take-home assignment, not affiliated with naano. Accounts, bookings
            and balances are real records in a real database. All money is demo money: no card is charged and nothing
            is paid out.
          </p>
          <a
            href="https://github.com/MuhammadHassan6603/naano-clone"
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} font-semibold text-[#111318]`}
          >
            Source code on GitHub
          </a>
        </div>
      </div>

      <div className="relative z-[2] mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 border-t border-[rgba(93,139,160,0.2)] pt-5 pb-7">
        <span className="text-[13.5px] text-[#8a8c92]">© 2026 naano rebuild. Demo project.</span>
        <span className="text-[13.5px] text-[#8a8c92]">Escrow-backed creator bookings</span>
      </div>
    </footer>
  )
}
