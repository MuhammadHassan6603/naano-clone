import { motion } from 'motion/react'
import { Reveal } from '../components/Reveal'
import { asset, assetSrcSet } from '../lib/assets'
import { ease, fadeUp, scaleIn, stagger, viewport } from '../lib/motion'

const avatars = [
  { file: 'avatar-a.png', left: 25.1, top: 33.4, rotate: -2.63 },
  { file: 'avatar-d.png', left: 87.1, top: 20.3, rotate: -0.8 },
  { file: 'avatar-g.png', left: 148, top: 12, rotate: 0.94 },
  { file: 'avatar-b.png', left: 208.2, top: 17.9, rotate: 2.38 },
  { file: 'avatar-e.png', left: 268.7, top: 30.1, rotate: 3.52 },
]

const flags = [
  { name: 'France', rotate: -3.81, paths: [['#1a47b8', 'M0 0h10v20H0z'], ['#fff', 'M10 0h10v20H10z'], ['#f1333f', 'M20 0h10v20H20z']] },
  { name: 'United States', rotate: 5.9, stripes: true },
  { name: 'Germany', rotate: -2.97, paths: [['#111', 'M0 0h30v6.67H0z'], ['#d00', 'M0 6.67h30v6.67H0z'], ['#ffce00', 'M0 13.34h30V20H0z']] },
  { name: 'United Kingdom', rotate: 4.25, union: true },
  { name: 'Spain', rotate: -2.04, paths: [['#aa151b', 'M0 0h30v20H0z'], ['#f1bf00', 'M0 5h30v10H0z']] },
  { name: 'Canada', rotate: 2.82, paths: [['#d80621', 'M0 0h7v20H0zm23 0h7v20h-7z'], ['#fff', 'M7 0h16v20H7z'], ['#d80621', 'm15 3 1.2 3 2.4-1.1-.8 3 2 .8-3.1 2.4.6 3.1-2.3-1.4-2.3 1.4.6-3.1-3.1-2.4 2-.8-.8-3 2.4 1.1z']] },
  { name: 'Netherlands', rotate: 5, paths: [['#ae1c28', 'M0 0h30v6.67H0z'], ['#fff', 'M0 6.67h30v6.67H0z'], ['#21468b', 'M0 13.34h30V20H0z']] },
]

const buyers = ['Founders', 'Sales leaders', 'GTM teams']

function Flag({ flag }: { flag: (typeof flags)[number] }) {
  return (
    <svg viewBox="0 0 30 20" role="img" aria-label={flag.name} className="w-[30px] lg:w-[calc(30*var(--u))]">
      {flag.stripes && (
        <>
          <path fill="#fff" d="M0 0h30v20H0z" />
          {[0, 3, 6, 9, 12, 15, 18].map((y) => (
            <path key={y} fill="#b22234" d={`M0 ${y}h30v1.55H0z`} />
          ))}
          <path fill="#3c3b6e" d="M0 0h13v10.8H0z" />
          <g fill="#fff">
            {[2, 5, 8, 11].map((cx) =>
              [2, 5, 8].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r=".65" />),
            )}
          </g>
        </>
      )}
      {flag.union && (
        <>
          <path fill="#012169" d="M0 0h30v20H0z" />
          <path stroke="#fff" strokeWidth="5" d="m0 0 30 20M30 0 0 20" />
          <path stroke="#c8102e" strokeWidth="2" d="m0 0 30 20M30 0 0 20" />
          <path fill="#fff" d="M12 0h6v20h-6zM0 7h30v6H0z" />
          <path fill="#c8102e" d="M13.5 0h3v20h-3zM0 8.5h30v3H0z" />
        </>
      )}
      {flag.paths?.map(([fill, d]) => <path key={d} fill={fill} d={d} />)}
    </svg>
  )
}

