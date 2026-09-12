import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthAside, BrandRow, Noise, SocialButton } from '../components/AuthShell'
import { MarketplaceCard } from '../components/MarketplaceCard'
import { ArrowLeft, GoogleG, LinkedInMark, Mail } from '../components/Icons'

const pill = (active: boolean) =>
  `cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
    active ? 'border-[#2563eb] bg-[#2563eb] text-white' : 'border-[#D1D5DB] bg-white text-[#374151]'
  }`

const BackToOptions = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#4B5563] transition-colors duration-200 hover:text-[#111827]"
  >
    <ArrowLeft className="size-4" />
    Back to sign-up options
  </button>
)

const HeardRow = ({ options }: { options: string[] }) => {
  const [picked, setPicked] = useState('')
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={picked === option}
          onClick={() => setPicked((value) => (value === option ? '' : option))}
          className={pill(picked === option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function RoleChooser() {
  return (
    <>
      <Noise />
      <div className="flex min-h-screen">
        <div className="flex flex-1 items-center justify-center bg-white p-8">
          <div className="w-full max-w-md">
            <BrandRow />
            <h1 className="font-jakarta text-2xl font-bold text-[#111827]">Create your account</h1>
            <p className="mt-1 mb-6 text-sm text-[#6B7280]">First, who are you here as?</p>

            <div className="space-y-3">
              <Link
                to="/register?role=influencer"
                className="block rounded-xl border border-[#D1D5DB] p-5 transition-colors hover:border-[#2563eb] hover:bg-[#F5F8FF]"
              >
                <div className="text-base font-semibold text-[#111827]">I'm a creator</div>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Get paid to create LinkedIn content for B2B brands you actually use.
                </p>
              </Link>
              <Link
                to="/register?role=saas"
                className="block rounded-xl border border-[#D1D5DB] p-5 transition-colors hover:border-[#2563eb] hover:bg-[#F5F8FF]"
              >
                <div className="text-base font-semibold text-[#111827]">I'm a brand</div>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Find creators, launch campaigns, and trace real pipeline back to each post.
                </p>
              </Link>
            </div>

            <p className="mt-6 text-center text-xs text-[#6B7280]">
              Already have an account?{' '}
              <Link to="/login?reauth=1" className="font-medium text-[#2563eb]">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <AuthAside title="One platform. Two sides.">
          <p className="text-[#dbeafe]">
            Creators get paid to post. B2B brands get real pipeline. Pick where you fit and we'll set
            the rest up in a couple of minutes.
          </p>
        </AuthAside>
      </div>
    </>
  )
}

const brandField =
  'w-full rounded-[10px] border border-[#D1D5DB] px-3.5 py-2.5 text-[15px] text-[#0f172a] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb] focus:outline-none'

const brandLabel = 'text-xs font-bold tracking-wide text-[#5C5B57] uppercase'

function BrandSignup() {
  const [email, setEmail] = useState(false)

  return (
    <>
      <Noise />
      <div className="flex min-h-screen">
        <div className="flex min-w-0 flex-1 items-start justify-center overflow-y-auto bg-white p-6 sm:items-center sm:p-10">
          <div className="w-full max-w-md">
            <BrandRow className="mb-8 gap-4" />

            {email ? (
              <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                <BackToOptions onClick={() => setEmail(false)} />
                <h1 className="font-jakarta text-[1.75rem] font-extrabold tracking-tight text-[#0f172a]">
                  Join Naano
                </h1>
                <p className="text-[0.95rem] font-bold text-[#2563eb]">Creators. Brands. Results.</p>
                <p className="text-sm text-[#64748b]">
                  The #1 platform to run LinkedIn creator campaigns that drive real business.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={brandLabel}>First name</span>
                    <div className="mt-1.5">
                      <input autoComplete="given-name" placeholder="First name" className={brandField} />
                    </div>
                  </label>
                  <label className="block">
                    <span className={brandLabel}>Last name</span>
                    <div className="mt-1.5">
                      <input autoComplete="family-name" placeholder="Last name" className={brandField} />
                    </div>
                  </label>
                </div>

                <label className="block">
                  <span className={brandLabel}>Business email</span>
                  <div className="mt-1.5">
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      className={brandField}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className={brandLabel}>Password</span>
                  <div className="mt-1.5">
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      className={brandField}
                    />
                  </div>
                </label>

                <div>
                  <span className={brandLabel}>How did you hear about us?</span>
                  <div className="mt-1.5">
                    <HeardRow
                      options={['LinkedIn', 'Word of mouth', 'Google search', 'A creator', 'Other']}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-[10px] bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4fd7]"
                >
                  Continue
                </button>

                <p className="text-center text-xs text-[#64748b]">
                  Already have an account?{' '}
                  <Link to="/login?reauth=1" className="font-semibold text-[#2563eb]">
                    Sign in here
                  </Link>
                </p>
              </form>
            ) : (
              <div className="space-y-4">
                <h1 className="font-jakarta text-[1.75rem] font-extrabold tracking-tight text-[#0f172a]">
                  Join Naano
                </h1>
                <p className="text-[0.95rem] font-bold text-[#2563eb]">Creators. Brands. Results.</p>
                <p className="text-sm text-[#64748b]">
                  The #1 platform to run LinkedIn creator campaigns that drive real business.
                </p>

                <div className="space-y-3">
                  <SocialButton icon={<LinkedInMark />} label="Sign up with LinkedIn" />
                  <SocialButton icon={<GoogleG />} label="Sign up with Google" />
                </div>

                <SocialButton
                  icon={<Mail className="text-[#6B7280]" />}
                  label="Sign up with email"
                  onClick={() => setEmail(true)}
                />

                <p className="text-center text-xs text-[#64748b]">
                  Already have an account?{' '}
                  <Link to="/login?reauth=1" className="font-semibold text-[#2563eb]">
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        <AuthAside title="Creators. Brands. Results.">
          <p className="mb-8 text-[#dbeafe]">
            Run LinkedIn creator campaigns that drive real business - discover creators, track
            performance, pay in one click.
          </p>
          <div className="text-sm text-[#bfdbfe]">Built for B2B marketing teams</div>
        </AuthAside>
      </div>
    </>
  )
}

const creatorField =
  'w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] focus:ring-2 focus:ring-[#2563eb] focus:outline-none'

const creatorLabel = 'text-xs font-semibold tracking-wide text-[#5C5B57] uppercase'

function CreatorSignup() {
  const [email, setEmail] = useState(false)

  return (
    <>
      <Noise />
      <div className="font-jakarta flex h-[100dvh] max-h-full min-h-0 overflow-hidden">
        <div className="flex h-full min-h-0 flex-1 items-start justify-center overflow-y-auto overscroll-y-contain bg-white px-8 pt-[clamp(1.75rem,7dvh,4.5rem)] pb-10 sm:pb-12 xl:px-10">
          <div className="w-full max-w-md pb-4">
            <BrandRow />

            {email ? (
              <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                <BackToOptions onClick={() => setEmail(false)} />
                <div className="text-xs font-semibold tracking-wide text-[#2563eb] uppercase">
                  Step 1 of 4
                </div>
                <h1 className="text-2xl font-bold text-[#111827]">Join Naano</h1>
                <p className="text-sm text-[#6B7280]">
                  Get paid to create LinkedIn content for B2B brands you actually use.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={creatorLabel}>First name</span>
                    <div className="mt-1">
                      <input autoComplete="given-name" placeholder="First name" className={creatorField} />
                    </div>
                  </label>
                  <label className="block">
                    <span className={creatorLabel}>Last name</span>
                    <div className="mt-1">
                      <input autoComplete="family-name" placeholder="Last name" className={creatorField} />
                    </div>
                  </label>
                </div>

                <label className="block">
                  <span className={creatorLabel}>Email</span>
                  <div className="mt-1">
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@email.com"
                      className={creatorField}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className={creatorLabel}>Password</span>
                  <div className="mt-1">
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      className={creatorField}
                    />
                  </div>
                </label>

                <div>
                  <span className={creatorLabel}>How did you hear about us?</span>
                  <div className="mt-1">
                    <HeardRow
                      options={[
                        'LinkedIn',
                        'Another creator',
                        'Word of mouth',
                        'Google search',
                        'Other',
                      ]}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1D4ED8]"
                >
                  Continue
                </button>

                <p className="text-center text-xs text-[#6B7280]">
                  Already have an account?{' '}
                  <Link to="/login?reauth=1" className="font-medium text-[#2563eb]">
                    Sign in here
                  </Link>
                </p>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-xs font-semibold tracking-wide text-[#2563eb] uppercase">
                  Step 1 of 4
                </div>
                <h1 className="text-2xl font-bold text-[#111827]">Join Naano</h1>
                <p className="text-sm text-[#6B7280]">
                  Get paid to create LinkedIn content for B2B brands you actually use.
                </p>

                <div className="space-y-3">
                  <SocialButton icon={<LinkedInMark />} label="Sign up with LinkedIn" />
                  <SocialButton icon={<GoogleG />} label="Sign up with Google" />
                </div>

                <SocialButton
                  icon={<Mail className="text-[#6B7280]" />}
                  label="Sign up with email"
                  onClick={() => setEmail(true)}
                />

                <p className="text-center text-xs text-[#6B7280]">
                  Already have an account?{' '}
                  <Link to="/login?reauth=1" className="font-medium text-[#2563eb]">
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="hidden h-full min-h-0 flex-1 items-start justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#FFFFFF_0%,#F1F6FF_46%,#EEF0FF_100%)] px-8 pt-[clamp(1.75rem,7dvh,4.5rem)] pb-10 lg:flex xl:px-12">
          <div className="flex w-full max-w-[560px] flex-col items-center">
            <div className="mb-4 max-w-[500px] text-center xl:mb-5">
              <div className="text-xs font-bold tracking-[0.16em] text-[#2563EB] uppercase">
                Your Marketplace card
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#111827] xl:text-3xl">
                Build a card brands can trust.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#596273]">
                It updates live with your profile, analytics, positioning and price.
              </p>
            </div>
            <div className="relative w-full">
              <MarketplaceCard />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Register() {
  const [params] = useSearchParams()
  const role = params.get('role')

  if (role === 'influencer') return <CreatorSignup />
  if (role === 'saas') return <BrandSignup />
  return <RoleChooser />
}
