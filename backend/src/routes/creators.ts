import { Router } from 'express'
import { db } from '../db.js'
import { getAuth, requireAuth, requireRole } from '../auth.js'
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

creatorsRouter.get('/', async (req, res) => {
  const query = req.query as Body
  const creators = await listCreators({
    niche: queryOneOf(query, 'niche', NICHES),
    maxPriceCents: queryInt(query, 'maxPriceCents', { min: 1, max: MAX_PRICE_CENTS }),
    sort: queryOneOf(query, 'sort', SORTS) ?? 'reliability',
  })
  res.json({ creators, niches: NICHES })
})

creatorsRouter.get('/:id', async (req, res) => {
  const creator = await getCreator(idParam(req.params.id, 'Creator'))
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
