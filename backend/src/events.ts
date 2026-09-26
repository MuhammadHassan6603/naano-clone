import type { Response } from 'express'

const MAX_STREAMS_PER_USER = 10
const HEARTBEAT_MS = 25_000

const streams = new Map<string, Set<Response>>()
const pending = new WeakMap<object, Set<string>>()

export function collectFor(tx: object) {
  const users = new Set<string>()
  pending.set(tx, users)
  return users
}

export function track(tx: object, userIds: string[]) {
  const users = pending.get(tx)
  if (users) for (const id of userIds) users.add(id)
}

export function publish(userIds: Iterable<string>) {
  for (const id of userIds) {
    for (const res of streams.get(id) ?? []) res.write('event: update\ndata: {}\n\n')
  }
}

export function openStream(userId: string, res: Response, onClose: (listener: () => void) => void) {
  res.status(200)
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' })
  res.flushHeaders()
  res.write('retry: 3000\n: connected\n\n')

  const mine = streams.get(userId) ?? new Set<Response>()
  if (mine.size >= MAX_STREAMS_PER_USER) {
    const oldest = mine.values().next().value
    if (oldest) {
      mine.delete(oldest)
      oldest.end()
    }
  }
  mine.add(res)
  streams.set(userId, mine)

  const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS)
  onClose(() => {
    clearInterval(heartbeat)
    mine.delete(res)
    if (!mine.size) streams.delete(userId)
  })
}

export const openStreams = (userId: string) => streams.get(userId)?.size ?? 0
