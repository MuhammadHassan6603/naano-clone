export type Notification = {
  id: string
  kind: 'booked' | 'accepted' | 'declined' | 'expired' | 'submitted' | 'paid' | 'message'
  title: string
  body: string
  link: string
  createdAt: string
  read: boolean
}

const SOUND_KEY = 'naano-rebuild.sound'

export const soundPreference = {
  get(): boolean {
    try {
      return localStorage.getItem(SOUND_KEY) !== 'off'
    } catch {
      return true
    }
  },
  set(on: boolean) {
    try {
      localStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
    } catch {
      return
    }
  },
}

let audio: AudioContext | null = null

export function unlockSound() {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    audio ??= new Ctor()
    if (audio.state === 'suspended') void audio.resume()
  } catch {
    audio = null
  }
}

export function chime() {
  if (!audio || audio.state !== 'running') return
  const start = audio.currentTime
  for (const [index, frequency] of [880, 1318.5].entries()) {
    const at = start + index * 0.12
    const tone = audio.createOscillator()
    const gain = audio.createGain()
    tone.type = 'sine'
    tone.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(0.18, at + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.45)
    tone.connect(gain).connect(audio.destination)
    tone.start(at)
    tone.stop(at + 0.5)
  }
}

export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso))
}
