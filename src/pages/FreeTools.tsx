import type { ReactNode } from 'react'
import { SiteFooter } from '../components/SiteFooter'
import { SmartLink } from '../components/SmartLink'
import { ToolsNav } from '../components/ToolsNav'
import {
  ArrowRightLine,
  Calculator,
  ChartPie,
  Sparkles,
  Target,
  TrendingUp,
  UserSearch,
} from '../components/Icons'

type Tool = {
  href: string
  icon: ReactNode
  title: string
  tagline: string
  body: string
  pill: string
  meta: string
}

const tools: Tool[] = [
  {
    href: 'https://naano.com/selection',
    icon: <UserSearch />,
    title: 'Free LinkedIn creator search',
    tagline: 'Get a hand-picked creator shortlist in 48 hours',
    body: 'Describe the campaign you want to launch and a real person at Naano finds every LinkedIn creator genuinely worth contacting — inside the Naano marketplace and across the wider LinkedIn ecosystem. You get names, pricing, and audience fit within 48 hours. Free, no account required, no commitment.',
    pill: 'Hand-picked by a real human, not an algorithm',
    meta: 'Free · 48h turnaround · No account needed',
  },
  {
    href: 'https://naano.com/free-tools/linkedin-creator-worth-calculator',
    icon: <Calculator />,
    title: 'LinkedIn Creator Worth Calculator',
    tagline: 'Find out what a sponsored post from any creator should cost',
    body: "Enter a LinkedIn creator's follower count, average reactions and comments, and their niche, and get an instant flat-fee estimate of what one sponsored post is worth — plus their engagement rating against B2B benchmarks. Built for creators setting their rate and for companies budgeting a campaign. Free, no account required.",
    pill: 'Benchmarked against B2B engagement tiers',
    meta: 'Free · Instant result · No account needed',
  },
  {
    href: 'https://naano.com/free-tools/linkedin-engagement-rate-calculator',
    icon: <TrendingUp />,
    title: 'LinkedIn Engagement Rate Calculator',
    tagline: 'Calculate your engagement rate and compare it to 2026 benchmarks',
    body: 'Enter your follower count and your average reactions, comments and reposts per post, and get your LinkedIn engagement rate two ways — by followers and by impressions — rated against 2026 B2B benchmarks for your audience size, with concrete tips to improve it. Free, no account required.',
    pill: 'Rated against 2026 B2B benchmarks',
    meta: 'Free · Instant result · No account needed',
  },
  {
    href: 'https://naano.com/free-tools/sponsored-post-delivery-odds-estimator',
    icon: <Target />,
    title: 'Sponsored Post Delivery Odds Estimator',
    tagline: 'See how often offers at your price actually get published',
    body: 'Enter what you plan to offer a LinkedIn creator per post and see how often real bookings at that price ended in a published post, how often creators simply never answered, and what brands actually paid at that audience size. Built on 239 real sponsored-post bookings from the Naano marketplace, not rules of thumb. Free, no account required.',
    pill: 'Built on 239 real bookings',
    meta: 'Free · Built on 239 real bookings · No account needed',
  },
  {
    href: 'https://naano.com/free-tools/creator-campaign-budget-planner',
    icon: <ChartPie />,
    title: 'Creator Campaign Budget Planner',
    tagline: 'Turn a budget into published posts, not just booked ones',
    body: 'Enter your campaign budget and see how many sponsored LinkedIn posts it books at real transacted medians — then how many of those historically ended in a published post, and what that makes the true cost per published post. Built on 239 real sponsored-post bookings from the Naano marketplace. Free, no account required.',
    pill: 'Plans on published posts, not booked ones',
    meta: 'Free · Built on 239 real bookings · No account needed',
  },
]

const faqs = [
  {
    question: "Are Naano's free tools really free?",
    answer:
      'Yes. The free LinkedIn creator search costs nothing, requires no account and no payment method, and carries no obligation to book anything afterwards. You keep the shortlist whether or not you run a campaign with Naano.',
  },
  {
    question: 'What is the free LinkedIn creator search?',
    answer:
      'You describe your campaign — your product, your audience, and your budget — and a member of the Naano team manually builds a shortlist of LinkedIn creators whose audience genuinely overlaps your buyer. Each profile comes with pricing, audience fit, and the reason it belongs in your campaign. It is delivered within 48 hours.',
  },
  {
    question: 'Do I have to run my campaign on Naano to use the tools?',
    answer:
      "No. The shortlist is yours to use however you want, including contacting the creators directly yourself. Naano's bet is that booking, briefing, paying, and tracking those creators in one place is easier than doing it by hand — but that is your decision to make after you see the list.",
  },
]

const keepReading = [
  { label: 'How to find B2B creators on LinkedIn', href: 'https://naano.com/blog/how-to-find-b2b-creators-linkedin' },
  { label: 'Best B2B creator marketplaces in 2026 (ranked)', href: 'https://naano.com/blog/best-b2b-creator-marketplace' },
  { label: 'What is a B2B creator marketplace?', href: 'https://naano.com/blog/what-is-a-b2b-creator-marketplace' },
  {
    label: 'How to launch your first LinkedIn creator campaign in 30 days',
    href: 'https://naano.com/blog/launch-b2b-linkedin-creator-campaign',
  },
  { label: 'How much does B2B influencer marketing cost in 2026?', href: 'https://naano.com/blog/b2b-influencer-marketing-cost' },
]

