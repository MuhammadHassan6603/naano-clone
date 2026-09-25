import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, useLocation } from 'react-router-dom'
import { Burger, CaretDown, Close, GlobeThin } from './Icons'
import { SmartLink } from './SmartLink'
import { ease } from '../lib/motion'

const primary = [
  { label: 'How it works', href: '/#workflow' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQs', href: '/#faq' },
]

const resources = [
  { label: 'Blog', href: '/blog' },
  { label: 'Free Tools', href: '/free-tools' },
  { label: 'Reports', href: 'https://naano.com/reports' },
  { label: 'Case study: BlogSEO', href: '/case-studies/blogseo' },
]

const about = { label: 'About us', href: 'https://naano.com/about' }

const linkClass =
  'text-[14px] font-medium whitespace-nowrap text-[var(--lp-ink-soft)] transition-colors duration-150 hover:text-[var(--lp-ink)]'

const mobileLink =
  'block border-b border-[var(--lp-border)] px-5 py-3.5 text-[15px] font-medium text-[var(--lp-ink-soft)] transition-colors hover:bg-[var(--lp-surface-2)] hover:text-[var(--lp-ink)]'

export function ToolsNav() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
    setResourcesOpen(false)
  }, [pathname])

  return (
    <nav className="fixed inset-x-0 top-0 z-[1000] px-4 pt-2 sm:px-6 sm:pt-3">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between rounded-full border border-[var(--lp-border)] bg-white px-4 py-1.5 shadow-sm backdrop-blur-md sm:px-6 sm:py-2">
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
          >
            <img
              src="https://naano.com/logo.svg"
              alt="naano"
              width={24}
              height={24}
              className="h-5 w-5 object-contain sm:h-6 sm:w-6"
            />
            <span className="text-base font-bold text-[var(--lp-ink)] sm:text-lg">naano</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            {primary.map((link) => (
              <SmartLink key={link.label} href={link.href} className={linkClass}>
                {link.label}
              </SmartLink>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <button
                type="button"
                aria-expanded={resourcesOpen}
                aria-haspopup="true"
                onClick={() => setResourcesOpen((value) => !value)}
                className={`flex items-center gap-1 ${linkClass}`}
              >
                Resources
                <CaretDown
                  className={`transition-transform duration-150 ${resourcesOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className={`absolute top-full left-0 z-10 pt-3 transition-all duration-150 ${
                  resourcesOpen ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-1 opacity-0'
                }`}
              >
                <div className="min-w-[176px] overflow-hidden rounded-xl border border-[var(--lp-border)] bg-white shadow-lg">
                  {resources.map((link) => (
                    <SmartLink
                      key={link.label}
                      href={link.href}
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-2.5 text-[14px] font-medium whitespace-nowrap text-[var(--lp-ink-soft)] transition-colors hover:bg-[var(--lp-surface-2)] hover:text-[var(--lp-ink)]"
                    >
                      {link.label}
                    </SmartLink>
                  ))}
                </div>
              </div>
            </div>
            <SmartLink href={about.href} className={linkClass}>
              {about.label}
            </SmartLink>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/creators"
            className="hidden items-center gap-1 text-[14px] font-semibold whitespace-nowrap text-[var(--lp-ink-soft)] transition-colors hover:text-[var(--lp-ink)] md:inline-flex"
          >
            I'm a creator
          </Link>
          <Link
            to="/login?reauth=1"
            className="hidden h-9 items-center rounded-lg bg-[var(--lp-brand)] px-4 text-[13px] font-semibold whitespace-nowrap text-white transition-opacity hover:opacity-90 md:inline-flex"
          >
            Sign in
          </Link>
          <button
            type="button"
            aria-label="Switch language"
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 transition-colors duration-100 hover:bg-[var(--lp-surface-3)]"
          >
            <GlobeThin className="shrink-0 text-[#6B6D74]" />
            <span className="block h-[18px] w-5 text-center text-[13px] leading-[18px] font-semibold tracking-[0.02em] text-[#17181C] uppercase">
              EN
            </span>
          </button>
          <Link
            to="/register"
            className="hidden h-8 shrink-0 items-center justify-center rounded-full bg-[var(--lp-ink)] px-4 text-[13px] font-medium whitespace-nowrap text-white transition-colors duration-150 hover:bg-[var(--lp-footer)] md:inline-flex"
          >
            Get started
          </Link>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
            className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--lp-surface-3)] md:hidden"
          >
            {open ? <Close /> : <Burger />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-[var(--lp-border)] bg-white shadow-lg md:hidden"
          >
            {[...primary, ...resources].map((link) => (
              <SmartLink key={link.label} href={link.href} className={mobileLink}>
                {link.label}
              </SmartLink>
            ))}
            <SmartLink href={about.href} className={mobileLink.replace(' border-b border-[var(--lp-border)]', '')}>
              {about.label}
            </SmartLink>
            <Link
              to="/creators"
              className="block border-t border-[var(--lp-border)] px-5 py-3.5 text-base font-semibold text-[var(--lp-ink-soft)] transition-colors hover:bg-[var(--lp-surface-2)] hover:text-[var(--lp-ink)]"
            >
              I'm a creator
            </Link>
            <Link
              to="/login?reauth=1"
              className="mx-4 mt-2 flex h-10 items-center justify-center rounded-lg bg-[var(--lp-brand)] text-[14px] font-semibold text-white"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="mx-4 mt-2 mb-4 flex h-10 items-center justify-center rounded-full bg-[var(--lp-ink)] text-[14px] font-semibold text-white transition-colors hover:bg-[var(--lp-footer)]"
            >
              Get started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
