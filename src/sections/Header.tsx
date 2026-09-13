import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { motion as m } from 'motion/react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../components/Button'
import { ChevronDown, Close, Globe, Menu } from '../components/Icons'
import { SmartLink } from '../components/SmartLink'
import { asset } from '../lib/assets'
import { ease, press, spring } from '../lib/motion'

const primaryLinks = [
  { label: 'For companies', href: '/' },
  { label: 'For creators', href: '/creators' },
  { label: 'For agencies', href: '/agencies' },
  { label: 'How it works', href: '/#workflow' },
]

const resourceLinks = [
  { label: 'Blog', href: '/blog' },
  { label: 'Free Tools', href: '/free-tools' },
  { label: 'Case study: BlogSEO', href: '/case-studies/blogseo' },
]

const ctaByPath: Record<string, { label: string; href: string }> = {
  '/creators': { label: 'Start earning', href: '/register' },
  '/agencies': { label: 'Choose your agency', href: '/agencies#choose' },
}

export function Header() {
  const { pathname } = useLocation()
  const cta = ctaByPath[pathname] ?? { label: 'Sign up', href: '/register' }
  const [open, setOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const solid = pathname.startsWith('/blog')
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 24))

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    setOpen(false)
    setResourcesOpen(false)
  }, [pathname])

  const close = () => setOpen(false)

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? 'bg-[#C5EBFD]'
          : open
            ? 'border-b border-line bg-page'
            : scrolled
              ? 'border-b border-line/80 bg-page/85 backdrop-blur-xl'
              : ''
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1680px] items-center gap-[14px] px-[14px] sm:gap-4 sm:px-8 lg:gap-0 lg:px-12"
      >
        <Link to="/" className="flex shrink-0 items-center" onClick={close}>
          <img
            src={asset('naano-logo-nav.png', 384)}
            alt="naano"
            width={123}
            height={26}
            className="h-[26px] w-auto max-sm:h-[22px]"
            fetchPriority="high"
          />
        </Link>

        <ul className="ml-auto hidden items-center gap-[20px] lg:flex xl:gap-[27.6px]">
          {primaryLinks.map((link) => (
            <li key={link.label}>
              <SmartLink
                href={link.href}
                className="text-[12.9px] font-medium whitespace-nowrap text-[#17181c] transition-colors hover:text-ink/70"
              >
                {link.label}
              </SmartLink>
            </li>
          ))}
          <li
            className="relative"
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setResourcesOpen((value) => !value)}
              aria-expanded={resourcesOpen}
              className="flex items-center gap-1 text-[12.9px] font-medium whitespace-nowrap text-[#17181c] transition-colors hover:text-ink/70"
            >
              Resources
              <ChevronDown className={`transition-transform duration-300 ${resourcesOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              className={`absolute top-full left-1/2 w-56 -translate-x-1/2 pt-3 transition-all duration-200 ${
                resourcesOpen ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-1 opacity-0'
              }`}
            >
              <div className="rounded-2xl border border-line bg-white p-2 shadow-card">
                {resourceLinks.map((link) => (
                  <SmartLink
                    key={link.label}
                    href={link.href}
                    onClick={() => setResourcesOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-page hover:text-ink"
                  >
                    {link.label}
                  </SmartLink>
                ))}
              </div>
            </div>
          </li>
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-[20px] xl:ml-[27.5px]">
          <motion.button
            type="button"
            whileTap={press}
            transition={spring}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex size-9 items-center justify-center rounded-full border border-line bg-white text-ink lg:hidden"
          >
            {open ? <Close /> : <Menu />}
          </motion.button>
          <button
            type="button"
            className="hidden items-center gap-1.5 px-1 text-[11.5px] font-medium text-ink-soft transition-colors hover:text-ink lg:flex"
          >
            <Globe />
            EN
          </button>
          <Button href="/login?reauth=1" variant="secondary" size="sm" className="max-sm:px-3">
            Sign in
          </Button>
          <Button href={cta.href} size="sm" className="max-sm:px-3">
            {cta.label}
          </Button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease }}
            className="overflow-hidden bg-page lg:hidden"
          >
            <div className="space-y-1 px-5 pt-2 pb-6 sm:px-8">
              {[...primaryLinks, ...resourceLinks].map((link, index) => (
                <m.div
                  key={link.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.04, duration: 0.3, ease }}
                >
                  <SmartLink
                    href={link.href}
                    onClick={close}
                    className="block rounded-xl px-3 py-3 text-[1.0625rem] font-medium text-ink transition-colors hover:bg-ink/5"
                  >
                    {link.label}
                  </SmartLink>
                </m.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
