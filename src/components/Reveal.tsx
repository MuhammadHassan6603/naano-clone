import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { fadeUp, viewport } from '../lib/motion'

type RevealProps = {
  children: ReactNode
  variants?: Variants
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article' | 'header' | 'span'
}

export function Reveal({
  children,
  variants = fadeUp,
  delay = 0,
  className,
  as = 'div',
}: RevealProps) {
  const Tag = motion[as]

  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      transition={{ delay }}
    >
      {children}
    </Tag>
  )
}
