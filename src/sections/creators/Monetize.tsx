import { motion } from 'motion/react'
import { asset } from '../../lib/assets'
import { fadeUp, scaleIn, stagger, viewport } from '../../lib/motion'

const cardClass =
  'flex flex-col rounded-[22px] border border-[#EDEBE7] bg-white p-[22px] lg:rounded-[calc(22*var(--u))] lg:p-[calc(30*var(--u))] lg:pb-[calc(34*var(--u))]'

const stageClass =
  'flex flex-1 items-center justify-center rounded-[16px] border border-[#F0EEEA] bg-[#FBFAF8] px-[18px] py-[22px] lg:min-h-[calc(200*var(--u))] lg:rounded-[calc(16*var(--u))] lg:px-[calc(24*var(--u))] lg:py-[calc(28*var(--u))]'

const captionClass =
  'mt-[18px] text-center text-[17px] font-semibold tracking-[-0.02em] text-[#17181C] lg:mt-[calc(24*var(--u))] lg:text-[calc(20*var(--u))]'

const innerCard =
  'w-full rounded-[14px] border border-[#EDEBE7] bg-white p-[18px] shadow-[0_18px_40px_-22px_rgba(23,24,28,0.28)] lg:rounded-[calc(14*var(--u))] lg:p-[calc(20*var(--u))]'

const bars = [
  { height: '38%', color: '#E7E4DF' },
  { height: '62%', color: '#DFE9FB' },
  { height: '52%', color: '#E7E4DF' },
  { height: '88%', color: '#2563EB' },
  { height: '70%', color: '#DFE9FB' },
  { height: '100%', color: '#2563EB' },
]

const logomarks = [
  { file: 'logomark-lemlist.png', alt: 'lemlist', left: '5%', top: '10%', rotate: -8, max: 34 },
  { file: 'logomark-flame.png', alt: '', left: '37%', top: '4%', rotate: 6, max: 34 },
  { file: 'logomark-teal-circle.png', alt: '', left: '70%', top: '12%', rotate: -6, max: 30 },
  { file: 'logomark-circle-dark.png', alt: '', left: '15%', top: '56%', rotate: 7, max: 30 },
  { file: 'logomark-bolt.png', alt: '', left: '48%', top: '62%', rotate: -9, max: 34 },
]

