import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Button } from '../components/Button'
import { ChevronDown, Close, Globe, Menu } from '../components/Icons'
import { asset } from '../lib/assets'
import { ease, press, spring } from '../lib/motion'

const primaryLinks = [
  { label: 'For companies', href: '#marketplace' },
  { label: 'For creators', href: '#results' },
  { label: 'For agencies', href: '#proof' },
  { label: 'How it works', href: '#workflow' },
]

const resourceLinks = [
  { label: 'Blog', href: 'https://naano.com/blog' },
  { label: 'Free Tools', href: 'https://naano.com/tools' },
  { label: 'Case study: BlogSEO', href: '#proof' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 24))

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const close = () => setOpen(false)

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        open ? 'border-b border-line bg-page' : scrolled ? 'border-b border-line/80 bg-page/85 backdrop-blur-xl' : ''
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1680px] items-center gap-4 px-5 sm:px-8 lg:gap-0 lg:px-12"
      >
        <a href="#top" className="flex shrink-0 items-center" onClick={close}>
          <img
            src={asset('naano-logo-nav.png', 384)}
            alt="naano"
            width={123}
            height={26}
            className="h-[26px] w-auto max-sm:h-6"
            fetchPriority="high"
          />
        </a>

        <ul className="ml-auto hidden items-center gap-[20px] lg:flex xl:gap-[27.6px]">
          {primaryLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[12.9px] font-medium whitespace-nowrap text-[#17181c] transition-colors hover:text-ink/70"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 text-[12.9px] font-medium whitespace-nowrap text-[#17181c] transition-colors hover:text-ink/70"
            >
              Resources
              <ChevronDown className="transition-transform duration-300 group-hover:rotate-180" />
            </button>
            <div className="invisible absolute top-full left-1/2 w-56 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="rounded-2xl border border-line bg-white p-2 shadow-card">
                {resourceLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-page hover:text-ink"
                  >
                    {link.label}
                  </a>
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
          <Button href="#pricing" variant="secondary" size="sm">
            Sign in
          </Button>
          <Button href="#cta" size="sm">
            Sign up
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
            className="overflow-hidden lg:hidden"
          >
            <div className="space-y-1 px-5 pt-2 pb-6 sm:px-8">
              {[...primaryLinks, ...resourceLinks].map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={close}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.04, duration: 0.3, ease }}
                  className="block rounded-xl px-3 py-3 text-[1.0625rem] font-medium text-ink transition-colors hover:bg-ink/5"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
