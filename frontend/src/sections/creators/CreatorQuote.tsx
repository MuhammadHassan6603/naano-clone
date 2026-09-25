import { motion } from 'motion/react'
import { asset } from '../../lib/assets'
import { ease, fadeUp, viewport } from '../../lib/motion'

const QUOTE = 'I was able to select my rate and get paid the moment the post went live'

const words = QUOTE.split(' ')

const Star = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#F5A623" className="lg:size-[calc(22*var(--u))]" aria-hidden>
    <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.6z" />
  </svg>
)

export function CreatorQuote() {
  return (
    <section className="flex flex-col items-center px-5 py-16 text-center sm:px-8 lg:min-h-[calc(620*var(--u))] lg:justify-center lg:px-[calc(84*var(--u))] lg:pt-[calc(90*var(--u))] lg:pb-[calc(96*var(--u))]">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="inline-flex items-center gap-[4px]"
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <Star key={index} />
        ))}
      </motion.div>

      <motion.blockquote
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={{ show: { transition: { staggerChildren: 0.035, delayChildren: 0.12 } } }}
        className="mt-8 max-w-[1040px] text-[1.625rem] leading-[1.24] font-medium tracking-[-0.02em] text-balance text-[#17181C] sm:text-[2.25rem] lg:mt-[calc(40*var(--u))] lg:max-w-[calc(1040*var(--u))] lg:text-[calc(44*var(--u))]"
      >
        <span aria-hidden>“</span>
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={{ hidden: { opacity: 0.14 }, show: { opacity: 1, transition: { duration: 0.28, ease } } }}
          >
            {word}{' '}
          </motion.span>
        ))}
        <motion.span
          variants={{ hidden: { opacity: 0.14 }, show: { opacity: 1, transition: { duration: 0.28, ease } } }}
          className="text-[#2563EB]"
        >
          .
        </motion.span>
        <span aria-hidden>”</span>
      </motion.blockquote>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="flex flex-col items-center"
      >
        <span
          style={{ backgroundImage: `url(${asset('avatar-c.png', 256)})` }}
          className="mt-9 size-[76px] rounded-full bg-line bg-cover bg-center lg:mt-[calc(48*var(--u))] lg:size-[calc(88*var(--u))]"
        />
        <div className="mt-4 text-[1.0625rem] font-bold text-[#17181C] lg:mt-[calc(20*var(--u))] lg:text-[calc(19*var(--u))]">
          Thomas Higadère
        </div>
        <div className="mt-1.5 text-[0.9375rem] text-[#55575E] lg:mt-[calc(6*var(--u))] lg:text-[calc(16*var(--u))]">
          B2B & AI creator · 34K followers
        </div>
      </motion.div>
    </section>
  )
}
