import { type Request, Router } from 'express'
import { db } from '../db.js'
import { getAuth, optionalAuth, requireAuth, requireRole } from '../auth.js'
import { hasTarget, targetOf } from '../fit.js'
import { LinkedInNotFound, LinkedInUnavailable, lookupLinkedIn, profileUrl } from '../linkedin.js'
import { Prisma } from '../generated/prisma/client.js'
import { HttpError, conflict } from '../errors.js'
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

const LOOKUPS_PER_MINUTE = 10
const lookups = new Map<string, number[]>()

function limitLookups(userId: string) {
  const now = Date.now()
  const times = (lookups.get(userId) ?? []).filter((at) => now - at < 60_000)
  if (times.length >= LOOKUPS_PER_MINUTE) throw new HttpError(429, 'Too many LinkedIn lookups. Please wait a minute and try again.')
  times.push(now)
  lookups.set(userId, times)
}

async function claimable(url: string, userId: string) {
  const owner = await db.creatorProfile.findUnique({ where: { linkedinUrl: url }, select: { userId: true } })
  if (owner && owner.userId !== userId) throw conflict('This LinkedIn profile is already linked to another creator on naano.')
}

async function verified(url: string) {
  try {
    return await lookupLinkedIn(url)
  } catch (err) {
    if (err instanceof LinkedInUnavailable || err instanceof LinkedInNotFound) return null
    throw err
  }
}

creatorsRouter.post('/me/linkedin', requireAuth, requireRole('creator'), async (req, res) => {
  const { userId } = getAuth(req)
  const url = profileUrl(text(objectBody(req.body), 'url', { max: 300 }))
  await claimable(url, userId)
  limitLookups(userId)
  res.json({ linkedin: await lookupLinkedIn(url) })
})

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
  const linkedin = await verified(linkedinUrl)
  const data = {
    ...profile,
    linkedinUrl,
    ...(linkedin
      ? { followers: Math.min(linkedin.followers, MAX_FOLLOWERS), linkedinName: linkedin.name, followersVerifiedAt: new Date() }
      : { linkedinName: null, followersVerifiedAt: null }),
  }

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
