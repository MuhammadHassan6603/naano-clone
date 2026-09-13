import { motion } from 'motion/react'
import { MotionLink } from '../components/MotionLink'
import { fadeUp, scaleIn, stagger, viewport } from '../lib/motion'

const plans = [
  {
    eyebrow: 'SELF-SERVE',
    eyebrowClass: 'text-[#9B9DA3]',
    title: 'Run it yourself.',
    copy: 'For teams that want the infrastructure to run creator campaigns in-house.',
    price: '€0',
    suffix: '/ month',
    features: [
      'Creator marketplace access',
      'AI-powered brief creation',
      'Track clicks, companies and pipeline',
      'Automatic creator payouts',
    ],
    cta: 'Start for free',
    ctaHref: '/register',
    ctaStyle: 'link' as const,
  },
  {
    eyebrow: 'MANAGED CAMPAIGNS',
    eyebrowClass: 'text-[#315B7C]',
    title: 'Get your time back.',
    copy: 'For teams that want Naano to operate their creator channel end to end.',
    price: 'Custom quote',
    suffix: '',
    features: [
      'Campaign strategy and positioning',
      'Creator sourcing and coordination',
      'Brief creation and campaign launch',
      'Reporting and optimisation',
    ],
    cta: 'Book a campaign call',
    ctaHref: '/book',
    ctaStyle: 'button' as const,
  },
]

const Arrow = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="4" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

export function Pricing() {
  return (
    <section
      id="pricing"
      className="bg-[linear-gradient(180deg,#FCFCFB_0%,#F3F8FF_58%,#FCFCFB_100%)] px-5 py-16 sm:px-8 lg:px-[84px] lg:pt-[72px] lg:pb-[160px]"
    >
      <motion.div
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <div className="mx-auto max-w-[710px] text-center">
          <motion.h2
            variants={fadeUp}
            className="text-[2.25rem] leading-[1.03] font-semibold tracking-[-0.045em] text-ink sm:text-[3rem] lg:text-[51.84px]"
          >
            Pricing.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-[18px] text-[1.0625rem] font-semibold tracking-[-0.015em] text-[#17181C] lg:mt-[26px] lg:text-[21px]"
          >
            Start free. Upgrade when you want your time back.
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="mt-[12px] text-[15px] leading-[1.55] text-[#8B8D94] lg:text-[16px]"
          >
            Choose whether you want to run creator campaigns in-house or have Naano operate them.
          </motion.p>
        </div>

        <div className="mx-auto mt-10 grid max-w-[1180px] gap-6 lg:mt-[46px] lg:grid-cols-2 lg:gap-[42px]">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.eyebrow}
              variants={scaleIn}
              transition={{ delay: index * 0.08 }}
              whileHover={{
                y: -5,
                boxShadow: '0 40px 82px -48px rgba(45,87,110,0.5)',
                transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
              }}
              className="flex flex-col rounded-[28px] border border-[rgba(178,204,217,0.52)] bg-white/96 p-[26px] shadow-[0_30px_72px_-50px_rgba(45,87,110,0.42)] lg:p-[46px_48px_42px]"
            >
              <div className={`text-[12px] font-bold tracking-[0.14em] ${plan.eyebrowClass}`}>
                {plan.eyebrow}
              </div>

              <h3 className="mt-[20px] text-[1.75rem] leading-[1.15] font-extrabold tracking-[-0.025em] text-[#17181C] lg:min-h-[78px] lg:text-[34px]">
                {plan.title}
              </h3>

              <p className="mt-[14px] text-[15.5px] leading-[1.55] text-[#55575E] lg:min-h-[48px]">
                {plan.copy}
              </p>

              <div className="mt-[28px] flex items-baseline gap-[7px]">
                <span className="text-[2.25rem] leading-none font-extrabold tracking-[-0.03em] text-[#17181C] lg:text-[46px]">
                  {plan.price}
                </span>
                {plan.suffix && <span className="text-[15px] text-[#9B9DA3]">{plan.suffix}</span>}
              </div>

              <div className="mt-[34px]">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="border-t border-[#ECEAE6] py-[16px] text-[15.5px] leading-[1.4] text-[#26272C]"
                  >
                    {feature}
                  </div>
                ))}
              </div>

              {plan.ctaStyle === 'link' ? (
                <MotionLink
                  to={plan.ctaHref}
                  whileHover={{ x: 3 }}
                  className="mt-[40px] inline-flex touch-manipulation items-center gap-[9px] self-start border-b-[1.5px] border-[#17181C] pb-[3px] text-[16px] font-bold tracking-[-0.01em] text-[#17181C]"
                >
                  {plan.cta}
                  <Arrow />
                </MotionLink>
              ) : (
                <MotionLink
                  to={plan.ctaHref}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-[40px] inline-flex items-center gap-[10px] self-start rounded-[12px] bg-[#17181C] px-[28px] py-[16px] text-[16px] font-semibold tracking-[-0.01em] text-white"
                >
                  {plan.cta}
                  <Arrow />
                </MotionLink>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={fadeUp}
          className="mt-[34px] flex items-center justify-center gap-[9px] text-center text-[14px] text-[#9B9DA3]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9B9DA3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
            <path d="M12 3 l7 3 v5 c0 4.4 -3 7.5 -7 9 c-4 -1.5 -7 -4.6 -7 -9 V6 Z" />
            <polyline points="9 12 11.2 14.2 15.5 9.6" />
          </svg>
          Campaign spend is separate. No lock-in. Cancel anytime.
        </motion.div>
      </motion.div>
    </section>
  )
}
