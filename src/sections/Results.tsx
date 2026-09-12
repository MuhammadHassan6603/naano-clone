import { motion } from 'motion/react'
import { asset, assetSrcSet } from '../lib/assets'
import { ease, fadeUp, scaleIn, stagger, viewport } from '../lib/motion'

const metrics = [
  { value: '5M+', label: 'Impressions generated' },
  { value: '30K+', label: 'Leads generated' },
  { value: '2,000+', label: 'Creators on Naano' },
  { value: '5K+', label: 'Posts published' },
]

const posts = [
  {
    name: 'Thomas Higadère',
    avatar: 'avatar-c.png',
    meta: 'Creator · B2B & AI · 34K followers',
    text: 'How AI changed our prospecting workflow for wealth managers and private bankers.',
    image: 'photo-calendar.png',
    alt: 'Calendar packed with meetings',
    stats: ['42.8K', '312', '18'],
    brand: 'lemlist',
    brandFile: 'logo-lemlist.png',
    brandHeight: 20,
    href: 'https://fr.linkedin.com/posts/thomas-higadere_cgp-banquiers-priv%C3%A9s-g%C3%A9rants-de-fonds-activity-7452932902885015553-UMO7',
  },
  {
    name: 'Robin Tempe',
    avatar: 'avatar-e.png',
    meta: 'Creator · Sales & AI · 12K followers',
    text: 'I run my entire prospecting workflow through an AI. Here is how.',
    image: 'photo-claude-mcp-leadbay.png',
    alt: 'Claude Code + MCP Leadbay',
    stats: ['9K', '100', '50'],
    brand: 'Leadbay',
    brandFile: 'logo-leadbay.png',
    brandHeight: 20,
    href: 'https://www.linkedin.com/posts/robin-tempe_je-g%C3%A8re-toute-ma-prospection-en-discutant-share-7479799225610924032-ML4u',
  },
  {
    name: 'Eric Djavid',
    avatar: 'avatar-b.png',
    meta: 'Sales Leader · B2B · 40K followers',
    text: 'Most sales teams spend 80% of their time on the wrong leads. Here is how I changed that.',
    image: 'photo-leadbay-app.png',
    alt: 'Leadbay app on screen',
    stats: ['20K', '350', '80'],
    brand: 'Leadbay',
    brandFile: 'logo-leadbay.png',
    brandHeight: 20,
    href: 'https://www.linkedin.com/posts/eric-djavid-2154b991_la-plupart-des-%C3%A9quipes-sales-passent-80-share-7478351684121997312-MtzH',
  },
  {
    name: 'Marina Panova',
    avatar: 'avatar-h.png',
    meta: 'Content Creator · B2B · 34K followers',
    text: 'How I build my 30-day LinkedIn content system, the exact playbook.',
    image: 'photo-marina-laptop.png',
    alt: 'Marina working on laptop',
    stats: ['100K', '1,600', '320'],
    brand: 'Abyssale',
    brandFile: 'logo-abyssale.png',
    brandHeight: 16,
    href: 'https://www.linkedin.com/posts/marina-panova_how-i-build-my-30-day-linkedin-content-system-activity-7442495515428126721-n28g',
  },
]

const statIcons = [
  <>
    <path d="M2 12 S5 5 12 5 s10 7 10 7 -3 7 -10 7 -10 -7 -10 -7Z" />
    <circle cx="12" cy="12" r="2.6" />
  </>,
  <path d="M5 3 L19 11 L12.5 12.5 L16 20 L13 21 L9.5 13.5 L5 17 Z" />,
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20 c0 -3.4 2.7 -5.8 6 -5.8 s6 2.4 6 5.8" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M16 14 c2.6 0.2 5 2.2 5 5.2" />
  </>,
]

const statLabels = ['Impressions', 'Clicks', 'Leads']

