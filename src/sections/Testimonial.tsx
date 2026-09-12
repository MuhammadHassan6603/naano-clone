import { motion } from 'motion/react'
import { asset, assetSrcSet } from '../lib/assets'
import { ease, fadeUp, viewport } from '../lib/motion'

const QUOTE = 'We manage €10M+ of influence budget every year. For B2B, Naano simply makes our life easier'

const words = QUOTE.split(' ')

export function Testimonial() {
  return (
    <section className="flex flex-col items-center px-5 py-20 text-center sm:px-8 lg:px-[calc(84*var(--u))] lg:py-[calc(96*var(--u))]">
      <motion.img
        src={asset('logo-zmirov.png', 384)}
        srcSet={assetSrcSet('logo-zmirov.png', 640)}
        sizes="(max-width: 1023px) 120px, 141px"
        alt="Zmirov Communication"
        loading="lazy"
        decoding="async"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="h-[34px] w-auto lg:h-[calc(46*var(--u))]"
      />

      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewport}
        transition={{ duration: 0.5, ease, delay: 0.1 }}
        className="mt-4 h-[2px] w-[38px] origin-center rounded-[2px] bg-[#2563EB] lg:mt-[calc(20*var(--u))] lg:w-[calc(46*var(--u))]"
      />

      <motion.blockquote
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={{ show: { transition: { staggerChildren: 0.035, delayChildren: 0.12 } } }}
        className="mt-8 max-w-[1160px] lg:max-w-[calc(880*var(--u))] text-[1.625rem] leading-[1.25] font-medium tracking-[-0.022em] text-balance text-[#17181C] sm:text-[2.25rem] lg:mt-[calc(44*var(--u))] lg:text-[calc(52*var(--u))] lg:leading-[1.2]"
      >
        <span aria-hidden>“</span>
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={{ hidden: { opacity: 0.14 }, show: { opacity: 1, transition: { duration: 0.28, ease } } }}
            className={index === words.length - 1 ? 'text-[#2563EB]' : undefined}
          >
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
        <span aria-hidden>”</span>
      </motion.blockquote>

      <motion.img
        src={asset('photo-david-zmirov.png', 256)}
        srcSet={assetSrcSet('photo-david-zmirov.png', 384)}
        sizes="(max-width: 1023px) 76px, 104px"
        alt="David Zmirov"
        loading="lazy"
        decoding="async"
        width={104}
        height={104}
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mt-9 size-[76px] rounded-full object-cover object-[center_18%] lg:mt-[calc(52*var(--u))] lg:size-[calc(104*var(--u))]"
      />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        transition={{ delay: 0.06 }}
      >
        <div className="mt-4 text-[1.0625rem] font-bold text-[#17181C] lg:mt-[calc(20*var(--u))] lg:text-[calc(19*var(--u))]">
          David Zmirov
        </div>
        <div className="mt-1.5 text-[0.9375rem] text-[#55575E] lg:mt-[calc(6*var(--u))] lg:text-[calc(16*var(--u))]">
          CEO, Zmirov Communication
        </div>
        <div className="mt-1 text-[0.875rem] text-[#9B9DA3] lg:mt-[calc(4*var(--u))] lg:text-[calc(15*var(--u))]">
          Influence agency
        </div>
      </motion.div>
    </section>
  )
}
