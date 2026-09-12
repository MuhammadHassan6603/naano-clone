import { motion } from 'motion/react'
import { MetricsPanel } from '../../components/MetricsPanel'
import { PostCard } from '../../components/PostCard'
import { posts } from '../../lib/posts'
import { fadeUp, stagger, viewport } from '../../lib/motion'

const metrics = [
  { value: '2,000+', label: 'Creators earning' },
  { value: '€500', label: 'Avg. per deal' },
  { value: '5K+', label: 'Posts published' },
  { value: '24h', label: 'Avg. payout time' },
]

const categories = [
  {
    label: 'B2B SaaS',
    icon: (
      <>
        <path d="M12 3 L21 7.5 L12 12 L3 7.5 Z" />
        <path d="M3 12 L12 16.5 L21 12" />
        <path d="M3 16.5 L12 21 L21 16.5" />
      </>
    ),
  },
  {
    label: 'Fintech',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
  },
  {
    label: 'DevTools',
    icon: (
      <>
        <polyline points="7 8 3 12 7 16" />
        <polyline points="14 8 18 12 14 16" />
      </>
    ),
  },
  {
    label: 'E-commerce',
    icon: (
      <>
        <path d="M6 2 L3 6 V20 a2 2 0 0 0 2 2 H19 a2 2 0 0 0 2 -2 V6 L18 2 Z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10 a4 4 0 0 1 -8 0" />
      </>
    ),
  },
]

export function CreatorResults() {
  return (
    <section
      id="results"
      className="px-5 py-16 sm:px-8 lg:px-[calc(84*var(--u))] lg:pt-[calc(80*var(--u))] lg:pb-[calc(120*var(--u))]"
    >
      <motion.div
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto w-full max-w-[1272px] lg:max-w-[calc(1440*var(--u))]"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-[10px]">
          <span className="size-[9px] rounded-full bg-[#16A34A]" />
          <span className="text-[12px] font-bold tracking-[0.22em] text-[#16A34A] lg:text-[calc(14*var(--u))]">
            THE RESULTS
          </span>
        </motion.div>

        <MetricsPanel metrics={metrics} className="mt-8 lg:mt-[calc(42*var(--u))]" />

        <motion.h2
          variants={fadeUp}
          className="mx-auto mt-12 max-w-[820px] text-center text-[2.25rem] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-[#17181C] sm:text-[3rem] lg:mt-[calc(112*var(--u))] lg:max-w-[calc(820*var(--u))] lg:text-[calc(52*var(--u))]"
        >
          Real posts from real creators<span className="text-[#2563EB]">.</span>
        </motion.h2>

        <motion.div
          variants={stagger(0.08)}
          className="mt-10 grid gap-[18px] sm:grid-cols-2 lg:mt-[calc(64*var(--u))] lg:grid-cols-4 lg:gap-[calc(24*var(--u))]"
        >
          {posts.map((post) => (
            <PostCard key={post.name} post={post} />
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center justify-center gap-[14px] lg:mt-[calc(48*var(--u))]"
        >
          {categories.map((category) => (
            <span
              key={category.label}
              className="inline-flex items-center gap-[9px] rounded-full border border-white/92 bg-white/88 px-[20px] py-[11px] text-[15px] font-semibold text-[#26272C] shadow-[0_10px_30px_-22px_rgba(56,96,128,0.34)] lg:text-[calc(16*var(--u))]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#55575E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {category.icon}
              </svg>
              {category.label}
            </span>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col items-center lg:mt-[calc(44*var(--u))]"
        >
          <motion.a
            href="#apply"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-[11px] rounded-[12px] bg-[#17181C] px-[28px] py-[16px] text-[16px] font-semibold text-white shadow-[0_12px_30px_rgba(23,24,28,0.18)]"
          >
            Start earning
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="4" y1="12" x2="20" y2="12" />
              <polyline points="13 5 20 12 13 19" />
            </svg>
          </motion.a>
          <span className="mt-[16px] text-[15px] text-[#9B9DA3]">
            Free to join. Paid within 24h. Quit anytime.
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}
