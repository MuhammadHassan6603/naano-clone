import { Router } from 'express'
import { getAuth, requireAuth } from '../auth.js'
import { openStream } from '../events.js'

export const eventsRouter = Router()

eventsRouter.get('/', requireAuth, (req, res) => {
  openStream(getAuth(req).userId, res, (listener) => req.on('close', listener))
})
