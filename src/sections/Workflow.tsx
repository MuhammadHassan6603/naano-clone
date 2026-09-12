import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { asset } from '../lib/assets'
import { fadeUp, scaleIn, stagger, viewport } from '../lib/motion'

const Check = ({ size = 10, width = 3.2 }: { size?: number; width?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="5 12.5 10 17.5 19 7" />
  </svg>
)

const panel =
  'w-full max-w-[272px] lg:max-w-[calc(272*var(--u))] rounded-[16px] lg:rounded-[calc(16*var(--u))] border border-[rgba(203,224,238,0.72)] bg-white/90 p-[18px] lg:p-[calc(18*var(--u))] shadow-[0_20px_48px_-32px_rgba(56,96,128,0.32)] lg:shadow-[0_calc(20*var(--u))_calc(48*var(--u))_calc(-32*var(--u))_rgba(56,96,128,0.32)]'

function CreatorPicks() {
  const picks = [
    { name: 'Eric', fit: '92%', file: 'avatar-b.png' },
    { name: 'Robin', fit: '88%', file: 'avatar-e.png' },
    { name: 'Aya', fit: '84%', file: 'avatar-f.png' },
  ]
  return (
    <div className="flex w-full justify-center gap-[6px] lg:gap-[calc(6*var(--u))]">
      {picks.map((pick) => (
        <div key={pick.name} className="min-w-0 flex-1 rounded-[12px] lg:rounded-[calc(12*var(--u))] border border-line bg-white p-[6px] lg:p-[calc(6*var(--u))]">
          <img
            src={asset(pick.file, 96)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-[54px] lg:h-[calc(54*var(--u))] w-full rounded-[8px] lg:rounded-[calc(8*var(--u))] object-cover object-[center_20%]"
          />
          <div className="mt-[8px] lg:mt-[calc(8*var(--u))] text-[11px] lg:text-[calc(11*var(--u))] font-bold text-ink">{pick.name}</div>
          <div className="mt-[5px] lg:mt-[calc(5*var(--u))] flex justify-between text-[9px] lg:text-[calc(9*var(--u))] text-[#8390A2]">
            <span>Fit</span>
            <strong className="text-[#315B7C]">{pick.fit}</strong>
          </div>
        </div>
      ))}
    </div>
  )
}

function CampaignBrief() {
  const items = ['Objectives and key messages', 'Creator guidelines', 'Tracking links ready']
  return (
    <div className={panel}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] lg:text-[calc(12*var(--u))] font-bold text-[#17181C]">Campaign brief</span>
        <span className="rounded-full bg-[rgba(220,239,250,0.86)] px-[8px] lg:px-[calc(8*var(--u))] py-[4px] lg:py-[calc(4*var(--u))] text-[9.5px] lg:text-[calc(9.5*var(--u))] font-bold text-[#315B7C]">
          AI
        </span>
      </div>
      <div className="mt-[16px] lg:mt-[calc(16*var(--u))] grid gap-[10px] lg:gap-[calc(10*var(--u))]">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-[8px] lg:gap-[calc(8*var(--u))] text-[11.5px] lg:text-[calc(11.5*var(--u))] text-[#55575E]">
            <span className="inline-flex size-[17px] lg:size-[calc(17*var(--u))] shrink-0 items-center justify-center rounded-full bg-[rgba(220,239,250,0.86)] text-[#315B7C]">
              <Check />
            </span>
            {item}
          </div>
        ))}
      </div>
      <div className="mt-[17px] lg:mt-[calc(17*var(--u))] h-[8px] lg:h-[calc(8*var(--u))] overflow-hidden rounded-full bg-[#E8EFF5]">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '78%' }}
          viewport={viewport}
          transition={{ duration: 1, delay: 0.3 }}
          className="h-full bg-[#315B7C]"
        />
      </div>
    </div>
  )
}

function Collaborations() {
  const rows = [
    { name: 'Raphael', status: 'Draft ready', file: 'avatar-d.png' },
    { name: 'Thomas', status: 'Scheduled', file: 'avatar-c.png' },
    { name: 'Nada', status: 'Live', file: 'avatar-a.png' },
  ]
  return (
    <div className={panel}>
      {rows.map((row, index) => (
        <div
          key={row.name}
          className={`flex items-center gap-[10px] ${index === 0 ? 'pb-[11px] lg:pb-[calc(11*var(--u))]' : 'border-t border-[#F0EEEA] py-[11px] lg:py-[calc(11*var(--u))]'}`}
        >
          <img
            src={asset(row.file, 96)}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-[30px] lg:size-[calc(30*var(--u))] rounded-full object-cover"
          />
          <span className="flex-1 text-[11.5px] lg:text-[calc(11.5*var(--u))] font-bold text-[#17181C]">{row.name}</span>
          <span className="rounded-[6px] lg:rounded-[calc(6*var(--u))] bg-[rgba(220,239,250,0.72)] px-[7px] lg:px-[calc(7*var(--u))] py-[4px] lg:py-[calc(4*var(--u))] text-[9.5px] lg:text-[calc(9.5*var(--u))] font-bold text-[#315B7C]">
            {row.status}
          </span>
        </div>
      ))}
    </div>
  )
}

