import { db } from '../src/db.js'
import type { Tx } from '../src/escrow.js'
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
  { key: 'pipewise', name: 'Pipewise', email: 'pipewise@demo.test', site: 'https://pipewise.example', topUpCents: 2_000_000 },
] as const

const creators = [
  { key: 'olivia', name: 'Olivia Bennett', niche: 'RevOps', price: 45_000, followers: 18_400,
    bio: 'Ex-VP Sales turned RevOps operator. I write about pipeline hygiene and forecasts that hold up.',
    audience: 'SaaS founders and sales leaders, seed to Series B' },
  { key: 'daniel', name: 'Daniel Hughes', niche: 'Sales', price: 60_000, followers: 31_200,
    bio: 'Enterprise AE for 9 years. Daily notes on discovery calls, objection handling and closing.',
    audience: 'Account executives and sales managers at B2B SaaS companies' },
  { key: 'emily', name: 'Emily Carter', niche: 'AI', price: 90_000, followers: 52_000,
    bio: 'ML engineer writing plain-language breakdowns of AI tools that actually ship.',
    audience: 'Engineering leaders and technical founders evaluating AI' },
  { key: 'tom', name: 'Tom Walker', niche: 'DevTools', price: 35_000, followers: 9_800,
    bio: 'Staff engineer. I review developer tools honestly, including the ones I stop using.',
    audience: 'Backend and platform engineers' },
  { key: 'sophie', name: 'Sophie Mitchell', niche: 'Marketing', price: 50_000, followers: 24_300,
    bio: 'B2B demand gen lead. Teardowns of campaigns that worked, and a few that did not.',
    audience: 'Heads of marketing and demand gen at Series A to C companies' },
  { key: 'james', name: 'James Whitfield', niche: 'Founders', price: 120_000, followers: 88_000,
    bio: 'Two-time founder, one exit. Writing about the unglamorous parts of building a company.',
    audience: 'Early-stage founders and operators' },
  { key: 'hannah', name: 'Hannah Brooks', niche: 'HR', price: 25_000, followers: 7_200,
    bio: 'People ops at a 300-person scale-up. Hiring, onboarding and keeping good people.',
    audience: 'HR leaders and hiring managers' },
  { key: 'lucas', name: 'Lucas Grant', niche: 'SEO', price: 30_000, followers: 12_500,
    bio: 'Technical SEO consultant. Case studies with real traffic numbers.',
    audience: 'Content and growth teams at SaaS companies' },
  { key: 'hassan', name: 'Muhammad Hassan', niche: 'AI', price: 40_000, followers: 2_400,
    bio: 'Full-stack engineer building AI products. I write about shipping fast with small teams and the tools that make it possible.',
    audience: 'Engineering leads and founders at early-stage SaaS companies',
    linkedinUrl: 'https://www.linkedin.com/in/muhammad-hassan05' },
] as const satisfies readonly (Record<string, unknown> & { niche: Niche })[]

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
    await escrow.topUp(user.id, brand.topUpCents, { at: ago(40) })
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
          create: {
            niche: c.niche,
            bio: c.bio,
            audience: c.audience,
            priceCents: c.price,
            followers: c.followers,
            linkedinUrl: 'linkedinUrl' in c ? c.linkedinUrl : null,
          },
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

async function addClicks(tx: Tx, bookingId: string, times: Date[]) {
  await tx.click.createMany({
    data: times.map((clickedAt) => ({
      bookingId,
      clickedAt,
      ipHash: hashIp(`198.51.100.${(visitorCounter++ % 250) + 1}`),
      userAgent: BROWSER,
    })),
  })
}

function play(ids: Record<BrandKey | CreatorKey, string>, brand: BrandKey, creator: CreatorKey, outcome: Outcome, start: Date) {
  return db.$transaction((tx) => playSteps(tx, ids, brand, creator, outcome, start), { ...escrow.TX_LIMITS, timeout: 60_000 })
}

