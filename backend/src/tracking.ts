import { db } from './db.js'
import { ignoreConflict, pay } from './escrow.js'
import type { BookingStatus } from './generated/prisma/enums.js'

const AUTOMATED =
  /bot|crawl|spider|preview|facebookexternalhit|whatsapp|slack|discord|telegram|embedly|curl|wget|python|go-http-client|java\/|okhttp|axios|node-fetch|undici|headless|^node$/i

export const isAutomated = (userAgent: string | undefined) => !userAgent?.trim() || AUTOMATED.test(userAgent)

export type TrackedBooking = {
  id: string
  status: BookingStatus
  submitIpHash: string | null
}

export async function recordClick(booking: TrackedBooking, visitor: { ipHash: string; userAgent: string }) {
  await db.click.create({
    data: { bookingId: booking.id, ipHash: visitor.ipHash, userAgent: visitor.userAgent.slice(0, 300) },
  })
  if (booking.status === 'submitted' && visitor.ipHash !== booking.submitIpHash) {
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