export function Results() {
  return (
    <section
      id="results"
      className="bg-[linear-gradient(180deg,rgba(243,248,255,0.72)_0%,#FCFCFB_48%,rgba(243,248,255,0.52)_100%)] px-5 py-16 sm:px-8 lg:px-[84px] lg:pt-[118px] lg:pb-[72px]"
    >
      <motion.div
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto w-full max-w-[1272px]"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-[10px]">
          <span className="size-[9px] rounded-full bg-[#315B7C]" />
          <span className="text-[12px] font-bold tracking-[0.22em] text-[#315B7C] lg:text-[14px]">
            THE RESULTS
          </span>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="mx-auto mt-[24px] max-w-[940px] text-center text-[2.25rem] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-[#17181C] sm:text-[3rem] lg:text-[52px]"
        >
          Proven across thousands of campaigns.
        </motion.h2>

        <motion.div
          variants={scaleIn}
          className="relative z-2 mt-8 grid items-center overflow-hidden rounded-[34px] bg-[linear-gradient(rgba(239,249,254,0.5),rgba(255,255,255,0.18))] px-[22px] py-[28px] lg:mx-[46px] lg:mt-[42px] lg:min-h-[310px] lg:py-[40px]"
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
          <div className="grid grid-cols-2 gap-[16px] md:grid-cols-4">
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
                  boxShadow:
                    '0 28px 58px -38px rgba(46,86,108,0.5), inset 0 1px 0 #fff',
                  transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
                }}
                className="rounded-[22px] border border-white/90 bg-white/64 px-[14px] pt-[26px] pb-[24px] text-center shadow-[0_22px_48px_-38px_rgba(46,86,108,0.42),inset_0_1px_0_#fff]"
              >
                <div className="text-[2rem] leading-none font-[660] tracking-[-0.05em] text-[#17181C] lg:text-[54px] lg:leading-[54px]">
                  {metric.value}
                </div>
                <span className="mt-[11px] block text-[13.5px] leading-[18.2px] text-[#697B86]">
                  {metric.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={stagger(0.08)}
          className="relative z-2 mt-10 grid gap-[18px] sm:grid-cols-2 lg:mt-[50px] lg:grid-cols-4 lg:px-[6px] lg:pt-[10px] lg:pb-[28px]"
        >
          {posts.map((post) => (
            <motion.article
              key={post.name}
              variants={scaleIn}
              whileHover={{
                y: -6,
                boxShadow: '0 40px 80px -44px rgba(44,83,106,0.5), inset 0 1px 0 #fff',
                transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
              }}
              className="group flex flex-col rounded-[26px] border border-[rgba(170,204,221,0.5)] bg-[linear-gradient(rgba(237,248,253,0.92)_0,rgba(255,255,255,0.98)_160px,#fff_100%)] shadow-[0_28px_66px_-46px_rgba(44,83,106,0.42),inset_0_1px_0_#fff]"
            >
              <div className="flex items-center gap-[12px] px-[22px] pt-[20px]">
                <span
                  className="size-[44px] shrink-0 rounded-full bg-line bg-cover bg-center"
                  style={{ backgroundImage: `url(${asset(post.avatar, 96)})` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-[6px]">
                    <span className="truncate text-[15.5px] font-bold text-[#17181C]">
                      {post.name}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0" aria-hidden>
                      <rect width="24" height="24" rx="4" fill="#0A66C2" />
                      <path
                        fill="#FFFFFF"
                        d="M7.2 9.6H4.8V19h2.4V9.6ZM6 5.2a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8ZM19.2 19h-2.4v-4.9c0-1.2-.5-1.9-1.5-1.9-.8 0-1.3.5-1.5 1.1-.1.2-.1.5-.1.8V19H11.3s.03-8.6 0-9.4h2.4v1.3c.3-.5.9-1.2 2.2-1.2 1.6 0 2.9 1 2.9 3.3V19Z"
                      />
                    </svg>
                  </div>
                  <div className="mt-[1px] text-[13px] text-[#8B8D94]">{post.meta}</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#B4B6BC" aria-hidden>
                  <circle cx="5" cy="12" r="1.6" />
                  <circle cx="12" cy="12" r="1.6" />
                  <circle cx="19" cy="12" r="1.6" />
                </svg>
              </div>

              <p className="mx-[22px] mt-[16px] text-[16.5px] leading-[1.4] font-semibold tracking-[-0.01em] text-[#17181C] lg:min-h-[92px]">
                {post.text}
              </p>

              <div className="relative mx-[22px] mt-[16px] mb-[18px] h-[200px] overflow-hidden rounded-[14px] bg-[#F2F1ED]">
                <img
                  src={asset(post.image, 828)}
                  srcSet={assetSrcSet(post.image, 1080)}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  alt={post.alt}
                  loading="lazy"
                  decoding="async"
                  className="block size-full object-cover object-top transition-[transform,filter] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025] group-hover:contrast-[1.02] group-hover:saturate-[0.92]"
                />
              </div>

              <div className="mt-auto pt-[16px]">
                <div className="grid grid-cols-3 gap-[10px] px-[22px] pt-[6px] pb-[2px]">
                  {post.stats.map((stat, index) => (
                    <div key={statLabels[index]} className="flex flex-col gap-[2px]">
                      <div className="flex items-center gap-[7px]">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9B9DA3"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          {statIcons[index]}
                        </svg>
                        <span className="text-[16.5px] font-bold text-[#17181C]">{stat}</span>
                      </div>
                      <span className="pl-[23px] text-[12.5px] text-[#9B9DA3]">
                        {statLabels[index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-[4px] flex items-center justify-between border-t border-[#F1EFEB] px-[22px] py-[16px]">
                <div className="flex min-w-0 shrink items-center gap-[8px] overflow-hidden">
                  <span className="shrink-0 text-[13.5px] text-[#9B9DA3]">For</span>
                  <img
                    src={asset(post.brandFile, 256)}
                    alt={post.brand}
                    loading="lazy"
                    decoding="async"
                    style={{ height: `${post.brandHeight}px` }}
                    className="ml-[2px] block w-auto"
                  />
                </div>
                <motion.a
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 2 }}
                  className="text-accent inline-flex shrink-0 items-center gap-[6px] text-[13.5px] font-semibold whitespace-nowrap"
                >
                  View post
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M7 17 L17 7" />
                    <path d="M8 7 H17 V16" />
                  </svg>
                </motion.a>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-[44px] flex flex-col items-center">
          <motion.a
            href="#cta"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-[11px] rounded-[12px] bg-[#17181C] px-[28px] py-[16px] text-[16px] font-semibold text-white shadow-[0_12px_30px_rgba(23,24,28,0.18)]"
          >
            Get started
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="4" y1="12" x2="20" y2="12" />
              <polyline points="13 5 20 12 13 19" />
            </svg>
          </motion.a>
          <span className="mt-[16px] text-[15px] text-[#9B9DA3]">
            Start free. Pay per post when you're ready.
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}
