import { motion } from 'motion/react'
import type { Post } from '../lib/posts'
import { asset, assetSrcSet } from '../lib/assets'
import { scaleIn } from '../lib/motion'

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

export function PostCard({ post }: { post: Post }) {
  return (
    <motion.article
      variants={scaleIn}
      whileHover={{
        y: -6,
        boxShadow: '0 40px 80px -44px rgba(44,83,106,0.5), inset 0 1px 0 #fff',
        transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
      }}
      className="group flex flex-col rounded-[26px] lg:rounded-[calc(26*var(--u))] border border-[rgba(170,204,221,0.5)] bg-[linear-gradient(rgba(237,248,253,0.92)_0,rgba(255,255,255,0.98)_160px,#fff_100%)] shadow-[0_28px_66px_-46px_rgba(44,83,106,0.42),inset_0_1px_0_#fff]"
    >
      <div className="flex items-center gap-[12px] px-[22px] pt-[20px] lg:gap-[calc(12*var(--u))] lg:px-[calc(22*var(--u))] lg:pt-[calc(20*var(--u))]">
        <span
          className="size-[44px] shrink-0 rounded-full bg-line bg-cover bg-center lg:size-[calc(44*var(--u))]"
          style={{ backgroundImage: `url(${asset(post.avatar, 96)})` }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-[6px]">
            <span className="truncate text-[15.5px] font-bold text-[#17181C] lg:text-[calc(15.5*var(--u))]">{post.name}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0" aria-hidden>
              <rect width="24" height="24" rx="4" fill="#0A66C2" />
              <path
                fill="#FFFFFF"
                d="M7.2 9.6H4.8V19h2.4V9.6ZM6 5.2a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8ZM19.2 19h-2.4v-4.9c0-1.2-.5-1.9-1.5-1.9-.8 0-1.3.5-1.5 1.1-.1.2-.1.5-.1.8V19H11.3s.03-8.6 0-9.4h2.4v1.3c.3-.5.9-1.2 2.2-1.2 1.6 0 2.9 1 2.9 3.3V19Z"
              />
            </svg>
          </div>
          <div className="mt-[1px] text-[13px] text-[#8B8D94] lg:text-[calc(13*var(--u))]">{post.meta}</div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#B4B6BC" aria-hidden>
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </div>

      <p className="mx-[22px] mt-[16px] text-[16.5px] leading-[1.4] font-semibold tracking-[-0.01em] text-[#17181C] lg:mx-[calc(22*var(--u))] lg:mt-[calc(16*var(--u))] lg:min-h-[calc(92*var(--u))] lg:text-[calc(16.5*var(--u))]">
        {post.text}
      </p>

      <div className="relative mx-[22px] mt-[16px] mb-[18px] h-[200px] overflow-hidden rounded-[14px] bg-[#F2F1ED] lg:mx-[calc(22*var(--u))] lg:mt-[calc(16*var(--u))] lg:mb-[calc(18*var(--u))] lg:h-[calc(200*var(--u))] lg:rounded-[calc(14*var(--u))]">
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

      <div className="mt-auto pt-[16px] lg:pt-[calc(16*var(--u))]">
        <div className="grid grid-cols-3 gap-[10px] px-[22px] pt-[6px] pb-[2px] lg:px-[calc(22*var(--u))]">
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
                <span className="text-[16.5px] font-bold text-[#17181C] lg:text-[calc(16.5*var(--u))]">{stat}</span>
              </div>
              <span className="pl-[23px] text-[12.5px] text-[#9B9DA3] lg:text-[calc(12.5*var(--u))]">{statLabels[index]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-[4px] flex items-center justify-between border-t border-[#F1EFEB] px-[22px] py-[16px] lg:px-[calc(22*var(--u))] lg:py-[calc(16*var(--u))]">
        <div className="flex min-w-0 shrink items-center gap-[8px] overflow-hidden">
          <span className="shrink-0 text-[13.5px] text-[#9B9DA3] lg:text-[calc(13.5*var(--u))]">For</span>
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
          className="inline-flex shrink-0 items-center gap-[6px] text-[13.5px] font-semibold whitespace-nowrap text-[#2563EB] lg:text-[calc(13.5*var(--u))]"
        >
          View post
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 17 L17 7" />
            <path d="M8 7 H17 V16" />
          </svg>
        </motion.a>
      </div>
    </motion.article>
  )
}
