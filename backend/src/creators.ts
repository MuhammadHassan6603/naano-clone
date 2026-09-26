import { db } from './db.js'
import type { Prisma } from './generated/prisma/client.js'
import { type Fit, type Target, explainFit, hasTarget } from './fit.js'

export const NICHES = ['AI', 'DevTools', 'Founders', 'HR', 'Marketing', 'RevOps', 'Sales', 'SEO'] as const
export type Niche = (typeof NICHES)[number]

export const SORTS = ['fit', 'reliability', 'price', 'followers'] as const
export type CreatorSort = (typeof SORTS)[number]

export const MAX_PRICE_CENTS = 10_000_000
export const MAX_FOLLOWERS = 100_000_000

export type Reliability = { delivered: number; total: number }

export type PublicCreator = {
  id: string
  name: string
  niche: string
  bio: string
  audience: string
  priceCents: number
  followers: number
  linkedinUrl: string | null
  reliability: Reliability
  fit?: Fit
}

const creatorSelect = {
  id: true,
  name: true,
  profile: {
    select: { niche: true, bio: true, audience: true, priceCents: true, followers: true, linkedinUrl: true },
  },
} satisfies Prisma.UserSelect

type CreatorRow = Prisma.UserGetPayload<{ select: typeof creatorSelect }>

export const listed = {
  role: 'creator',
  profile: { is: { priceCents: { not: null }, niche: { not: null } } },
} satisfies Prisma.UserWhereInput

async function reliabilityOf(creatorIds: string[]): Promise<Map<string, Reliability>> {
  const result = new Map(creatorIds.map((id) => [id, { delivered: 0, total: 0 }]))
  if (creatorIds.length === 0) return result

  const groups = await db.booking.groupBy({
    by: ['creatorId', 'status'],
    where: {
      creatorId: { in: creatorIds },
      OR: [{ status: 'paid' }, { status: 'refunded', refundReason: 'expired' }],
    },
    _count: { _all: true },
  })
  for (const group of groups) {
    const entry = result.get(group.creatorId)
    if (!entry) continue
    entry.total += group._count._all
    if (group.status === 'paid') entry.delivered += group._count._all
  }
  return result
}

function toPublic(row: CreatorRow, reliability: Reliability): PublicCreator | null {
  const profile = row.profile
  if (!profile || profile.priceCents === null || profile.niche === null) return null
  return {
    id: row.id,
    name: row.name,
    niche: profile.niche,
    bio: profile.bio,
    audience: profile.audience,
    priceCents: profile.priceCents,
    followers: profile.followers,
    linkedinUrl: profile.linkedinUrl,
    reliability,
  }
}

export function reliabilityScore({ delivered, total }: Reliability): number {
  if (total === 0) return -1
  const z = 1.96
  const p = delivered / total
  const z2n = (z * z) / total
  return (p + z2n / 2 - z * Math.sqrt((p * (1 - p)) / total + z2n / (4 * total))) / (1 + z2n)
}

const compare: Record<CreatorSort, (a: PublicCreator, b: PublicCreator) => number> = {
  fit: (a, b) => (b.fit?.matched ?? 0) - (a.fit?.matched ?? 0) || compare.reliability(a, b),
  reliability: (a, b) =>
    reliabilityScore(b.reliability) - reliabilityScore(a.reliability) || b.followers - a.followers,
  price: (a, b) => a.priceCents - b.priceCents || b.followers - a.followers,
  followers: (a, b) => b.followers - a.followers,
}

export async function listCreators(
  filters: { niche?: Niche; maxPriceCents?: number; sort: CreatorSort; q?: string },
  target: Target | null = null,
): Promise<PublicCreator[]> {
  const words = (filters.q ?? '').toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8)
  const rows = await db.user.findMany({
    where: {
      ...listed,
      AND: words.map((word) => ({
        OR: [
          { name: { contains: word, mode: 'insensitive' as const } },
          {
            profile: {
              is: {
                OR: [
                  { niche: { contains: word, mode: 'insensitive' as const } },
                  { audience: { contains: word, mode: 'insensitive' as const } },
                  { bio: { contains: word, mode: 'insensitive' as const } },
                ],
              },
            },
          },
        ],
      })),
      profile: {
        is: {
          ...listed.profile.is,
          ...(filters.niche && { niche: filters.niche }),
          ...(filters.maxPriceCents && { priceCents: { not: null, lte: filters.maxPriceCents } }),
        },
      },
    },
    select: creatorSelect,
  })
  const reliability = await reliabilityOf(rows.map((row) => row.id))
  const sort = filters.sort === 'fit' && !hasTarget(target) ? 'reliability' : filters.sort
  return rows
    .flatMap((row) => withFit(toPublic(row, reliability.get(row.id) ?? { delivered: 0, total: 0 }), target) ?? [])
    .sort((a, b) => compare[sort](a, b) || a.id.localeCompare(b.id))
}

function withFit(creator: PublicCreator | null, target: Target | null): PublicCreator | null {
  return creator && hasTarget(target) ? { ...creator, fit: explainFit(creator, target) } : creator
}

export async function getCreator(id: string, target: Target | null = null): Promise<PublicCreator | null> {
  const row = await db.user.findFirst({ where: { id, ...listed }, select: creatorSelect })
  if (!row) return null
  const reliability = await reliabilityOf([id])
  return withFit(toPublic(row, reliability.get(id) ?? { delivered: 0, total: 0 }), target)
}
