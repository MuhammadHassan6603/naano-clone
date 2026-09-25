function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}`)
  return value
}

function positiveNumber(name: string, fallback: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be a positive number`)
  return value
}

const jwtSecret = required('JWT_SECRET')
if (jwtSecret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters')

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret,
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  port: Number(process.env.PORT ?? 4000),
  publicApiUrl: process.env.PUBLIC_API_URL?.replace(/\/+$/, '') || undefined,
  autoApproveMs: positiveNumber('AUTO_APPROVE_HOURS', 72) * 3_600_000,
}
