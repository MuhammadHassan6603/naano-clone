export interface Env {
  GEMINI_API_KEY: string
  ALLOWED_ORIGINS: string
}

type Role = 'user' | 'assistant'
type Message = { role: Role; text: string }

const MODEL = 'gemini-2.5-flash'
const MAX_MESSAGES = 12
const MAX_CHARS = 2000

const SYSTEM_PROMPT = `You are the assistant embedded in a rebuild of naano.com.

What this site is, and you must be upfront about it whenever it comes up:
- This is a clone of naano.com, not the real product. It is a portfolio build,
  produced as a take-home task for 8x.
- The brief was to rebuild naano.com from scratch in 24 hours. Deliverables
  were a live deployed link, a public repository with the agent logs
  committed, and a walkthrough video of five minutes or less.
- It is built with React 19, Vite 8, TypeScript, Tailwind CSS v4 and the
  motion library, with client routing via react-router. Images and video are
  hotlinked from naano.com rather than re-hosted.
- You run on Google Gemini, called through a Cloudflare Worker so the API key
  is never exposed to the browser.
- Nothing here transacts. Sign-up, login, booking and the agency forms are
  faithful reproductions of the real flows but they do not create accounts,
  take payment, or book anything.

What naano itself does, so you can answer questions about the content:
naano is a B2B LinkedIn creator marketplace. Companies find creators whose
audience overlaps their buyers, launch campaigns in days, pay per post, and
track the clicks, leads and pipeline each post generates. Creators get paid to
post about products they already use. There are pages for companies, creators
and agencies, a blog, free tools, and a BlogSEO case study.

How to answer:
- Be brief. Two or three sentences unless asked for more. This renders in a
  small floating bar, so keep it tight and skip any markdown formatting.
- Be accurate about what you do not know. If someone asks about pricing
  specifics, account data, or anything that needs the real naano backend, say
  plainly that this is a clone and does not have it.
- If someone asks who built it or why, say it is a rebuild of naano.com done
  as an 8x assignment, and offer to point them at a section of the site.
- Never invent statistics, customer names, or claims that are not on the site.`

const json = (body: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  })

function cors(origin: string | null): Record<string, string> {
  if (!origin) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function allowed(origin: string | null, env: Env): string | null {
  if (!origin) return null
  const list = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  return list.includes(origin) ? origin : null
}

function sanitize(input: unknown): Message[] {
  if (!Array.isArray(input)) return []
  return input
    .filter(
      (item): item is Message =>
        !!item &&
        typeof item === 'object' &&
        (item as Message).role != null &&
        typeof (item as Message).text === 'string',
    )
    .map<Message>((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      text: item.text.slice(0, MAX_CHARS),
    }))
    .slice(-MAX_MESSAGES)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')
    const okOrigin = allowed(origin, env)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: okOrigin ? 204 : 403, headers: cors(okOrigin) })
    }

    if (request.method !== 'POST') {
      return json({ error: 'method not allowed' }, 405, okOrigin)
    }

    if (origin && !okOrigin) {
      return json({ error: 'origin not allowed' }, 403, null)
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: 'assistant is not configured' }, 500, okOrigin)
    }

    let messages: Message[]
    try {
      const body = (await request.json()) as { messages?: unknown }
      messages = sanitize(body.messages)
    } catch {
      return json({ error: 'invalid body' }, 400, okOrigin)
    }

    if (messages.length === 0) {
      return json({ error: 'no messages' }, 400, okOrigin)
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: messages.map((message) => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.text }],
          })),
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 600,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    )

    if (!upstream.ok || !upstream.body) {
      return json({ error: `upstream ${upstream.status}` }, 502, okOrigin)
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = upstream.body!.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let buffer = ''

        const emit = (text: string) => {
          if (text) controller.enqueue(encoder.encode(JSON.stringify({ text }) + '\n'))
        }

        try {
          for (;;) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })

            let cut = buffer.indexOf('\n')
            while (cut !== -1) {
              const line = buffer.slice(0, cut).trim()
              buffer = buffer.slice(cut + 1)
              if (line.startsWith('data:')) {
                const payload = line.slice(5).trim()
                if (payload && payload !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(payload)
                    const parts = parsed?.candidates?.[0]?.content?.parts ?? []
                    for (const part of parts) emit(part?.text ?? '')
                  } catch {
                  }
                }
              }
              cut = buffer.indexOf('\n')
            }
          }
        } catch {
          controller.enqueue(encoder.encode(JSON.stringify({ error: 'stream failed' }) + '\n'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-store',
        ...cors(okOrigin),
      },
    })
  },
}
