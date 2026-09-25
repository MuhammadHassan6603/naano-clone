import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthAside, BrandRow, Noise, SocialButton } from '../components/AuthShell'
import { Eye, EyeOff, GoogleG, LinkedInMark } from '../components/Icons'

const field =
  'w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3.5 text-sm text-[#111827] transition-all placeholder:text-[#9CA3AF] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 focus:outline-none'

const label = 'block text-xs font-semibold tracking-wide text-[#5C5B57] uppercase'

export default function Login() {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Noise />
      <div className="flex min-h-screen">
        <div className="flex flex-1 items-center justify-center bg-white p-8">
          <div className="w-full max-w-md">
            <BrandRow />
            <h1 className="font-jakarta text-2xl font-bold text-[#111827]">Welcome back</h1>
            <p className="mt-1 mb-6 text-sm text-[#6B7280]">Sign in to your account</p>

            <form className="space-y-5" noValidate onSubmit={(event) => event.preventDefault()}>
              <div className="space-y-3">
                <SocialButton icon={<LinkedInMark />} label="Continue with LinkedIn" />
                <SocialButton icon={<GoogleG />} label="Continue with Google" />
              </div>

              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-[#E9E9E7]" />
                  <span className="text-[11px] font-medium tracking-wide text-[#9B9A97] uppercase">
                    Or continue with email
                  </span>
                  <span className="h-px flex-1 bg-[#E9E9E7]" />
                </div>

                <div>
                  <label htmlFor="login-email" className={`${label} mb-1.5 ml-1`}>
                    Email
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="john@company.com"
                    className={field}
                  />
                </div>

                <div>
                  <div className="mb-1.5 ml-1 flex items-center justify-between">
                    <label htmlFor="login-password" className={label}>
                      Password
                    </label>
                    <Link
                      to="/login"
                      className="text-xs font-medium text-[#2563eb] transition-colors hover:text-[#1d4ed8]"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      type={visible ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={`${field} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setVisible((value) => !value)}
                      aria-label={visible ? 'Hide password' : 'Show password'}
                      className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-[#9B9A97] transition-colors hover:bg-[#F7F6F3] hover:text-[#37352F]"
                    >
                      {visible ? <Eye /> : <EyeOff />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-sm font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.24)] transition-all hover:bg-[#1d4ed8]"
                >
                  Sign in
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-[#6B7280]">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-[#2563eb]">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <AuthAside title="Welcome back.">
          <p className="text-[#dbeafe]">
            Sign in to manage your campaigns, creators and payouts, all in one place.
          </p>
        </AuthAside>
      </div>
    </>
  )
}
