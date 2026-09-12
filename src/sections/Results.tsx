import { motion } from 'motion/react'
import { MetricsPanel } from '../components/MetricsPanel'
import { PostCard } from '../components/PostCard'
import { posts } from '../lib/posts'
import { fadeUp, stagger, viewport } from '../lib/motion'

const metrics = [
  { value: '5M+', label: 'Impressions generated' },
  { value: '30K+', label: 'Leads generated' },
  { value: '2,000+', label: 'Creators on Naano' },
  { value: '5K+', label: 'Posts published' },
]

export function Results() {
  return (
    <section
      id="results"
      className="bg-[linear-gradient(180deg,rgba(243,248,255,0.72)_0%,#FCFCFB_48%,rgba(243,248,255,0.52)_100%)] px-5 py-16 sm:px-8 lg:px-[84px] lg:pt-[118px] lg:pb-[72px]"
    >
      <motion.div
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto w-full max-w-[1272px]"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-[10px]">
          <span className="size-[9px] rounded-full bg-[#315B7C]" />
          <span className="text-[12px] font-bold tracking-[0.22em] text-[#315B7C] lg:text-[14px]">
            THE RESULTS
          </span>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="mx-auto mt-[24px] max-w-[940px] text-center text-[2.25rem] leading-[1.03] font-semibold tracking-[-0.045em] text-balance text-[#17181C] sm:text-[3rem] lg:text-[51.84px]"
        >
          Proven across thousands of campaigns.
        </motion.h2>

        <MetricsPanel metrics={metrics} className="mt-8 lg:mx-[46px] lg:mt-[42px]" />

        <motion.div
          variants={stagger(0.08)}
          className="relative z-2 mt-10 grid gap-[18px] sm:grid-cols-2 lg:mt-[50px] lg:grid-cols-4 lg:px-[6px] lg:pt-[10px] lg:pb-[28px]"
        >
          {posts.map((post) => (
            <PostCard key={post.name} post={post} />
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-[44px] flex flex-col items-center">
          <motion.a
            href="#cta"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-[11px] rounded-[12px] bg-[#17181C] px-[28px] py-[16px] text-[16px] font-semibold text-white shadow-[0_12px_30px_rgba(23,24,28,0.18)]"
          >
            Get started
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="4" y1="12" x2="20" y2="12" />
              <polyline points="13 5 20 12 13 19" />
            </svg>
          </motion.a>
          <span className="mt-[16px] text-[15px] text-[#9B9DA3]">
            Start free. Pay per post when you're ready.
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}
