import { HttpError, badRequest } from './errors.js'

export type LinkedInProfile = { url: string; name: string; followers: number }

const BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
const HIT_TTL_MS = 15 * 60_000
const MISS_TTL_MS = 60_000
const MAX_HTML = 3_000_000

export class LinkedInUnavailable extends HttpError {
  constructor() {
    super(503, "LinkedIn doesn't show this profile's follower count to outside apps, which is common. Enter your followers yourself: brands will see them as self-reported, with a link to your LinkedIn profile so they can check.")
  }
}

export class LinkedInNotFound extends HttpError {
  constructor() {
    super(422, "We couldn't find a follower count on this LinkedIn profile. Check the link is right. Enter your followers yourself: brands will see them as self-reported, with a link to your LinkedIn profile so they can check.")
  }
}

export function profileUrl(input: string): string {
  const raw = input.trim()
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    throw badRequest('Use your LinkedIn profile link, like https://www.linkedin.com/in/your-name')
  }
  const host = url.hostname.toLowerCase()
  const slug = url.pathname.match(/^\/in\/([^/]+)\/?/i)?.[1]
  const onLinkedIn = host === 'linkedin.com' || host.endsWith('.linkedin.com')
  let decoded = ''
  try {
    decoded = slug ? decodeURIComponent(slug) : ''
  } catch {
    decoded = ''
  }
  if (!onLinkedIn || !/^[\p{L}\p{N}_-]{3,100}$/u.test(decoded)) {
    throw badRequest('Use your LinkedIn profile link, like https://www.linkedin.com/in/your-name')
  }
  return `https://www.linkedin.com/in/${encodeURIComponent(decoded.toLowerCase())}`
}

type Json = Record<string, unknown>

function nodes(value: unknown): Json[] {
  if (Array.isArray(value)) return value.flatMap(nodes)
  if (value && typeof value === 'object') {
    const node = value as Json
    return [node, ...nodes(node['@graph'])]
  }
  return []
}

function followsOf(person: Json): number | undefined {
  const stats = ([] as unknown[]).concat(person.interactionStatistic ?? [])
  for (const stat of stats) {
    const entry = stat as Json
    if (typeof entry?.interactionType === 'string' && entry.interactionType.endsWith('FollowAction')) {
      const count = Number(entry.userInteractionCount)
      if (Number.isSafeInteger(count) && count >= 0) return count
    }
  }
  return undefined
}

export function parseProfile(html: string, url: string): LinkedInProfile | null {
  const slug = url.split('/in/')[1]
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  const people: Json[] = []
  for (const [, body] of blocks) {
    try {
      people.push(...nodes(JSON.parse(body)).filter((node) => node['@type'] === 'Person'))
    } catch {
      continue
    }
  }
  const counted = people.filter((person) => followsOf(person) !== undefined)
  const person =
    counted.find((p) => typeof p.url === 'string' && p.url.toLowerCase().replace(/\/$/, '').endsWith(`/in/${slug}`)) ??
    (counted.length === 1 ? counted[0] : undefined)
  if (!person) return null
  const name = typeof person.name === 'string' && person.name.trim() ? person.name.trim() : slug
  return { url, name, followers: followsOf(person)! }
}

const cache = new Map<string, { at: number; result: LinkedInProfile | HttpError }>()

export async function lookupLinkedIn(input: string): Promise<LinkedInProfile> {
  const url = profileUrl(input)
  const cached = cache.get(url)
  if (cached && Date.now() - cached.at < (cached.result instanceof HttpError ? MISS_TTL_MS : HIT_TTL_MS)) {
    if (cached.result instanceof HttpError) throw cached.result
    return cached.result
  }

  const remember = (result: LinkedInProfile | HttpError) => {
    if (cache.size > 500) cache.clear()
    cache.set(url, { at: Date.now(), result })
    if (result instanceof HttpError) throw result
    return result
  }

  let response: Response
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': BROWSER, Accept: 'text/html', 'Accept-Language': 'en-US,en;q=0.9' },
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
    })
  } catch (err) {
    console.error(`LinkedIn lookup for ${url} failed:`, err instanceof Error ? err.message : err)
    throw new LinkedInUnavailable()
  }
  if (response.status === 404) return remember(new LinkedInNotFound())
  if (!response.ok || /authwall|login|checkpoint/.test(response.url)) {
    console.error(`LinkedIn lookup for ${url} answered ${response.status} at ${response.url}`)
    return remember(new LinkedInUnavailable())
  }
  const html = (await response.text()).slice(0, MAX_HTML)
  const profile = parseProfile(html, url)
  return remember(profile ?? new LinkedInNotFound())
}
