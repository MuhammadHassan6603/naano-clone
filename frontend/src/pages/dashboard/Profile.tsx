import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CreatorCard } from '../../components/CreatorCard'
import { CreatorProfileForm } from '../../components/CreatorProfileForm'
import { DashboardHeader, Panel } from '../../components/dashboard/DashboardLayout'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback'
import { useAuth } from '../../lib/auth'
import { usePageTitle } from '../../lib/navigation'
import type { Creator, OwnProfile, User } from '../../lib/types'
import { useApi } from '../../lib/useApi'

function ProfileEditor({ user, profile, niches, reliability }: { user: User; profile?: OwnProfile; niches: string[]; reliability: Creator['reliability'] }) {
  const [listed, setListed] = useState(Boolean(profile?.priceCents && profile.niche))

  return (
    <CreatorProfileForm
      user={user}
      profile={profile}
      niches={niches}
      reliability={reliability}
      submitLabel={listed ? 'Save changes' : 'Save and go live'}
      onSaved={() => setListed(true)}
      extraActions={
        listed && (
          <Link to={`/creators/${user.id}`} className="text-sm font-semibold text-accent hover:underline">
            View your public page
          </Link>
        )
      }
      layout={(form, preview) => (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          <Panel guide="profile-form">
            {form}
            <p className="mt-4 text-sm text-muted">A new price only applies to new bookings. Bookings already made keep their price.</p>
          </Panel>
          <div data-guide="profile-preview" className="space-y-3 lg:sticky lg:top-6">
            <p className="text-sm font-semibold text-muted">
              {listed ? 'Live on the marketplace' : 'Preview. Not on the marketplace until you save your profile.'}
            </p>
            <CreatorCard creator={preview} preview />
          </div>
        </div>
      )}
    />
  )
}

export default function Profile() {
  usePageTitle('My profile')
  const { user } = useAuth()
  const me = useApi<{ user: User; profile?: OwnProfile }>('/auth/me')
  const market = useApi<{ creators: Creator[]; niches: string[] }>('/creators')
  const listed = Boolean(me.data?.profile?.priceCents)
  const card = useApi<{ creator: Creator }>(listed && user ? `/creators/${user.id}` : null, { refreshOnFocus: true })
  const ready = Boolean(me.data && market.data && (!listed || card.data || card.error))

  if (!user) return null
  if (user.role !== 'creator') {
    return <EmptyState title="Only creators have a public profile" message="Brands book creators from the marketplace. Your bookings and wallet are in the menu." />
  }
  const error = me.error ?? market.error

  return (
    <>
      <DashboardHeader title="My profile" subtitle="This is the card brands see on the marketplace. Keep it honest and specific." />
      {ready && me.data && market.data ? (
        <ProfileEditor
          user={user}
          profile={me.data.profile}
          niches={market.data.niches}
          reliability={card.data?.creator.reliability ?? { delivered: 0, total: 0 }}
        />
      ) : error ? (
        <ErrorState
          title="Couldn't load your profile"
          message={error.message}
          action={
            <Button
              onClick={() => {
                me.reload()
                market.reload()
              }}
            >
              Try again
            </Button>
          }
        />
      ) : (
        <LoadingState label="Loading your profile…" slow={me.slow || market.slow} />
      )}
    </>
  )
}