export default function FreeTools() {
  return (
    <>
      <div className="bg-noise" aria-hidden />
      <main className="font-jakarta min-h-screen bg-[#FCFCFB] text-[#17181C]">
        <ToolsNav />

        <section className="relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(640px 320px at 50% -120px, rgba(22,82,240,0.08), transparent 70%)',
            }}
          />
          <div className="relative mx-auto max-w-[900px] px-4 text-center sm:px-6">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#E4E1DC] bg-white px-4 py-2 text-[13px] font-medium text-[#55575E] shadow-[0_1px_2px_rgba(23,24,28,0.04)]">
              <Sparkles width={14} height={14} className="text-[#1652F0]" />
              Free tools by Naano
            </span>
            <h1 className="mt-8 text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-[#17181C] sm:text-5xl lg:text-[60px]">
              Free tools for B2B creator marketing
              <span className="text-[#1652F0]">.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-[#55575E] sm:text-[19px]">
              Practical tools for teams running LinkedIn creator campaigns. No account, no payment
              method, no commitment — start with the one below.
            </p>
          </div>
        </section>

        <section className="pb-16 sm:pb-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {tools.map((tool) => (
                <SmartLink
                  key={tool.title}
                  href={tool.href}
                  className="group flex flex-col rounded-2xl border border-[#ECEAE6] bg-white p-7 shadow-[0_2px_10px_rgba(23,24,28,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-[#1652F0]/40 hover:shadow-[0_18px_40px_rgba(23,24,28,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1652F0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFCFB] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#1652F0]">
                      {tool.icon}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-[#E4E1DC] bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.1em] text-[#55575E] uppercase">
                      Free
                    </span>
                  </div>
                  <h2 className="mt-5 text-[20px] leading-snug font-semibold tracking-[-0.02em] text-[#17181C]">
                    {tool.title}
                  </h2>
                  <p className="mt-1.5 text-[15px] font-medium text-[#1652F0]">{tool.tagline}</p>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#55575E]">{tool.body}</p>
                  <span className="mt-5 inline-flex items-center gap-2 self-start rounded-full border border-[#ECEAE6] bg-[#FAFAF9] px-3 py-1.5 text-[12px] font-medium text-[#55575E]">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#1652F0]" />
                    {tool.pill}
                  </span>
                  <span className="mt-3 text-[13px] text-[#6B6D74]">{tool.meta}</span>
                  <span className="mt-5 inline-flex items-center gap-2 border-t border-[#F1EFEA] pt-5 text-[15px] font-semibold text-[#17181C] transition-colors group-hover:text-[#1652F0] motion-reduce:transition-none">
                    Open the tool
                    <ArrowRightLine className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </span>
                </SmartLink>
              ))}

              <div className="flex flex-col justify-center rounded-2xl border border-dashed border-[#E4E1DC] bg-[#FAFAF9] p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ECEAE6] bg-white text-[#6B6D74]">
                  <Sparkles />
                </span>
                <h2 className="mt-5 text-[20px] font-semibold tracking-[-0.02em] text-[#17181C]">
                  More tools coming
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#55575E]">
                  We ship a new free tool whenever we build something internally that B2B teams keep
                  asking us for. In the meantime, the{' '}
                  <SmartLink
                    href="/blog"
                    className="rounded-sm font-semibold text-[#1652F0] underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1652F0]"
                  >
                    blog
                  </SmartLink>{' '}
                  covers the playbooks.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#ECEAE6] py-16 sm:py-20">
          <div className="mx-auto max-w-[820px] px-4 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#17181C] sm:text-[38px]">
              Frequently asked questions
              <span className="text-[#1652F0]">.</span>
            </h2>
            <div className="mt-8">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="border-t border-[#ECEAE6] py-7 first:border-t-0 first:pt-2"
                >
                  <h3 className="text-[18px] font-medium tracking-[-0.015em] text-[#17181C]">
                    {faq.question}
                  </h3>
                  <p className="mt-3 max-w-[680px] text-[16px] leading-[1.65] text-[#6B6D74]">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#ECEAE6] py-16 sm:py-20">
          <div className="mx-auto max-w-[820px] px-4 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#17181C] sm:text-3xl">
              Keep reading
              <span className="text-[#1652F0]">.</span>
            </h2>
            <ul className="mt-6 divide-y divide-[#ECEAE6]">
              {keepReading.map((link) => (
                <li key={link.label}>
                  <SmartLink
                    href={link.href}
                    className="group flex min-h-11 items-center justify-between gap-4 rounded-sm py-3.5 text-[16px] font-medium text-[#17181C] transition-colors hover:text-[#1652F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1652F0] motion-reduce:transition-none"
                  >
                    {link.label}
                    <ArrowRightLine
                      width={16}
                      height={16}
                      className="shrink-0 text-[#1652F0] transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  )
}
