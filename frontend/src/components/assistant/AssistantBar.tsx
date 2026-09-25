import { type MouseEvent, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toApiError, isAbort } from '../../lib/api'
import {
  type ChatMessage,
  type GuideAction,
  PLACEHOLDERS,
  SUGGESTIONS,
  askAssistant,
  createRecognition,
  highlight,
  speechSupported,
} from '../../lib/assistant'
import type { User } from '../../lib/types'

const SLOW_AFTER_MS = 6000

const SpinMark = () => (
  <svg viewBox="0 0 100 100" className="ai-spin" aria-hidden>
    {Array.from({ length: 7 }, (_, i) => (
      <ellipse key={i} cx="50" cy="20" rx="8" ry="13" fill="currentColor" transform={`rotate(${18 + (i * 360) / 7} 50 50) rotate(-45 50 20)`} />
    ))}
  </svg>
)

const Chevron = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M2.5 4.75 6 8.25l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Bubble = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.337 21.718a6.707 6.707 0 0 1-.533-.074.75.75 0 0 1-.44-1.223 3.73 3.73 0 0 0 .814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 0 1-4.246.997Z"
      fill="currentColor"
    />
  </svg>
)

const VoiceIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 10v4M9.7 6.5v11M14.3 8.8v6.4M19 10v4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
)

