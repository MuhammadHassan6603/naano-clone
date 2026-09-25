import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { DEMO_PASSWORD, DemoAccounts } from '../components/DemoAccounts'
import { Page } from '../components/Layout'
import { PasswordField } from '../components/PasswordField'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/Field'
import { Notice, SlowServerHint } from '../components/ui/Feedback'
import { toApiError } from '../lib/api'
import { useAuth } from '../lib/auth'
import { homeFor, safeNext, usePageTitle, withNext } from '../lib/navigation'
import type { User } from '../lib/types'
import { emailProblem } from '../lib/validation'

export default function Login() {
  usePageTitle('Log in')
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, setPending] = useState<'form' | string | null>(null)

  if (user && pending === null) return <Navigate to={next ?? homeFor(user.role)} replace />

  async function attempt(address: string, secret: string, source: 'form' | string) {
    setPending(source)
    setServerError(null)
    try {
      const signedIn: User = await login(address.trim(), secret)
      navigate(next ?? homeFor(signedIn.role), { replace: true })
    } catch (error) {
      setServerError(toApiError(error).message)
      setPending(null)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const found = { email: emailProblem(email), password: password ? undefined : 'Enter your password.' }
    setErrors(found)
    if (found.email || found.password) return
    void attempt(email, password, 'form')
  }

  return (
    <Page>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
          <p className="mt-1 text-sm text-muted">
            {next ? 'Log in to continue where you left off.' : 'Welcome back.'}
          </p>

          <form onSubmit={submit} noValidate className="mt-6 space-y-5">
            {serverError && <Notice tone="error">{serverError}</Notice>}
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
            />
            <PasswordField
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
            />
            <Button type="submit" size="lg" className="w-full" loading={pending === 'form'} disabled={pending !== null}>
              Log in
            </Button>
            {pending !== null && <SlowServerHint />}
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            New here?{' '}
            <Link to={withNext('/signup', next)} className="font-semibold text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </section>

        <DemoAccounts
          pendingEmail={pending !== null && pending !== 'form' ? pending : null}
          onUse={(address) => {
            setEmail(address)
            setPassword(DEMO_PASSWORD)
            setErrors({})
            void attempt(address, DEMO_PASSWORD, address)
          }}
        />
      </div>
    </Page>
  )
}
