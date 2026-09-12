import { motion } from 'motion/react'
import { asset, assetSrcSet } from '../lib/assets'
import { fadeUp, scaleIn, stagger, viewport } from '../lib/motion'

const cards = [
  {
    number: '01',
    type: 'Brand agency',
    title: 'I manage campaigns for companies',
    copy: 'Operate separate client workspaces, budgets, campaigns and reporting from one portfolio.',
    points: [
      'Create one workspace per client',
      'Add and allocate client budgets',
      'Track campaigns and next actions',
    ],
    cta: 'Create a brand agency workspace',
    note: 'You will create the agency manager account first.',
  },
  {
    number: '02',
    type: 'Creator agency',
    title: 'I represent and manage creators',
    copy: 'Import your roster, manage every profile and run collaborations without creator logins.',
    points: [
      'Import any creator roster CSV',
      'Manage rates and creator profiles',
      'Track collaborations and earnings',
    ],
    cta: 'Create a creator agency workspace',
    note: 'Your creators do not need individual Naano accounts.',
  },
]

const Arrow = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const eyebrow = 'text-[11px] font-[750] tracking-[0.14em] uppercase lg:text-[calc(12*var(--u))]'

export default function Agencies() {
  return (
    <main className="canvas">
      <section
        id="top"
        className="relative flex flex-col items-center justify-center overflow-hidden bg-[#C5EBFD] px-5 pt-28 pb-16 text-center sm:px-8 lg:min-h-[calc(1045*var(--u))] lg:px-[calc(84*var(--u))] lg:pt-[calc(138*var(--u))] lg:pb-[calc(88*var(--u))]"
      >
        <img
          src={asset('hero-clouds-cotton-blue-v7.png', 1920)}
          srcSet={assetSrcSet('hero-clouds-cotton-blue-v7.png')}
          sizes="100vw"
          alt=""
          aria-hidden
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute inset-0 z-0 size-full object-cover object-bottom"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 z-1 bg-white/18" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-px z-3 h-[120px] bg-[linear-gradient(180deg,rgba(252,252,251,0)_0%,rgba(252,252,251,0.74)_72%,#FCFCFB_100%)] lg:h-[calc(170*var(--u))]"
        />

        <motion.div
          variants={stagger(0.09, 0.1)}
          initial="hidden"
          animate="show"
          className="relative z-10 flex flex-col items-center"
        >
          <motion.span
            variants={fadeUp}
            className={`${eyebrow} rounded-full border border-white/92 bg-white/92 px-[18px] py-[9px] text-[#526978] shadow-[0_4px_14px_rgba(42,73,117,0.055)] backdrop-blur-[8px] lg:px-[calc(18*var(--u))] lg:py-[calc(9*var(--u))]`}
          >
            Naano for agencies
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-8 max-w-[980px] text-[2.5rem] leading-[1.03] font-semibold tracking-[-0.045em] text-balance text-[#17181C] sm:text-[4rem] lg:mt-[calc(38*var(--u))] lg:max-w-[calc(980*var(--u))] lg:text-[calc(77*var(--u))]"
          >
            Choose the workspace that matches your agency.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-[700px] text-[1.0625rem] leading-[1.55] text-[#43454C] lg:mt-[calc(28*var(--u))] lg:max-w-[calc(700*var(--u))] lg:text-[calc(20*var(--u))] lg:leading-[calc(31*var(--u))]"
          >
            Naano separates brand operations from creator management. Choose your setup and create
            the right workspace for your agency.
          </motion.p>

          <motion.a
            variants={fadeUp}
            href="#choose"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="mt-9 inline-flex items-center gap-[11px] rounded-[12px] bg-[#17181C] px-[28px] py-[16px] text-[16px] font-semibold text-white lg:mt-[calc(40*var(--u))] lg:gap-[calc(11*var(--u))] lg:rounded-[calc(12*var(--u))] lg:px-[calc(28*var(--u))] lg:py-[calc(16*var(--u))] lg:text-[calc(16*var(--u))]"
          >
            Choose your agency
            <Arrow />
          </motion.a>
        </motion.div>
      </section>

      <section
        id="choose"
        className="bg-[linear-gradient(180deg,#FCFCFB_0%,#F7FBFD_100%)] px-5 py-16 sm:px-8 lg:px-[calc(84*var(--u))] lg:pt-[calc(88*var(--u))] lg:pb-[calc(104*var(--u))]"
      >
        <motion.div
          variants={stagger(0.09)}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mx-auto w-full max-w-[1320px] lg:max-w-[calc(1320*var(--u))]"
        >
          <motion.header variants={fadeUp} className="mb-10 lg:mb-[calc(48*var(--u))]">
            <span className={`${eyebrow} text-[#60727C]`}>Two distinct products</span>
            <h2 className="mt-3 max-w-[760px] text-[2.25rem] leading-[1.03] font-semibold tracking-[-0.045em] text-[#17181C] sm:text-[3rem] lg:mt-[calc(16*var(--u))] lg:max-w-[calc(760*var(--u))] lg:text-[calc(56*var(--u))]">
              What does your agency manage?
            </h2>
          </motion.header>

          <motion.div
            variants={scaleIn}
            className="grid overflow-hidden rounded-[18px] border border-[#DFE5E7] bg-white lg:grid-cols-2 lg:rounded-[calc(18*var(--u))]"
          >
            {cards.map((card, index) => (
              <article
                key={card.number}
                className={`flex flex-col p-[26px] sm:p-[34px] lg:min-h-[calc(530*var(--u))] lg:p-[calc(48*var(--u))] ${
                  index > 0 ? 'border-t border-[#DFE5E7] lg:border-t-0 lg:border-l' : ''
                }`}
              >
                <div className="flex items-center justify-between border-b border-[#ECEAE6] pb-[22px] lg:pb-[calc(28*var(--u))]">
                  <span className="text-[11px] font-extrabold tracking-[0.1em] text-[#54778A] lg:text-[calc(11*var(--u))]">
                    {card.number}
                  </span>
                  <span className={`${eyebrow} text-[#60727C]`}>{card.type}</span>
                </div>

                <h3 className="mt-6 max-w-[490px] text-[1.625rem] leading-[1.1] font-[650] tracking-[-0.035em] text-[#17181C] sm:text-[2rem] lg:mt-[calc(34*var(--u))] lg:max-w-[calc(490*var(--u))] lg:text-[calc(36*var(--u))]">
                  {card.title}
                </h3>

                <p className="mt-4 max-w-[520px] text-[15.5px] leading-[1.58] text-[#5F6670] lg:mt-[calc(18*var(--u))] lg:max-w-[calc(520*var(--u))] lg:text-[calc(16*var(--u))]">
                  {card.copy}
                </p>

                <ul className="mt-7 mb-8 grid gap-[14px] lg:mt-[calc(32*var(--u))] lg:mb-[calc(38*var(--u))] lg:gap-[calc(14*var(--u))]">
                  {card.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-[11px] text-[14.5px] text-[#33353B] lg:gap-[calc(11*var(--u))] lg:text-[calc(15*var(--u))]"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#315FBE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>

                <motion.a
                  href="#book-a-call"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between gap-4 rounded-[12px] bg-[#17181C] px-[18px] py-[16px] text-[15px] font-[650] text-white lg:mt-auto lg:rounded-[calc(12*var(--u))] lg:px-[calc(18*var(--u))] lg:py-[calc(16*var(--u))] lg:text-[calc(15*var(--u))]"
                >
                  {card.cta}
                  <Arrow />
                </motion.a>

                <small className="mt-3.5 text-[12px] leading-[1.45] text-[#8993A2] lg:mt-[calc(14*var(--u))] lg:text-[calc(12*var(--u))]">
                  {card.note}
                </small>
              </article>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section
        id="book-a-call"
        className="bg-[linear-gradient(180deg,#F7FBFD_0%,#E5F5FC_48%,#D9F0FB_100%)] px-5 py-20 text-center sm:px-8 lg:px-[calc(84*var(--u))] lg:pt-[calc(132*var(--u))] lg:pb-[calc(158*var(--u))]"
      >
        <motion.div
          variants={stagger(0.09)}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mx-auto max-w-[880px] lg:max-w-[calc(880*var(--u))]"
        >
          <motion.span variants={fadeUp} className={`${eyebrow} block text-[#54778A]`}>
            Talk to Naano
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="mt-5 text-[2.25rem] leading-[1.03] font-semibold tracking-[-0.045em] text-[#17181C] sm:text-[3rem] lg:mt-[calc(20*var(--u))] lg:text-[calc(60*var(--u))]"
          >
            Not sure which workspace fits your agency?
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-[660px] text-[1rem] leading-[1.6] text-[#555F68] lg:mt-[calc(26*var(--u))] lg:max-w-[calc(660*var(--u))] lg:text-[calc(18*var(--u))]"
          >
            Book a 30-minute agency call. We will look at how you manage clients or creators and
            point you to the right setup.
          </motion.p>

          <motion.a
            variants={fadeUp}
            href="/#cta"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="mt-9 inline-flex items-center gap-[10px] rounded-[12px] bg-[#17181C] px-[24px] py-[16px] text-[16px] font-[650] text-white lg:mt-[calc(38*var(--u))] lg:gap-[calc(10*var(--u))] lg:rounded-[calc(12*var(--u))] lg:px-[calc(24*var(--u))] lg:py-[calc(16*var(--u))] lg:text-[calc(16*var(--u))]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
              <path d="M8 14h.01" />
              <path d="M12 14h.01" />
              <path d="M16 14h.01" />
              <path d="M8 18h.01" />
              <path d="M12 18h.01" />
              <path d="M16 18h.01" />
            </svg>
            Book a call
            <Arrow />
          </motion.a>

          <motion.small
            variants={fadeUp}
            className="mt-4 block text-[13px] text-[#70818C] lg:mt-[calc(16*var(--u))] lg:text-[calc(13*var(--u))]"
          >
            30 minutes with the Naano team. No commitment.
          </motion.small>
        </motion.div>
      </section>
    </main>
  )
}
