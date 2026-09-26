import { db } from './db.js'
import type { PublicCreator } from './creators.js'

export type Target = { niches: string[]; audience: string; budgetCents: number | null }
export type FitReason = { kind: 'niche' | 'audience' | 'budget'; match: boolean; label: string }
export type Fit = { matched: number; reasons: FitReason[] }

const STOPWORDS = new Set(
  'and the for with who are our from that this into your their them they has have was were will can all any not but its per via b2b company companies people team teams based'.split(' '),
)

const stem = (word: string) => (word.length > 4 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word)

function keywords(text: string): Map<string, string> {
  const found = new Map<string, string>()
  for (const word of text.match(/[A-Za-z0-9]+/g) ?? []) {
    const lower = word.toLowerCase()
    if (lower.length < 3 || STOPWORDS.has(lower)) continue
    const key = stem(lower)
    if (!found.has(key)) found.set(key, word)
  }
  return found
}

const wholeMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const exactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const money = (cents: number) => (cents % 100 === 0 ? wholeMoney : exactMoney).format(cents / 100)

export const hasTarget = (target: Target | null): target is Target =>
  Boolean(target && (target.niches.length || target.audience.trim() || target.budgetCents))

export function explainFit(creator: Pick<PublicCreator, 'niche' | 'audience' | 'priceCents'>, target: Target): Fit {
  const reasons: FitReason[] = []
  if (target.niches.length) {
    const match = target.niches.includes(creator.niche)
    reasons.push({ kind: 'niche', match, label: match ? `${creator.niche} niche` : `${creator.niche}, outside your niches` })
  }
  if (target.audience.trim()) {
    const wanted = keywords(target.audience)
    const theirs = keywords(creator.audience)
    const shared = [...theirs].filter(([key]) => wanted.has(key)).map(([, original]) => original)
    reasons.push(
      shared.length
        ? { kind: 'audience', match: true, label: `Audience: ${shared.slice(0, 3).join(', ')}` }
        : { kind: 'audience', match: false, label: 'Different audience' },
    )
  }
  if (target.budgetCents) {
    const over = creator.priceCents - target.budgetCents
    reasons.push(
      over <= 0
        ? { kind: 'budget', match: true, label: `Within your ${money(target.budgetCents)} budget` }
        : { kind: 'budget', match: false, label: `${money(over)} over your budget` },
    )
  }
  return { matched: reasons.filter((reason) => reason.match).length, reasons }
}

export async function targetOf(userId: string): Promise<Target | null> {
  return db.brandProfile.findUnique({ where: { userId }, select: { niches: true, audience: true, budgetCents: true } })
}
