import { db } from './db.js'
import type { Prisma } from './generated/prisma/client.js'

export const NICHES = ['AI', 'DevTools', 'Founders', 'HR', 'Marketing', 'RevOps', 'Sales', 'SEO'] as const
export type Niche = (typeof NICHES)[number]

export const SORTS = ['reliability', 'price', 'followers'] as const
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
  reliability: Reliability
}

// Email is deliberately absent: this shape is served to anyone, logged in or not.
const creatorSelect = {
  id: true,
  name: true,
  profile: { select: { niche: true, bio: true, audience: true, priceCents: true, followers: true } },
} satisfies Prisma.UserSelect

type CreatorRow = Prisma.UserGetPayload<{ select: typeof creatorSelect }>

// A creator is listed once they've set a price, which the profile endpoint only allows together with a niche.
export const listed = {
  role: 'creator',
  profile: { is: { priceCents: { not: null }, niche: { not: null } } },
} satisfies Prisma.UserWhereInput

/**
 * Delivered = paid bookings. Total = paid + expired. Declined bookings don't count:
 * turning down a brief is not a failure to deliver.
 */
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
    reliability,
  }
}

/**
 * Ranks by how confident we can be in the delivery rate, not the raw rate: the lower bound
 * of the 95% Wilson score interval. So "5 of 5" outranks "1 of 1", and "4 of 5" outranks
 * "1 of 1" too. New creators (no finished bookings yet) sort after anyone with a track record.
 */
export function reliabilityScore({ delivered, total }: Reliability): number {
  if (total === 0) return -1
  const z = 1.96
  const p = delivered / total
  const z2n = (z * z) / total
  return (p + z2n / 2 - z * Math.sqrt((p * (1 - p)) / total + z2n / (4 * total))) / (1 + z2n)
}

const compare: Record<CreatorSort, (a: PublicCreator, b: PublicCreator) => number> = {
  reliability: (a, b) =>
    reliabilityScore(b.reliability) - reliabilityScore(a.reliability) || b.followers - a.followers,
  price: (a, b) => a.priceCents - b.priceCents || b.followers - a.followers,
  followers: (a, b) => b.followers - a.followers,
}

export async function listCreators(filters: {
  niche?: Niche
  maxPriceCents?: number
  sort: CreatorSort
}): Promise<PublicCreator[]> {
  // ponytail: loads every matching creator and sorts in memory; add SQL ordering + pagination past a few thousand creators.
  const rows = await db.user.findMany({
    where: {
      ...listed,
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
  return rows
    .flatMap((row) => toPublic(row, reliability.get(row.id) ?? { delivered: 0, total: 0 }) ?? [])
    .sort((a, b) => compare[filters.sort](a, b) || a.id.localeCompare(b.id))
}

export async function getCreator(id: string): Promise<PublicCreator | null> {
  const row = await db.user.findFirst({ where: { id, ...listed }, select: creatorSelect })
  if (!row) return null
  const reliability = await reliabilityOf([id])
  return toPublic(row, reliability.get(id) ?? { delivered: 0, total: 0 })
}
