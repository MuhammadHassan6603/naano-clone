import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { SiteFooter } from '../components/SiteFooter'
import { blogPosts } from '../lib/blogPosts'
import { fadeUp, stagger, viewport } from '../lib/motion'

const topics = [
  'CPL economics',
  'LinkedIn micro-creators',
  'Naano vs alternatives',
  'Creator-led growth',
  'LinkedIn algorithm',
  'Founder-led distribution',
]

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 6v6l4 2" />
    <circle cx="12" cy="12" r="10" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M8 2v4M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
  </svg>
)

const DotOverlay = ({ size = 28 }: { size?: number }) => (
  <div
    aria-hidden
    className="absolute inset-0 opacity-[0.16]"
    style={{
      backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
      backgroundSize: `${size}px ${size}px`,
    }}
  />
)

export default function Blog() {
  const [featured, ...rest] = blogPosts

  return (
    <main className="font-jakarta min-h-screen bg-white text-[#111827]">
      <section className="border-b border-[#F3F4F6] px-4 pt-32 pb-14 sm:px-6 sm:pt-36 sm:pb-20">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-[1200px]"
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-[#6B7280] uppercase"
          >
            <span>Naano Journal</span>
            <span aria-hidden className="size-1 rounded-full bg-[#D1D5DB]" />
            <span className="font-normal">{blogPosts.length} articles</span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mb-6 max-w-[18ch] text-[clamp(36px,5.4vw,68px)] leading-[1.02] font-light tracking-[-0.025em] text-[#111827]"
          >
            Notes on creator-led growth.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="max-w-2xl text-base leading-relaxed text-[#4B5563] sm:text-lg"
          >
            Field notes from the team building Naano: on LinkedIn distribution, CPL economics, and
            how B2B brands grow through creators.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-2">
            <span className="mr-3 self-center text-[10px] font-semibold tracking-[0.16em] text-[#9CA3AF] uppercase">
              Topics
            </span>
            {topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[12px] text-[#4B5563]"
              >
                {topic}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="px-4 pt-12 pb-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-[1200px]">
          <p className="mb-5 text-[10px] font-semibold tracking-[0.18em] text-[#6B7280] uppercase">
            Latest
          </p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.5 }}
          >
            <Link
              to={`/blog/${featured.slug}`}
              className="group grid items-center gap-8 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111827] focus-visible:ring-offset-4 lg:grid-cols-12 lg:gap-12"
            >
              <div
                className="relative aspect-[16/10] overflow-hidden rounded-2xl transition-transform duration-300 group-hover:scale-[1.01] motion-reduce:transition-none sm:aspect-[16/9] lg:col-span-7"
                style={{ background: featured.gradient }}
              >
                <DotOverlay />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-transparent" />
                <span className="absolute top-6 left-6 text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase sm:top-8 sm:left-8">
                  {featured.category}
                </span>
              </div>
              <div className="lg:col-span-5">
                <h2 className="mb-5 text-[clamp(26px,3.6vw,42px)] leading-[1.08] font-light tracking-[-0.02em] text-[#111827] underline-offset-4 decoration-[#111827]/20 group-hover:underline">
                  {featured.title}
                </h2>
                <p className="mb-7 max-w-prose text-base leading-relaxed text-[#4B5563]">
                  {featured.description}
                </p>
                <div className="mb-7 flex items-center gap-4 text-xs text-[#6B7280]">
                  <span className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#F3F4F6] text-[10px] font-medium text-[#4B5563]">
                      {featured.author.name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')}
                    </span>
                    {featured.author.name}
                  </span>
                  <span aria-hidden className="size-1 rounded-full bg-[#D1D5DB]" />
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon />
                    {featured.minutes} min read
                  </span>
                  <span aria-hidden className="size-1 rounded-full bg-[#D1D5DB]" />
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon />
                    <time dateTime={featured.dateISO}>{featured.dateLabel}</time>
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#111827] transition-all duration-200 group-hover:gap-2.5 motion-reduce:transition-none">
                  Read article
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pt-8 pb-24 sm:px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8 flex items-baseline justify-between border-b border-[#F3F4F6] pb-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#6B7280] uppercase">
              More articles
            </p>
            <span className="text-xs text-[#9CA3AF]">{rest.length}</span>
          </div>
          <motion.ul
            variants={stagger(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          >
            {rest.map((post) => (
              <motion.li key={post.slug} variants={fadeUp}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111827] focus-visible:ring-offset-4"
                >
                  <div
                    className="relative mb-5 aspect-[16/10] overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-[1.015] motion-reduce:transition-none"
                    style={{ background: post.gradient }}
                  >
                    <DotOverlay size={22} />
                  </div>
                  <p className="mb-3 text-[10px] font-semibold tracking-[0.16em] text-[#6B7280] uppercase">
                    {post.category}
                  </p>
                  <h3 className="mb-3 text-[20px] leading-[1.25] font-medium tracking-[-0.01em] text-[#111827] underline-offset-4 decoration-[#111827]/20 group-hover:underline sm:text-[22px]">
                    {post.title}
                  </h3>
                  <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-[#4B5563]">
                    {post.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
                    <span>{post.author.name}</span>
                    <span aria-hidden className="size-1 rounded-full bg-[#D1D5DB]" />
                    <span className="inline-flex items-center gap-1.5">
                      <ClockIcon />
                      {post.minutes} min read
                    </span>
                    <span aria-hidden className="size-1 rounded-full bg-[#D1D5DB]" />
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarIcon />
                      <time dateTime={post.dateISO}>{post.dateLabel}</time>
                    </span>
                  </div>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
