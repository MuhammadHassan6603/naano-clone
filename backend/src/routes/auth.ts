import { Router } from 'express'
import { db } from '../db.js'
import { Prisma } from '../generated/prisma/client.js'
import { conflict, unauthorized } from '../errors.js'
import { email, objectBody, oneOf, text } from '../validate.js'
import {
  ROLES,
  getAuth,
  hashPassword,
  password,
  requireAuth,
  signToken,
  verifyPassword,
} from '../auth.js'

export const publicUser = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect

const ownProfile = {
  niche: true,
  bio: true,
  audience: true,
  priceCents: true,
  followers: true,
  linkedinUrl: true,
} satisfies Prisma.CreatorProfileSelect

const isUniqueViolation = (err: unknown) =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'

export const authRouter = Router()

authRouter.post('/signup', async (req, res) => {
  const body = objectBody(req.body)
  const input = {
    email: email(body),
    name: text(body, 'name', { max: 100 }),
    role: oneOf(body, 'role', ROLES),
  }
  const passwordHash = await hashPassword(password(body))

  const user = await db.user
    .create({
      data: {
        ...input,
        passwordHash,
        wallet: { create: {} },
        profile: input.role === 'creator' ? { create: {} } : undefined,
      },
      select: publicUser,
    })
    .catch((err: unknown) => {
      if (isUniqueViolation(err)) throw conflict('An account with this email already exists')
      throw err
    })

  res.status(201).json({ token: signToken({ userId: user.id, role: user.role }), user })
})

authRouter.post('/login', async (req, res) => {
  const body = objectBody(req.body)
  const address = email(body)
  const plain = typeof body.password === 'string' ? body.password : ''

  const found = await db.user.findUnique({
    where: { email: address },
    select: { ...publicUser, passwordHash: true },
  })
  const ok = await verifyPassword(plain, found?.passwordHash)
  if (!found || !ok) throw unauthorized('Wrong email or password')

  const { passwordHash: _hash, ...user } = found
  res.json({ token: signToken({ userId: user.id, role: user.role }), user })
})

authRouter.get('/me', requireAuth, async (req, res) => {
  const found = await db.user.findUnique({
    where: { id: getAuth(req).userId },
    select: { ...publicUser, profile: { select: ownProfile } },
  })
  if (!found) throw unauthorized('Account no longer exists')

  const { profile, ...user } = found
  res.json(profile ? { user, profile } : { user })
})
