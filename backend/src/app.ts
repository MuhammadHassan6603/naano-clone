import cors from 'cors'
import express from 'express'
import { db } from './db.js'
import { env } from './env.js'
import { errorHandler, unknownRoute } from './errors.js'
import { authRouter } from './routes/auth.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(cors({ origin: env.allowedOrigins }))
  app.use(express.json({ limit: '100kb' }))

  app.get('/health', async (_req, res) => {
    try {
      await db.$queryRaw`SELECT 1`
      res.json({ ok: true })
    } catch (err) {
      console.error('health check failed:', err)
      res.status(503).json({ ok: false, error: 'Database unavailable' })
    }
  })

  app.use('/auth', authRouter)

  app.use(unknownRoute)
  app.use(errorHandler)
  return app
}
