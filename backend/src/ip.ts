import { createHmac } from 'node:crypto'
import { env } from './env.js'

export const hashIp = (ip: string | undefined) =>
  createHmac('sha256', env.jwtSecret).update(`ip-hash:${ip ?? 'unknown'}`).digest('hex')
