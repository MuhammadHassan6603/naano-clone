import { Router } from 'express'
import { db } from '../db.js'
import { getAuth, requireAuth, requireRole } from '../auth.js'
import { badRequest } from '../errors.js'
import { MAX_PRICE_CENTS, NICHES, type Niche } from '../creators.js'
import { type Body, int, objectBody, text } from '../validate.js'

const EMPTY = { niches: [] as string[], audience: '', budgetCents: null as number | null }
const select = { niches: true, audience: true, budgetCents: true } as const

function niches(body: Body): Niche[] {
  const value = body.niches
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !NICHES.includes(item as Niche))) {
    throw badRequest(`niches must be a list of: ${NICHES.join(', ')}`)
  }
  return NICHES.filter((niche) => value.includes(niche))
}

function budget(body: Body): number | null {
  return body.budgetCents === null || body.budgetCents === undefined ? null : int(body, 'budgetCents', { min: 100, max: MAX_PRICE_CENTS })
}

export const brandsRouter = Router()
brandsRouter.use(requireAuth, requireRole('brand'))

brandsRouter.get('/me/profile', async (req, res) => {
  const profile = await db.brandProfile.findUnique({ where: { userId: getAuth(req).userId }, select })
  res.json({ profile: profile ?? EMPTY, niches: NICHES })
})

brandsRouter.put('/me/profile', async (req, res) => {
  const body = objectBody(req.body)
  const data = { niches: niches(body), audience: text(body, 'audience', { min: 0, max: 200 }), budgetCents: budget(body) }
  const { userId } = getAuth(req)
  const profile = await db.brandProfile.upsert({ where: { userId }, create: { userId, ...data }, update: data, select })
  res.json({ profile, niches: NICHES })
})
