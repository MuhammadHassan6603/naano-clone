import { useCallback, useEffect, useRef, useState } from 'react'
import { type ApiError, api, isAbort, toApiError } from './api'

const SLOW_AFTER_MS = 4000

export const REFRESH_EVENT = 'naano:refresh'

type State<T> = { data: T | undefined; error: ApiError | undefined; loading: boolean }

export function useApi<T>(path: string | null, { refreshOnFocus = false }: { refreshOnFocus?: boolean } = {}) {
  const [state, setState] = useState<State<T>>({ data: undefined, error: undefined, loading: path !== null })
  const [slow, setSlow] = useState(false)
  const [version, setVersion] = useState(0)
  const lastPath = useRef(path)

  useEffect(() => {
    if (path === null) return
    const samePath = lastPath.current === path
    lastPath.current = path
    const controller = new AbortController()
    setState((current) => ({ data: samePath ? current.data : undefined, error: undefined, loading: true }))
    setSlow(false)
    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS)

    api<T>(path, { signal: controller.signal })
      .then((data) => setState({ data, error: undefined, loading: false }))
      .catch((error: unknown) => {
        if (isAbort(error)) return
        setState((current) => ({ data: current.data, error: toApiError(error), loading: false }))
      })
      .finally(() => window.clearTimeout(slowTimer))

    return () => {
      controller.abort()
      window.clearTimeout(slowTimer)
    }
  }, [path, version])

  const reload = useCallback(() => setVersion((value) => value + 1), [])
  const replace = useCallback((data: T) => setState({ data, error: undefined, loading: false }), [])

  useEffect(() => {
    if (!refreshOnFocus || path === null) return
    const onVisible = () => document.visibilityState === 'visible' && reload()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener(REFRESH_EVENT, reload)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener(REFRESH_EVENT, reload)
    }
  }, [refreshOnFocus, path, reload])

  return { ...state, slow: slow && state.loading, reload, replace }
}
