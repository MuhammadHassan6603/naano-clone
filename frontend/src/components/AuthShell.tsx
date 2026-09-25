import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { ArrowLeftIcon } from './ui/Icons'

type AuthShellProps = {
  children: ReactNode
  asideTitle: string
  aside: ReactNode
}

export function AuthShell({ children, asideTitle, aside }: AuthShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-white lg:flex-row">
      <div className="flex flex-1 items-start justify-center px-5 py-8 sm:px-10 lg:items-center lg:py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between">
            <Logo className="h-7" />
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4b5563] hover:text-[#111827]">
              <ArrowLeftIcon /> Marketplace
            </Link>
          </div>
          {children}
        </div>
      </div>
      <aside className="flex flex-1 items-start justify-center bg-[#2563eb] px-5 py-10 text-white sm:px-10 lg:items-center lg:p-12">
        <div className="w-full max-w-md">
          <h2 className="font-jakarta mb-4 text-3xl font-bold text-white">{asideTitle}</h2>
          {aside}
        </div>
      </aside>
    </div>
  )
}

export const authTitle = 'font-jakarta text-[1.75rem] font-extrabold tracking-tight text-[#0f172a]'