const SendArrow = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden>
    <path d="M9.5 16.5V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.96094 8.54167 9.5026 3l5.5417 5.54167" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function AssistantBar({ user }: { user: User }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [threadOpen, setThreadOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [slow, setSlow] = useState(false)
  const [listening, setListening] = useState(false)
  const [guide, setGuide] = useState<GuideAction & { at: number }>()

  const rootRef = useRef<HTMLDivElement>(null)
  const threadRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const recognitionRef = useRef<ReturnType<typeof createRecognition>>(null)

  const visible = location.pathname.startsWith('/dashboard')
  const empty = value.trim().length === 0
  const suggesting = focused && messages.length === 0 && !pending
  const panelOpen = !collapsed && (threadOpen || suggesting)
  const expanded = focused || panelOpen

  useEffect(() => {
    const scroll = scrollRef.current
    if (scroll) scroll.scrollTop = scroll.scrollHeight
  }, [messages, pending, slow])

  useEffect(
    () => () => {
      abortRef.current?.abort()
      recognitionRef.current?.stop()
    },
    [],
  )

  useEffect(() => {
    if (!guide?.highlight || location.pathname + location.search !== guide.path) return
    return highlight(guide.highlight, () => setGuide(undefined))
  }, [guide, location.pathname, location.search])

  useLayoutEffect(() => {
    const node = threadRef.current
    const root = rootRef.current
    if (!root) return
    if (!node) {
      root.style.setProperty('--ai-thread-h', '0px')
      return
    }
    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty('--ai-thread-h', `${entry.contentRect.height}px`)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [panelOpen, visible])

  const resize = (node: HTMLTextAreaElement) => {
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 96)}px`
  }

  const go = (action: GuideAction) => {
    navigate(action.path)
    setGuide({ ...action, at: Date.now() })
  }

  const request = async (history: ChatMessage[]) => {
    const controller = new AbortController()
    abortRef.current?.abort()
    abortRef.current = controller
    setPending(true)
    setSlow(false)
    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS)
    try {
      const { reply, action } = await askAssistant(history, location.pathname + location.search, controller.signal)
      setMessages([...history, { role: 'assistant', text: reply, action }])
      if (action) go(action)
    } catch (error) {
      if (isAbort(error)) return
      setMessages([...history, { role: 'assistant', text: toApiError(error).message, failed: true }])
    } finally {
      window.clearTimeout(slowTimer)
      if (abortRef.current === controller) {
        abortRef.current = null
        setPending(false)
        setSlow(false)
      }
    }
  }

  const send = (text = value.trim()) => {
    if (!text || pending) return
    setThreadOpen(true)
    setValue('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    const answered = messages.filter((m, i) => !m.failed && !messages[i + 1]?.failed)
    void request([...answered, { role: 'user', text }])
  }

  const retry = () => {
    if (pending) return
    void request(messages.filter((m) => !m.failed))
  }

  const clear = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setPending(false)
    setMessages([])
    setThreadOpen(false)
    inputRef.current?.focus()
  }

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = createRecognition()
    if (!recognition) return
    recognitionRef.current = recognition
    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i += 1) transcript += event.results[i][0].transcript
      setValue(transcript)
      if (inputRef.current) resize(inputRef.current)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.start()
    setListening(true)
    inputRef.current?.focus()
  }

  const handleAction = () => {
    if (collapsed) {
      setCollapsed(false)
      window.setTimeout(() => inputRef.current?.focus(), 0)
      return
    }
    if (panelOpen) {
      setThreadOpen(false)
      inputRef.current?.blur()
      return
    }
    setCollapsed(true)
  }

  if (!visible) return null

  const handleLabel = collapsed ? 'Open the assistant' : panelOpen ? 'Close the answers' : 'Minimize the assistant'
  const keepFocus = (event: MouseEvent) => event.preventDefault()

  return (
    <div className="ai-root" ref={rootRef} onKeyDown={(event) => event.key === 'Escape' && panelOpen && handleAction()}>
      {panelOpen && (
        <aside ref={threadRef} aria-label="Assistant" className="ai-thread">
          <div className="ai-thread__scroll" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="ai-suggest">
                <p className="ai-suggest__title">Ask about your {user.role === 'brand' ? 'bookings, escrow and clicks' : 'requests, posts and earnings'}, or where to find something.</p>
                <ul className="ai-suggest__list">
                  {SUGGESTIONS[user.role].map((suggestion) => (
                    <li key={suggestion}>
                      <button type="button" className="ai-chip" onMouseDown={keepFocus} onClick={() => send(suggestion)}>
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                <div className="ai-thread__top">
                  <button type="button" className="ai-thread__clear" onMouseDown={keepFocus} onClick={clear}>
                    New chat
                  </button>
                </div>
                <ol className="ai-thread__list" aria-live="polite">
                  {messages.map((message, index) => (
                    <li key={index} className={`ai-msg ai-msg--${message.role}${message.failed ? ' ai-msg--failed' : ''}`}>
                      <p>{message.text}</p>
                      {message.action && (
                        <button type="button" className="ai-chip ai-chip--go" onMouseDown={keepFocus} onClick={() => go(message.action!)}>
                          {message.action.highlight ? 'Show me' : 'Open'}: {message.action.label}
                        </button>
                      )}
                      {message.failed && index === messages.length - 1 && (
                        <button type="button" className="ai-chip" onMouseDown={keepFocus} onClick={retry} disabled={pending}>
                          Try again
                        </button>
                      )}
                    </li>
                  ))}
                  {pending && (
                    <li className="ai-msg ai-msg--assistant">
                      <span className="ai-typing" role="status" aria-label="Thinking">
                        <i />
                        <i />
                        <i />
                      </span>
                      {slow && <p className="ai-msg__slow">Still working. The server may be waking up, which can take up to a minute.</p>}
                    </li>
                  )}
                </ol>
              </>
            )}
          </div>
        </aside>
      )}

      <button
        type="button"
        className="ai-handle"
        data-collapsed={collapsed}
        data-panel-open={panelOpen}
        aria-expanded={!collapsed}
        aria-label={handleLabel}
        title={handleLabel}
        onMouseDown={keepFocus}
        onClick={handleAction}
      >
        {collapsed ? <Bubble /> : <Chevron />}
      </button>

      <form
        className="ai-bar"
        data-collapsed={collapsed}
        data-expanded={expanded}
        aria-hidden={collapsed}
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <span className="ai-bar__mark" aria-hidden>
          <SpinMark />
        </span>

        <div className="ai-bar__body">
          <textarea
            ref={inputRef}
            rows={1}
            className="ai-bar__input"
            value={value}
            aria-label="Ask the naano assistant"
            enterKeyHint="send"
            autoComplete="off"
            maxLength={2000}
            tabIndex={collapsed ? -1 : 0}
            onFocus={() => {
              setFocused(true)
              if (messages.length) setThreadOpen(true)
            }}
            onBlur={() => setFocused(false)}
            onChange={(event) => {
              setValue(event.target.value)
              resize(event.target)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                send()
              }
            }}
          />
          {empty && (
            <span className="ai-bar__placeholder" aria-hidden>
              {PLACEHOLDERS[user.role].map((line, index) => (
                <span key={line} style={{ animationDelay: `${index * 3.4}s` }}>
                  {line}
                </span>
              ))}
            </span>
          )}
        </div>

        {empty ? (
          <button
            type="button"
            className="ai-bar__action"
            data-listening={listening}
            onMouseDown={keepFocus}
            onClick={toggleVoice}
            disabled={!speechSupported()}
            tabIndex={collapsed ? -1 : 0}
            aria-label={listening ? 'Stop dictation' : 'Dictate your question'}
            title={speechSupported() ? 'Dictate your question' : 'Voice input is not supported in this browser'}
          >
            <VoiceIcon />
          </button>
        ) : (
          <button
            type="submit"
            className="ai-bar__action ai-bar__action--send"
            onMouseDown={keepFocus}
            disabled={pending}
            tabIndex={collapsed ? -1 : 0}
            aria-label="Send"
            title="Send"
          >
            <SendArrow />
          </button>
        )}
      </form>
    </div>
  )
}
