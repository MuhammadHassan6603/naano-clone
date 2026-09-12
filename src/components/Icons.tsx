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

export const CaretDown: Icon = (props) => (
  <svg viewBox="0 0 256 256" width="12" height="12" fill="currentColor" aria-hidden {...props}>
    <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z" />
  </svg>
)

export const Burger: Icon = (props) => (
  <svg viewBox="0 0 256 256" width="20" height="20" fill="currentColor" aria-hidden {...props}>
    <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
  </svg>
)

export const Sparkles: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...base} strokeWidth={2} {...props}>
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
    <path d="M20 2v4" />
    <path d="M22 4h-4" />
    <circle cx="4" cy="20" r="2" />
  </svg>
)

export const UserSearch: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...base} strokeWidth={2} {...props}>
    <circle cx="10" cy="7" r="4" />
    <path d="M10.3 15H7a4 4 0 0 0-4 4v2" />
    <circle cx="17" cy="17" r="3" />
    <path d="m21 21-1.9-1.9" />
  </svg>
)

export const Calculator: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...base} strokeWidth={2} {...props}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
)

export const TrendingUp: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...base} strokeWidth={2} {...props}>
    <path d="M16 7h6v6" />
    <path d="m22 7-8.5 8.5-5-5L2 17" />
  </svg>
)

export const Target: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...base} strokeWidth={2} {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

export const ChartPie: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...base} strokeWidth={2} {...props}>
    <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" />
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
  </svg>
)

export const ArrowRightLine: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden {...base} strokeWidth={2.2} {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

export const ArrowLeftLong: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden {...base} strokeWidth={2.2} {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

export const ArrowRightLong: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden {...base} strokeWidth={2.2} {...props}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="13 5 20 12 13 19" />
  </svg>
)

export const ArrowRightMid: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden {...base} strokeWidth={2.3} {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

export const Check: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden {...base} strokeWidth={3} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const PlayTriangle: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden {...props}>
    <path d="M8 5.5 L19 12 L8 18.5 Z" />
  </svg>
)

export const LinkedInBadge: Icon = (props) => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden {...props}>
    <rect width="24" height="24" rx="4" fill="#0A66C2" />
    <path
      fill="#FFFFFF"
      d="M7.2 9.6H4.8V19h2.4V9.6ZM6 5.2a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8ZM19.2 19h-2.4v-4.9c0-1.2-.5-1.9-1.5-1.9-.8 0-1.3.5-1.5 1.1-.1.2-.1.5-.1.8V19H11.3s.03-8.6 0-9.4h2.4v1.3c.3-.5.9-1.2 2.2-1.2 1.6 0 2.9 1 2.9 3.3V19Z"
    />
  </svg>
)
