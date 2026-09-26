import { type Request, Router } from 'express'
import { db } from '../db.js'
import { getAuth, optionalAuth, requireAuth, requireRole } from '../auth.js'
import { hasTarget, targetOf } from '../fit.js'
import { notFound } from '../errors.js'
import {
  MAX_FOLLOWERS,
  MAX_PRICE_CENTS,
  NICHES,
  SORTS,
  getCreator,
  listCreators,
} from '../creators.js'
import { type Body, idParam, int, objectBody, oneOf, queryInt, queryOneOf, text } from '../validate.js'

export const creatorsRouter = Router()

const brandTarget = async (req: Request) => {
  const target = req.auth?.role === 'brand' ? await targetOf(req.auth.userId) : null
  return hasTarget(target) ? target : null
}

creatorsRouter.get('/', optionalAuth, async (req, res) => {
  const query = req.query as Body
  const target = await brandTarget(req)
  const sort = queryOneOf(query, 'sort', SORTS) ?? (target ? 'fit' : 'reliability')
  const creators = await listCreators(
    {
      niche: queryOneOf(query, 'niche', NICHES),
      maxPriceCents: queryInt(query, 'maxPriceCents', { min: 1, max: MAX_PRICE_CENTS }),
      sort,
    },
    target,
  )
  res.json({ creators, niches: NICHES, sort: sort === 'fit' && !target ? 'reliability' : sort, target })
})

creatorsRouter.get('/:id', optionalAuth, async (req, res) => {
  const creator = await getCreator(idParam(typeof req.params.id === 'string' ? req.params.id : undefined, 'Creator'), await brandTarget(req))
  if (!creator) throw notFound('Creator not found')
  res.json({ creator })
})

creatorsRouter.put('/me/profile', requireAuth, requireRole('creator'), async (req, res) => {
  const body = objectBody(req.body)
  const profile = {
    niche: oneOf(body, 'niche', NICHES),
    bio: text(body, 'bio', { min: 0, max: 1000 }),
    audience: text(body, 'audience', { min: 0, max: 200 }),
    priceCents: int(body, 'priceCents', { min: 1, max: MAX_PRICE_CENTS }),
    followers: int(body, 'followers', { min: 0, max: MAX_FOLLOWERS }),
  }
  const { userId } = getAuth(req)

  await db.creatorProfile.update({ where: { userId }, data: profile })

  const creator = await getCreator(userId)
  if (!creator) throw new Error(`Creator ${userId} not listed right after saving a price`)
  res.json({ creator })
})
