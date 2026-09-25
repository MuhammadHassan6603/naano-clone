import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { CLOUDS, asset, assetSrcSet } from '../lib/assets'
import { AppHeader } from './AppHeader'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function CloudBackdrop({ tall = false }: { tall?: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 -z-10 ${tall ? 'h-full' : 'h-[420px]'}`}>
      <img
        src={asset(CLOUDS, 1920)}
        srcSet={assetSrcSet(CLOUDS)}
        sizes="100vw"
        alt=""
        decoding="async"
        className="size-full object-cover object-bottom"
      />
      <div className="absolute inset-0 bg-[radial-gradient(62%_46%_at_50%_52%,rgb(255_255_255/0.6)_0%,rgb(255_255_255/0.24)_48%,transparent_74%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-page/70 to-page" />
    </div>
  )
}

export function Page({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return (
    <div className="relative isolate">
      <CloudBackdrop />
      <div className={`mx-auto w-full px-5 pt-24 pb-12 sm:px-8 ${narrow ? 'max-w-3xl' : 'max-w-[1200px]'}`}>
        {children}
      </div>
    </div>
  )
}
