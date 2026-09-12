import { motion } from 'motion/react'
import { ArrowRight } from '../components/Icons'
import { asset } from '../lib/assets'
import { fadeUp, scaleIn, stagger, viewport } from '../lib/motion'

const points = ['Creator strategy', 'Campaign format', 'Budget recommendation']

export function Cta() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#E5F5FC_54%,#D8EFFA_100%)] px-5 py-16 sm:px-8 lg:px-[84px] lg:pt-[128px] lg:pb-[170px]"
    >
      <motion.div
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto max-w-[820px] text-center"
      >
        <motion.div
          variants={fadeUp}
          className="text-[12px] font-bold tracking-[0.16em] text-[#315B7C]"
        >
          READY TO LAUNCH?
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="mt-[20px] text-[2.5rem] leading-[1.03] font-semibold tracking-[-0.045em] text-balance text-[#111318] sm:text-[3.25rem] lg:text-[57.6px]"
        >
          Your next creator campaign starts here.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-[26px] max-w-[600px] text-[17px] leading-[1.55] text-[#55575E] lg:text-[19px]"
        >
          Get a clear creator strategy, campaign format and estimated budget for your next launch.
        </motion.p>
      </motion.div>

      <motion.div
        variants={scaleIn}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-10 flex w-full max-w-[550px] flex-col rounded-[30px] border border-white/96 bg-white/86 p-[26px] shadow-[0_38px_90px_-56px_rgba(45,87,110,0.5),inset_0_1px_0_#fff] backdrop-blur-[20px] backdrop-saturate-[1.12] lg:mt-[56px] lg:p-[48px_48px_44px]"
      >
        <div className="flex items-center gap-[12px]">
          <img
            src={asset('photo-book-call.png', 96)}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="size-[40px] shrink-0 rounded-full object-cover"
          />
          <span className="text-[12px] font-bold tracking-[0.14em] text-[#315B7C]">
            CAMPAIGN STRATEGY CALL
          </span>
        </div>

        <h3 className="mt-[20px] text-[1.625rem] leading-[1.15] font-extrabold tracking-[-0.025em] text-[#17181C] lg:text-[30px]">
          30-minute working session
        </h3>
        <p className="mt-[14px] text-[15.5px] leading-[1.55] text-[#55575E]">
          Leave with a concrete plan for your next creator campaign.
        </p>

        <div className="mt-[30px]">
          {points.map((point) => (
            <div
              key={point}
              className="flex items-center gap-[11px] border-t border-[rgba(203,224,238,0.72)] py-[15px] text-[15.5px] text-[#26272C]"
            >
              <span className="size-[5px] shrink-0 rounded-full bg-[#315B7C]" />
              {point}
            </div>
          ))}
        </div>

        <motion.a
          href="#pricing"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="mt-[32px] inline-flex items-center justify-center gap-[10px] rounded-[12px] bg-[#17181C] px-[28px] py-[16px] text-[16px] font-semibold tracking-[-0.01em] text-white"
        >
          Book a campaign call
          <ArrowRight width="16" height="16" strokeWidth={2} />
        </motion.a>

        <span className="mt-[14px] text-center text-[13.5px] text-[#9B9DA3]">
          Pick a time on the next page.
        </span>

        <a
          href="#pricing"
          className="mt-[20px] text-center text-[14.5px] tracking-[-0.005em] text-[#55575E]"
        >
          Prefer to start yourself? <span className="font-semibold text-[#111318]">Start for free →</span>
        </a>
      </motion.div>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mt-[40px] text-center text-[14px] tracking-[-0.005em] text-[#9B9DA3]"
      >
        Trusted by B2B teams building creator-led acquisition.
      </motion.p>
    </section>
  )
}
