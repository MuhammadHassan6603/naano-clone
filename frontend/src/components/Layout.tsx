import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { Footer } from './Footer'
import { ScrollManager } from './ScrollManager'

export function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      <ScrollManager />
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function Page({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return (
    <div className={`mx-auto w-full px-4 py-8 sm:px-6 sm:py-10 ${narrow ? 'max-w-3xl' : 'max-w-6xl'}`}>{children}</div>
  )
}
