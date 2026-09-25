import { badRequest } from './errors.js'

export type Body = Record<string, unknown>

export function objectBody(body: unknown): Body {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw badRequest('Request body must be a JSON object')
  }
  return body as Body
}

export function text(body: Body, key: string, { min = 1, max }: { min?: number; max: number }): string {
  const value = body[key]
  if (typeof value !== 'string') throw badRequest(`${key} is required`)
  const trimmed = value.trim()
  if (trimmed.length < min) throw badRequest(`${key} must be at least ${min} characters`)
  if (trimmed.length > max) throw badRequest(`${key} must be at most ${max} characters`)
  return trimmed
}

export function oneOf<T extends string>(body: Body, key: string, options: readonly T[]): T {
  const value = body[key]
  if (typeof value !== 'string' || !options.includes(value as T)) {
    throw badRequest(`${key} must be one of: ${options.join(', ')}`)
  }
  return value as T
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function email(body: Body, key = 'email'): string {
  const value = text(body, key, { max: 254 }).toLowerCase()
  if (!EMAIL.test(value)) throw badRequest(`${key} must be a valid email address`)
  return value
}
