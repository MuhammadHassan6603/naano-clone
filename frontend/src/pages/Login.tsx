import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { DEMO_PASSWORD, DemoAccounts } from '../components/DemoAccounts'
import { AuthShell, authTitle } from '../components/AuthShell'
import { PasswordField } from '../components/PasswordField'
import { TextField } from '../components/ui/Field'
import { Notice, SlowServerHint, Spinner } from '../components/ui/Feedback'
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
    <AuthShell
      asideTitle="Try it with a demo account"
      aside={
        <DemoAccounts
          pendingEmail={pending !== null && pending !== 'form' ? pending : null}
          onUse={(address) => {
            setEmail(address)
            setPassword(DEMO_PASSWORD)
            setErrors({})
            void attempt(address, DEMO_PASSWORD, address)
          }}
        />
      }
    >
      <h1 className={authTitle}>Welcome back</h1>
      <p className="mt-1 text-sm text-[#6b7280]">
        {next ? 'Sign in to continue where you left off.' : 'Sign in to your account.'}
      </p>

      <form onSubmit={submit} noValidate className="mt-7 space-y-5">
        {serverError && <Notice tone="error">{serverError}</Notice>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
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
        <button
          type="submit"
          disabled={pending !== null}
          aria-busy={pending === 'form' || undefined}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-sm font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.24)] transition-colors hover:bg-[#1d4ed8] disabled:opacity-60"
        >
          {pending === 'form' && <Spinner />}
          Sign in
        </button>
        {pending !== null && <SlowServerHint />}
      </form>

      <p className="mt-6 text-center text-sm text-[#6b7280]">
        Don't have an account?{' '}
        <Link to={withNext('/signup', next)} className="font-semibold text-[#2563eb] hover:underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  )
}