function Pipeline() {
  const bars = [32, 48, 39, 62, 54, 78, 92]
  return (
    <div className={panel}>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10.5px] lg:text-[calc(10.5*var(--u))] text-[#9B9DA3]">Attributed pipeline</div>
          <div className="mt-[4px] lg:mt-[calc(4*var(--u))] text-[30px] lg:text-[calc(30*var(--u))] font-extrabold tracking-[-0.035em] text-[#17181C]">€48.2K</div>
        </div>
        <span className="rounded-[6px] lg:rounded-[calc(6*var(--u))] bg-[rgba(220,239,250,0.72)] px-[7px] lg:px-[calc(7*var(--u))] py-[5px] lg:py-[calc(5*var(--u))] text-[10px] lg:text-[calc(10*var(--u))] font-bold text-[#315B7C]">
          +24%
        </span>
      </div>
      <div className="mt-[18px] lg:mt-[calc(18*var(--u))] flex h-[64px] lg:h-[calc(64*var(--u))] items-end gap-[6px] lg:gap-[calc(6*var(--u))]">
        {bars.map((height, index) => (
          <motion.span
            key={height}
            initial={{ height: 0 }}
            whileInView={{ height: `${height}%` }}
            viewport={viewport}
            transition={{ duration: 0.6, delay: 0.15 + index * 0.06 }}
            className={`flex-1 rounded-t-[4px] ${index > 4 ? 'bg-[#315B7C]' : 'bg-[#DCEFFA]'}`}
          />
        ))}
      </div>
      <div className="mt-[12px] lg:mt-[calc(12*var(--u))] flex justify-between border-t border-[#F0EEEA] pt-[11px] lg:pt-[calc(11*var(--u))] text-[10px] lg:text-[calc(10*var(--u))] text-[#8A8C92]">
        <span>124K views</span>
        <span>418 leads</span>
      </div>
    </div>
  )
}

