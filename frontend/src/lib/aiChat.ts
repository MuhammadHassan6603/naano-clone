export type ChatMessage = { role: 'user' | 'assistant'; text: string }

const ENDPOINT = import.meta.env.VITE_AI_ENDPOINT ?? '/api/chat'

export async function streamReply(
  history: ChatMessage[],
  onToken: (chunk: string) => void,
  signal: AbortSignal,
) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history.slice(-12) }),
    signal,
  })

  if (!response.ok || !response.body) {
    throw new Error(`chat ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let cut = buffer.indexOf('\n')
    while (cut !== -1) {
      const line = buffer.slice(0, cut).trim()
      buffer = buffer.slice(cut + 1)
      if (line) {
        const parsed = JSON.parse(line) as { text?: string; error?: string }
        if (parsed.error) throw new Error(parsed.error)
        if (parsed.text) onToken(parsed.text)
      }
      cut = buffer.indexOf('\n')
    }
  }
}

type SpeechCtor = new () => SpeechRecognitionLike

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

export const speechSupported = () =>
  typeof window !== 'undefined' &&
  Boolean(
    (window as unknown as { SpeechRecognition?: SpeechCtor }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: SpeechCtor }).webkitSpeechRecognition,
  )

export function createRecognition(): SpeechRecognitionLike | null {
  const Ctor =
    (window as unknown as { SpeechRecognition?: SpeechCtor }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SpeechCtor }).webkitSpeechRecognition
  if (!Ctor) return null
  const recognition = new Ctor()
  recognition.lang = 'en-US'
  recognition.continuous = false
  recognition.interimResults = true
  return recognition
}
