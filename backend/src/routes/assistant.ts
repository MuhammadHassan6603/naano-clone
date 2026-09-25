import { Router } from 'express'
import { db } from '../db.js'
import { env } from '../env.js'
import { getAuth, requireAuth } from '../auth.js'
import { HttpError, badRequest, unauthorized } from '../errors.js'
import { type ChatMessage, type Model, ask } from '../assistant.js'
import { type Body, objectBody } from '../validate.js'

const MAX_MESSAGES = 12
const MAX_CHARS = 2000
const WINDOW_MS = 10 * 60_000
export const MAX_QUESTIONS_PER_WINDOW = 20

function messages(body: Body): ChatMessage[] {
  const value = body.messages
  if (!Array.isArray(value) || value.length === 0) throw badRequest('messages must be a non-empty list')
  const parsed = value.slice(-MAX_MESSAGES).map((item: unknown) => {
    const message = item as Partial<ChatMessage> | null
    if (!message || (message.role !== 'user' && message.role !== 'assistant') || typeof message.text !== 'string') {
      throw badRequest('each message needs a role (user or assistant) and text')
    }
    const text = message.text.trim()
    if (!text) throw badRequest('messages cannot be empty')
    if (text.length > MAX_CHARS) throw badRequest(`messages must be at most ${MAX_CHARS} characters`)
    return { role: message.role, text }
  })
  if (parsed.at(-1)!.role !== 'user') throw badRequest('the last message must be from the user')
  while (parsed[0].role !== 'user') parsed.shift()
  return parsed
}

function page(body: Body): string | undefined {
  const value = body.page
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !value.startsWith('/') || value.length > 200) throw badRequest('page must be a path')
  return value
}

const recent = new Map<string, number[]>()

function rateLimit(userId: string) {
  const now = Date.now()
  const times = (recent.get(userId) ?? []).filter((at) => now - at < WINDOW_MS)
  if (times.length >= MAX_QUESTIONS_PER_WINDOW) {
    recent.set(userId, times)
    throw new HttpError(429, 'You have asked a lot of questions in a short time. Please try again in a few minutes.')
  }
  times.push(now)
  recent.set(userId, times)
}

export function assistantRouter(model: Model | null) {
  const router = Router()
  router.use(requireAuth)

  router.post('/', async (req, res) => {
    const body = objectBody(req.body)
    const input = { messages: messages(body), page: page(body) }
    if (!model) throw new HttpError(503, "The assistant isn't switched on for this server yet.")

    const auth = getAuth(req)
    const user = await db.user.findUnique({ where: { id: auth.userId }, select: { name: true } })
    if (!user) throw unauthorized('Account no longer exists')
    rateLimit(auth.userId)

    const trackingBase = env.publicApiUrl ?? `${req.protocol}://${req.get('host')}`
    res.json(await ask({ ...auth, name: user.name, trackingBase }, input.messages, input.page, model))
  })

  return router
}