function Payout() {
  return (
    <div className={panel}>
      <div className="flex items-center gap-[9px] lg:gap-[calc(9*var(--u))]">
        <span className="inline-flex size-[30px] lg:size-[calc(30*var(--u))] items-center justify-center rounded-full bg-[rgba(220,239,250,0.72)] text-[#315B7C]">
          <Check size={15} width={2.8} />
        </span>
        <div>
          <div className="text-[12px] lg:text-[calc(12*var(--u))] font-bold text-[#17181C]">Payment scheduled</div>
          <div className="mt-[2px] lg:mt-[calc(2*var(--u))] text-[10px] lg:text-[calc(10*var(--u))] text-[#9B9DA3]">Handled by Naano</div>
        </div>
      </div>
      <div className="mt-[18px] lg:mt-[calc(18*var(--u))] flex items-center justify-between rounded-[10px] lg:rounded-[calc(10*var(--u))] border border-[#F0EEEA] bg-page p-[14px] lg:p-[calc(14*var(--u))]">
        <span className="text-[11px] lg:text-[calc(11*var(--u))] text-[#8A8C92]">Creator payout</span>
        <strong className="text-[15px] lg:text-[calc(15*var(--u))] text-[#17181C]">€1,240</strong>
      </div>
      <div className="mt-[13px] lg:mt-[calc(13*var(--u))] flex gap-[6px] lg:gap-[calc(6*var(--u))] text-[9.5px] lg:text-[calc(9.5*var(--u))] text-[#8A8C92]">
        {['Contract', 'Invoice', 'Payout'].map((tag) => (
          <span key={tag} className="rounded-[6px] lg:rounded-[calc(6*var(--u))] bg-[#F4F2EE] px-[7px] lg:px-[calc(7*var(--u))] py-[5px] lg:py-[calc(5*var(--u))]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

const steps: { title: string; preview: ReactNode }[] = [
  { title: 'Find creators your buyers trust', preview: <CreatorPicks /> },
  { title: 'Build a campaign brief in minutes', preview: <CampaignBrief /> },
  { title: 'Manage every collaboration', preview: <Collaborations /> },
  { title: 'Track reach, clicks, and leads', preview: <Pipeline /> },
  { title: 'Pay creators without the admin', preview: <Payout /> },
]

export function Workflow() {
  return (
    <section
      id="workflow"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#F2FAFF_0%,#FFFFFF_27%,#FFFFFF_100%)] px-5 py-16 sm:px-8 lg:px-[calc(84*var(--u))] lg:pt-[calc(110*var(--u))] lg:pb-[calc(126*var(--u))]"
    >
      <div className="relative z-2 mx-auto w-full max-w-[1320px] lg:max-w-[calc(1320*var(--u))]">
        <motion.header
          variants={stagger(0.09)}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid items-end gap-6 lg:grid-cols-[calc(720*var(--u))_calc(420*var(--u))] lg:gap-[calc(60*var(--u))]"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-[10px] lg:gap-[calc(10*var(--u))] text-[11px] font-[750] tracking-[0.15em] text-[#60727C] uppercase lg:col-span-2 lg:text-[calc(12*var(--u))] lg:tracking-[calc(1.8*var(--u))]"
          >
            <span className="size-[8px] lg:size-[calc(8*var(--u))] rounded-full bg-[#92CBE5] shadow-[0_0_0_5px_rgba(146,203,229,0.16)] lg:shadow-[0_0_0_calc(5*var(--u))_rgba(146,203,229,0.16)]" />
            One platform, from brief to results
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-[2.125rem] leading-[1.03] font-semibold tracking-[-0.045em] text-balance text-ink sm:text-[2.75rem] lg:text-[calc(51.84*var(--u))] lg:leading-[calc(53.4*var(--u))]"
          >
            Run creator campaigns from one place.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="max-w-[400px] lg:max-w-[calc(400*var(--u))] text-[1rem] leading-[1.5] text-[#55575E] lg:mt-[calc(20*var(--u))] lg:text-[calc(19*var(--u))]"
          >
            Find the right voices, launch faster, and connect every post to measurable business
            results.
          </motion.p>
        </motion.header>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="relative mt-10 grid gap-6 sm:grid-cols-2 lg:mt-[calc(62*var(--u))] lg:min-h-[calc(350*var(--u))] lg:grid-cols-5 lg:gap-[calc(16*var(--u))] lg:pt-[calc(34*var(--u))] lg:pb-[calc(38*var(--u))]"
        >
          <img
            src={asset('journey-cloud-current-v1.png', 1920)}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute -top-[calc(42*var(--u))] -left-[calc(66*var(--u))] z-0 hidden h-[calc(486*var(--u))] w-full max-w-full opacity-36 lg:block"
          />
          <svg
            viewBox="0 0 1280 360"
            fill="none"
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-[calc(8*var(--u))] z-0 hidden h-full w-[calc(1336*var(--u))] max-w-none lg:block"
          >
            <path
              className="route-flow"
              d="M34 186 C172 132 280 230 410 182 S646 142 770 188 S1026 226 1246 174"
              stroke="rgba(80,157,194,0.72)"
              strokeWidth="2"
              strokeDasharray="8 11"
              strokeLinecap="round"
            />
          </svg>

          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              variants={scaleIn}
              transition={{ delay: index * 0.06 }}
              whileHover={{
                y: -6,
                boxShadow: '0 34px 66px -42px rgba(56,96,128,0.42)',
                transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
              }}
              className="relative z-2 flex flex-col rounded-[24px] lg:rounded-[calc(24*var(--u))] border border-[rgba(172,203,219,0.42)] bg-white/90 p-[18px] lg:p-[calc(18*var(--u))] pb-[22px] lg:pb-[calc(22*var(--u))] shadow-[0_22px_58px_-44px_rgba(56,96,128,0.38)] lg:shadow-[0_calc(22*var(--u))_calc(58*var(--u))_calc(-44*var(--u))_rgba(56,96,128,0.38)] backdrop-blur-[14px] lg:backdrop-blur-[calc(14*var(--u))]"
            >
              <span className="absolute -top-[14px] lg:-top-[calc(14*var(--u))] left-[18px] lg:left-[calc(18*var(--u))] grid h-[28px] lg:h-[calc(28*var(--u))] w-[36px] lg:w-[calc(36*var(--u))] place-items-center rounded-full border border-[rgba(143,187,209,0.4)] bg-[#F4FBFE] text-[10px] lg:text-[calc(10*var(--u))] font-extrabold tracking-[0.8px] lg:tracking-[calc(0.8*var(--u))] text-[#54778A]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div
                className="journey-breath flex min-h-[158px] lg:min-h-[calc(158*var(--u))] flex-1 items-center justify-center overflow-hidden rounded-[20px] lg:rounded-[calc(20*var(--u))] border border-[rgba(204,225,239,0.68)] bg-[linear-gradient(145deg,rgba(243,248,255,0.9),rgba(255,255,255,0.82))] px-[16px] lg:px-[calc(16*var(--u))] py-[18px] lg:py-[calc(18*var(--u))]"
                style={{ animationDelay: `${index * -0.9}s` }}
              >
                {step.preview}
              </div>
              <h3 className="mt-[18px] lg:mt-[calc(18*var(--u))] mx-[4px] lg:mx-[calc(4*var(--u))] text-[15px] leading-[1.3] font-[650] tracking-[-0.02em] text-ink lg:text-[calc(17*var(--u))]">
                {step.title}
              </h3>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
