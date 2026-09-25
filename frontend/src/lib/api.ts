const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '')
const TOKEN_KEY = 'naano-rebuild.token'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      return
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      return
    }
  },
}

let onSessionExpired: (() => void) | null = null

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT'
  body?: unknown
  signal?: AbortSignal
}

export async function api<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<T> {
  const token = tokenStore.get()
  let response: Response
  try {
    response = await fetch(BASE_URL + path, {
      method,
      signal,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.")
  }

  const data = (await response.json().catch(() => null)) as { error?: string } | null
  if (!response.ok) {
    if (response.status === 401 && token) onSessionExpired?.()
    throw new ApiError(response.status, data?.error ?? `Something went wrong (error ${response.status}).`)
  }
  return data as T
}

export const toApiError = (error: unknown) =>
  error instanceof ApiError ? error : new ApiError(0, 'Something unexpected went wrong. Please try again.')

export const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'
