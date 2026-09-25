import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Migrations bypass Neon's pooler; the app itself uses DATABASE_URL.
  datasource: { url: process.env.DIRECT_URL },
})
