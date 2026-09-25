import { Link } from 'react-router-dom'
import { SmartLink } from './SmartLink'

const product = [
  { label: 'Features', href: '/#workflow' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQs', href: '/#faq' },
  { label: 'Blog', href: '/blog' },
  { label: 'Free Tools', href: '/free-tools' },
  { label: 'Benchmarks', href: 'https://naano.com/benchmarks/q2-2026' },
  { label: 'About', href: 'https://naano.com/about' },
]

const company = [
  { label: 'Help Center', href: 'https://naano.com/help' },
  { label: 'Privacy', href: 'https://naano.com/privacy' },
  { label: 'Terms of Sale & Use', href: 'https://naano.com/terms' },
]

const press = [
  {
    label: 'Interview Thomas Marcelle — Xymag.tv',
    href: 'https://www.xymag.tv/les-videos/interview-de-thomas-marcelle-createur-de-naano/',
  },
  {
    label: 'Naano on FounderTrace',
    href: 'https://foundertrace.fr/25-000e-de-ca-en-2-mois-comment-trois-etudiants-ont-reinvente-la-micro-influence-b2b-avec-naano/',
  },
  {
    label: 'Naano on TechnicalBeep',
    href: 'https://technicalbeep.com/naano-b2b-linkedin-creator-pay-per-click/',
  },
]

const resources = [
  { label: 'Best B2B influencer platforms 2026', href: 'https://naano.com/best-b2b-influencer-marketing-platforms-2026' },
  { label: 'Creator-led growth for B2B', href: 'https://naano.com/blog/creator-led-growth-b2b' },
  { label: 'B2B influencer marketing cost', href: 'https://naano.com/blog/b2b-influencer-marketing-cost' },
  { label: 'What is a B2B creator marketplace?', href: 'https://naano.com/blog/what-is-a-b2b-creator-marketplace' },
  { label: 'Launch a LinkedIn creator campaign', href: 'https://naano.com/blog/launch-b2b-linkedin-creator-campaign' },
  { label: 'LinkedIn Creator Marketplace in Europe', href: 'https://naano.com/blog/linkedin-creator-marketplace-europe' },
  { label: 'How to pay B2B creators', href: 'https://naano.com/blog/how-to-pay-b2b-creators' },
  { label: 'Creator Marketplace explained', href: 'https://naano.com/blog/linkedin-creator-marketplace-explained' },
  { label: 'LinkedIn Ads vs creator-led CPL', href: 'https://naano.com/blog/linkedin-ads-vs-creator-led-cpl' },
  { label: 'Nano vs macro creators in B2B', href: 'https://naano.com/blog/nano-vs-macro-creators-b2b-ctr' },
  { label: 'B2B influence on LinkedIn', href: 'https://naano.com/blog/b2b-influence-linkedin' },
  { label: 'Founder-led distribution for SaaS', href: 'https://naano.com/blog/founder-led-distribution-b2b-saas' },
  { label: 'Naano vs alternatives', href: 'https://naano.com/blog/naano-vs-alternatives' },
]

const agents = [
  { label: 'llms.txt', href: 'https://naano.com/llms.txt' },
  { label: 'pricing.md', href: 'https://naano.com/pricing.md' },
  { label: 'Reports & data', href: 'https://naano.com/reports' },
]

const linkClass = 'text-[13px] transition-colors duration-150 text-[#787774] hover:text-white'

export function SiteFooter() {
  return (
    <footer className="font-jakarta" style={{ backgroundColor: '#1c1b19' }}>
      <div
        className="relative overflow-hidden text-center"
        style={{
          background: 'linear-gradient(135deg, #0A2A6B 0%, #1652F0 55%, #2563EB 100%)',
          padding: 'clamp(48px, 8vw, 80px) 24px clamp(56px, 8vw, 96px)',
        }}
      >
        <svg className="pointer-events-none absolute inset-0 size-full opacity-[0.04]" aria-hidden>
          <defs>
            <pattern id="ftGrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ftGrid)" />
        </svg>
        <div className="relative z-10 mx-auto max-w-2xl">
          <p
            className="mb-5 text-xs font-semibold tracking-[0.14em] uppercase"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          >
            Get started
          </p>
          <h2 className="mb-5 text-[clamp(28px,3.4vw,46px)] leading-[1.08] font-bold tracking-[-0.03em] text-white">
            Ready to scale with <span style={{ color: '#FFFFFF' }}>naano</span>?
          </h2>
          <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-white/75">
            Launch your first campaign in minutes. Top up your wallet and pay per post, with
            tracked clicks on every one.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex h-[50px] items-center rounded-[10px] bg-white px-7 text-[15px] font-bold tracking-[-0.01em] text-[#37352f] shadow-[0_8px_30px_rgba(4,18,60,0.28)]"
            >
              Get started
            </Link>
            <Link
              to="/#workflow"
              className="inline-flex h-[50px] items-center gap-1.5 rounded-[10px] border border-white/15 px-[22px] text-[15px] font-medium tracking-[-0.01em] text-white"
            >
              See how it works
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p className="mt-5 text-[12px] text-white/60">Free to start. No credit card required.</p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 leading-none select-none"
          aria-hidden
        >
          <span
            className="font-black tracking-[-0.05em] text-white"
            style={{ fontSize: 'clamp(80px, 14vw, 180px)', opacity: 0.03 }}
          >
            NAANO
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-8 sm:px-8">
          <div className="mb-14 grid grid-cols-2 gap-10 md:grid-cols-5">
            <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="https://naano.com/logo.svg"
                  alt="naano"
                  loading="lazy"
                  decoding="async"
                  style={{ filter: 'invert(1)' }}
                  className="size-5 object-contain"
                />
                <span className="text-base font-bold text-white">naano</span>
              </Link>
              <p className="max-w-[220px] text-[13px] leading-relaxed text-[#787774]">
                Turn LinkedIn creators into your best acquisition channel.
              </p>
              <a
                href="https://www.linkedin.com/company/naanooo/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="mt-1 inline-flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50 transition-colors hover:text-white"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Product
              </p>
              {product.map((link) => (
                <SmartLink key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </SmartLink>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Company
              </p>
              {company.map((link) => (
                <SmartLink key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </SmartLink>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Press
              </p>
              {press.map((link) => (
                <SmartLink key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </SmartLink>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Resources
              </p>
              {resources.map((link) => (
                <SmartLink key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </SmartLink>
              ))}
              <p className="mt-4 mb-1 text-[11px] font-semibold tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                For AI agents
              </p>
              {agents.map((link) => (
                <SmartLink key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </SmartLink>
              ))}
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-between gap-3 pt-6 sm:flex-row"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[12px] text-[#787774]">© 2026 naano. All rights reserved.</p>
            <a
              href="https://fr.trustpilot.com/review/www.naano.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-[#787774] transition-colors hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#00b67a" stroke="none" aria-hidden>
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
              </svg>
              Trustpilot reviews
            </a>
          </div>
        </div>
      </div>

      <div className="h-20" style={{ backgroundColor: '#1c1b19' }} />
    </footer>
  )
}
