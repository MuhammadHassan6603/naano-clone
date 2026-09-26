import { Router } from 'express'
import { getAuth, requireAuth } from '../auth.js'
import { badRequest } from '../errors.js'
import { listNotifications, markRead } from '../notifications.js'
import { type Body, objectBody, queryText } from '../validate.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const notificationsRouter = Router()
notificationsRouter.use(requireAuth)

notificationsRouter.get('/', async (req, res) => {
  const raw = queryText(req.query as Body, 'since')
  const since = raw === undefined ? undefined : new Date(raw)
  if (since && Number.isNaN(since.getTime())) throw badRequest('since must be an ISO 8601 date')
  res.json(await listNotifications(getAuth(req).userId, since))
})

notificationsRouter.post('/read', async (req, res) => {
  const body = objectBody(req.body ?? {})
  const ids = body.ids
  if (ids !== undefined && (!Array.isArray(ids) || ids.length > 100 || ids.some((id) => typeof id !== 'string' || !UUID.test(id)))) {
    throw badRequest('ids must be a list of notification ids')
  }
  res.json({ unread: await markRead(getAuth(req).userId, ids as string[] | undefined) })
})
