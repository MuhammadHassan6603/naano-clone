import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { createRecognition, speechSupported, streamReply } from '../lib/aiChat'
import type { ChatMessage } from '../lib/aiChat'

const PLACEHOLDERS = [
  'What would you like to see?',
  'What would you like to do?',
  'What can I help you find?',
]

const EASE = [0.22, 1, 0.36, 1] as const

const SpinMark = () => (
  <svg viewBox="0 0 100 100" className="ai-spin" aria-hidden>
    {Array.from({ length: 7 }, (_, i) => (
      <ellipse
        key={i}
        cx="50"
        cy="20"
        rx="8"
        ry="13"
        fill="currentColor"
        transform={`rotate(${18 + (i * 360) / 7} 50 50) rotate(-45 50 20)`}
      />
    ))}
  </svg>
)

const Chevron = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path
      d="M2.5 4.75 6 8.25l3.5-3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
    <path
      d="M5 10v4M9.7 6.5v11M14.3 8.8v6.4M19 10v4"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
)

const SendIcon = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden>
    <path d="M9.5 16.5V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M3.96094 8.54167 9.5026 3l5.5417 5.54167"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function AiBar() {
  const [collapsed, setCollapsed] = useState(false)
  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [threadOpen, setThreadOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [listening, setListening] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const threadRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const recognitionRef = useRef<ReturnType<typeof createRecognition>>(null)

  const empty = value.trim().length === 0
  const expanded = focused || threadOpen

  useEffect(() => {
    const scroll = scrollRef.current
    if (scroll) scroll.scrollTop = scroll.scrollHeight
  }, [messages])

  useEffect(() => () => abortRef.current?.abort(), [])

  // The handle rides the thread's top border, so it needs the live height.
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
  }, [threadOpen])

  const resize = (node: HTMLTextAreaElement) => {
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 96)}px`
  }

  const send = async () => {
    const text = value.trim()
    if (!text || pending) return

    const next: ChatMessage[] = [...messages, { role: 'user', text }]
    setMessages([...next, { role: 'assistant', text: '' }])
    setThreadOpen(true)
    setValue('')
    setPending(true)
    if (inputRef.current) inputRef.current.style.height = 'auto'

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamReply(
        next,
        (chunk) => {
          setMessages((current) => {
            const copy = current.slice()
            const last = copy[copy.length - 1]
            copy[copy.length - 1] = { ...last, text: last.text + chunk }
            return copy
          })
        },
        controller.signal,
      )
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      setMessages((current) => {
        const copy = current.slice()
        copy[copy.length - 1] = {
          role: 'assistant',
          text: "I couldn't reach the assistant just now. Please try again in a moment.",
        }
        return copy
      })
    } finally {
      setPending(false)
      abortRef.current = null
    }
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

  // One control, three jobs: close the answers, then minimize, then restore.
  const handleAction = () => {
    if (collapsed) {
      setCollapsed(false)
      return
    }
    if (threadOpen) {
      abortRef.current?.abort()
      setThreadOpen(false)
      return
    }
    setCollapsed(true)
  }

  const handleLabel = collapsed
    ? 'Open the assistant'
    : threadOpen
      ? 'Close the answers'
      : 'Minimize the assistant'

  return (
    <div className="ai-root" ref={rootRef}>
      <AnimatePresence>
        {!collapsed && threadOpen && (
          <motion.aside
            key="thread"
            ref={threadRef}
            aria-label="Conversation"
            aria-live="polite"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.26, ease: EASE }}
            className="ai-thread"
          >
            <div className="ai-thread__scroll" ref={scrollRef}>
              <ol className="ai-thread__list">
                {messages.map((message, index) => (
                  <li key={index} className={`ai-msg ai-msg--${message.role}`}>
                    {message.text ? (
                      <p>{message.text}</p>
                    ) : (
                      <span className="ai-typing" aria-label="Thinking">
                        <i />
                        <i />
                        <i />
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="ai-handle"
        data-collapsed={collapsed}
        data-panel-open={!collapsed && threadOpen}
        aria-expanded={!collapsed}
        aria-label={handleLabel}
        title={handleLabel}
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
          void send()
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
            aria-label="Ask the assistant"
            enterKeyHint="send"
            autoComplete="off"
            tabIndex={collapsed ? -1 : 0}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(event) => {
              setValue(event.target.value)
              resize(event.target)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void send()
              }
            }}
          />
          {empty && (
            <span className="ai-bar__placeholder" aria-hidden>
              {PLACEHOLDERS.map((line, index) => (
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
            onMouseDown={(event) => event.preventDefault()}
            onClick={toggleVoice}
            disabled={!speechSupported()}
            tabIndex={collapsed ? -1 : 0}
            aria-label={listening ? 'Stop dictation' : 'Dictate your message'}
            title={
              speechSupported()
                ? 'Dictate your message'
                : 'Voice input is not supported in this browser'
            }
          >
            <VoiceIcon />
          </button>
        ) : (
          <button
            type="submit"
            className="ai-bar__action ai-bar__action--send"
            onMouseDown={(event) => event.preventDefault()}
            disabled={pending}
            tabIndex={collapsed ? -1 : 0}
            aria-label="Send"
            title="Send"
          >
            <SendIcon />
          </button>
        )}
      </form>
    </div>
  )
}
