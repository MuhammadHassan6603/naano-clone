const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function emailProblem(value: string): string | undefined {
  if (!value.trim()) return 'Enter your email address.'
  if (!EMAIL.test(value.trim())) return 'That email address looks incomplete.'
}

export function passwordProblem(value: string): string | undefined {
  if (value.length < 8) return 'Use at least 8 characters.'
  if (new TextEncoder().encode(value).length > 72) return 'That password is too long (72 bytes at most).'
}

export function webUrlProblem(value: string): string | undefined {
  if (!value.trim()) return 'Add the page readers should land on.'
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'Use a link that starts with https://'
  } catch {
    return 'Use a full link, for example https://yourcompany.com/launch'
  }
}

export function lengthProblem(value: string, { min, max, what }: { min: number; max: number; what: string }) {
  const length = value.trim().length
  if (length < min) return `${what} needs at least ${min} characters (${length} so far).`
  if (length > max) return `${what} can be at most ${max} characters.`
}
