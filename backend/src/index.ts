import 'dotenv/config'
import { createApp } from './app.js'
import { db } from './db.js'
import { env } from './env.js'

const server = createApp().listen(env.port, () => {
  console.log(`backend listening on :${env.port}`)
})

// Render sends SIGTERM on every deploy; finish in-flight requests, then release DB connections.
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    server.close(() => {
      db.$disconnect().finally(() => process.exit(0))
    })
  })
}
