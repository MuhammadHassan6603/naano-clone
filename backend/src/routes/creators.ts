import { type Request, Router } from 'express'
import { db } from '../db.js'
import { getAuth, optionalAuth, requireAuth, requireRole } from '../auth.js'
import { hasTarget, targetOf } from '../fit.js'
import { profileUrl } from '../linkedin.js'
import { Prisma } from '../generated/prisma/client.js'
import { badRequest, conflict } from '../errors.js'
import { notFound } from '../errors.js'
import {
  MAX_FOLLOWERS,
  MAX_PRICE_CENTS,
  NICHES,
  SORTS,
  getCreator,
  listCreators,
} from '../creators.js'
import { type Body, idParam, int, objectBody, oneOf, queryInt, queryOneOf, queryText, text } from '../validate.js'

export const creatorsRouter = Router()

const brandTarget = async (req: Request) => {
  const target = req.auth?.role === 'brand' ? await targetOf(req.auth.userId) : null
  return hasTarget(target) ? target : null
}

creatorsRouter.get('/', optionalAuth, async (req, res) => {
  const query = req.query as Body
  const target = await brandTarget(req)
  const sort = queryOneOf(query, 'sort', SORTS) ?? (target ? 'fit' : 'reliability')
  const q = queryText(query, 'q')?.trim() ?? ''
  if (q.length > 100) throw badRequest('q must be at most 100 characters')
  const pageSize = queryInt(query, 'pageSize', { min: 1, max: 50 })
  const requestedPage = queryInt(query, 'page', { min: 1, max: 10_000 }) ?? 1
  const all = await listCreators(
    {
      niche: queryOneOf(query, 'niche', NICHES),
      maxPriceCents: queryInt(query, 'maxPriceCents', { min: 1, max: MAX_PRICE_CENTS }),
      sort,
      q,
    },
    target,
  )
  const pages = pageSize ? Math.max(1, Math.ceil(all.length / pageSize)) : 1
  const page = Math.min(requestedPage, pages)
  const creators = pageSize ? all.slice((page - 1) * pageSize, page * pageSize) : all
  res.json({
    creators,
    total: all.length,
    page,
    pages,
    pageSize: pageSize ?? all.length,
    q,
    niches: NICHES,
    sort: sort === 'fit' && !target ? 'reliability' : sort,
    target,
  })
})

creatorsRouter.get('/:id', optionalAuth, async (req, res) => {
  const creator = await getCreator(idParam(typeof req.params.id === 'string' ? req.params.id : undefined, 'Creator'), await brandTarget(req))
  if (!creator) throw notFound('Creator not found')
  res.json({ creator })
})

async function claimable(url: string, userId: string) {
  const owner = await db.creatorProfile.findUnique({ where: { linkedinUrl: url }, select: { userId: true } })
  if (owner && owner.userId !== userId) throw conflict('This LinkedIn profile is already linked to another creator on naano.')
}

creatorsRouter.put('/me/profile', requireAuth, requireRole('creator'), async (req, res) => {
  const body = objectBody(req.body)
  const { userId } = getAuth(req)
  const linkedinUrl = profileUrl(text(body, 'linkedinUrl', { max: 300 }))
  const profile = {
    niche: oneOf(body, 'niche', NICHES),
    bio: text(body, 'bio', { min: 0, max: 1000 }),
    audience: text(body, 'audience', { min: 0, max: 200 }),
    priceCents: int(body, 'priceCents', { min: 1, max: MAX_PRICE_CENTS }),
    followers: int(body, 'followers', { min: 0, max: MAX_FOLLOWERS }),
  }
  await claimable(linkedinUrl, userId)
  const data = { ...profile, linkedinUrl }

  await db.creatorProfile.update({ where: { userId }, data }).catch((err: unknown) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw conflict('This LinkedIn profile is already linked to another creator on naano.')
    }
    throw err
  })

  const creator = await getCreator(userId)
  if (!creator) throw new Error(`Creator ${userId} not listed right after saving a price`)
  res.json({ creator })
})
