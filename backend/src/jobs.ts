import { sweep } from './escrow.js'

export const SWEEP_INTERVAL_MS = 60_000

export function startSweepLoop(intervalMs = SWEEP_INTERVAL_MS): () => void {
  let running = false
  const timer = setInterval(async () => {
    if (running) return
    running = true
    try {
      await sweep()
    } catch (err) {
      console.error('background sweep failed:', err)
    } finally {
      running = false
    }
  }, intervalMs)
  timer.unref()
  return () => clearInterval(timer)
}
