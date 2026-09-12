import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ChevronDown } from '../components/Icons'
import { ease, fadeUp, stagger, viewport } from '../lib/motion'

const faqs = [
  {
    q: 'What is Naano?',
    a: 'Naano is a B2B LinkedIn creator marketplace: companies discover and book vetted creators for sponsored LinkedIn campaigns, each at a fixed price per post set by the creator. The marketplace spans creators from niche voices with around 1,000 followers to established B2B creators with audiences of several hundred thousand.',
  },
  {
    q: 'How does Naano find the right creators?',
    a: 'Our matching engine scores every creator on audience fit, category relevance and engagement quality across LinkedIn, X and YouTube, so you rank creators by who actually reaches your buyers, not by follower count.',
  },
  {
    q: 'Which networks do you support?',
    a: 'LinkedIn, X and YouTube today, with more on the way. You can compare creators and track performance across every network in one place.',
  },
  {
    q: 'How does per-post pricing work?',
    a: 'Campaigns start from €20 per published post, you only pay for posts that go live, with no retainer. Prefer a hands-off setup? Done for you adds our team executing everything end to end.',
  },
  {
    q: 'How does attribution work?',
    a: 'Naano places a tracking pixel at every stage of the funnel, so each click, lead, pipeline and revenue is tied back to the exact creator and post that drove it.',
  },
  {
    q: 'Do you handle creator payouts?',
    a: 'Yes. Approve content and pay every creator in one click, securely via Stripe Connect, invoices and approvals are handled for you.',
  },
  {
    q: "What's the difference between Free and Done for you?",
    a: 'Free gives your team the platform to source creators and run simple campaigns yourselves. Done for you adds hands-on execution by the Naano team, sourcing, briefs, reporting and optimisation.',
  },
  {
    q: 'Can I upgrade or cancel anytime?',
    a: 'Absolutely. Plans are month-to-month, you can upgrade, downgrade or cancel whenever you like.',
  },
]

export function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section
      id="faq"
      className="bg-white px-5 py-16 sm:px-8 lg:px-[84px] lg:pt-[130px] lg:pb-[144px]"
    >
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 lg:grid-cols-[minmax(260px,360px)_minmax(0,760px)] lg:justify-between lg:gap-[90px]">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="lg:sticky lg:top-[120px] lg:self-start"
        >
          <motion.h2
            variants={fadeUp}
            className="text-[2.25rem] leading-[1.03] font-semibold tracking-[-0.045em] text-[#17181C] sm:text-[3rem] lg:text-[52px]"
          >
            Frequently asked questions.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-[16px] text-[17px] leading-[1.5] text-[#55575E] lg:text-[19px]"
          >
            Everything you need to know before getting started.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-[28px] flex flex-wrap items-center gap-[10px] text-[15px] text-[#70747B]"
          >
            <span>Still have questions?</span>
            <motion.a
              href="#cta"
              whileHover={{ x: 3 }}
              className="inline-flex items-center gap-[7px] font-[650] text-[#111318]"
            >
              Talk to our team
              <ArrowRight width="15" height="15" strokeWidth={2} />
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="w-full"
        >
          {faqs.map((item, index) => {
            const isOpen = open === index
            return (
              <div
                key={item.q}
                className={`border-t ${index === 0 ? 'border-[#DFE7EB]' : 'border-[#ECEAE6]'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer touch-manipulation items-center justify-between gap-[18px] rounded-[14px] py-[22px] text-left transition-[background-color,padding] duration-[240ms] hover:bg-[#F3F9FC] hover:px-[14px] lg:gap-[24px] lg:py-[30px]"
                >
                  <span className="text-[17px] leading-[1.35] font-medium tracking-[-0.015em] text-[#17181C] lg:text-[20px]">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0, color: isOpen ? '#111318' : '#9B9DA3' }}
                    transition={{ duration: 0.3, ease }}
                    className="inline-flex size-[24px] shrink-0 items-center justify-center"
                  >
                    <ChevronDown width="18" height="18" strokeWidth={1.8} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.36, ease }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[680px] pb-[28px] text-[15.5px] leading-[1.65] text-[#6B6D74] lg:pr-[60px] lg:pb-[32px] lg:text-[16.5px]">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
          <div className="border-t border-[#ECEAE6]" />
        </motion.div>
      </div>
    </section>
  )
}
