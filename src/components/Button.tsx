import type { ComponentProps, ReactNode } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { press, spring } from '../lib/motion'
import { ArrowRight } from './Icons'
import { isExternal } from './SmartLink'

const MotionLink = motion.create(Link)

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
  sm: 'h-9 px-3.5 text-[0.875rem]',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-11 px-6 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  arrow = false,
  className = '',
  href = '',
  ...props
}: ButtonProps) {
  const shared = {
    whileHover: variant === 'link' ? { x: 3 } : { y: -2 },
    whileTap: press,
    transition: spring,
    className: `group inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`,
  }
  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  )

  if (href && !isExternal(href)) {
    return (
      <MotionLink to={href} {...shared} {...props}>
        {content}
      </MotionLink>
    )
  }

  return (
    <motion.a href={href} target={href ? '_blank' : undefined} rel={href ? 'noopener noreferrer' : undefined} {...shared} {...props}>
      {content}
    </motion.a>
  )
}
