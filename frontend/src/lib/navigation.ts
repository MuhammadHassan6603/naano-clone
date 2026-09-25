import { useEffect } from 'react'
import type { Role } from './types'

const SITE_NAME = 'Naano Rebuild'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${SITE_NAME}`
  }, [title])
}

export function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null
  return value
}

export const homeFor = (role: Role) => (role === 'brand' ? '/' : '/wallet')

export const withNext = (path: string, next: string | null) =>
  next ? `${path}${path.includes('?') ? '&' : '?'}next=${encodeURIComponent(next)}` : path
