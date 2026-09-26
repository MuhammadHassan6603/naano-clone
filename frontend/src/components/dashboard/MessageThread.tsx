import { type FormEvent, type KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { api, toApiError } from '../../lib/api'
import { counterpart } from '../../lib/bookings'
import { firstName } from '../../lib/format'
import type { Booking, Message, Role } from '../../lib/types'
import { useApi } from '../../lib/useApi'
import { Button } from '../ui/Button'
import { Notice, Spinner } from '../ui/Feedback'
import { MESSAGES_READ } from './DashboardLayout'

const POLL_MS = 5000
const MAX_CHARS = 2000
const WARN_AT = 1800

type Draft = { key: string; body: string; state: 'sending' | 'failed'; error?: string }

const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const dayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

function dayLabel(date: Date) {
  const today = new Date()
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return dayFormat.format(date)
}

function merge(server: Message[], sent: Message[]) {
  const ids = new Set(server.map((m) => m.id))
  return [...server, ...sent.filter((m) => !ids.has(m.id))].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a.id.localeCompare(b.id),
  )
}

function Bubble({ mine, children, muted = false }: { mine: boolean; children: string; muted?: boolean }) {
  return (
    <p
      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[15px] leading-[1.45] break-words whitespace-pre-wrap sm:max-w-[75%] ${
        mine ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md bg-[#f1f2f4] text-ink'
      } ${muted ? 'opacity-60' : ''}`}
    >
      {children}
    </p>
  )
}

export function MessageThread({ booking, role }: { booking: Booking; role: Role }) {
  const other = counterpart(booking, role)
  const path = `/bookings/${booking.id}/messages`
  const thread = useApi<{ messages: Message[] }>(path, { refreshOnFocus: true })
  const [sent, setSent] = useState<Message[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const stickToBottom = useRef(true)
  const { reload } = thread

  useEffect(() => {
    const timer = window.setInterval(() => document.visibilityState === 'visible' && reload(), POLL_MS)
    return () => window.clearInterval(timer)
  }, [reload])

  const serverMessages = thread.data?.messages
  useEffect(() => {
    if (serverMessages) window.dispatchEvent(new Event(MESSAGES_READ))
  }, [serverMessages])

  const messages = merge(serverMessages ?? [], sent)
  const lastKey = `${messages.at(-1)?.id ?? ''}:${drafts.length}`

  useLayoutEffect(() => {
    const node = scrollRef.current
    if (node && stickToBottom.current) node.scrollTop = node.scrollHeight
  }, [lastKey, thread.data])

  const onScroll = () => {
    const node = scrollRef.current
    if (node) stickToBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80
  }

  const resize = () => {
    const node = inputRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 140)}px`
  }

  async function deliver(key: string, body: string) {
    setDrafts((current) => current.map((d) => (d.key === key ? { ...d, state: 'sending', error: undefined } : d)))
    stickToBottom.current = true
    try {
      const { message } = await api<{ message: Message }>(path, { method: 'POST', body: { body } })
      setSent((current) => [...current, message])
      setDrafts((current) => current.filter((d) => d.key !== key))
    } catch (error) {
      setDrafts((current) => current.map((d) => (d.key === key ? { ...d, state: 'failed', error: toApiError(error).message } : d)))
    }
  }

  function submit(event?: FormEvent) {
    event?.preventDefault()
    const body = text.trim()
    if (!body || body.length > MAX_CHARS) return
    const key = `${Date.now()}-${Math.random()}`
    setDrafts((current) => [...current, { key, body, state: 'sending' }])
    setText('')
    requestAnimationFrame(resize)
    void deliver(key, body)
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  const name = firstName(other.name)
  let lastDay = ''

  return (
    <div className="flex flex-col">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="-mx-2 max-h-[420px] min-h-[160px] overflow-y-auto overscroll-contain px-2"
        aria-live="polite"
        aria-label={`Conversation with ${other.name}`}
      >
        {!thread.data && thread.error ? (
          <Notice tone="error" title="Couldn't load the messages">
            {thread.error.message}{' '}
            <button type="button" onClick={thread.reload} className="font-semibold underline">
              Try again
            </button>
          </Notice>
        ) : !thread.data ? (
          <p className="flex items-center gap-2 py-6 text-sm text-muted">
            <Spinner /> Loading messages…
          </p>
        ) : messages.length === 0 && drafts.length === 0 ? (
          <div className="flex h-[160px] flex-col items-center justify-center text-center">
            <p className="font-semibold text-ink">No messages yet</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
              {role === 'brand' ? `Questions or extra details for ${name}? ` : `Questions about the brief? `}
              Ask {role === 'brand' ? 'here' : name}. Only the two of you can see this conversation.
            </p>
          </div>
        ) : (
          <ol className="space-y-1.5 py-1">
            {messages.map((message, index) => {
              const at = new Date(message.createdAt)
              const day = dayLabel(at)
              const showDay = day !== lastDay
              lastDay = day
              const previous = messages[index - 1]
              const startsGroup = showDay || previous?.sender.id !== message.sender.id
              return (
                <li key={message.id}>
                  {showDay && <p className="py-3 text-center text-xs font-semibold text-muted">{day}</p>}
                  <div className={`flex flex-col ${message.mine ? 'items-end' : 'items-start'} ${startsGroup && !showDay ? 'pt-2' : ''}`}>
                    {startsGroup && !message.mine && <p className="mb-1 px-1 text-xs font-semibold text-muted">{message.sender.name}</p>}
                    <Bubble mine={message.mine}>{message.body}</Bubble>
                    <time dateTime={message.createdAt} className="mt-0.5 px-1 text-[11px] text-muted">
                      {time.format(at)}
                    </time>
                  </div>
                </li>
              )
            })}
            {drafts.map((draft) => (
              <li key={draft.key} className="flex flex-col items-end pt-1">
                <Bubble mine muted={draft.state === 'sending'}>
                  {draft.body}
                </Bubble>
                {draft.state === 'sending' ? (
                  <span className="mt-0.5 px-1 text-[11px] text-muted">Sending…</span>
                ) : (
                  <span className="mt-1 flex flex-wrap items-center justify-end gap-x-2 px-1 text-xs text-danger">
                    <span>Not sent. {draft.error}</span>
                    <button type="button" className="font-semibold underline" onClick={() => void deliver(draft.key, draft.body)}>
                      Retry
                    </button>
                    <button
                      type="button"
                      className="font-semibold text-muted underline"
                      onClick={() => setDrafts((current) => current.filter((d) => d.key !== draft.key))}
                    >
                      Remove
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <form onSubmit={submit} className="mt-4 border-t border-line pt-4">
        <label htmlFor={`message-${booking.id}`} className="sr-only">
          Message {other.name}
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id={`message-${booking.id}`}
            ref={inputRef}
            rows={1}
            value={text}
            maxLength={MAX_CHARS}
            placeholder={`Message ${name}…`}
            onChange={(event) => {
              setText(event.target.value)
              resize()
            }}
            onKeyDown={onKeyDown}
            enterKeyHint="send"
            className="min-h-11 flex-1 resize-none rounded-2xl border border-line-strong bg-white px-4 py-2.5 text-[15px] leading-6 text-ink placeholder:text-[#9ca3af] focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
          />
          <Button type="submit" disabled={!text.trim()}>
            Send
          </Button>
        </div>
        <div className="mt-1.5 flex justify-between gap-3 px-1 text-xs text-muted">
          <span className="hidden sm:inline">Enter to send, Shift + Enter for a new line</span>
          {text.length >= WARN_AT && (
            <span className={text.length >= MAX_CHARS ? 'text-danger' : ''}>
              {text.length}/{MAX_CHARS}
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
