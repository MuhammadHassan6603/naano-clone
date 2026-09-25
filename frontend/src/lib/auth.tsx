import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, isAbort, setSessionExpiredHandler, tokenStore } from './api'
import type { Role, Session, User } from './types'

type AuthStatus = 'checking' | 'ready'

type SignupInput = { name: string; email: string; password: string; role: Role }

type AuthValue = {
  status: AuthStatus
  user: User | null
  login: (email: string, password: string) => Promise<User>
  signup: (input: SignupInput) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStore.get() ? 'checking' : 'ready'))
  const [user, setUser] = useState<User | null>(null)

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    setStatus('ready')
  }, [])

  useEffect(() => {
    setSessionExpiredHandler(logout)
    return () => setSessionExpiredHandler(null)
  }, [logout])

  useEffect(() => {
    if (!tokenStore.get()) return
    const controller = new AbortController()
    api<{ user: User }>('/auth/me', { signal: controller.signal })
      .then((result) => setUser(result.user))
      .catch((error: unknown) => {
        if (isAbort(error)) return
        setUser(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setStatus('ready')
      })
    return () => controller.abort()
  }, [])

  const start = useCallback((session: Session) => {
    tokenStore.set(session.token)
    setUser(session.user)
    setStatus('ready')
    return session.user
  }, [])

  const login = useCallback(
    (email: string, password: string) =>
      api<Session>('/auth/login', { method: 'POST', body: { email, password } }).then(start),
    [start],
  )

  const signup = useCallback(
    (input: SignupInput) => api<Session>('/auth/signup', { method: 'POST', body: input }).then(start),
    [start],
  )

  const value = useMemo(() => ({ status, user, login, signup, logout }), [status, user, login, signup, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
