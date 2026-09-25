import { badRequest, notFound } from './errors.js'

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

type Range = { min: number; max: number }

export function int(body: Body, key: string, { min, max }: Range): number {
  const value = body[key]
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw badRequest(`${key} must be a whole number`)
  }
  if (value < min || value > max) throw badRequest(`${key} must be between ${min} and ${max}`)
  return value
}

export function queryText(query: Body, key: string): string | undefined {
  const value = query[key]
  if (value === undefined) return undefined
  if (typeof value !== 'string') throw badRequest(`${key} must be given once`)
  return value
}

export function queryOneOf<T extends string>(query: Body, key: string, options: readonly T[]): T | undefined {
  return queryText(query, key) === undefined ? undefined : oneOf(query, key, options)
}

export function queryInt(query: Body, key: string, range: Range): number | undefined {
  const value = queryText(query, key)
  if (value === undefined) return undefined
  if (!/^\d+$/.test(value)) throw badRequest(`${key} must be a whole number`)
  return int({ [key]: Number(value) }, key, range)
}

function parseUrl(body: Body, key: string): URL {
  const value = text(body, key, { max: 2000 })
  try {
    return new URL(value)
  } catch {
    throw badRequest(`${key} must be a valid URL`)
  }
}

export function webUrl(body: Body, key: string): string {
  const url = parseUrl(body, key)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw badRequest(`${key} must be an http(s) URL`)
  return url.toString()
}

export function linkedInUrl(body: Body, key: string): string {
  const url = parseUrl(body, key)
  const onLinkedIn = url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com')
  if (url.protocol !== 'https:' || !onLinkedIn) throw badRequest(`${key} must be an https link to a LinkedIn post`)
  return url.toString()
}

export function isoDate(body: Body, key: string): Date {
  const value = text(body, key, { max: 40 })
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw badRequest(`${key} must be an ISO 8601 date`)
  return date
}

export function uuid(body: Body, key: string, what: string): string {
  return idParam(text(body, key, { max: 36 }), what)
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function idParam(value: string | undefined, what: string): string {
  if (!value || !UUID.test(value)) throw notFound(`${what} not found`)
  return value
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function email(body: Body, key = 'email'): string {
  const value = text(body, key, { max: 254 }).toLowerCase()
  if (!EMAIL.test(value)) throw badRequest(`${key} must be a valid email address`)
  return value
}
