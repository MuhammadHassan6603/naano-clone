import { db } from './db.js'
import { ignoreConflict, pay } from './escrow.js'
import type { BookingStatus } from './generated/prisma/enums.js'

/**
 * Link-preview crawlers and scripts fetch the tracking link like a visitor would.
 * LinkedIn's own crawler (LinkedInBot) fetches every link in a post to build its preview
 * card, so without this filter a re-crawl would pay the creator with no human involved.
 * Anything with no user agent, or one that looks automated, is redirected but never counted.
 * ponytail: user agents can be faked; this stops accidental payment, not a determined cheat.
 */
const AUTOMATED =
  /bot|crawl|spider|preview|facebookexternalhit|whatsapp|slack|discord|telegram|embedly|curl|wget|python|go-http-client|java\/|okhttp|axios|node-fetch|undici|headless|^node$/i

export const isAutomated = (userAgent: string | undefined) => !userAgent?.trim() || AUTOMATED.test(userAgent)

export type TrackedBooking = {
  id: string
  status: BookingStatus
  submitIpHash: string | null
}

/**
 * Counts a human click. The first click on a submitted post is the proof it's live and
 * pays the creator, unless it comes from the IP the creator submitted from.
 */
export async function recordClick(booking: TrackedBooking, visitor: { ipHash: string; userAgent: string }) {
  await db.click.create({
    data: { bookingId: booking.id, ipHash: visitor.ipHash, userAgent: visitor.userAgent.slice(0, 300) },
  })
  if (booking.status === 'submitted' && visitor.ipHash !== booking.submitIpHash) {
    // The status was read before the redirect; if the brand approved meanwhile, this is a no-op 409.
    await pay(booking.id, 'click').catch(ignoreConflict)
  }
}

export type ClickStats = {
  totalClicks: number
  uniqueClicks: number
  byDay: { date: string; clicks: number }[]
}

export async function clickStats(bookingId: string): Promise<ClickStats> {
  const [[totals], byDay] = await Promise.all([
    db.$queryRaw<{ total: number; unique: number }[]>`
      SELECT count(*)::int AS total, count(DISTINCT ip_hash)::int AS unique
      FROM clicks WHERE booking_id = ${bookingId}::uuid`,
    db.$queryRaw<{ date: string; clicks: number }[]>`
      SELECT to_char(clicked_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date, count(*)::int AS clicks
      FROM clicks WHERE booking_id = ${bookingId}::uuid
      GROUP BY 1 ORDER BY 1`,
  ])
  return { totalClicks: totals?.total ?? 0, uniqueClicks: totals?.unique ?? 0, byDay }
}