async function playSteps(
  tx: Tx,
  ids: Record<BrandKey | CreatorKey, string>,
  brand: BrandKey,
  creator: CreatorKey,
  outcome: Outcome,
  start: Date,
) {
  const deadline = outcome === 'expired' ? plus(start, 3 * DAY) : plus(start, 7 * DAY)
  const id = await escrow.createBooking(
    {
      brandId: ids[brand],
      creatorId: ids[creator],
      brief: briefs[brand],
      destinationUrl: `${siteOf[brand]}/linkedin?utm_source=${creator}`,
      deadline,
    },
    { at: start, tx },
  )
  if (outcome === 'requested') return id
  if (outcome === 'declined') return escrow.decline(id, { at: plus(start, 20 * HOUR), tx }).then(() => id)
  if (outcome === 'expired') return escrow.refund(id, 'expired', { at: plus(deadline, HOUR), tx }).then(() => id)

  await escrow.accept(id, { at: plus(start, 6 * HOUR), tx })
  if (outcome === 'accepted') return id

  const postedAt = plus(start, 30 * HOUR)
  await addClicks(tx, id, [plus(postedAt, 20 * 60_000), plus(postedAt, 2 * HOUR), plus(postedAt, 5 * HOUR)])
  const submittedAt = plus(postedAt, 6 * HOUR)
  const postUrl = `https://www.linkedin.com/posts/${creator}-demo_activity-${7_300_000_000 + ++postCounter}`
  await escrow.submit(id, { postUrl, submitIpHash: hashIp('203.0.113.50') }, { at: submittedAt, tx })
  if (outcome === 'submitted') return id

  if (outcome === 'paid-brand') await escrow.approve(id, { at: plus(submittedAt, 9 * HOUR), tx })
  if (outcome === 'paid-click') {
    const firstClickAfterSubmit = plus(submittedAt, 25 * 60_000)
    await addClicks(tx, id, [firstClickAfterSubmit])
    await escrow.pay(id, 'click', { at: firstClickAfterSubmit, tx })
  }
  if (outcome === 'paid-timeout') {
    await escrow.pay(id, 'timeout', { at: plus(submittedAt, env.autoApproveMs + 10 * 60_000), tx })
  }
  return id
}

const targets: Record<BrandKey, { niches: Niche[]; audience: string; budgetCents: number }> = {
  acme: { niches: ['RevOps', 'Sales'], audience: 'SaaS founders, sales leaders and RevOps teams', budgetCents: 60_000 },
  pipewise: { niches: ['Founders', 'Sales', 'AI'], audience: 'Early-stage founders and account executives', budgetCents: 100_000 },
}

type Line = { from: 'brand' | 'creator'; body: string }
const conversations: { creator: CreatorKey; lines: Line[]; brandReads: number; creatorReads: number }[] = [
  {
    creator: 'emily',
    lines: [
      { from: 'brand', body: 'Hi Emily, excited for this one. Could you mention the pipeline health score by name?' },
      { from: 'creator', body: "Absolutely. I'll show it on a real forecast screenshot so it doesn't read like an ad." },
      { from: 'creator', body: 'The post is live. The link is in the booking and clicks are already coming in.' },
    ],
    brandReads: 2,
    creatorReads: 3,
  },
  {
    creator: 'daniel',
    lines: [
      { from: 'creator', body: 'Thanks for the booking! Is there a discount code you want me to include?' },
      { from: 'brand', body: 'No code this time, just the free-trial link. Thanks for asking.' },
    ],
    brandReads: 2,
    creatorReads: 2,
  },
  {
    creator: 'olivia',
    lines: [{ from: 'brand', body: 'Hi Olivia! Happy to send screenshots of the pipeline health score if that helps with the post.' }],
    brandReads: 1,
    creatorReads: 0,
  },
]

