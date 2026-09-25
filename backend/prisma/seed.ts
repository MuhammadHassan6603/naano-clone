/**
 * Demo data: 2 brands, 8 creators, and bookings in every state.
 *
 *   npm run seed        → the database in .env (the Neon test branch)
 *   npm run seed:prod   → production (.env.prod.local)
 *
 * Everything goes through escrow.ts with past timestamps, so balances, ledger rows and
 * reliability scores are exactly what real use would have produced. It refuses to run twice.
 */
import { db } from '../src/db.js'
import { hashPassword } from '../src/auth.js'
import { hashIp } from '../src/ip.js'
import * as escrow from '../src/escrow.js'
import { env } from '../src/env.js'
import type { Niche } from '../src/creators.js'

export const DEMO_PASSWORD = 'naano-demo-2026'
const DAY = 86_400_000
const HOUR = 3_600_000
const NOW = Date.now()
const ago = (days: number) => new Date(NOW - days * DAY)
const plus = (date: Date, ms: number) => new Date(date.getTime() + ms)

const BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'

const brands = [
  { key: 'acme', name: 'Acme CRM', email: 'acme@demo.test', site: 'https://acme-crm.example', topUpCents: 1_000_000 },
  { key: 'pipewise', name: 'Pipewise', email: 'pipewise@demo.test', site: 'https://pipewise.example', topUpCents: 1_000_000 },
] as const

const creators = [
  { key: 'maya', name: 'Maya Okafor', niche: 'RevOps', price: 45_000, followers: 18_400,
    bio: 'Ex-VP Sales turned RevOps operator. I write about pipeline hygiene and forecasts that hold up.',
    audience: 'SaaS founders and sales leaders, seed to Series B' },
  { key: 'daniel', name: 'Daniel Reyes', niche: 'Sales', price: 60_000, followers: 31_200,
    bio: 'Enterprise AE for 9 years. Daily notes on discovery calls, objection handling and closing.',
    audience: 'Account executives and sales managers at B2B SaaS companies' },
  { key: 'priya', name: 'Priya Nair', niche: 'AI', price: 90_000, followers: 52_000,
    bio: 'ML engineer writing plain-language breakdowns of AI tools that actually ship.',
    audience: 'Engineering leaders and technical founders evaluating AI' },
  { key: 'tom', name: 'Tom Becker', niche: 'DevTools', price: 35_000, followers: 9_800,
    bio: 'Staff engineer. I review developer tools honestly, including the ones I stop using.',
    audience: 'Backend and platform engineers' },
  { key: 'sofia', name: 'Sofia Lindqvist', niche: 'Marketing', price: 50_000, followers: 24_300,
    bio: 'B2B demand gen lead. Teardowns of campaigns that worked, and a few that did not.',
    audience: 'Heads of marketing and demand gen at Series A to C companies' },
  { key: 'james', name: 'James Whitfield', niche: 'Founders', price: 120_000, followers: 88_000,
    bio: 'Two-time founder, one exit. Writing about the unglamorous parts of building a company.',
    audience: 'Early-stage founders and operators' },
  { key: 'aisha', name: 'Aisha Rahman', niche: 'HR', price: 25_000, followers: 7_200,
    bio: 'People ops at a 300-person scale-up. Hiring, onboarding and keeping good people.',
    audience: 'HR leaders and hiring managers' },
  { key: 'lucas', name: 'Lucas Moreau', niche: 'SEO', price: 30_000, followers: 12_500,
    bio: 'Technical SEO consultant. Case studies with real traffic numbers.',
    audience: 'Content and growth teams at SaaS companies' },
] as const satisfies readonly { niche: Niche }[]

type BrandKey = (typeof brands)[number]['key']
type CreatorKey = (typeof creators)[number]['key']

const siteOf = Object.fromEntries(brands.map((b) => [b.key, b.site])) as Record<BrandKey, string>

async function createUsers() {
  const passwordHash = await hashPassword(DEMO_PASSWORD)
  const ids = {} as Record<BrandKey | CreatorKey, string>
  for (const brand of brands) {
    const user = await db.user.create({
      data: { email: brand.email, name: brand.name, role: 'brand', passwordHash, wallet: { create: {} }, createdAt: ago(40) },
    })
    ids[brand.key] = user.id
    await escrow.topUp(user.id, brand.topUpCents, ago(40))
  }
  for (const c of creators) {
    const user = await db.user.create({
      data: {
        email: `${c.key}@demo.test`,
        name: c.name,
        role: 'creator',
        passwordHash,
        createdAt: ago(40),
        wallet: { create: {} },
        profile: {
          create: { niche: c.niche, bio: c.bio, audience: c.audience, priceCents: c.price, followers: c.followers },
        },
      },
    })
    ids[c.key] = user.id
  }
  return ids
}

type Outcome = 'requested' | 'accepted' | 'submitted' | 'paid-brand' | 'paid-click' | 'paid-timeout' | 'declined' | 'expired'

const briefs: Record<BrandKey, string> = {
  acme: 'Share how your team keeps its CRM clean without nagging reps. Mention the Acme CRM pipeline health score and link the free trial.',
  pipewise: 'Write about one forecasting mistake you have seen and how Pipewise catches it early. Keep it in your own voice; link our demo page.',
}

