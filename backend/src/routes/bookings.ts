import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'
import { env } from '../env.js'
import { getAuth, requireAuth, requireRole } from '../auth.js'
import { badRequest, forbidden, notFound } from '../errors.js'
import { BOOKING_STATUSES, findBooking, listBookings } from '../bookings.js'
import { accept, approve, createBooking, decline, submit, sweep } from '../escrow.js'
import { hashIp } from '../ip.js'
import { clickStats } from '../tracking.js'
import { MAX_MESSAGE_CHARS, readThread, sendMessage, unreadTotal } from '../messages.js'
import type { Role } from '../generated/prisma/enums.js'
import {
  type Body,
  idParam,
  isoDate,
  linkedInUrl,
  objectBody,
  queryOneOf,
  text,
  uuid,
  webUrl,
} from '../validate.js'

const MAX_DEADLINE_MS = 60 * 86_400_000

export const bookingsRouter = Router()
bookingsRouter.use(requireAuth)

const trackingBase = (req: Request) => env.publicApiUrl ?? `${req.protocol}://${req.get('host')}`

async function sendBooking(req: Request, res: Response, id: string, status = 200) {
  const booking = await findBooking(id, trackingBase(req))
  if (!booking) throw notFound('Booking not found')
  res.status(status).json({ booking })
}

async function bookingForCaller(req: Request, side?: Role): Promise<string> {
  const raw = req.params.id
  const id = idParam(typeof raw === 'string' ? raw : undefined, 'Booking')
  const { userId } = getAuth(req)
  await sweep({ bookingId: id })

  const booking = await db.booking.findUnique({ where: { id }, select: { brandId: true, creatorId: true } })
  if (!booking) throw notFound('Booking not found')
  const callerSide = booking.brandId === userId ? 'brand' : booking.creatorId === userId ? 'creator' : null
  if (!callerSide) throw forbidden('This booking belongs to someone else')
  if (side && callerSide !== side) throw forbidden(`Only the ${side} on this booking can do this`)
  return id
}

function deadline(body: Body): Date {
  const value = isoDate(body, 'deadline')
  const now = Date.now()
  if (value.getTime() <= now) throw badRequest('deadline must be in the future')
  if (value.getTime() > now + MAX_DEADLINE_MS) throw badRequest('deadline must be within 60 days')
  return value
}

bookingsRouter.post('/', requireRole('brand'), async (req, res) => {
  const body = objectBody(req.body)
  const input = {
    brandId: getAuth(req).userId,
    creatorId: uuid(body, 'creatorId', 'Creator'),
    brief: text(body, 'brief', { min: 20, max: 5000 }),
    destinationUrl: webUrl(body, 'destinationUrl'),
    deadline: deadline(body),
  }
  await sendBooking(req, res, await createBooking(input), 201)
})

bookingsRouter.get('/', async (req, res) => {
  const status = queryOneOf(req.query as Body, 'status', BOOKING_STATUSES)
  await sweep()
  res.json({ bookings: await listBookings(getAuth(req), status, trackingBase(req)) })
})

bookingsRouter.get('/unread', async (req, res) => {
  res.json({ unread: await unreadTotal(getAuth(req).userId) })
})

bookingsRouter.get('/:id', async (req, res) => {
  await sendBooking(req, res, await bookingForCaller(req))
})

bookingsRouter.get('/:id/stats', async (req, res) => {
  res.json(await clickStats(await bookingForCaller(req)))
})

bookingsRouter.get('/:id/messages', async (req, res) => {
  const id = await bookingForCaller(req)
  res.json({ messages: await readThread(id, getAuth(req).userId) })
})

bookingsRouter.post('/:id/messages', async (req, res) => {
  const id = await bookingForCaller(req)
  const body = text(objectBody(req.body), 'body', { max: MAX_MESSAGE_CHARS })
  res.status(201).json({ message: await sendMessage(id, getAuth(req).userId, body) })
})

bookingsRouter.post('/:id/accept', async (req, res) => {
  const id = await bookingForCaller(req, 'creator')
  await accept(id)
  await sendBooking(req, res, id)
})

bookingsRouter.post('/:id/decline', async (req, res) => {
  const id = await bookingForCaller(req, 'creator')
  await decline(id)
  await sendBooking(req, res, id)
})

bookingsRouter.post('/:id/submit', async (req, res) => {
  const id = await bookingForCaller(req, 'creator')
  const postUrl = linkedInUrl(objectBody(req.body), 'postUrl')
  await submit(id, { postUrl, submitIpHash: hashIp(req.ip) })
  await sendBooking(req, res, id)
})

bookingsRouter.post('/:id/approve', async (req, res) => {
  const id = await bookingForCaller(req, 'brand')
  await approve(id)
  await sendBooking(req, res, id)
})
