import { badRequest } from './errors.js'

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
