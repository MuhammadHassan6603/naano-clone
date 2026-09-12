import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { asset, brandLogos, CASE_STUDY_VIDEO } from '../lib/assets'
import { fadeUp, scaleIn, stagger, viewport } from '../lib/motion'

const stats = [
  { value: '9', label: 'creators activated' },
  { value: '2,940', label: 'qualified clicks' },
  { value: '512', label: 'trials started' },
]

const logoHeights: Record<string, number> = {
  lemlist: 34,
  folk: 24,
  Leadbay: 22,
  Ringover: 34,
  Attio: 34,
  'La Growth Machine': 27,
  gojiberry: 26,
  ChatSEO: 32,
  Abyssale: 24,
}

const card =
  'flex flex-col rounded-[28px] border border-white/92 bg-white/88 shadow-[0_28px_80px_-54px_rgba(56,96,128,0.42)] backdrop-blur-[18px]'

const label = 'text-[12px] font-bold tracking-[0.22em] text-[#9B9DA3]'

function VideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const play = () => {
    videoRef.current?.play()
    setPlaying(true)
  }

  return (
    <motion.div variants={scaleIn} className={`${card} relative z-2 p-[22px] lg:p-[30px] wide:translate-x-[14.5px] wide:translate-y-[41.8px] wide:rotate-[-0.65deg]`}>
      <span className={label}>VIDEO TESTIMONIAL</span>

      <div className="relative mt-[18px] h-[240px] overflow-hidden rounded-[16px] bg-[#EEF8FD] sm:h-[300px] lg:h-[340px]">
        <video
          ref={videoRef}
          src={CASE_STUDY_VIDEO}
          poster={asset('blogseo-vincent-video-poster.png', 828)}
          playsInline
          preload="metadata"
          controls={playing}
          onPause={() => setPlaying(false)}
          className="absolute inset-0 size-full object-contain"
        />
        {!playing && (
          <button
            type="button"
            onClick={play}
            aria-label="Play the BlogSEO video testimonial"
            className="absolute inset-0 size-full cursor-pointer border-0 bg-[linear-gradient(180deg,rgba(17,19,24,0.02),rgba(17,19,24,0.24))] p-0"
          >
            <span className="play-pulse pointer-events-none absolute top-1/2 left-1/2 inline-flex size-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/94 backdrop-blur-[8px]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#111318" aria-hidden>
                <path d="M8 5.5 L19 12 L8 18.5 Z" />
              </svg>
            </span>
            <span className="pointer-events-none absolute right-[14px] bottom-[12px] rounded-[7px] bg-[rgba(23,24,28,0.78)] px-[9px] py-[4px] text-[12px] font-semibold text-white">
              2:40
            </span>
          </button>
        )}
      </div>

      <p className="mt-[26px] text-[1.1875rem] leading-[1.4] font-semibold tracking-[-0.015em] text-[#17181C] lg:text-[24px]">
        “Naano became one of our fastest acquisition channels. We know exactly what every creator
        brings.”
      </p>

      <div className="mt-[22px] flex items-center gap-[13px]">
        <img
          src={asset('avatar-g.png', 96)}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-[46px] shrink-0 rounded-full object-cover"
        />
        <div>
          <div className="text-[15px] font-bold text-ink">Vincent Josse</div>
          <div className="mt-[1px] text-[13.5px] text-[#8B8D94]">CEO &amp; Founder, BlogSEO</div>
        </div>
      </div>
    </motion.div>
  )
}