let postCounter = 0
let visitorCounter = 0

/** Adds human clicks from distinct visitors, spread over the given times. */
async function addClicks(bookingId: string, times: Date[]) {
  await db.click.createMany({
    data: times.map((clickedAt) => ({
      bookingId,
      clickedAt,
      ipHash: hashIp(`198.51.100.${(visitorCounter++ % 250) + 1}`),
      userAgent: BROWSER,
    })),
  })
}

/**
 * Plays one booking forward through escrow.ts. `start` is when it was booked; every later
 * step happens at a fixed offset from it, so the timeline reads naturally.
 */
async function play(ids: Record<BrandKey | CreatorKey, string>, brand: BrandKey, creator: CreatorKey, outcome: Outcome, start: Date) {
  const deadline = outcome === 'expired' ? plus(start, 3 * DAY) : plus(start, 7 * DAY)
  const id = await escrow.createBooking(
    {
      brandId: ids[brand],
      creatorId: ids[creator],
      brief: briefs[brand],
      destinationUrl: `${siteOf[brand]}/linkedin?utm_source=${creator}`,
      deadline,
    },
    start,
  )
  if (outcome === 'requested') return id
  if (outcome === 'declined') return escrow.decline(id, plus(start, 20 * HOUR)).then(() => id)
  if (outcome === 'expired') return escrow.refund(id, 'expired', plus(deadline, HOUR)).then(() => id)

  const acceptedAt = plus(start, 6 * HOUR)
  await escrow.accept(id, acceptedAt)
  if (outcome === 'accepted') return id

  // The creator posts, a few readers click, and then the creator submits the link.
  const postedAt = plus(start, 30 * HOUR)
  await addClicks(id, [plus(postedAt, 20 * 60_000), plus(postedAt, 2 * HOUR), plus(postedAt, 5 * HOUR)])
  const submittedAt = plus(postedAt, 6 * HOUR)
  const postUrl = `https://www.linkedin.com/posts/${creator}-demo_activity-${7_300_000_000 + ++postCounter}`
  await escrow.submit(id, { postUrl, submitIpHash: hashIp('203.0.113.50') }, submittedAt)
  if (outcome === 'submitted') return id

  if (outcome === 'paid-brand') await escrow.approve(id, plus(submittedAt, 9 * HOUR))
  if (outcome === 'paid-click') {
    const firstClickAfterSubmit = plus(submittedAt, 25 * 60_000)
    await addClicks(id, [firstClickAfterSubmit])
    await escrow.pay(id, 'click', firstClickAfterSubmit)
  }
  if (outcome === 'paid-timeout') await escrow.pay(id, 'timeout', plus(submittedAt, env.autoApproveMs + 10 * 60_000))
  return id
}

async function main() {
  const host = new URL(env.databaseUrl).hostname
  console.log(`seeding ${host}`)
  if (await db.user.findUnique({ where: { email: brands[0].email } })) {
    console.log('already seeded (acme@demo.test exists); nothing to do')
    return
  }

  const ids = await createUsers()
  console.log('created 2 brands and 8 creators')

  // Track records, booked by Pipewise over the past month. Declines don't count against anyone.
  const history: [CreatorKey, Outcome][] = [
    ['maya', 'paid-brand'], ['maya', 'paid-click'], ['maya', 'paid-brand'], ['maya', 'paid-timeout'], ['maya', 'expired'],
    ['daniel', 'paid-brand'], ['daniel', 'paid-click'], ['daniel', 'paid-brand'],
    ['priya', 'paid-click'], ['priya', 'paid-brand'], ['priya', 'paid-brand'], ['priya', 'paid-click'], ['priya', 'paid-brand'],
    ['tom', 'paid-brand'],
    ['sofia', 'paid-brand'], ['sofia', 'expired'], ['sofia', 'paid-click'],
    ['aisha', 'declined'], ['aisha', 'paid-brand'],
  ]
  for (const [index, [creator, outcome]] of history.entries()) {
    await play(ids, 'pipewise', creator, outcome, ago(32 - index))
  }
  console.log(`played ${history.length} past bookings for reliability history`)

  // Acme is the account a reviewer logs into: one booking in every state.
  const acme: [CreatorKey, Outcome, Date][] = [
    ['tom', 'paid-timeout', ago(12)],
    ['james', 'paid-click', ago(10)],
    ['sofia', 'expired', ago(9)],
    ['tom', 'paid-brand', ago(8)],
    ['aisha', 'declined', ago(5)],
    ['priya', 'submitted', plus(ago(0), -44 * HOUR)],
    ['daniel', 'accepted', ago(1)],
    ['maya', 'requested', plus(ago(0), -2 * HOUR)],
  ]
  for (const [creator, outcome, start] of acme) await play(ids, 'acme', creator, outcome, start)
  console.log(`played ${acme.length} Acme bookings, one per state`)

  console.log(`\nDemo logins (password: ${DEMO_PASSWORD})`)
  for (const b of brands) console.log(`  brand    ${b.email}`)
  for (const c of creators) console.log(`  creator  ${c.key}@demo.test`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