function SignalCard({ children, title, copy, delay }: {
  children: React.ReactNode
  title: string
  copy: string
  delay: number
}) {
  return (
    <motion.article
      variants={scaleIn}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="relative flex min-h-[210px] flex-col overflow-hidden rounded-[22px] border border-[rgba(173,205,222,0.42)] bg-white/82 p-6 shadow-[0_26px_64px_-48px_rgba(43,84,106,0.42),inset_0_1px_0_#fff] lg:min-h-[calc(276*var(--u))] lg:rounded-[calc(26*var(--u))] lg:p-[calc(26*var(--u))_calc(28*var(--u))_calc(28*var(--u))]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-29px] bottom-[-42px] top-[62%] bg-cover bg-bottom bg-no-repeat opacity-82 [filter:saturate(0.72)_brightness(1.1)_contrast(0.94)] lg:top-[calc(173.7*var(--u))]"
        style={{ backgroundImage: `url(${asset('cloud-layer-bottom-v1.png', 640)})` }}
      />
      <div className="relative z-2 flex flex-1 items-start justify-center">{children}</div>
      <div className="relative z-3 grid gap-1.5 lg:gap-[calc(6*var(--u))]">
        <strong className="text-[1.0625rem] font-bold tracking-[-0.025em] text-[#17181C] lg:text-[calc(19*var(--u))]">
          {title}
        </strong>
        <span className="text-[0.8125rem] leading-[1.45] text-[#69717A] lg:text-[calc(13.5*var(--u))] lg:leading-[calc(19.575*var(--u))]">
          {copy}
        </span>
      </div>
    </motion.article>
  )
}

