import { firstName, formatDateTime, formatMoney } from './format'
import type { Booking, BookingStatus, Role, TimelineEvent } from './types'

export const AUTO_APPROVE_MS = 72 * 60 * 60 * 1000

export type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'muted'

export const counterpart = (booking: Booking, role: Role) => (role === 'brand' ? booking.creator : booking.brand)

export function statusLabel(booking: Booking, role: Role): { label: string; tone: Tone } {
  const brand = role === 'brand'
  switch (booking.status) {
    case 'requested':
      return brand ? { label: 'Waiting for creator', tone: 'neutral' } : { label: 'New request', tone: 'warning' }
    case 'accepted':
      return brand ? { label: 'Accepted · not posted yet', tone: 'info' } : { label: 'Submit your post', tone: 'warning' }
    case 'submitted':
      return brand ? { label: 'Posted · needs your approval', tone: 'warning' } : { label: 'Posted · being verified', tone: 'info' }
    case 'paid':
      return { label: brand ? 'Paid' : 'Paid to you', tone: 'success' }
    case 'refunded':
      return { label: booking.refundReason === 'declined' ? 'Declined · refunded' : 'Expired · refunded', tone: 'muted' }
  }
}

export function moneyLine(booking: Booking, role: Role): string {
  const price = formatMoney(booking.priceCents)
  const name = firstName(counterpart(booking, role).name)
  if (booking.status === 'paid') return role === 'brand' ? `${price} paid to ${name}` : `${price} paid to you`
  if (booking.status === 'refunded') return role === 'brand' ? `${price} refunded to you` : 'Not paid'
  return role === 'brand' ? `${price} held in escrow` : `${price} held for you`
}

export const isOpen = (booking: Booking) => booking.status !== 'paid' && booking.status !== 'refunded'

export function needsAction(booking: Booking, role: Role): boolean {
  return role === 'brand' ? booking.status === 'submitted' : booking.status === 'requested' || booking.status === 'accepted'
}

export const autoApproveAt = (booking: Booking) =>
  booking.submittedAt ? new Date(new Date(booking.submittedAt).getTime() + AUTO_APPROVE_MS) : null

export type BookingTab = 'action' | 'progress' | 'done' | 'all'

export const TABS: { value: BookingTab; label: string }[] = [
  { value: 'action', label: 'Needs action' },
  { value: 'progress', label: 'In progress' },
  { value: 'done', label: 'Completed' },
  { value: 'all', label: 'All' },
]

export function inTab(booking: Booking, tab: BookingTab, role: Role): boolean {
  if (tab === 'all') return true
  if (tab === 'action') return needsAction(booking, role)
  if (tab === 'progress') return isOpen(booking) && !needsAction(booking, role)
  return !isOpen(booking)
}

export function eventText(event: TimelineEvent, booking: Booking): string {
  const price = formatMoney(booking.priceCents)
  const creator = firstName(booking.creator.name)
  switch (event.event) {
    case 'booked':
      return `Booked. ${price} held in escrow`
    case 'accepted':
      return `${creator} accepted the brief`
    case 'submitted':
      return `${creator} submitted the live post`
    case 'verified':
      return event.via === 'click'
        ? 'Verified live by the first reader click'
        : event.via === 'timeout'
          ? 'Auto-approved after 72 hours'
          : `Approved by ${booking.brand.name}`
    case 'paid':
      return `${price} paid to ${creator}`
    case 'declined':
      return `${creator} declined the request`
    case 'expired':
      return 'Deadline passed without a post'
    case 'refunded':
      return `${price} refunded to ${booking.brand.name}`
  }
}

export function upcomingSteps(booking: Booking): string[] {
  const creator = firstName(booking.creator.name)
  const steps: Record<BookingStatus, string[]> = {
    requested: [`${creator} accepts the brief`, `${creator} publishes and submits the post`, 'Post verified, then paid'],
    accepted: [`${creator} publishes and submits the post`, 'Post verified, then paid'],
    submitted: ['Post verified, then paid'],
    paid: [],
    refunded: [],
  }
  return steps[booking.status]
}

const LINKEDIN = /^https:\/\/([a-z0-9-]+\.)*linkedin\.com\//i

export function linkedInPostProblem(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return 'Paste the link to your LinkedIn post.'
  try {
    new URL(trimmed)
  } catch {
    return 'That is not a full link.'
  }
  if (!LINKEDIN.test(trimmed)) return 'Use the https link of the post on linkedin.com.'
}

export function nextStepText(booking: Booking, role: Role): string {
  const price = formatMoney(booking.priceCents)
  const creator = firstName(booking.creator.name)
  const brand = booking.brand.name
  const deadline = formatDateTime(booking.deadline)
  const autoAt = autoApproveAt(booking)
  const auto = autoAt ? formatDateTime(autoAt.toISOString()) : ''

  if (role === 'brand') {
    switch (booking.status) {
      case 'requested':
        return `${creator} hasn't responded yet. If they don't accept and post by ${deadline}, your ${price} comes back automatically.`
      case 'accepted':
        return `${creator} accepted and is preparing the post. It has to be submitted by ${deadline}, otherwise you're refunded.`
      case 'submitted':
        return `${creator} has posted. Check the post, then approve it to release the payment. The first real reader click on your tracked link also verifies it, and if nothing happens it is approved automatically on ${auto}.`
      case 'paid':
        return `Delivered. ${price} was released from escrow to ${creator}.`
      case 'refunded':
        return booking.refundReason === 'declined'
          ? `${creator} declined, so ${price} went straight back to your available balance.`
          : `No post arrived before the deadline, so ${price} went back to your available balance.`
    }
  }
  switch (booking.status) {
    case 'requested':
      return `${brand} wants one post and has already put ${price} in escrow for you. Accept to get your tracked link, or decline to return the money.`
    case 'accepted':
      return `Publish the post on LinkedIn with your tracked link, then paste the post's link below before ${deadline}.`
    case 'submitted':
      return `Your post is in. You're paid when ${brand} approves it, when the first reader clicks your link, or automatically on ${auto}.`
    case 'paid':
      return `${price} was added to your wallet.`
    case 'refunded':
      return booking.refundReason === 'declined'
        ? `You declined this request, so ${brand} got the money back.`
        : `The deadline passed before a post was submitted, so ${brand} was refunded.`
  }
}