async function addExtras() {
  const users = await db.user.findMany({
    where: { email: { in: [...brands.map((b) => b.email), ...creators.map((c) => `${c.key}@demo.test`)] } },
    select: { id: true, email: true },
  })
  const idOf = (email: string) => users.find((u) => u.email === email)?.id
  for (const brand of brands) {
    const userId = idOf(brand.email)
    if (!userId || (await db.brandProfile.findUnique({ where: { userId } }))) continue
    await db.brandProfile.create({ data: { userId, ...targets[brand.key] } })
    console.log(`set who ${brand.name} sells to`)
  }

  const acmeId = idOf(brands[0].email)
  for (const talk of conversations) {
    const creatorId = idOf(`${talk.creator}@demo.test`)
    if (!acmeId || !creatorId) continue
    const booking = await db.booking.findFirst({
      where: { brandId: acmeId, creatorId, status: { in: ['requested', 'accepted', 'submitted'] } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, acceptedAt: true, submittedAt: true, _count: { select: { messages: true } } },
    })
    if (!booking || booking._count.messages) continue
    const start = (booking.acceptedAt ?? booking.createdAt).getTime()
    const end = Math.max(start + talk.lines.length * 60_000, (booking.submittedAt?.getTime() ?? NOW) + 30 * 60_000)
    const step = Math.min((Math.min(end, NOW) - start) / (talk.lines.length + 1), 3 * HOUR)
    const times = talk.lines.map((_, index) => new Date(start + step * (index + 1)))
    await db.$transaction(async (tx) => {
      for (const [index, line] of talk.lines.entries()) {
        await tx.message.create({
          data: { bookingId: booking.id, senderId: line.from === 'brand' ? acmeId : creatorId, body: line.body, createdAt: times[index] },
        })
      }
      for (const [userId, upTo] of [[acmeId, talk.brandReads], [creatorId, talk.creatorReads]] as const) {
        if (upTo) await tx.messageRead.create({ data: { bookingId: booking.id, userId, readAt: times[upTo - 1] } })
      }
    })
    console.log(`added a conversation between Acme CRM and ${talk.creator}`)
  }
}

async function resetEverything(host: string) {
  if (!process.argv.includes('--yes')) {
    throw new Error(`--reset deletes every account, booking and ledger row on ${host}. Run again with --reset --yes to confirm.`)
  }
  await db.$executeRaw`TRUNCATE TABLE "notifications", "message_reads", "messages", "clicks", "transactions", "bookings", "brand_profiles", "creator_profiles", "wallets", "users" CASCADE`
  console.log('emptied every table')
}

async function quietOldNotifications() {
  const { count } = await db.notification.updateMany({
    where: { readAt: null, createdAt: { lt: new Date(NOW - DAY) } },
    data: { readAt: new Date() },
  })
  console.log(`marked ${count} older notifications as read`)
}

async function main() {
  const host = new URL(env.databaseUrl).hostname
  console.log(`seeding ${host}`)
  if (process.argv.includes('--reset')) await resetEverything(host)
  if (await db.user.findUnique({ where: { email: brands[0].email } })) {
    console.log('already seeded (acme@demo.test exists); adding anything newer that is missing')
    await addExtras()
    return
  }

  const ids = await createUsers()
  console.log(`created ${brands.length} brands and ${creators.length} creators`)

  const history: [CreatorKey, Outcome][] = [
    ['olivia', 'paid-brand'], ['olivia', 'paid-click'], ['olivia', 'paid-brand'], ['olivia', 'paid-timeout'], ['olivia', 'expired'],
    ['daniel', 'paid-brand'], ['daniel', 'paid-click'], ['daniel', 'paid-brand'],
    ['emily', 'paid-click'], ['emily', 'paid-brand'], ['emily', 'paid-brand'], ['emily', 'paid-click'], ['emily', 'paid-brand'],
    ['tom', 'paid-brand'],
    ['sophie', 'paid-brand'], ['sophie', 'expired'], ['sophie', 'paid-click'],
    ['hannah', 'declined'], ['hannah', 'paid-brand'],
    ['hassan', 'paid-brand'], ['hassan', 'paid-click'], ['hassan', 'paid-brand'],
  ]
  for (const [index, [creator, outcome]] of history.entries()) {
    await play(ids, 'pipewise', creator, outcome, ago(34 - index))
  }
  console.log(`played ${history.length} past bookings for reliability history`)

  const acme: [CreatorKey, Outcome, Date][] = [
    ['tom', 'paid-timeout', ago(12)],
    ['james', 'paid-click', ago(10)],
    ['sophie', 'expired', ago(9)],
    ['tom', 'paid-brand', ago(8)],
    ['hassan', 'paid-click', ago(6)],
    ['hannah', 'declined', ago(5)],
    ['emily', 'submitted', plus(ago(0), -44 * HOUR)],
    ['daniel', 'accepted', ago(1)],
    ['olivia', 'requested', plus(ago(0), -2 * HOUR)],
  ]
  for (const [creator, outcome, start] of acme) await play(ids, 'acme', creator, outcome, start)
  console.log(`played ${acme.length} Acme bookings, one per state`)
  await addExtras()
  await quietOldNotifications()

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
