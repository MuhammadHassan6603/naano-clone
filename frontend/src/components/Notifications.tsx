import { type ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { type Notification, chime, soundPreference, timeAgo, unlockSound } from '../lib/notifications'
import { REFRESH_EVENT } from '../lib/useApi'
import { BellIcon, CheckIcon, CloseIcon, MessageIcon, MuteIcon, UndoIcon, VolumeIcon, WalletIcon } from './ui/Icons'

const POLL_MS = 8000
const TOAST_MS = 7000
const MAX_TOASTS = 3

type Feed = { notifications: Notification[]; unread: number }

type NotificationsValue = {
  items: Notification[]
  unread: number
  loaded: boolean
  sound: boolean
  setSound: (on: boolean) => void
  open: (note: Notification) => void
  markAllRead: () => void
}

const NotificationsContext = createContext<NotificationsValue | null>(null)

export const useNotifications = () => useContext(NotificationsContext)

const KIND_STYLE: Record<Notification['kind'], { icon: ReactNode; tone: string }> = {
  message: { icon: <MessageIcon />, tone: 'bg-accent-soft text-accent-strong' },
  booked: { icon: <WalletIcon />, tone: 'bg-accent-soft text-accent-strong' },
  accepted: { icon: <CheckIcon />, tone: 'bg-accent-soft text-accent-strong' },
  submitted: { icon: <BellIcon />, tone: 'bg-held-soft text-held' },
  paid: { icon: <CheckIcon />, tone: 'bg-good-soft text-good' },
  declined: { icon: <UndoIcon />, tone: 'bg-[#f1f2f4] text-[#4b5563]' },
  expired: { icon: <UndoIcon />, tone: 'bg-[#f1f2f4] text-[#4b5563]' },
}

function KindIcon({ kind }: { kind: Notification['kind'] }) {
  const style = KIND_STYLE[kind] ?? KIND_STYLE.booked
  return <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${style.tone}`}>{style.icon}</span>
}

function Toast({ note, onOpen, onClose }: { note: Notification; onOpen: () => void; onClose: () => void }) {
  const timer = useRef<number | undefined>(undefined)
  const start = useCallback(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(onClose, TOAST_MS)
  }, [onClose])
  useEffect(() => {
    start()
    return () => window.clearTimeout(timer.current)
  }, [start])

  return (
    <div
      role="status"
      className="notify-toast pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-[0_18px_48px_rgb(15_23_42/0.18),0_2px_8px_rgb(15_23_42/0.06)]"
      onMouseEnter={() => window.clearTimeout(timer.current)}
      onMouseLeave={start}
    >
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        <KindIcon kind={note.kind} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{note.title}</span>
          <span className="mt-0.5 line-clamp-2 block text-sm leading-5 text-muted">{note.body}</span>
          <span className="mt-1 block text-xs font-semibold text-accent">Open</span>
        </span>
      </button>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="-mt-0.5 -mr-0.5 rounded-full p-1.5 text-[#9ca3af] hover:bg-ink/5 hover:text-ink">
        <CloseIcon className="size-4" />
      </button>
    </div>
  )
}

export function NotificationsProvider({ userId, children }: { userId?: string; children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [toasts, setToasts] = useState<Notification[]>([])
  const [sound, setSoundState] = useState(soundPreference.get)
  const cursor = useRef<string | null>(null)
  const pathRef = useRef(pathname)
  pathRef.current = pathname
  const soundRef = useRef(sound)
  soundRef.current = sound

  const markRead = useCallback(async (ids?: string[]) => {
    setItems((current) => current.map((n) => (!ids || ids.includes(n.id) ? { ...n, read: true } : n)))
    setUnread((current) => (ids ? Math.max(0, current - ids.length) : 0))
    try {
      const result = await api<{ unread: number }>('/notifications/read', { method: 'POST', body: ids ? { ids } : {} })
      setUnread(result.unread)
    } catch {
      return
    }
  }, [])

  useEffect(() => {
    const unlock = () => unlockSound()
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => {
    setItems([])
    setUnread(0)
    setLoaded(false)
    setToasts([])
    cursor.current = null
    if (!userId) return
    let alive = true
    let first = true
    const poll = async () => {
      if (!first && document.visibilityState !== 'visible') return
      try {
        const since = cursor.current
        const feed = await api<Feed>(`/notifications${since ? `?since=${encodeURIComponent(since)}` : ''}`)
        if (!alive) return
        setUnread(feed.unread)
        if (feed.notifications.length) cursor.current = feed.notifications[0].createdAt
        if (first) {
          first = false
          setItems(feed.notifications)
          setLoaded(true)
          return
        }
        const fresh = feed.notifications
        if (!fresh.length) return
        setItems((current) => {
          const known = new Set(current.map((n) => n.id))
          return [...fresh.filter((n) => !known.has(n.id)), ...current].slice(0, 30)
        })
        const here = fresh.filter((n) => !n.read && n.link === pathRef.current)
        const elsewhere = fresh.filter((n) => !n.read && n.link !== pathRef.current)
        if (here.length) void markRead(here.map((n) => n.id))
        if (elsewhere.length) {
          setToasts((current) => [...elsewhere.slice().reverse(), ...current].slice(0, MAX_TOASTS))
          if (soundRef.current) chime()
        }
        window.dispatchEvent(new Event(REFRESH_EVENT))
      } catch {
        return
      }
    }
    void poll()
    const timer = window.setInterval(() => void poll(), POLL_MS)
    const onVisible = () => document.visibilityState === 'visible' && void poll()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [markRead, userId])

  useEffect(() => {
    const ids = items.filter((n) => !n.read && n.link === pathname).map((n) => n.id)
    if (ids.length) void markRead(ids)
  }, [pathname, items, markRead])

  const dismiss = useCallback((id: string) => setToasts((current) => current.filter((n) => n.id !== id)), [])

  const open = useCallback(
    (note: Notification) => {
      dismiss(note.id)
      if (!note.read) void markRead([note.id])
      if (pathRef.current === note.link) window.dispatchEvent(new Event(REFRESH_EVENT))
      else navigate(note.link)
    },
    [dismiss, markRead, navigate],
  )

  const setSound = useCallback((on: boolean) => {
    soundPreference.set(on)
    setSoundState(on)
    if (on) {
      unlockSound()
      chime()
    }
  }, [])

  const value: NotificationsValue = { items, unread, loaded, sound, setSound, open, markAllRead: () => void markRead() }

  return (
    <NotificationsContext.Provider value={userId ? value : null}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-2 top-2 z-[2147483600] flex flex-col gap-2 sm:inset-x-auto sm:top-4 sm:right-4 sm:w-[380px]"
      >
        {toasts.map((note) => (
          <Toast key={note.id} note={note} onOpen={() => open(note)} onClose={() => dismiss(note.id)} />
        ))}
      </div>
    </NotificationsContext.Provider>
  )
}

export function NotificationBell({ align = 'right' }: { align?: 'left' | 'right' }) {
  const feed = useNotifications()
  const [openPanel, setOpenPanel] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => setOpenPanel(false), [pathname])
  useEffect(() => {
    if (!openPanel) return
    const onDown = (event: PointerEvent) => !ref.current?.contains(event.target as Node) && setOpenPanel(false)
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpenPanel(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openPanel])

  if (!feed) return null
  const { items, unread, loaded, sound, setSound, open, markAllRead } = feed

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpenPanel((current) => !current)}
        aria-expanded={openPanel}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative flex size-9 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink/25"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-danger px-1 text-center text-[10px] leading-[18px] font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      {openPanel && (
        <div
          role="dialog"
          aria-label="Notifications"
          className={`fixed inset-x-2 top-16 z-[2147483500] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_60px_rgb(15_23_42/0.18)] sm:absolute sm:inset-x-auto sm:top-full sm:mt-2 sm:w-[380px] ${
            align === 'right' ? 'sm:right-0' : 'sm:left-0'
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <p className="font-semibold text-ink">Notifications</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSound(!sound)}
                aria-pressed={sound}
                title={sound ? 'Sound on' : 'Sound off'}
                aria-label={sound ? 'Turn notification sound off' : 'Turn notification sound on'}
                className="rounded-full p-2 text-muted hover:bg-ink/5 hover:text-ink"
              >
                {sound ? <VolumeIcon /> : <MuteIcon />}
              </button>
              <button
                type="button"
                onClick={markAllRead}
                disabled={!unread}
                className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-accent enabled:hover:bg-accent-soft disabled:text-muted disabled:opacity-60"
              >
                Mark all as read
              </button>
            </div>
          </div>
          <ul className="max-h-[min(70svh,440px)] overflow-y-auto overscroll-contain">
            {!loaded ? (
              <li className="px-4 py-8 text-center text-sm text-muted">Loading…</li>
            ) : items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm leading-6 text-muted">
                You're all caught up. New bookings, posts, payments and messages will show up here.
              </li>
            ) : (
              items.map((note) => (
                <li key={note.id} className="border-b border-line last:border-0">
                  <button type="button" onClick={() => open(note)} className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[#f6f7f9] ${note.read ? '' : 'bg-accent-soft/40'}`}>
                    <KindIcon kind={note.kind} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className={`text-sm ${note.read ? 'font-medium text-body' : 'font-semibold text-ink'}`}>{note.title}</span>
                        <span className="shrink-0 text-[11px] text-muted">{timeAgo(note.createdAt)}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-sm leading-5 text-muted">{note.body}</span>
                    </span>
                    {!note.read && <span aria-label="Unread" className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
