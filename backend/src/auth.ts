import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Request, RequestHandler } from 'express'
import { env } from './env.js'
import { badRequest, forbidden, unauthorized } from './errors.js'
import type { Body } from './validate.js'
import type { Role } from './generated/prisma/enums.js'

export const ROLES = ['brand', 'creator'] as const satisfies readonly Role[]

export type AuthClaims = { userId: string; role: Role }

declare global {
  namespace Express {
    interface Request {
      auth?: AuthClaims
    }
  }
}

const BCRYPT_COST = 10
const TOKEN_TTL = '7d'

// bcrypt only reads the first 72 bytes, so longer passwords would silently match on a prefix.
export function password(body: Body): string {
  const value = body.password
  if (typeof value !== 'string') throw badRequest('password is required')
  const bytes = Buffer.byteLength(value, 'utf8')
  if (value.length < 8) throw badRequest('password must be at least 8 characters')
  if (bytes > 72) throw badRequest('password must be at most 72 bytes')
  return value
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, BCRYPT_COST)

// Comparing against a real hash even when the email is unknown keeps login timing
// the same either way, so response time doesn't reveal which emails have accounts.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-real-password', BCRYPT_COST)

export const verifyPassword = (plain: string, hash: string | undefined) =>
  bcrypt.compare(plain, hash ?? DUMMY_HASH).then((match) => match && hash !== undefined)

export const signToken = (claims: AuthClaims) =>
  jwt.sign({ role: claims.role }, env.jwtSecret, {
    subject: claims.userId,
    expiresIn: TOKEN_TTL,
    algorithm: 'HS256',
  })

function readToken(header: string | undefined): AuthClaims {
  const [scheme, token] = header?.split(' ') ?? []
  if (scheme !== 'Bearer' || !token) throw unauthorized()
  try {
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] })
    if (typeof payload === 'string' || typeof payload.sub !== 'string') throw new Error('bad payload')
    if (!ROLES.includes(payload.role)) throw new Error('bad role')
    return { userId: payload.sub, role: payload.role }
  } catch {
    throw unauthorized('Invalid or expired token')
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  req.auth = readToken(req.headers.authorization)
  next()
}

export const requireRole =
  (role: Role): RequestHandler =>
  (req, _res, next) => {
    if (getAuth(req).role !== role) throw forbidden(`Only ${role}s can do this`)
    next()
  }

export function getAuth(req: Request): AuthClaims {
  if (!req.auth) throw unauthorized()
  return req.auth
}
