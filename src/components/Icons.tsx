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

export const ArrowLeft: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...base} strokeWidth={2} {...props}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
)

export const GlobeThin: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden {...base} strokeWidth={1.8} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
)

export const EyeOff: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...base} strokeWidth={2} {...props}>
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </svg>
)

export const Eye: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...base} strokeWidth={2} {...props}>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const Mail: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...base} strokeWidth={2} {...props}>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    <rect x="2" y="4" width="20" height="16" rx="2" />
  </svg>
)

export const LinkedInMark: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="#0A66C2" aria-hidden {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.61 0 4.27 2.38 4.27 5.47v6.27ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
  </svg>
)

export const GoogleG: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
  </svg>
)
