import { motion } from 'motion/react'
import { asset, assetSrcSet } from '../lib/assets'
import { ease, scaleIn, viewport } from '../lib/motion'

export type Metric = { value: string; label: string }

export function MetricsPanel({ metrics, className = '' }: { metrics: Metric[]; className?: string }) {
  return (
    <motion.div
      variants={scaleIn}
      className={`relative z-2 grid items-center overflow-hidden rounded-[34px] bg-[linear-gradient(rgba(239,249,254,0.5),rgba(255,255,255,0.18))] px-[22px] py-[28px] lg:min-h-[calc(310*var(--u))] lg:rounded-[calc(34*var(--u))] lg:py-[calc(40*var(--u))] ${className}`}
    >
      <img
        src={asset('results-metrics-clouds-v2.png', 1920)}
        srcSet={assetSrcSet('results-metrics-clouds-v2.png')}
        sizes="100vw"
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 -z-2 size-full object-cover opacity-92"
      />
      <div className="grid grid-cols-2 gap-[16px] md:grid-cols-4 lg:gap-[calc(16*var(--u))]">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={viewport}
            transition={{ delay: 0.1 + index * 0.08, duration: 0.55, ease }}
            whileHover={{
              y: -5,
              backgroundColor: 'rgba(255,255,255,0.82)',
              boxShadow: '0 28px 58px -38px rgba(46,86,108,0.5), inset 0 1px 0 #fff',
              transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
            }}
            className="rounded-[22px] border border-white/90 bg-white/64 px-[14px] pt-[26px] pb-[24px] text-center shadow-[0_22px_48px_-38px_rgba(46,86,108,0.42),inset_0_1px_0_#fff] lg:rounded-[calc(22*var(--u))] lg:px-[calc(14*var(--u))] lg:pt-[calc(26*var(--u))] lg:pb-[calc(24*var(--u))]"
          >
            <div className="text-[2rem] leading-none font-[660] tracking-[-0.05em] text-[#17181C] lg:text-[calc(54*var(--u))] lg:leading-[calc(54*var(--u))]">
              {metric.value}
            </div>
            <span className="mt-[11px] block text-[13.5px] leading-[18.2px] text-[#697B86] lg:mt-[calc(11*var(--u))] lg:text-[calc(13.5*var(--u))] lg:leading-[calc(18.2*var(--u))]">
              {metric.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
