import type { SVGProps } from 'react'

type Icon = (props: SVGProps<SVGSVGElement>) => React.JSX.Element

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const ArrowRight: Icon = (props) => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden {...base} {...props}>
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
)

export const ChevronDown: Icon = (props) => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden {...base} {...props}>
    <path d="m5 8 5 5 5-5" />
  </svg>
)

export const Globe: Icon = (props) => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden {...base} {...props}>
    <circle cx="10" cy="10" r="7" />
    <path d="M3 10h14M10 3c1.9 2 2.9 4.4 2.9 7s-1 5-2.9 7c-1.9-2-2.9-4.4-2.9-7s1-5 2.9-7Z" />
  </svg>
)

export const Shield: Icon = (props) => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden {...base} {...props}>
    <path d="M10 2.5 4.5 5v4.6c0 3.4 2.2 6.4 5.5 7.9 3.3-1.5 5.5-4.5 5.5-7.9V5L10 2.5Z" />
  </svg>
)

export const Menu: Icon = (props) => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden {...base} {...props}>
    <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
  </svg>
)

export const Close: Icon = (props) => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden {...base} {...props}>
    <path d="m5 5 10 10M15 5 5 15" />
  </svg>
)

export const LinkedIn: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden {...props}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05C21.3 8.65 22 10.9 22 14v7h-4v-6.2c0-1.48-.03-3.39-2.07-3.39-2.07 0-2.39 1.61-2.39 3.28V21h-4V9Z" />
  </svg>
)

export const XLogo: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden {...props}>
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.67l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64Z" />
  </svg>
)
