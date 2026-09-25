import { createHmac } from 'node:crypto'
import { env } from './env.js'

// Keyed hash: the raw IP is never stored, and without the server secret the hash can't be brute-forced back.
export const hashIp = (ip: string | undefined) =>
  createHmac('sha256', env.jwtSecret).update(`ip-hash:${ip ?? 'unknown'}`).digest('hex')
