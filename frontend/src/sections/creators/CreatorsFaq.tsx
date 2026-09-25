import { motion } from 'motion/react'
import { Accordion, type FaqItem } from '../../components/Accordion'
import { fadeUp, stagger, viewport } from '../../lib/motion'

const faqs: FaqItem[] = [
  {
    q: 'What is Naano?',
    a: 'Naano is the B2B LinkedIn creator marketplace: B2B brands book creators for sponsored LinkedIn posts at a fixed price per post that you set. Creators from about 1,000 to 500,000 followers use Naano to monetize their LinkedIn audience with deals from B2B brands they already know.',
  },
  {
    q: 'Is Naano free for creators?',
    a: 'Yes, always. Joining and using Naano is completely free, and you keep 100% of what you earn on every deal.',
  },
  {
    q: 'How much can I earn?',
    a: 'Creators earn on average €500 per deal, with top deals reaching €1,500. You choose which deals to take, so your earnings scale with how much you post.',
  },
  {
    q: 'How and when do I get paid?',
    a: 'You get paid within 24h of your post going live, securely via Stripe or bank transfer. No invoicing, no chasing, it happens automatically.',
  },
  {
    q: 'Do I have to sign an exclusivity contract?',
    a: 'No. There is no exclusivity, no minimum and no lock-in. You pick the deals you want and quit anytime while keeping everything you have earned.',
  },
  {
    q: 'What kind of brands are on Naano?',
    a: 'B2B brands you already know: SaaS, sales, marketing and prospecting tools like Lemlist, Folk, Ringover and Gojiberry, plus 20+ more, with new deals every week.',
  },
  {
    q: 'Do I keep control of my content?',
    a: 'Completely. You post in your own voice. Each brief gives you an angle, a hook and a CTA plus full product access, but the words are always yours.',
  },
  {
    q: 'How do I join?',
    a: 'Apply in about 2 minutes, no commitment. Once approved you can browse open deals and start earning right away.',
  },
]

export function CreatorsFaq() {
  return (
    <section
      id="faq"
      className="px-5 pb-16 sm:px-8 lg:px-[calc(84*var(--u))] lg:pt-[calc(40*var(--u))] lg:pb-[calc(100*var(--u))]"
    >
      <motion.div
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <motion.h2
          variants={fadeUp}
          className="text-center text-[2.25rem] leading-[1.06] font-semibold tracking-[-0.03em] text-[#17181C] sm:text-[3rem] lg:text-[calc(52*var(--u))]"
        >
          Frequently asked questions<span className="text-[#2563EB]">.</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-4 text-center text-[1rem] text-[#55575E] lg:mt-[calc(16*var(--u))] lg:text-[calc(19*var(--u))]"
        >
          Everything you need to know before you start earning.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mx-auto mt-10 max-w-[820px] lg:mt-[calc(60*var(--u))] lg:max-w-[calc(820*var(--u))]"
        >
          <Accordion items={faqs} openColor="#2563EB" />
        </motion.div>
      </motion.div>
    </section>
  )
}
