import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { Spinner } from './Feedback'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-px active:translate-y-0 disabled:translate-y-0 disabled:opacity-55'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white shadow-pill hover:bg-[#23262d]',
  secondary: 'border border-line bg-white text-ink hover:border-ink/25',
  ghost: 'text-ink hover:bg-ink/5',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.875rem]',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-12 px-6 text-base',
}

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', extra = '') =>
  `${base} ${variants[variant]} ${sizes[size]} ${extra}`

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

export function Button({ variant, size, loading = false, className = '', disabled, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

type ButtonLinkProps = LinkProps & { variant?: Variant; size?: Size }

export function ButtonLink({ variant, size, className = '', ...props }: ButtonLinkProps) {
  return <Link {...props} className={buttonClass(variant, size, className)} />
}
