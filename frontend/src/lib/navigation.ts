import { useEffect } from 'react'

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

export const DASHBOARD = '/dashboard'

export const withNext = (path: string, next: string | null) =>
  next ? `${path}${path.includes('?') ? '&' : '?'}next=${encodeURIComponent(next)}` : path
