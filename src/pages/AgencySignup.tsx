import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const ArrowRight = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const listIcon = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

const Building = () => (
  <svg {...listIcon}>
    <path d="M10 12h4" />
    <path d="M10 8h4" />
    <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
    <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
    <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
  </svg>
)

const Landmark = () => (
  <svg {...listIcon}>
    <path d="M10 18v-7" />
    <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z" />
    <path d="M14 18v-7" />
    <path d="M18 18v-7" />
    <path d="M3 22h18" />
    <path d="M6 18v-7" />
  </svg>
)

const Users = () => (
  <svg {...listIcon}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <path d="M16 3.128a4 4 0 0 1 0 7.744" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <circle cx="9" cy="7" r="4" />
  </svg>
)

const ShieldCheck = () => (
  <svg {...listIcon}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const Tick = () => (
  <svg {...listIcon}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

type Variant = {
  eyebrow: string
  title: string
  copy: string
  points: { icon: ReactNode; label: string }[]
  formCopy: string
  loginTo: string
}

const variants: Record<'brand' | 'talent', Variant> = {
  brand: {
    eyebrow: 'Brand agency workspace',
    title: 'Run every client campaign from one portfolio.',
    copy: 'Create client workspaces, assign their budgets and monitor delivery without mixing accounts.',
    points: [
      { icon: <Building />, label: 'One workspace per client company' },
      { icon: <Landmark />, label: 'Budgets allocated from one dashboard' },
      { icon: <Tick />, label: 'One operational queue across campaigns' },
    ],
    formCopy: 'Use the login of the person who will manage client workspaces.',
    loginTo: '/login?redirectTo=/agency',
  },
  talent: {
    eyebrow: 'Talent agency workspace',
    title: 'Run every creator operation from one place.',
    copy: 'Import your roster, manage collaborations and collect agency earnings without creating accounts for your creators.',
    points: [
      { icon: <Users />, label: 'Import all your creators in minutes' },
      { icon: <ShieldCheck />, label: 'Creators never need to log in' },
      { icon: <Tick />, label: 'One task list for the whole agency' },
    ],
    formCopy: 'This login belongs to the agency manager, not to a creator.',
    loginTo: '/login?redirectTo=/talent-agency',
  },
}

export default function AgencySignup({ variant }: { variant: 'brand' | 'talent' }) {
  const data = variants[variant]
  const [submitted, setSubmitted] = useState(false)

  return (
    <>
      <div className="bg-noise" aria-hidden />
      <main className="ag-page">
        <section className="ag-shell">
          <aside className="ag-intro">
            <Link to="/" className="ag-logo" aria-label="Naano">
              Naano
            </Link>
            <div>
              <span className="ag-eyebrow">{data.eyebrow}</span>
              <h1>{data.title}</h1>
              <p>{data.copy}</p>
            </div>
            <ul>
              {data.points.map((point) => (
                <li key={point.label}>
                  {point.icon}
                  <span>{point.label}</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="ag-form-panel">
            <div className="ag-progress" aria-label="Onboarding progress">
              <span className="ag-current" />
              <span />
              <span />
            </div>
            <form
              className="ag-form"
              onSubmit={(event) => {
                event.preventDefault()
                setSubmitted(true)
              }}
            >
              <div>
                <span className="ag-step">Step 1 of 3</span>
                <h2>Create your agency account</h2>
                <p>{data.formCopy}</p>
              </div>

              <div className="ag-two-columns">
                <label>
                  <span>First name</span>
                  <input required autoComplete="given-name" />
                </label>
                <label>
                  <span>Last name</span>
                  <input required autoComplete="family-name" />
                </label>
              </div>

              <label>
                <span>Work email</span>
                <input required type="email" autoComplete="email" />
              </label>

              <label>
                <span>Password</span>
                <input required minLength={8} type="password" autoComplete="new-password" />
                <small>At least 8 characters</small>
              </label>

              {submitted && (
                <p className="ag-status" role="status">
                  Thanks — we'll email you the next step.
                </p>
              )}

              <button type="submit">
                <ArrowRight />
                Continue
              </button>

              <p className="ag-login">
                Already have an account? <Link to={data.loginTo}>Log in</Link>
              </p>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}
