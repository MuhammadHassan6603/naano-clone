import { motion } from 'motion/react'
import { asset, assetSrcSet } from '../../lib/assets'
import { fadeUp, scaleIn, stagger, viewport } from '../../lib/motion'

const features = [
  { title: 'Centralized opportunities', copy: 'Discover brand deals that match your audience.' },
  { title: 'Payments built-in', copy: 'Get paid on time with secure, transparent payouts.' },
  { title: 'Track performance', copy: 'See views, clicks and engagement in real time.' },
  { title: 'Easy delivery', copy: 'Manage deals and deliver content with ease.' },
]

const dots = ['#E5726A', '#E8B54A', '#5FB666']

export function Platform() {
  return (
    <section
      id="platform"
      className="bg-white px-5 py-16 sm:px-8 lg:px-[calc(84*var(--u))] lg:pt-[calc(80*var(--u))] lg:pb-[calc(96*var(--u))]"
    >
      <motion.div
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <div className="mx-auto max-w-[760px] text-center lg:max-w-[calc(760*var(--u))]">
          <motion.div
            variants={fadeUp}
            className="text-[11px] font-bold tracking-[0.16em] text-[#2563EB] lg:text-[calc(12*var(--u))]"
          >
            THE PLATFORM
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-4 text-[2.25rem] leading-[1.06] font-semibold tracking-[-0.03em] text-balance text-[#17181C] sm:text-[3rem] lg:mt-[calc(18*var(--u))] lg:text-[calc(52*var(--u))]"
          >
            For creators who don't want
            <br className="max-lg:hidden" /> the administrative burden.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-[1rem] text-[#55575E] lg:mt-[calc(16*var(--u))] lg:text-[calc(19*var(--u))]"
          >
            Find deals, get paid, and track your performance from one dashboard. No invoicing, no
            chasing, no spreadsheets.
          </motion.p>
        </div>

        <motion.div
          variants={scaleIn}
          className="mx-auto mt-10 w-full max-w-[1180px] overflow-hidden rounded-[18px] border border-[#E4E1DC] bg-white shadow-[0_40px_90px_-40px_rgba(23,24,28,0.42)] lg:mt-[calc(56*var(--u))] lg:max-w-[calc(1180*var(--u))] lg:rounded-[calc(18*var(--u))]"
        >
          <div className="flex items-center gap-[8px] border-b border-[#EDEBE7] bg-[#FBFAF8] px-[14px] py-[11px] lg:px-[calc(18*var(--u))] lg:py-[calc(13*var(--u))]">
            {dots.map((color) => (
              <span
                key={color}
                style={{ background: color }}
                className="size-[10px] rounded-full lg:size-[calc(11*var(--u))]"
              />
            ))}
            <span className="ml-[10px] text-[11.5px] text-[#9B9DA3] lg:ml-[calc(14*var(--u))] lg:text-[calc(12.5*var(--u))]">
              naano.com/overview
            </span>
          </div>
          <img
            src={asset('dashboard-creator.webp', 2048)}
            srcSet={assetSrcSet('dashboard-creator.webp', 2048)}
            sizes="(max-width: 1023px) 100vw, 80vw"
            alt="Naano creator dashboard"
            width={2328}
            height={902}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </motion.div>

        <motion.div
          variants={stagger(0.07)}
          className="mx-auto mt-8 grid w-full max-w-[1180px] gap-4 sm:grid-cols-2 lg:mt-[calc(44*var(--u))] lg:max-w-[calc(1180*var(--u))] lg:grid-cols-4 lg:gap-[calc(20*var(--u))]"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="rounded-[16px] border border-[#EDEBE7] bg-white p-[20px] lg:rounded-[calc(16*var(--u))] lg:p-[calc(22*var(--u))]"
            >
              <div className="text-[15px] font-bold tracking-[-0.01em] text-[#17181C] lg:text-[calc(16*var(--u))]">
                {feature.title}
              </div>
              <p className="mt-2 text-[13.5px] leading-[1.5] text-[#8B8D94] lg:mt-[calc(8*var(--u))] lg:text-[calc(14*var(--u))]">
                {feature.copy}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
