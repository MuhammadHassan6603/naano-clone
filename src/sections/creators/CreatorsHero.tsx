import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { asset, assetSrcSet } from '../../lib/assets'
import { fadeUp, stagger } from '../../lib/motion'

const avatars = ['avatar-b.png', 'avatar-f.png', 'avatar-a.png']

const brands = [
  { file: 'logo-lemlist.png', alt: 'lemlist', height: 30 },
  { file: 'logo-attio.jpg', alt: 'Attio', height: 26 },
  { file: 'logo-folk.png', alt: 'Folk', height: 22 },
  { file: 'logo-ringover.png', alt: 'Ringover', height: 30 },
  { file: 'logo-gojiberry.png', alt: 'Gojiberry', height: 24 },
  { file: 'logo-lagrowthmachine.png', alt: 'La Growth Machine', height: 24 },
  { file: 'logo-chatseo.png', alt: 'ChatSEO', height: 28 },
  { file: 'logo-abyssale.png', alt: 'Abyssale', height: 22 },
]

const Arrow = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="13 5 20 12 13 19" />
  </svg>
)

export function CreatorsHero() {
  return (
    <section
      id="top"
      className="relative flex flex-col items-center justify-center overflow-hidden px-5 pt-24 pb-14 text-center sm:px-8 lg:min-h-[calc(100svh-calc(74*var(--u)))] lg:px-[calc(84*var(--u))] lg:pt-[calc(114*var(--u))] lg:pb-[calc(60*var(--u))]"
    >
      <img
        src={asset('hero-clouds-cotton-blue-v7.png', 1920)}
        srcSet={assetSrcSet('hero-clouds-cotton-blue-v7.png')}
        sizes="100vw"
        alt=""
        aria-hidden
        fetchPriority="high"
        decoding="async"
        className="pointer-events-none absolute inset-0 -z-20 size-full object-cover object-bottom"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-b from-transparent via-page/70 to-page" />

      <motion.div
        variants={stagger(0.09, 0.1)}
        initial="hidden"
        animate="show"
        className="flex w-full flex-col items-center"
      >
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-[10px] rounded-full border border-[#EBE9E5] bg-white px-[16px] py-[8px] shadow-[0_1px_2px_rgba(23,24,28,0.04)] lg:gap-[calc(10*var(--u))] lg:px-[calc(18*var(--u))] lg:py-[calc(9*var(--u))] lg:pl-[calc(14*var(--u))]"
        >
          <span className="inline-flex items-center">
            {avatars.map((file, index) => (
              <span
                key={file}
                style={{ backgroundImage: `url(${asset(file, 96)})` }}
                className={`size-[22px] rounded-full border-2 border-white bg-line bg-cover lg:size-[calc(22*var(--u))] ${index > 0 ? '-ml-[8px] lg:-ml-[calc(8*var(--u))]' : ''}`}
              />
            ))}
          </span>
          <span className="text-[14px] font-medium text-[#33353B] lg:text-[calc(15*var(--u))]">
            2,000+ creators paid · 4.8/5 rating
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-8 max-w-[980px] text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.04em] text-balance text-[#17181C] sm:text-[4rem] lg:mt-[calc(34*var(--u))] lg:max-w-[calc(980*var(--u))] lg:text-[calc(80*var(--u))]"
        >
          Get paid to post on LinkedIn
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-[680px] text-[1.0625rem] leading-[1.5] text-[#43454C] lg:mt-[calc(30*var(--u))] lg:max-w-[calc(680*var(--u))] lg:text-[calc(21*var(--u))]"
        >
          Choose deals from B2B brands you know, post in your own voice, and get paid within 24h. No
          negotiating, no admin. Creators earn{' '}
          <span className="font-semibold text-[#17181C]">€500 on average per deal</span>.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-col items-center gap-5 sm:flex-row lg:mt-[calc(44*var(--u))] lg:gap-[calc(24*var(--u))]"
        >
          <motion.a
            href="#apply"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-[11px] rounded-[12px] bg-[#17181C] px-[28px] py-[16px] text-[16px] font-semibold whitespace-nowrap text-white lg:gap-[calc(11*var(--u))] lg:rounded-[calc(12*var(--u))] lg:px-[calc(28*var(--u))] lg:py-[calc(16*var(--u))] lg:text-[calc(16*var(--u))]"
          >
            Start earning
            <Arrow />
          </motion.a>
          <motion.a
            href="#monetize"
            whileHover={{ x: 3 }}
            className="inline-flex items-center gap-[9px] text-[16.5px] font-semibold whitespace-nowrap text-[#17181C] lg:gap-[calc(9*var(--u))] lg:text-[calc(16.5*var(--u))]"
          >
            See how it works
            <Arrow size={16} />
          </motion.a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-7 flex items-center gap-[11px] text-[#55575E] lg:mt-[calc(34*var(--u))] lg:gap-[calc(11*var(--u))]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
            <path d="M12 2 L20 5 V11 C20 16.5 16.5 20.5 12 22 C7.5 20.5 4 16.5 4 11 V5 Z" />
            <path d="M9 12 L11 14 L15 9.5" />
          </svg>
          <span className="text-[14.5px] font-medium lg:text-[calc(15.5*var(--u))]">
            Free to join · No exclusivity · Paid within 24h
          </span>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-12 w-full lg:mt-[calc(62*var(--u))]">
          <div className="text-center text-[11px] font-bold tracking-[0.18em] text-[#B0B2B8] lg:text-[calc(12*var(--u))]">
            THE BRANDS ALREADY ON NAANO
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-[34px] gap-y-[22px] lg:mt-[calc(28*var(--u))] lg:gap-x-[calc(54*var(--u))] lg:gap-y-[calc(28*var(--u))]">
            {brands.map((brand) => (
              <span
                key={brand.file}
                className="flex h-[26px] items-center justify-center lg:h-[calc(34*var(--u))]"
              >
                <img
                  src={asset(brand.file, 256)}
                  alt={brand.alt}
                  loading="lazy"
                  decoding="async"
                  style={{ '--lh': brand.height } as CSSProperties}
                  className="block max-h-[calc(var(--lh)*0.8px)] w-auto max-w-[110px] object-contain opacity-55 grayscale lg:max-h-[calc(var(--lh)*var(--u))] lg:max-w-[calc(132*var(--u))]"
                />
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
