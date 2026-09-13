import { motion } from 'motion/react'
import { MotionLink } from '../../components/MotionLink'
import { fadeUp, stagger, viewport } from '../../lib/motion'

const badges = ['2,000+ creators paid', 'Paid within 24h', 'Quit anytime, keep your earnings']

export function CreatorsCta() {
  return (
    <section
      id="apply"
      className="px-5 pt-8 pb-20 sm:px-8 lg:px-[calc(84*var(--u))] lg:pt-[calc(60*var(--u))] lg:pb-[calc(140*var(--u))]"
    >
      <motion.div
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto max-w-[900px] text-center lg:max-w-[calc(900*var(--u))]"
      >
        <motion.div
          variants={fadeUp}
          className="text-[11px] font-bold tracking-[0.16em] text-[#2563EB] lg:text-[calc(12*var(--u))]"
        >
          READY TO EARN?
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="mt-5 text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-[#17181C] sm:text-[3.25rem] lg:mt-[calc(20*var(--u))] lg:text-[calc(64*var(--u))]"
        >
          You've seen how it works.
          <br className="max-lg:hidden" /> Now get paid for it.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-[600px] text-[1.0625rem] leading-[1.55] text-[#55575E] lg:mt-[calc(26*var(--u))] lg:max-w-[calc(600*var(--u))] lg:text-[calc(19*var(--u))]"
        >
          Join 2,000+ creators already getting paid to post on LinkedIn. It's free, and you keep 100%
          of what you earn.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-9 flex justify-center lg:mt-[calc(40*var(--u))]">
          <MotionLink
            to="/register"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-[11px] rounded-[12px] bg-[#17181C] px-[28px] py-[16px] text-[16px] font-semibold whitespace-nowrap text-white shadow-[0_12px_30px_rgba(23,24,28,0.18)]"
          >
            Apply now
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="4" y1="12" x2="20" y2="12" />
              <polyline points="13 5 20 12 13 19" />
            </svg>
          </MotionLink>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-4 text-[15px] text-[#9B9DA3] lg:mt-[calc(16*var(--u))]"
        >
          Takes 2 minutes. No commitment.
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-9 flex flex-wrap items-center justify-center gap-[14px] lg:mt-[calc(40*var(--u))]"
        >
          {badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-[9px] rounded-full border border-white/92 bg-white/88 px-[20px] py-[11px] text-[15px] font-medium text-[#26272C] shadow-[0_10px_30px_-22px_rgba(56,96,128,0.34)] lg:text-[calc(15.5*var(--u))]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="5 12.5 10 17 19 7" />
              </svg>
              {badge}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