export function Marketplace() {
  return (
    <section
      id="marketplace"
      className="relative overflow-hidden px-5 py-16 sm:px-8 lg:px-[calc(72*var(--u))] lg:pt-[calc(115.2*var(--u))] lg:pb-[calc(144*var(--u))]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 60%, rgba(208,237,251,0.35), rgba(0,0,0,0) 44%), linear-gradient(#FCFCFB 0%, #F8FCFE 62%, #FFFFFF 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-[1440px] lg:max-w-[calc(1440*var(--u))]">
        <motion.header
          variants={stagger(0.09)}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mx-auto max-w-[880px] text-center lg:max-w-[calc(880*var(--u))]"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex min-h-[32px] items-center gap-[7px] rounded-full border border-[rgba(17,19,24,0.08)] bg-white/68 px-3 py-1.5 text-[0.75rem] font-[650] tracking-[0.02em] text-[#555B63] shadow-[0_8px_30px_rgba(68,111,133,0.07)] lg:min-h-[calc(36*var(--u))] lg:gap-[calc(9*var(--u))] lg:px-[calc(14*var(--u))] lg:py-[calc(7*var(--u))] lg:text-[calc(13*var(--u))] lg:tracking-[calc(0.26*var(--u))]"
          >
            <span className="size-[7px] rounded-full bg-[#76BADD] shadow-[0_0_0_4px_rgba(118,186,221,0.13)] lg:size-[calc(8*var(--u))]" />
            The Naano creator marketplace
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="mx-auto mt-5 max-w-[840px] text-[2.25rem] lg:max-w-[calc(840*var(--u))] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-[#111318] sm:text-[3rem] lg:mt-[calc(25*var(--u))] lg:text-[calc(74.88*var(--u))] lg:leading-[calc(74.13*var(--u))] lg:tracking-[calc(-3.89*var(--u))]"
          >
            Work with all the best creators.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-[650px] text-[1.0625rem] lg:max-w-[calc(650*var(--u))] leading-[1.52] text-[#525861] lg:mt-[calc(18*var(--u))] lg:text-[calc(20.88*var(--u))] lg:leading-[calc(31.74*var(--u))]"
          >
            Find the right B2B voices, compare their audience fit, and book every collaboration from
            one place.
          </motion.p>
        </motion.header>

        <Reveal
          variants={scaleIn}
          className="relative mt-10 overflow-hidden rounded-[24px] border border-[rgba(139,189,215,0.32)] bg-[linear-gradient(#DFF3FC_0%,#EDF9FE_72%,#FFFFFF_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_42px_90px_-48px_rgba(69,119,145,0.38)] sm:p-8 lg:mx-[calc(30*var(--u))] lg:mt-[calc(86.4*var(--u))] lg:rounded-[calc(43.2*var(--u))] lg:p-[calc(74.88*var(--u))_calc(63.36*var(--u))_calc(83.52*var(--u))]"
        >
          <img
            src={asset('marketplace-atmosphere-v1.png', 1920)}
            srcSet={assetSrcSet('marketplace-atmosphere-v1.png')}
            sizes="100vw"
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 -z-30 size-full object-cover opacity-72"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.92),rgba(0,0,0,0)_39%),linear-gradient(rgba(233,248,255,0.1),rgba(255,255,255,0.22))]"
          />

          <div className="relative z-2 overflow-hidden rounded-[14px] border border-[rgba(17,19,24,0.12)] bg-white shadow-[inset_0_2px_0_rgba(255,255,255,0.9),0_30px_75px_-32px_rgba(25,58,76,0.46),0_9px_26px_rgba(67,103,123,0.12)] [transform:perspective(1400px)_rotateX(0.7deg)] lg:rounded-[calc(25*var(--u))]">
            <div
              aria-hidden
              className="grid grid-cols-[1fr_auto_1fr] items-center bg-[rgba(250,252,253,0.96)] px-3 py-2 lg:h-[calc(53*var(--u))] lg:px-[calc(23*var(--u))] lg:py-0"
            >
              <div className="flex gap-[5px]">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="size-[7px] rounded-full border border-[rgba(17,19,24,0.08)] bg-[#D8DEE3] lg:size-[calc(8*var(--u))]"
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-[5px] rounded-[7px] border border-[#E6EAED] bg-white px-2.5 py-1 text-[0.625rem] font-[550] text-[#76808A] lg:w-[calc(420*var(--u))] lg:gap-[calc(7*var(--u))] lg:rounded-[calc(9*var(--u))] lg:px-[calc(14*var(--u))] lg:py-[calc(7*var(--u))] lg:text-[calc(12*var(--u))]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                naano.co/marketplace
              </div>
              <span />
            </div>
            <div className="relative overflow-hidden bg-[#F5F7FA]">
              <img
                src={asset('marketplace-screenshot-clean-v2.png', 1920)}
                srcSet={assetSrcSet('marketplace-screenshot-clean-v2.png')}
                sizes="(max-width: 700px) 100vw, 1100px"
                alt="Naano marketplace showing a curated selection of B2B creators"
                loading="lazy"
                decoding="async"
                width={1664}
                height={945}
                className="block w-full scale-[1.002] object-cover"
              />
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[15%] bottom-[3%] -z-10 h-[78px] scale-x-86 lg:h-[calc(78*var(--u))] rounded-[50%] bg-[rgba(47,88,110,0.22)] blur-[28px]"
          />
        </Reveal>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mx-auto mt-5 grid max-w-[1280px] gap-4 md:grid-cols-3 lg:max-w-[calc(1280*var(--u))] lg:mt-[calc(28*var(--u))] lg:gap-[calc(20*var(--u))]"
        >
          <SignalCard
            title="3,000+ vetted creators"
            copy="Specialist B2B voices, ready to collaborate."
            delay={0}
          >
            <div aria-hidden className="relative h-[120px] w-full max-w-[355px] lg:h-[calc(136*var(--u))] lg:max-w-[calc(355*var(--u))]">
              {avatars.map((avatar, index) => (
                <motion.span
                  key={avatar.file}
                  initial={{ opacity: 0, y: 14, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={viewport}
                  transition={{ delay: 0.12 + index * 0.06, duration: 0.5, ease }}
                  className="absolute grid size-[56px] place-items-center rounded-full bg-white/94 p-1 shadow-[0_12px_28px_rgba(53,89,108,0.16),0_0_0_1px_rgba(127,180,205,0.18)] lg:size-[calc(62*var(--u))]"
                  style={{
                    left: `${avatar.left / 3.55}%`,
                    top: `${avatar.top / 1.36}%`,
                    rotate: `${avatar.rotate}deg`,
                  }}
                >
                  <img
                    src={asset(avatar.file, 96)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full rounded-full object-cover"
                  />
                </motion.span>
              ))}
            </div>
          </SignalCard>

          <SignalCard
            title="Across 100 countries"
            copy="Local expertise with genuinely global reach."
            delay={0.08}
          >
            <div
              aria-hidden
              className="mx-auto grid grid-cols-4 items-center gap-x-2.5 gap-y-3 px-4 py-3 lg:gap-x-[calc(10*var(--u))] lg:gap-y-[calc(12*var(--u))] lg:px-[calc(18*var(--u))] lg:py-[calc(12*var(--u))]"
            >
              {flags.map((flag, index) => (
                <motion.span
                  key={flag.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={viewport}
                  transition={{ delay: 0.12 + index * 0.05, duration: 0.45, ease }}
                  className="grid place-items-center overflow-hidden rounded-[7px] border border-[rgba(150,190,211,0.48)] bg-white/96 p-[3px] shadow-[0_8px_22px_rgba(52,91,111,0.1)] lg:rounded-[calc(8*var(--u))]"
                  style={{ rotate: `${flag.rotate}deg` }}
                >
                  <Flag flag={flag} />
                </motion.span>
              ))}
            </div>
          </SignalCard>

          <SignalCard
            title="Matched to your buyers"
            copy="Audience fit comes before follower count."
            delay={0.16}
          >
            <div
              aria-hidden
              className="relative grid w-full max-w-[355px] grid-cols-[96px_86px_110px] items-center justify-center gap-1 lg:max-w-[calc(355*var(--u))] lg:grid-cols-[calc(96*var(--u))_calc(86*var(--u))_calc(110*var(--u))]"
            >
              <div className="grid justify-items-center gap-[7px] text-center text-[9px] leading-tight font-bold text-[#66737C] lg:gap-[calc(7*var(--u))] lg:text-[calc(9*var(--u))]">
                <span className="grid size-[50px] place-items-center overflow-hidden rounded-full bg-white p-1 shadow-[0_10px_24px_rgba(53,89,108,0.16)] lg:size-[calc(58*var(--u))]">
                  <img
                    src={asset('avatar-f.png', 96)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full rounded-full object-cover"
                  />
                </span>
                AI &amp; SaaS creator
              </div>

              <svg viewBox="0 0 96 52" className="w-full" fill="none" aria-hidden>
                <motion.path
                  d="M3 37 C27 4 68 4 93 36"
                  stroke="#9CCBDD"
                  strokeWidth="2"
                  strokeDasharray="5 6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={viewport}
                  transition={{ duration: 0.9, ease, delay: 0.2 }}
                />
                <circle cx="48" cy="13" r="5" fill="#70B7D7" />
              </svg>

              <div className="grid gap-[5px] lg:gap-[calc(5*var(--u))]">
                {buyers.map((buyer) => (
                  <span
                    key={buyer}
                    className="rounded-full border border-[rgba(154,194,213,0.36)] bg-white/90 px-2 py-[5px] text-center text-[9px] font-[750] text-[#56666F] lg:px-[calc(8*var(--u))] lg:py-[calc(5*var(--u))] lg:text-[calc(9*var(--u))] shadow-[0_6px_16px_rgba(55,91,110,0.08)]"
                  >
                    {buyer}
                  </span>
                ))}
              </div>

              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={viewport}
                transition={{ delay: 0.7, duration: 0.45, ease }}
                className="absolute top-[9.4%] left-[41.7%] grid size-[48px] place-items-center rounded-full border-2 border-white bg-[#E9F7FD] text-[13px] font-extrabold text-[#315B7C] shadow-[0_14px_31px_rgba(48,87,108,0.17)] lg:size-[calc(54*var(--u))] lg:text-[calc(15*var(--u))]"
              >
                96%
              </motion.span>
            </div>
          </SignalCard>
        </motion.div>
      </div>
    </section>
  )
}
