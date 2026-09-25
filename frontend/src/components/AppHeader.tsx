import { startTransition, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import type { User } from '../lib/types'
import { Logo } from './Logo'
import { Button, ButtonLink } from './ui/Button'
import { CloseIcon, MenuIcon } from './ui/Icons'

type NavItem = { to: string; label: string }

const NAV: NavItem[] = [
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#creators', label: 'Creators' },
]

function RoleBadge({ user }: { user: User }) {
  return (
    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold tracking-wide text-accent-strong uppercase">
      {user.role}
    </span>
  )
}

export function AppHeader() {
  const { user, status, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname, hash } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const close = () => setMenuOpen(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const signOut = () => {
    close()
    navigate('/')
    startTransition(logout)
  }

  const isActive = (to: string) => (to.includes('#') ? pathname === '/' && hash === to.slice(1) : pathname === to)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        menuOpen ? 'border-b border-line bg-page' : scrolled ? 'border-b border-line/80 bg-page/85 backdrop-blur-xl' : ''
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5 sm:px-8">
        <Logo onClick={close} />

        <ul className="ml-10 hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={isActive(item.to) ? 'page' : undefined}
                className="text-[13px] font-medium whitespace-nowrap text-[#17181c] transition-colors hover:text-ink/70 aria-[current=page]:text-accent"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          {status === 'checking' ? null : user ? (
            <>
              <span className="hidden items-center gap-2 text-[13px] font-medium text-ink xl:flex">
                {user.name}
                <RoleBadge user={user} />
              </span>
              <Button variant="secondary" size="sm" onClick={signOut} className="hidden lg:inline-flex">
                Log out
              </Button>
              <ButtonLink to="/dashboard" size="sm" className="max-sm:px-3">
                Open dashboard
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink to="/login" variant="secondary" size="sm" className="max-sm:px-3">
                Sign in
              </ButtonLink>
              <ButtonLink to="/signup" size="sm" className="max-sm:px-3">
                Sign up
              </ButtonLink>
            </>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex size-9 items-center justify-center rounded-full border border-line bg-white text-ink lg:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="bg-page px-5 pt-2 pb-6 sm:px-8 lg:hidden">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={close}
                  className="block rounded-xl px-3 py-3 text-[1.0625rem] font-medium text-ink transition-colors hover:bg-ink/5"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {user && (
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line px-3 pt-4">
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink">
                <span className="truncate">{user.name}</span>
                <RoleBadge user={user} />
              </span>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Log out
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
