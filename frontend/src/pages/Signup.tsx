import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Page } from '../components/Layout'
import { PasswordField } from '../components/PasswordField'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/Field'
import { Notice, SlowServerHint } from '../components/ui/Feedback'
import { toApiError } from '../lib/api'
import { useAuth } from '../lib/auth'
import { homeFor, safeNext, usePageTitle, withNext } from '../lib/navigation'
import type { Role } from '../lib/types'
import { emailProblem, lengthProblem, passwordProblem } from '../lib/validation'

const roles: { value: Role; title: string; body: string }[] = [
  {
    value: 'brand',
    title: "I'm a brand",
    body: 'I want to book LinkedIn creators and only pay for posts that go live.',
  },
  {
    value: 'creator',
    title: "I'm a creator",
    body: 'I want brands to book me and get paid once my post is verified.',
  },
]

type Errors = { role?: string; name?: string; email?: string; password?: string }

export default function Signup() {
  usePageTitle('Create an account')
  const { user, signup } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const initialRole = params.get('role')

  const [role, setRole] = useState<Role | null>(initialRole === 'brand' || initialRole === 'creator' ? initialRole : null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState<{ message: string; emailTaken: boolean } | null>(null)
  const [pending, setPending] = useState(false)

  if (user && !pending) return <Navigate to={next ?? homeFor(user.role)} replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    const found: Errors = {
      role: role ? undefined : 'Choose whether you are a brand or a creator.',
      name: lengthProblem(name, { min: 1, max: 100, what: role === 'brand' ? 'The company name' : 'Your name' }),
      email: emailProblem(email),
      password: passwordProblem(password),
    }
    setErrors(found)
    if (!role || Object.values(found).some(Boolean)) return

    setPending(true)
    setServerError(null)
    try {
      const created = await signup({ role, name: name.trim(), email: email.trim(), password })
      navigate(next ?? homeFor(created.role), { replace: true })
    } catch (error) {
      const apiError = toApiError(error)
      setServerError({ message: apiError.message, emailTaken: apiError.status === 409 })
      setPending(false)
    }
  }

  return (
    <Page narrow>
      <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="mt-1 text-sm text-muted">
          Free, and it takes a minute. Your role can't be changed later, so pick the one that fits.
        </p>

        <form onSubmit={submit} noValidate className="mt-6 space-y-5">
          {serverError && (
            <Notice tone="error">
              {serverError.message}
              {serverError.emailTaken && (
                <>
                  {' '}
                  <Link to={withNext('/login', next)} className="font-semibold underline">
                    Log in instead
                  </Link>
                </>
              )}
            </Notice>
          )}

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-ink">Who are you here as?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {roles.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                    role === option.value ? 'border-accent bg-accent-soft' : 'border-line-strong hover:border-ink/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => {
                      setRole(option.value)
                      setErrors((current) => ({ ...current, role: undefined }))
                    }}
                    className="mt-1 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{option.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted">{option.body}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.role && <p className="text-sm text-danger">{errors.role}</p>}
          </fieldset>

          <TextField
            label={role === 'brand' ? 'Company name' : 'Your name'}
            autoComplete={role === 'brand' ? 'organization' : 'name'}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
            hint={role === 'creator' ? 'Shown to brands on your creator card.' : undefined}
          />
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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            hint="At least 8 characters."
          />
          <Button type="submit" size="lg" className="w-full" loading={pending}>
            Create account
          </Button>
          {pending && <SlowServerHint />}
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to={withNext('/login', next)} className="font-semibold text-accent hover:underline">
            Log in
          </Link>
        </p>
      </section>
    </Page>
  )
}
