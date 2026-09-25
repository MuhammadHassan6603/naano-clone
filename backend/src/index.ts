import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { db } from './db.js'

const app = express()
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }))
app.use(express.json())

app.get('/health', async (_req, res) => {
  await db.query('SELECT 1')
  res.json({ ok: true })
})

const port = Number(process.env.PORT ?? 4000)
app.listen(port, () => console.log(`backend listening on :${port}`))
