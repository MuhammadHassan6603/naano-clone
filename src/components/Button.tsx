import type { ComponentProps, ReactNode } from 'react'
import { motion } from 'motion/react'
import { press, spring } from '../lib/motion'
import { ArrowRight } from './Icons'

type Variant = 'primary' | 'secondary' | 'ghost' | 'link'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = ComponentProps<typeof motion.a> & {
  children: ReactNode
  variant?: Variant
  size?: Size
  arrow?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white shadow-pill hover:bg-[#23262d]',
  secondary: 'bg-white text-ink border border-line hover:border-ink/25',
  ghost: 'text-ink hover:bg-ink/5',
  link: 'text-ink underline-offset-4 hover:underline px-0',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-[52px] px-7 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  arrow = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.a
      whileHover={variant === 'link' ? { x: 3 } : { y: -2 }}
      whileTap={press}
      transition={spring}
      className={`group inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
      {arrow && (
        <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </motion.a>
  )
}
