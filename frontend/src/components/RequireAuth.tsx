import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { withNext } from '../lib/navigation'
import type { Role } from '../lib/types'
import { Page } from './Layout'
import { ButtonLink } from './ui/Button'
import { EmptyState, LoadingState } from './ui/Feedback'

const roleCopy: Record<Role, { who: string; why: string }> = {
  brand: { who: 'brands', why: 'Brands book creators and hold money in escrow.' },
  creator: { who: 'creators', why: 'Creators accept bookings and get paid for verified posts.' },
}

export function RequireAuth({ role, children }: { role?: Role; children: ReactNode }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return (
      <Page narrow>
        <LoadingState label="Checking your session…" />
      </Page>
    )
  }
  if (!user) return <Navigate to={withNext('/login', location.pathname + location.search)} replace />
  if (role && user.role !== role) {
    return (
      <Page narrow>
        <EmptyState
          title={`This page is for ${roleCopy[role].who}`}
          message={`You're signed in as a ${user.role}. ${roleCopy[role].why}`}
          action={
            <ButtonLink to="/" variant="secondary">
              Back to the marketplace
            </ButtonLink>
          }
        />
      </Page>
    )
  }
  return children
}
