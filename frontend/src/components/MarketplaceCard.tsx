import { useRef } from 'react'
import { LinkedIn } from './Icons'
import { asset } from '../lib/assets'

const cardNoise =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.62'/%3E%3C/svg%3E\")"

const stats = [
  { label: 'Followers', divider: false, nested: false },
  { label: 'Est. impressions', divider: true, nested: false },
  { label: 'Cost / post', divider: false, nested: true },
]

export function MarketplaceCard() {
  const tilt = useRef<HTMLDivElement>(null)

  const move = (event: React.MouseEvent<HTMLDivElement>) => {
    const node = tilt.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    node.style.setProperty('--card-glare-x', `${x * 100}%`)
    node.style.setProperty('--card-glare-y', `${y * 100}%`)
    node.style.setProperty('--card-sheen-x', `${-36 + x * 72}%`)
    node.style.transform = `rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg) translate3d(0, 0, 0)`
  }

  const reset = () => {
    const node = tilt.current
    if (!node) return
    node.style.setProperty('--card-sheen-x', '-36%')
    node.style.transform = 'rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)'
  }

  return (
    <div className="group/physical-card relative isolate w-full max-w-[500px] [perspective:1600px]">
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-1 z-0 h-14 w-[42%] -rotate-[8deg] rounded-[50%] bg-[rgba(59,90,154,0.14)] opacity-70 blur-[24px] transition-[transform,opacity] duration-300 group-hover/physical-card:-translate-x-1 group-hover/physical-card:translate-y-1 group-hover/physical-card:-rotate-[11deg] group-hover/physical-card:opacity-90 motion-reduce:transition-none"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-1 bottom-10 z-0 h-14 w-[42%] rotate-[8deg] rounded-[50%] bg-[rgba(59,90,154,0.14)] opacity-70 blur-[24px] transition-[transform,opacity] duration-300 group-hover/physical-card:translate-x-1 group-hover/physical-card:translate-y-1 group-hover/physical-card:rotate-[11deg] group-hover/physical-card:opacity-90 motion-reduce:transition-none"
      />

      <div
        ref={tilt}
        onMouseMove={move}
        onMouseLeave={reset}
        className="group/tilt relative z-10 [transform-style:preserve-3d] will-change-[transform] motion-reduce:!transform-none"
        style={{
          '--card-glare-x': '50%',
          '--card-glare-y': '50%',
          '--card-sheen-x': '-36%',
          '--card-edge-opacity': '0.34',
          transform: 'rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)',
          transformOrigin: '50% 72%',
          transformStyle: 'preserve-3d',
          transition: 'transform 220ms cubic-bezier(0.22,1,0.36,1)',
        } as React.CSSProperties}
      >
        <section className="group/card relative w-full min-w-0 self-start pb-9">
          <div className="relative overflow-hidden rounded-[34px] border border-[#E4E5E7] bg-white/90 shadow-[0_20px_55px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:border-[#9FB9F7] group-hover/card:shadow-[0_30px_72px_rgba(37,62,117,0.18),0_8px_22px_rgba(49,91,194,0.09),inset_0_1px_0_rgba(255,255,255,1)] group-hover/card:duration-200 motion-reduce:transition-none sm:rounded-[42px]">
            <div className="relative aspect-[4/1] bg-[linear-gradient(135deg,#E4F1ED_0%,#E6EEFC_52%,#EEE9FC_100%)] px-5 py-4 sm:px-7 sm:py-5">
              <div
                aria-hidden
                className="absolute inset-0 grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(255,255,255,0.25),transparent_28%),radial-gradient(circle_at_88%_86%,rgba(137,174,255,0.42),transparent_36%),linear-gradient(135deg,#0C3EBE_0%,#1959EF_57%,#6691FF_100%)]"
              >
                <span className="absolute -top-20 -right-16 size-32 rounded-full border border-white/15 shadow-[0_0_0_20px_rgba(255,255,255,0.045),0_0_0_40px_rgba(255,255,255,0.025)]" />
                <span className="absolute -bottom-12 -left-12 size-20 rounded-full border border-white/15 shadow-[0_0_0_16px_rgba(255,255,255,0.035)]" />
                <img
                  src={asset('naano-logo-nav.png', 384)}
                  alt=""
                  width={160}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  className="relative z-10 mb-3 h-auto max-h-7 w-[min(32%,112px)] brightness-0 invert sm:mb-3.5 sm:max-h-8"
                />
              </div>

              <span className="absolute top-4 left-5 z-20 inline-flex size-11 items-center justify-center rounded-[15px] border border-white/75 bg-white/88 text-[#0A66C2] opacity-90 shadow-[0_6px_18px_rgba(15,23,42,0.10)] backdrop-blur-md sm:top-5 sm:left-7">
                <span
                  aria-hidden
                  className="inline-flex size-7 items-center justify-center rounded-[8px] bg-[#0A66C2] text-white shadow-[0_4px_10px_rgba(10,102,194,0.24)]"
                >
                  <LinkedIn width={16} height={16} />
                </span>
              </span>

              <div className="absolute bottom-0 left-1/2 z-30 -translate-x-1/2 translate-y-1/2">
                <div className="relative rounded-full ring-[3px] ring-[#2563EB] shadow-[0_10px_24px_rgba(37,99,235,0.20)]">
                  <div className="flex size-[78px] items-center justify-center rounded-full bg-[#F7F6F3] text-[28px] font-semibold text-[#787774]">
                    Y
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pt-[54px] pb-0 text-center sm:px-8 sm:pt-[58px]">
              <div className="flex min-w-0 justify-center px-8">
                <div className="relative max-w-full min-w-0">
                  <h2 className="truncate text-[24px] leading-tight font-bold tracking-[-0.035em] text-[#111827] sm:text-[28px]">
                    Your name
                  </h2>
                </div>
              </div>
              <p className="mx-auto mt-5 line-clamp-2 min-h-[48px] max-w-[390px] text-[14px] leading-6 text-[#5F6673] sm:text-[15px]">
                Your LinkedIn headline and topics will appear here.
              </p>
              <div className="mx-auto mt-4 flex max-w-[360px] items-center gap-3 pb-5 text-left">
                <span className="shrink-0 text-xs font-medium text-[#8A909B]">Data</span>
                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#E8EBF1]">
                  <span className="block h-full w-0 rounded-full bg-[linear-gradient(90deg,#2563EB,#7C8DF6)]" />
                </span>
                <span className="shrink-0 text-xs font-semibold text-[#6B7280]">Pending</span>
              </div>
            </div>

            <dl className="grid grid-cols-3 border-t border-[#E7E8EB] bg-[#FCFCFD]">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`flex min-w-0 flex-col items-center justify-center px-2 py-5 text-center sm:px-4 sm:py-6 ${
                    stat.divider ? 'border-x border-[#E7E8EB]' : ''
                  }`}
                >
                  <dt className="order-2 mt-1 text-[11px] leading-4 text-[#8A909B] sm:text-xs">
                    {stat.label}
                  </dt>
                  {stat.nested ? (
                    <dd className="order-1 min-w-0">
                      <span className="block truncate text-[20px] font-bold tracking-[-0.025em] text-[#111827] sm:text-[24px]">
                        —
                      </span>
                    </dd>
                  ) : (
                    <dd className="order-1 w-full truncate text-[20px] font-bold tracking-[-0.025em] text-[#111827] sm:text-[24px]">
                      —
                    </dd>
                  )}
                </div>
              ))}
            </dl>

            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[24] rounded-[inherit] bg-[length:170px_170px] opacity-[0.14] mix-blend-soft-light"
              style={{ backgroundImage: cardNoise }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[25] rounded-[inherit] opacity-0 mix-blend-screen transition-opacity duration-200 group-hover/tilt:opacity-[0.32] motion-reduce:transition-none"
              style={{
                background:
                  'radial-gradient(circle 180px at var(--card-glare-x) var(--card-glare-y), rgba(255,255,255,0.48) 0%, rgba(213,232,255,0.16) 28%, rgba(168,173,255,0.05) 48%, transparent 70%)',
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-[20%] z-[25] opacity-0 mix-blend-soft-light transition-opacity duration-200 group-hover/tilt:opacity-[0.38] motion-reduce:transition-none"
              style={{
                background:
                  'linear-gradient(112deg, transparent 24%, rgba(255,255,255,0.03) 34%, rgba(255,255,255,0.52) 47%, rgba(179,199,255,0.16) 52%, transparent 65%)',
                transform: 'translate3d(var(--card-sheen-x), 0, 0) rotate(-2deg)',
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[26] rounded-[inherit] p-px"
              style={{
                background:
                  'conic-gradient(from 215deg, rgba(255,255,255,0.96), rgba(132,174,255,var(--card-edge-opacity)), rgba(219,177,255,0.24), rgba(146,227,222,0.20), rgba(255,255,255,0.96))',
                WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[23] rounded-[inherit] opacity-[0.34] mix-blend-screen"
              style={{
                background:
                  'radial-gradient(circle at 0 0, rgba(255,255,255,0.9), transparent 12%),radial-gradient(circle at 100% 0, rgba(186,210,255,0.46), transparent 14%),radial-gradient(circle at 0 100%, rgba(195,237,231,0.34), transparent 15%),radial-gradient(circle at 100% 100%, rgba(217,194,255,0.38), transparent 15%)',
              }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
