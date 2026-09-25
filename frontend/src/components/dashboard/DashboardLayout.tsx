import { type ReactNode, startTransition } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import type { Role, User } from '../../lib/types'
import { Logo } from '../Logo'
import { GridIcon, ListIcon, LogOutIcon, StoreIcon, UserIcon, WalletIcon } from '../ui/Icons'

type Item = { to: string; label: string; icon: ReactNode; end?: boolean }

const itemsFor = (role: Role): Item[] => [
  { to: '/dashboard', label: 'Overview', icon: <GridIcon />, end: true },
  { to: '/dashboard/bookings', label: 'Bookings', icon: <ListIcon /> },
  ...(role === 'creator' ? [{ to: '/dashboard/profile', label: 'My profile', icon: <UserIcon /> }] : []),
  { to: '/dashboard/wallet', label: 'Wallet', icon: <WalletIcon /> },
]

const sideLink = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
    isActive ? 'bg-accent-soft text-accent-strong' : 'text-[#4b5563] hover:bg-ink/5 hover:text-ink'
  }`

const tabLink = ({ isActive }: { isActive: boolean }) =>
  `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
    isActive ? 'bg-ink text-white' : 'bg-white text-[#4b5563] ring-1 ring-line'
  }`

function Account({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <div className="space-y-3 border-t border-line pt-4">
      <div className="min-w-0 px-1">
        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
        <span className="mt-1.5 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold tracking-wide text-accent-strong uppercase">
          {user.role}
        </span>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#4b5563] hover:bg-ink/5 hover:text-ink"
      >
        <LogOutIcon /> Log out
      </button>
    </div>
  )
}

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null
  const items = itemsFor(user.role)
  const signOut = () => {
    navigate('/')
    startTransition(logout)
  }

  return (
    <div className="min-h-svh bg-[#f6f7f9] lg:flex">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-line bg-white px-4 py-5 lg:flex">
        <div className="px-2">
          <Logo className="h-6" />
          <p className="mt-2 text-xs font-semibold tracking-wide text-muted uppercase">{user.role} dashboard</p>
        </div>
        <nav aria-label="Dashboard" className="mt-8 flex flex-col gap-1">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={sideLink}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          <Link to={user.role === 'brand' ? '/#creators' : '/'} className={sideLink({ isActive: false })}>
            <StoreIcon />
            {user.role === 'brand' ? 'Find creators' : 'Marketplace'}
          </Link>
        </nav>
        <div className="mt-auto">
          <Account user={user} onLogout={signOut} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Logo className="h-[22px]" />
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-[#4b5563] ring-1 ring-line"
            >
              <LogOutIcon /> Log out
            </button>
          </div>
          <nav aria-label="Dashboard" className="flex gap-2 overflow-x-auto px-4 pb-3">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={tabLink}>
                {item.label}
              </NavLink>
            ))}
            <Link to={user.role === 'brand' ? '/#creators' : '/'} className={tabLink({ isActive: false })}>
              {user.role === 'brand' ? 'Find creators' : 'Marketplace'}
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1100px] px-4 pt-6 pb-32 sm:px-8 sm:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function DashboardHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-jakarta text-[1.6rem] font-extrabold tracking-tight text-ink sm:text-[1.9rem]">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ title, action, children, className = '', guide }: { title?: string; action?: ReactNode; children: ReactNode; className?: string; guide?: string }) {
  return (
    <section data-guide={guide} className={`min-w-0 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgb(17_19_24/0.04)] sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