function CaseCard() {
  return (
    <motion.div variants={scaleIn} transition={{ delay: 0.08 }} className={`${card} relative z-1 p-[22px] lg:p-[36px_40px] wide:-ml-[16px] wide:rotate-[0.28deg] wide:pl-[68px]`}>
      <div className="flex items-center justify-between">
        <span className={label}>CASE STUDY</span>
        <div className="flex items-center gap-[8px]">
          <svg width="30" height="24" viewBox="0 0 40 32" fill="none" className="shrink-0" aria-hidden>
            <rect x="3" y="3" width="27" height="19" rx="6" stroke="#2B9BF9" strokeWidth="3.4" />
            <circle cx="25" cy="21" r="6.2" stroke="#2B9BF9" strokeWidth="3.4" />
            <line x1="29.6" y1="25.6" x2="34.5" y2="30.5" stroke="#2B9BF9" strokeWidth="3.4" strokeLinecap="round" />
          </svg>
          <span className="text-[22px] font-extrabold tracking-[-0.02em] text-[#15171A]">BlogSEO</span>
        </div>
      </div>

      <h3 className="mt-[22px] text-[1.375rem] leading-[1.2] font-bold tracking-[-0.02em] text-[#17181C] lg:text-[27px]">
        How BlogSEO turned creator content into product signups
      </h3>

      <p className="mt-[14px] text-[15.5px] leading-[1.55] text-[#8B8D94]">
        BlogSEO briefed SEO &amp; SaaS creators on LinkedIn and X, then traced every trial back to
        the post that drove it, all in Naano.
      </p>

      <div className="my-[26px] h-px bg-[#F0EEEA]" />

      <div className="grid grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={index === 0 ? 'pr-[18px]' : 'border-l border-[#F0EEEA] px-[22px]'}
          >
            <div className="text-[1.75rem] font-semibold tracking-[-0.03em] text-[#17181C] lg:text-[38px]">
              {stat.value}
            </div>
            <div className="mt-[5px] text-[13.5px] text-[#8B8D94]">{stat.label}</div>
          </div>
        ))}
      </div>

      <motion.a
        href="https://naano.com/case-studies/blogseo"
        whileHover={{ x: 3 }}
        className="mt-[28px] inline-flex items-center gap-[9px] text-[15.5px] font-semibold text-ink"
      >
        Read case study
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="4" y1="12" x2="20" y2="12" />
          <polyline points="13 5 20 12 13 19" />
        </svg>
      </motion.a>

      <div className="mt-[30px] mb-[22px] h-px bg-[#F0EEEA]" />

      <div className="text-[11px] font-bold tracking-[0.2em] text-[#B0B2B8]">TRUSTED BY TEAMS AT</div>

      <div className="mt-[22px] flex flex-wrap items-center gap-x-[36px] gap-y-[22px]">
        {brandLogos.map((logo) => (
          <div key={logo.name} className="flex h-[40px] w-[124px] items-center justify-center">
            <img
              src={asset(logo.file, 384)}
              alt={logo.name}
              loading="lazy"
              decoding="async"
              style={{ maxHeight: `${logoHeights[logo.name]}px` }}
              className={`block max-w-[124px] object-contain ${
                logo.name === 'Attio' || logo.name === 'Abyssale' ? 'mix-blend-multiply' : ''
              }`}
            />
          </div>
        ))}
        <span className="inline-flex h-[26px] items-center rounded-full border-[1.5px] border-[#D9D6D0] px-[14px] text-[14px] font-bold tracking-[-0.01em] text-[#8B8D94]">
          +30
        </span>
      </div>
    </motion.div>
  )
}

export function Proof() {
  return (
    <section
      id="proof"
      className="bg-[linear-gradient(180deg,#FCFCFB_0%,rgba(243,248,255,0.72)_100%)] px-5 py-16 sm:px-8 lg:px-[84px] lg:pt-[118px] lg:pb-[150px]"
    >
      <motion.div
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto w-full max-w-[1272px]"
      >
        <motion.h2
          variants={fadeUp}
          className="text-center text-[2.25rem] leading-[1.03] font-semibold tracking-[-0.045em] text-balance text-ink sm:text-[3rem] lg:text-[51.84px]"
        >
          Real teams. Measurable pipeline.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-[16px] text-center text-[1rem] text-[#55575E] lg:text-[19px]"
        >
          See how B2B teams turn creator trust into attributable demand with Naano.
        </motion.p>

        <div className="mt-10 grid gap-6 lg:mx-[6px] lg:mt-[54px] lg:grid-cols-2 lg:gap-[34px] wide:grid-cols-[507.36px_700.63px] wide:items-start wide:justify-center wide:gap-0">
          <VideoCard />
          <CaseCard />
        </div>
      </motion.div>
    </section>
  )
}
