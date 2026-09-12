import type { Transition, Variants } from 'motion/react'

export const ease = [0.22, 0.61, 0.36, 1] as const

export const viewport = { once: true, amount: 0.25, margin: '0px 0px -80px 0px' } as const

export const spring: Transition = { type: 'spring', stiffness: 420, damping: 32, mass: 0.6 }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease } },
}

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})

export const press = { scale: 0.97 } as const

export const lift = { y: -3 } as const
