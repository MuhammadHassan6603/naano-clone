import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import type { User } from '../lib/types'
import { Logo } from './Logo'
import { Button, ButtonLink } from './ui/Button'
import { CloseIcon, MenuIcon } from './ui/Icons'

type NavItem = { to: string; label: string }

function navFor(user: User | null): NavItem[] {
  const items: NavItem[] = [{ to: '/', label: 'Marketplace' }]
  if (user) items.push({ to: '/wallet', label: 'Wallet' })
  return items
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-ink/[0.06] text-ink' : 'text-muted hover:text-ink'
  }`

function RoleBadge({ user }: { user: User }) {
  return (
    <span className="rounded-md border border-line px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
      {user.role}
    </span>
  )
}

export function AppHeader() {
  const { user, status, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const items = navFor(user)
  const close = () => setMenuOpen(false)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const signOut = () => {
    close()
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo onClick={close} />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {status === 'checking' ? null : user ? (
            <>
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                {user.name}
                <RoleBadge user={user} />
              </span>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink to="/signup" size="sm">
                Sign up
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto grid size-10 place-items-center rounded-lg text-ink hover:bg-ink/5 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-line bg-surface px-4 pt-3 pb-5 md:hidden">
          <nav aria-label="Main" className="flex flex-col gap-1">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} end className={navClass} onClick={close}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 border-t border-line pt-4">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink">
                  <span className="truncate">{user.name}</span>
                  <RoleBadge user={user} />
                </span>
                <Button variant="secondary" size="sm" onClick={signOut}>
                  Log out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <ButtonLink to="/login" variant="secondary" onClick={close}>
                  Log in
                </ButtonLink>
                <ButtonLink to="/signup" onClick={close}>
                  Sign up
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
