import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { LinkedIn } from '../components/Icons'
import { asset } from '../lib/assets'
import { fadeUp, stagger, viewport } from '../lib/motion'

const product = [
  { label: 'Features', href: '#workflow' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQs', href: '#faq' },
  { label: 'Blog', href: 'https://naano.com/blog' },
  { label: 'Reports & benchmarks', href: 'https://naano.com/reports' },
  { label: 'About', href: 'https://naano.com/about' },
]

const company = [
  { label: 'Help Center', href: 'https://naano.com/help' },
  { label: 'Privacy', href: 'https://naano.com/privacy' },
  { label: 'Terms of Sale & Use', href: 'https://naano.com/terms' },
]

const agents = [
  { label: 'llms.txt', href: 'https://naano.com/llms.txt' },
  { label: 'pricing.md', href: 'https://naano.com/pricing.md' },
  { label: 'Reports & data', href: 'https://naano.com/reports' },
]

const press = [
  {
    label: 'Interview Thomas Marcelle, Xymag.tv',
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
  { label: 'LinkedIn creator marketplace', href: 'https://naano.com/linkedin-creator-marketplace' },
  {
    label: 'Best B2B influencer platforms 2026',
    href: 'https://naano.com/best-b2b-influencer-marketing-platforms-2026',
  },
  {
    label: 'B2B influencer marketing cost',
    href: 'https://naano.com/blog/b2b-influencer-marketing-cost',
  },
  {
    label: 'Launch a LinkedIn creator campaign',
    href: 'https://naano.com/blog/launch-b2b-linkedin-creator-campaign',
  },
  {
    label: 'LinkedIn Creator Marketplace in Europe',
    href: 'https://naano.com/blog/linkedin-creator-marketplace-europe',
  },
  { label: 'How to pay B2B creators', href: 'https://naano.com/blog/how-to-pay-b2b-creators' },
  {
    label: 'Creator Marketplace explained',
    href: 'https://naano.com/blog/linkedin-creator-marketplace-explained',
  },
  {
    label: 'What is a B2B creator marketplace?',
    href: 'https://naano.com/blog/what-is-a-b2b-creator-marketplace',
  },
  { label: 'Creator-led growth for B2B', href: 'https://naano.com/blog/creator-led-growth-b2b' },
  {
    label: 'LinkedIn Ads vs creator-led CPL',
    href: 'https://naano.com/blog/linkedin-ads-vs-creator-led-cpl',
  },
  {
    label: 'Nano vs macro creators in B2B',
    href: 'https://naano.com/blog/nano-vs-macro-creators-b2b-ctr',
  },
  { label: 'B2B influence on LinkedIn', href: 'https://naano.com/blog/b2b-influence-linkedin' },
  {
    label: 'Founder-led distribution for SaaS',
    href: 'https://naano.com/blog/founder-led-distribution-b2b-saas',
  },
  { label: 'Naano vs alternatives', href: 'https://naano.com/blog/naano-vs-alternatives' },
]

const linkClass =
  'text-[14.5px] leading-[1.3] text-[#526875] transition-[color,transform] duration-200 hover:translate-x-[2px] hover:text-[#111318]'

const headingClass = 'text-[12px] font-bold tracking-[0.16em] text-[#8A969E]'

const maskTransition =
  'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0) 12%, #000 30%, #000 100%)'
const maskClouds = 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0) 42%, #000 76%, #000 100%)'

const layerTransition: CSSProperties = {
  backgroundImage: `url(${asset('footer-cloud-transition-v2.png', 1920)})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center bottom',
  backgroundRepeat: 'no-repeat',
  filter: 'saturate(0.92) brightness(0.96) contrast(1.18)',
  maskImage: maskTransition,
  WebkitMaskImage: maskTransition,
}

const layerClouds: CSSProperties = {
  backgroundImage: `url(${asset('hero-clouds-cotton-blue-v7.png', 1920)})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center bottom',
  backgroundRepeat: 'no-repeat',
  filter: 'saturate(0.78) brightness(1.03) contrast(1.08)',
  maskImage: maskClouds,
  WebkitMaskImage: maskClouds,
}

const ExternalLink = ({ label, href }: { label: string; href: string }) =>
  href.startsWith('#') ? (
    <a href={href} className={linkClass}>
      {label}
    </a>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {label}
    </a>
  )

export function Footer() {
  return (
    <footer className="relative isolate -mt-[10px] overflow-hidden bg-[linear-gradient(180deg,#E9F7FC_0%,#EDF9FD_48%,#FFFFFF_100%)] px-5 pt-[235px] shadow-[0_-54px_96px_44px_rgba(233,247,252,0.96)] sm:px-8 lg:px-[72px] lg:pt-[290px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-px right-0 bottom-0 left-0 z-0"
        style={layerTransition}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-1 opacity-24"
        style={layerClouds}
      />

      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="relative z-2 mx-auto grid w-full max-w-[1280px] items-start gap-x-6 gap-y-9 pt-[34px] pb-[46px] lg:grid-cols-[1.1fr_0.62fr_0.72fr_0.82fr_2.2fr] lg:gap-[clamp(24px,3vw,46px)]"
      >
        <motion.div variants={fadeUp} className="flex flex-col">
          <img
            src={asset('naano-logo-nav.png', 384)}
            alt="naano"
            loading="lazy"
            decoding="async"
            className="h-[28px] w-auto self-start"
          />
          <p className="mt-[22px] max-w-[210px] text-[15px] leading-[1.55] text-[#5F737E]">
            Turn LinkedIn creators into your best acquisition channel.
          </p>
          <a
            href="https://www.linkedin.com/company/naanooo/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="mt-[26px] inline-flex size-[40px] items-center justify-center rounded-[11px] border border-white/84 bg-white/58 text-[#111318] backdrop-blur-[10px] transition-transform duration-200 hover:translate-x-[2px]"
          >
            <LinkedIn width="16" height="16" fill="currentColor" />
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col gap-[14px]">
          <span className={headingClass}>PRODUCT</span>
          {product.map((link) => (
            <ExternalLink key={link.label} {...link} />
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col gap-[14px]">
          <span className={headingClass}>COMPANY</span>
          {company.map((link) => (
            <ExternalLink key={link.label} {...link} />
          ))}
          <span className={`${headingClass} mt-[14px]`}>For AI agents</span>
          {agents.map((link) => (
            <ExternalLink key={link.label} {...link} />
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col gap-[14px]">
          <span className={headingClass}>PRESS</span>
          {press.map((link) => (
            <ExternalLink key={link.label} {...link} />
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="grid content-start grid-cols-2 gap-x-[22px] gap-y-[12px]"
        >
          <span className={`${headingClass} col-span-2`}>RESOURCES</span>
          {resources.map((link) => (
            <ExternalLink key={link.label} {...link} />
          ))}
        </motion.div>
      </motion.div>

      <div className="relative z-2 mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t border-[rgba(93,139,160,0.2)] pt-[22px] pb-[30px]">
        <span className="text-[13.5px] text-[#8A8C92]">© 2026 naano. All rights reserved.</span>
        <a
          href="https://fr.trustpilot.com/review/www.naano.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-[8px] ${linkClass} text-[13.5px]`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#00B67A" aria-hidden>
            <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.6z" />
          </svg>
          Trustpilot reviews
        </a>
      </div>
    </footer>
  )
}
