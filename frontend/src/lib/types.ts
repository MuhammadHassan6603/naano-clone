export type Role = 'brand' | 'creator'

export type User = {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
}

export type OwnProfile = {
  niche: string | null
  bio: string
  audience: string
  priceCents: number | null
  followers: number
}

export type Session = { token: string; user: User }

export type Reliability = { delivered: number; total: number }

export type Creator = {
  id: string
  name: string
  niche: string
  bio: string
  audience: string
  priceCents: number
  followers: number
  reliability: Reliability
  fit?: Fit
}

export type FitReason = { kind: 'niche' | 'audience' | 'budget'; match: boolean; label: string }

export type Fit = { matched: number; reasons: FitReason[] }

export type Target = { niches: string[]; audience: string; budgetCents: number | null }

export type CreatorSort = 'fit' | 'reliability' | 'price' | 'followers'

export type Wallet = {
  availableCents: number
  heldCents: number
  reconciled: boolean
}

export type TransactionType = 'topup' | 'hold' | 'release' | 'payout' | 'refund'

export type Transaction = {
  id: string
  type: TransactionType
  amountCents: number
  bookingId: string | null
  createdAt: string
}

export type BookingStatus = 'requested' | 'accepted' | 'submitted' | 'paid' | 'refunded'

export type Booking = {
  id: string
  status: BookingStatus
  brief: string
  destinationUrl: string
  priceCents: number
  deadline: string
  postUrl: string | null
  trackingUrl: string | null
  verifiedVia: 'brand' | 'click' | 'timeout' | null
  refundReason: 'declined' | 'expired' | null
  createdAt: string
  acceptedAt: string | null
  submittedAt: string | null
  closedAt: string | null
  brand: { id: string; name: string }
  creator: { id: string; name: string }
  unreadMessages?: number
}

export type Message = {
  id: string
  body: string
  createdAt: string
  sender: { id: string; name: string }
  mine: boolean
}

export type TimelineEvent = {
  at: string
  event: 'booked' | 'accepted' | 'submitted' | 'verified' | 'paid' | 'declined' | 'expired' | 'refunded'
  via?: 'brand' | 'click' | 'timeout'
}

export type BookingDetail = Booking & { timeline: TimelineEvent[] }

export type ClickStats = {
  totalClicks: number
  uniqueClicks: number
  byDay: { date: string; clicks: number }[]
}
