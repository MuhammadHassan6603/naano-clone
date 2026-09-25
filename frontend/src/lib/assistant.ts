import { api } from './api'
import type { Role } from './types'

export type GuideAction = { path: string; label: string; highlight?: string; auto: boolean }
export type ChatMessage = { role: 'user' | 'assistant'; text: string; action?: GuideAction; failed?: boolean }

export const askAssistant = (history: ChatMessage[], page: string, signal: AbortSignal) =>
  api<{ reply: string; action?: GuideAction }>('/assistant', {
    method: 'POST',
    signal,
    body: {
      messages: history.filter((m) => !m.failed).map(({ role, text }) => ({ role, text })),
      page,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  })

export const SUGGESTIONS: Record<Role, string[]> = {
  brand: [
    'How much money is held in escrow?',
    'Which posts need my approval?',
    'How many clicks did my posts get?',
    'Where can I see link insights?',
  ],
  creator: [
    'How many new requests do I have, and what are they worth?',
    'What did the brands ask me to post about?',
    'How much have I earned so far?',
    'Where do I change my price?',
  ],
}

export const PLACEHOLDERS: Record<Role, string[]> = {
  brand: ['Ask about your bookings', 'Where is my money?', 'What can I help you find?'],
  creator: ['Ask about your requests', 'How much have I earned?', 'What can I help you find?'],
}

export function highlight(target: string, onFound: () => void, timeoutMs = 8000) {
  const started = performance.now()
  let timer = 0
  const find = () => {
    const element = document.querySelector<HTMLElement>(`[data-guide="${CSS.escape(target)}"]`)
    if (element) {
      onFound()
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      element.classList.remove('guide-pulse')
      void element.offsetWidth
      element.classList.add('guide-pulse')
      window.setTimeout(() => element.classList.remove('guide-pulse'), 3600)
      return
    }
    if (performance.now() - started < timeoutMs) timer = window.setTimeout(find, 100)
    else onFound()
  }
  timer = window.setTimeout(find, 0)
  return () => window.clearTimeout(timer)
}

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

type SpeechCtor = new () => SpeechRecognitionLike

const speechCtor = () =>
  typeof window === 'undefined'
    ? undefined
    : ((window as unknown as { SpeechRecognition?: SpeechCtor }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: SpeechCtor }).webkitSpeechRecognition)

export const speechSupported = () => Boolean(speechCtor())

export function createRecognition(): SpeechRecognitionLike | null {
  const Ctor = speechCtor()
  if (!Ctor) return null
  const recognition = new Ctor()
  recognition.lang = 'en-US'
  recognition.continuous = false
  recognition.interimResults = true
  return recognition
}
