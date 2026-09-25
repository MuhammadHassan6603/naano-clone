import { Router } from 'express'
import { db } from '../db.js'
import { notFound } from '../errors.js'
import { hashIp } from '../ip.js'
import { isAutomated, recordClick } from '../tracking.js'

export const trackingRouter = Router()

const TRACKING_CODE = /^[A-Za-z0-9_-]{8}$/

// The public link inside the LinkedIn post. The visitor is always redirected first;
// counting (and possibly paying) happens afterwards, so it can never slow down or break the redirect.
trackingRouter.get('/r/:code', async (req, res) => {
  const { code } = req.params
  if (!TRACKING_CODE.test(code)) throw notFound('Link not found')

  const booking = await db.booking.findUnique({
    where: { trackingCode: code },
    select: { id: true, destinationUrl: true, status: true, acceptedAt: true, submitIpHash: true },
  })
  if (!booking) throw notFound('Link not found')

  res.redirect(302, booking.destinationUrl)

  const userAgent = req.get('user-agent') ?? ''
  // Before acceptance the creator doesn't have the link yet, so nothing real can arrive.
  if (!booking.acceptedAt || isAutomated(userAgent)) return

  recordClick(booking, { ipHash: hashIp(req.ip), userAgent }).catch((err: unknown) => {
    console.error(`recording a click on booking ${booking.id} failed:`, err)
  })
})