export function Monetize() {
  return (
    <section
      id="monetize"
      className="px-5 py-16 sm:px-8 lg:px-[calc(84*var(--u))] lg:pt-[calc(92*var(--u))] lg:pb-[calc(100*var(--u))]"
    >
      <motion.div
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto grid w-full max-w-[1240px] gap-5 lg:max-w-[calc(1240*var(--u))] lg:grid-cols-[1.02fr_1fr_1fr] lg:gap-[calc(20*var(--u))]"
      >
        <motion.div
          variants={fadeUp}
          className="flex flex-col justify-end lg:pr-[calc(8*var(--u))] lg:pb-[calc(26*var(--u))]"
        >
          <h2 className="text-[2.125rem] leading-[1.04] font-semibold tracking-[-0.035em] text-[#17181C] sm:text-[2.75rem] lg:text-[calc(50*var(--u))]">
            Monetize your content on Naano<span className="text-[#2563EB]">.</span>
          </h2>
          <p className="mt-5 max-w-[400px] text-[1rem] leading-[1.5] text-[#55575E] lg:mt-[calc(20*var(--u))] lg:max-w-[calc(400*var(--u))] lg:text-[calc(19*var(--u))]">
            Accept deals from brands you know, or bring your own onto the platform and get paid
            faster.
          </p>
        </motion.div>

        <motion.div variants={scaleIn} className={cardClass}>
          <div className={stageClass}>
            <div className={`${innerCard} max-w-[272px] lg:max-w-[calc(272*var(--u))]`}>
              <div className="flex items-center gap-[11px] lg:gap-[calc(11*var(--u))]">
                <span
                  style={{ backgroundImage: `url(${asset('avatar-e.png', 96)})` }}
                  className="size-[38px] rounded-full bg-line bg-cover bg-center lg:size-[calc(42*var(--u))]"
                />
                <div className="flex-1">
                  <div className="text-[12.5px] font-bold text-[#17181C] lg:text-[calc(13.5*var(--u))]">
                    Robin Tempe
                  </div>
                  <div className="text-[11px] text-[#8A8C92] lg:text-[calc(11.5*var(--u))]">
                    B2B SaaS · Product
                  </div>
                </div>
                <span className="inline-flex items-center gap-[4px] rounded-[6px] bg-[#EAF3FF] px-[8px] py-[4px] text-[10px] font-bold text-[#2563EB] lg:text-[calc(10.5*var(--u))]">
                  in LinkedIn
                </span>
              </div>

              <div className="mt-[14px] flex gap-[7px] lg:mt-[calc(16*var(--u))]">
                <span className="inline-flex items-center gap-[5px] rounded-[7px] bg-[#FDECEC] px-[9px] py-[5px] text-[11px] font-bold text-[#E0455A] lg:text-[calc(11.5*var(--u))]">
                  ▶ 97K views
                </span>
                <span className="inline-flex items-center gap-[5px] rounded-[7px] bg-[#EAF3FF] px-[9px] py-[5px] text-[11px] font-bold text-[#2563EB] lg:text-[calc(11.5*var(--u))]">
                  ◎ 34K reach
                </span>
              </div>

              <div className="mt-[14px] flex h-[40px] items-end gap-[6px] lg:mt-[calc(16*var(--u))] lg:h-[calc(44*var(--u))]">
                {bars.map((bar, index) => (
                  <span
                    key={index}
                    style={{ height: bar.height, background: bar.color }}
                    className="flex-1 rounded-t-[4px]"
                  />
                ))}
              </div>

              <div className="mt-[13px] flex items-center justify-between border-t border-[#F0EEEA] pt-[12px] lg:mt-[calc(14*var(--u))] lg:pt-[calc(13*var(--u))]">
                <span className="text-[11px] text-[#8A8C92] lg:text-[calc(11.5*var(--u))]">
                  Starting rate
                </span>
                <span className="text-[13px] font-extrabold text-[#17181C] lg:text-[calc(14*var(--u))]">
                  €800 / post
                </span>
              </div>
            </div>
          </div>
          <div className={captionClass}>
            Launch a professional
            <br />
            media kit in minutes
          </div>
        </motion.div>

        <motion.div variants={scaleIn} className={cardClass}>
          <div className={stageClass}>
            <div className={`${innerCard} max-w-[256px] lg:max-w-[calc(256*var(--u))]`}>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-[7px] text-[12px] font-bold text-[#16A34A] lg:text-[calc(12.5*var(--u))]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="8 12.5 11 15.5 16 9" />
                  </svg>
                  Payment received
                </span>
                <span className="text-[10px] text-[#8A8C92] lg:text-[calc(10.5*var(--u))]">
                  Today
                </span>
              </div>
              <div className="mt-[10px] text-[34px] leading-none font-extrabold tracking-[-0.03em] text-[#17181C] lg:mt-[calc(12*var(--u))] lg:text-[calc(40*var(--u))]">
                €5,000
              </div>
              <div className="mt-[8px] flex items-center gap-[6px]">
                <span className="inline-flex items-center gap-[4px] rounded-[6px] bg-[#E7F7EC] px-[8px] py-[4px] text-[10px] font-bold text-[#16A34A] lg:text-[calc(10.5*var(--u))]">
                  ⚡ Instant · SEPA
                </span>
                <span className="text-[10.5px] text-[#8A8C92] lg:text-[calc(11*var(--u))]">
                  Attio campaign
                </span>
              </div>
              <div className="mt-[14px] flex items-center gap-[9px] border-t border-[#F0EEEA] pt-[13px] lg:mt-[calc(16*var(--u))] lg:pt-[calc(14*var(--u))]">
                <span
                  style={{ backgroundImage: `url(${asset('avatar-f.png', 96)})` }}
                  className="size-[26px] rounded-full bg-line bg-cover bg-center lg:size-[calc(28*var(--u))]"
                />
                <div className="flex-1">
                  <div className="text-[11.5px] font-semibold text-[#17181C] lg:text-[calc(12*var(--u))]">
                    Paid to your account
                  </div>
                  <div className="text-[10px] text-[#8A8C92] lg:text-[calc(10.5*var(--u))]">
                    No invoice, no chasing
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={captionClass}>Instant payment</div>
        </motion.div>

        <motion.div variants={scaleIn} className={cardClass}>
          <div className={stageClass}>
            <div className="relative h-[190px] w-full lg:h-auto lg:min-h-[calc(190*var(--u))]">
              {logomarks.map((mark) => (
                <span
                  key={mark.file}
                  style={{ left: mark.left, top: mark.top, transform: `rotate(${mark.rotate}deg)` }}
                  className="absolute flex size-[56px] items-center justify-center rounded-[16px] border border-[#EDEBE7] bg-white shadow-[0_12px_26px_-12px_rgba(23,24,28,0.35)] lg:size-[calc(62*var(--u))] lg:rounded-[calc(16*var(--u))]"
                >
                  <img
                    src={asset(mark.file, 96)}
                    alt={mark.alt}
                    loading="lazy"
                    decoding="async"
                    style={{ maxHeight: `${mark.max * 0.8}px` }}
                    className="w-auto max-w-[36px] object-contain"
                  />
                </span>
              ))}
              <span
                style={{ left: '78%', top: '58%', transform: 'rotate(5deg)' }}
                className="absolute flex size-[56px] items-center justify-center rounded-[16px] bg-[#2563EB] shadow-[0_12px_30px_-8px_rgba(37,99,235,0.6)] lg:size-[calc(62*var(--u))] lg:rounded-[calc(16*var(--u))]"
              >
                <img
                  src={asset('naano-logo-footer.png', 96)}
                  alt="Naano"
                  loading="lazy"
                  decoding="async"
                  className="max-h-[18px] w-auto max-w-[44px] object-contain lg:max-h-[calc(22*var(--u))]"
                />
              </span>
            </div>
          </div>
          <div className={captionClass}>Get sponsored by our network</div>
        </motion.div>

        <motion.div variants={scaleIn} className={cardClass}>
          <div className={stageClass}>
            <div className={`${innerCard} max-w-[264px] lg:max-w-[calc(264*var(--u))]`}>
              <div className="flex items-center gap-[10px]">
                <span className="flex size-[32px] items-center justify-center rounded-[9px] bg-[#EAF3FF] lg:size-[calc(34*var(--u))]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                <div className="text-[12.5px] font-semibold text-[#17181C] lg:text-[calc(13.5*var(--u))]">
                  A deal you sourced
                </div>
              </div>
              <div className="mt-[14px] flex items-center justify-between rounded-[9px] border border-[#EDEBE7] bg-[#FBFAF8] px-[12px] py-[9px] lg:mt-[calc(15*var(--u))]">
                <span className="text-[12px] text-[#8A8C92] lg:text-[calc(13*var(--u))]">
                  yourbrand.com
                </span>
                <span className="text-[12px] font-bold text-[#17181C] lg:text-[calc(13*var(--u))]">
                  €2,000
                </span>
              </div>
              <div className="mt-[12px] flex items-center justify-between rounded-[9px] border border-[#CFEDD8] bg-[#E7F7EC] px-[12px] py-[10px]">
                <span className="inline-flex items-center gap-[6px] text-[11.5px] font-bold text-[#16A34A] lg:text-[calc(12*var(--u))]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
                  </svg>
                  Naano bonus
                </span>
                <span className="text-[12.5px] font-extrabold text-[#16A34A] lg:text-[calc(13*var(--u))]">
                  + €300
                </span>
              </div>
              <div className="mt-[12px] text-[10.5px] text-[#8A8C92] lg:text-[calc(11*var(--u))]">
                Contract & payout handled. You just close it.
              </div>
            </div>
          </div>
          <div className={captionClass}>Bring your own deals & earn extra</div>
        </motion.div>

        <motion.div variants={scaleIn} className={cardClass}>
          <div className={stageClass}>
            <div className={`${innerCard} max-w-[264px] lg:max-w-[calc(264*var(--u))] lg:p-[calc(18*var(--u))]`}>
              <div className="flex items-center gap-[9px]">
                <span className="flex size-[28px] items-center justify-center rounded-[8px] bg-[#EEF0FF] text-[13px] lg:size-[calc(30*var(--u))]">
                  🔔
                </span>
                <div className="text-[12.5px] leading-[1.35] text-[#26272C] lg:text-[calc(13*var(--u))]">
                  <span className="font-bold">Attio</span> sent a collaboration request
                </div>
              </div>
              <div className="mt-[13px] flex items-center justify-between lg:mt-[calc(14*var(--u))]">
                <span className="inline-flex items-center gap-[6px] rounded-full bg-[#EEF0FF] px-[10px] py-[5px] text-[11px] font-bold text-[#5B5FE0] lg:text-[calc(11.5*var(--u))]">
                  ◆ Sponsored post
                </span>
                <span className="inline-flex items-center gap-[5px] rounded-[7px] bg-[#EAF3FF] px-[10px] py-[5px] text-[11px] font-bold text-[#2563EB] lg:text-[calc(11.5*var(--u))]">
                  €1,000
                </span>
              </div>
              <div className="mt-[12px] text-[10.5px] text-[#8A8C92] lg:text-[calc(11*var(--u))]">
                Deliver by · Aug 12 · 1 post + 1 repost
              </div>
              <div className="mt-[13px] flex gap-[8px] lg:mt-[calc(14*var(--u))]">
                <span className="flex-1 rounded-[8px] bg-[#17181C] py-[8px] text-center text-[12px] font-semibold text-white lg:text-[calc(12.5*var(--u))]">
                  Accept
                </span>
                <span className="flex-1 rounded-[8px] bg-[#F4F2EE] py-[8px] text-center text-[12px] font-semibold text-[#55575E] lg:text-[calc(12.5*var(--u))]">
                  Decline
                </span>
              </div>
            </div>
          </div>
          <div className={captionClass}>
            Workflows to accelerate
            <br />
            collaborations
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
