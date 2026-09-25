import type { ReactNode } from 'react'
import { BookingList, StatCard } from '../../components/dashboard/BookingBits'
import { DashboardHeader, Panel } from '../../components/dashboard/DashboardLayout'
import { Button, ButtonLink } from '../../components/ui/Button'
import { ErrorState, LoadingState, Notice } from '../../components/ui/Feedback'
import { LockIcon, WalletIcon } from '../../components/ui/Icons'
import { useAuth } from '../../lib/auth'
import { isOpen, needsAction } from '../../lib/bookings'
import { firstName, formatMoney } from '../../lib/format'
import { usePageTitle } from '../../lib/navigation'
import type { Booking, Creator, OwnProfile, User, Wallet } from '../../lib/types'
import { useApi } from '../../lib/useApi'

function useDashboardData() {
  const bookings = useApi<{ bookings: Booking[] }>('/bookings', { refreshOnFocus: true })
  const wallet = useApi<Wallet>('/wallet', { refreshOnFocus: true })
  const retry = () => {
    bookings.reload()
    wallet.reload()
  }
  return { bookings, wallet, retry }
}

function Loading({ children }: { children: (bookings: Booking[], wallet: Wallet) => ReactNode }) {
  const { bookings, wallet, retry } = useDashboardData()
  if (bookings.data && wallet.data) return <>{children(bookings.data.bookings, wallet.data)}</>
  const error = bookings.error ?? wallet.error
  if (error) return <ErrorState title="Couldn't load your dashboard" message={error.message} action={<Button onClick={retry}>Try again</Button>} />
  return <LoadingState label="Loading your dashboard…" slow={bookings.slow || wallet.slow} />
}

const quiet = (text: string) => <p className="text-sm leading-6 text-muted">{text}</p>

function BrandOverview({ user }: { user: User }) {
  return (
    <>
      <DashboardHeader
        title={`Welcome back, ${firstName(user.name)}`}
        subtitle="The creators you booked, what they've posted, and where your money is."
        actions={<ButtonLink to="/#creators">Find creators</ButtonLink>}
      />
      <Loading>
        {(bookings, wallet) => {
          const toApprove = bookings.filter((b) => needsAction(b, 'brand'))
          const running = bookings.filter((b) => isOpen(b) && !needsAction(b, 'brand'))
          const finished = bookings.filter((b) => !isOpen(b)).slice(0, 5)
          const delivered = bookings.filter((b) => b.status === 'paid').length
          return (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<WalletIcon />} label="Available" value={formatMoney(wallet.availableCents)} note="Ready for new bookings" />
                <StatCard icon={<LockIcon className="text-held" />} label="Held in escrow" value={formatMoney(wallet.heldCents)} tone="text-held" note="Locked until posts are verified" />
                <StatCard label="Active bookings" value={String(toApprove.length + running.length)} note={`${toApprove.length} waiting for your approval`} />
                <StatCard label="Posts delivered" value={String(delivered)} note="Verified and paid" />
              </div>

              {bookings.length === 0 ? (
                <Panel>
                  <div className="py-8 text-center">
                    <h2 className="text-lg font-semibold">No bookings yet</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                      Pick a creator from the marketplace. Their price is held in escrow and only paid once the post is verified live.
                    </p>
                    <div className="mt-5 flex justify-center">
                      <ButtonLink to="/#creators">Browse creators</ButtonLink>
                    </div>
                  </div>
                </Panel>
              ) : (
                <>
                  <Panel title="Needs your approval">
                    <BookingList bookings={toApprove} role="brand" empty={quiet('Nothing to approve. When a creator submits a post, it shows up here.')} />
                  </Panel>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Panel title="In progress">
                      <BookingList bookings={running} role="brand" empty={quiet('No bookings waiting on a creator right now.')} />
                    </Panel>
                    <Panel title="Recently finished" action={<ButtonLink to="/dashboard/bookings?tab=all" variant="ghost" size="sm">View all</ButtonLink>}>
                      <BookingList bookings={finished} role="brand" empty={quiet('Paid and refunded bookings appear here.')} />
                    </Panel>
                  </div>
                </>
              )}
            </div>
          )
        }}
      </Loading>
    </>
  )
}

function CreatorOverview({ user }: { user: User }) {
  const me = useApi<{ user: User; profile?: OwnProfile }>('/auth/me')
  const listed = Boolean(me.data?.profile?.priceCents && me.data.profile.niche)
  const card = useApi<{ creator: Creator }>(listed ? `/creators/${user.id}` : null)
  const reliability = card.data?.creator.reliability

  return (
    <>
      <DashboardHeader
        title={`Welcome back, ${firstName(user.name)}`}
        subtitle="Requests from brands, posts to deliver, and what you've earned."
        actions={<ButtonLink to="/dashboard/profile" variant="secondary">Edit profile</ButtonLink>}
      />
      {me.data && !listed && (
        <div className="mb-6">
          <Notice tone="warning" title="Brands can't find you yet">
            Add your niche and price per post so your card appears on the marketplace.{' '}
            <ButtonLink to="/dashboard/profile" size="sm" className="mt-3">
              Set up your profile
            </ButtonLink>
          </Notice>
        </div>
      )}
      <Loading>
        {(bookings, wallet) => {
          const requests = bookings.filter((b) => b.status === 'requested')
          const toPost = bookings.filter((b) => b.status === 'accepted')
          const verifying = bookings.filter((b) => b.status === 'submitted')
          const finished = bookings.filter((b) => !isOpen(b)).slice(0, 5)
          return (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<WalletIcon />} label="Earned" value={formatMoney(wallet.availableCents)} tone="text-good" note="Paid for verified posts" />
                <StatCard label="New requests" value={String(requests.length)} note="Waiting for your answer" />
                <StatCard label="In progress" value={String(toPost.length + verifying.length)} note={`${toPost.length} to post, ${verifying.length} being verified`} />
                <StatCard
                  label="Track record"
                  value={reliability?.total ? `${reliability.delivered}/${reliability.total}` : 'New'}
                  note={reliability?.total ? 'Bookings delivered' : 'No finished bookings yet'}
                />
              </div>
              <Panel title="New requests">
                <BookingList bookings={requests} role="creator" empty={quiet('No new requests. Brands that book you appear here, with the money already held in escrow.')} />
              </Panel>
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Posts to submit">
                  <BookingList bookings={toPost} role="creator" empty={quiet('Nothing to post right now.')} />
                </Panel>
                <Panel title="Being verified">
                  <BookingList bookings={verifying} role="creator" empty={quiet('Submitted posts wait here until they are verified and paid.')} />
                </Panel>
              </div>
              <Panel title="Recently finished" action={<ButtonLink to="/dashboard/bookings?tab=all" variant="ghost" size="sm">View all</ButtonLink>}>
                <BookingList bookings={finished} role="creator" empty={quiet('Paid, declined and expired bookings appear here.')} />
              </Panel>
            </div>
          )
        }}
      </Loading>
    </>
  )
}

export default function Overview() {
  usePageTitle('Dashboard')
  const { user } = useAuth()
  if (!user) return null
  return user.role === 'brand' ? <BrandOverview user={user} /> : <CreatorOverview user={user} />
}
