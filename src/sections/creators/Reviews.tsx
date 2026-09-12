import { motion } from 'motion/react'
import { asset } from '../../lib/assets'
import { LinkedIn } from '../../components/Icons'
import { fadeUp, stagger, viewport } from '../../lib/motion'

const stats = [
  { value: '2,000+', label: 'Creators' },
  { value: '€500', label: 'Avg. per deal' },
  { value: '€1,500', label: 'Top deal' },
]

const reviews = [
  {
    text: 'Naano is the marketplace LinkedIn was missing. The founders truly listen and do everything they can to build something that brings real value to its users.',
    name: 'Raphael Alfero',
    meta: 'B2B creator · 18K followers',
    avatar: 'avatar-d.png',
  },
  {
    text: "At first I wasn't sure what to expect. But the whole experience was simple and smooth: clear opportunities, an easy platform, everything well guided. A real bridge between creators and brands.",
    name: 'Aya Dara',
    meta: 'Content creator · 9K followers',
    avatar: 'avatar-f.png',
  },
  {
    text: 'Excellent experience. The platform is simple and efficient, the team ultra-responsive, and results come fast. I recommend it whether you want to grow your name or create content.',
    name: 'Robin Tempe',
    meta: 'Sales creator · 14K followers',
    avatar: 'avatar-e.png',
  },
  {
    text: 'Great experience, I love the platform, it helps me every day. I already made money with it from day one.',
    name: 'Thomas Higadère',
    meta: 'B2B & AI creator · 34K followers',
    avatar: 'avatar-c.png',
  },
  {
    text: 'Naano lets me keep making useful content while monetizing my LinkedIn community. We never give up!',
    name: 'Eric Djavid',
    meta: 'LinkedIn creator · 40K followers',
    avatar: 'avatar-b.png',
  },
  {
    text: "A young team that's ambitious, efficient and driven. Super proactive and always listening. I'd tell every creator to join Naano!",
    name: 'Nada Ait Ouchene',
    meta: 'Marketing creator · 11K followers',
    avatar: 'avatar-a.png',
  },
]

const Star = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#F5A623" aria-hidden>
    <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.6z" />
  </svg>
)

export function Reviews() {
  return (
    <section
      id="reviews"
      className="px-5 py-16 sm:px-8 lg:px-[calc(84*var(--u))] lg:pt-[calc(80*var(--u))] lg:pb-[calc(100*var(--u))]"
    >
      <motion.div
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <motion.div
          variants={fadeUp}
          className="text-center text-[12px] font-bold tracking-[0.22em] text-[#2563EB] lg:text-[calc(14*var(--u))]"
        >
          FROM THE COMMUNITY
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="mt-5 text-center text-[2.25rem] leading-[1.06] font-semibold tracking-[-0.03em] text-[#17181C] sm:text-[3rem] lg:mt-[calc(20*var(--u))] lg:text-[calc(52*var(--u))]"
        >
          What creators say<span className="text-[#2563EB]">.</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mt-4 text-center text-[1rem] text-[#55575E] lg:mt-[calc(16*var(--u))] lg:text-[calc(19*var(--u))]"
        >
          2,000+ creators already getting paid on Naano.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-9 flex flex-wrap items-center justify-center lg:mt-[calc(44*var(--u))]"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex items-center">
              {index > 0 && (
                <span className="h-[44px] w-px bg-[#E4E1DC] lg:h-[calc(44*var(--u))]" />
              )}
              <div className="px-[22px] text-center lg:px-[calc(30*var(--u))]">
                <div className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-[#17181C] lg:text-[calc(40*var(--u))]">
                  {stat.value}
                </div>
                <div className="mt-2.5 text-[13px] text-[#8B8D94] lg:mt-[calc(10*var(--u))] lg:text-[calc(14*var(--u))]">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mx-auto mt-10 max-w-[1160px] gap-[22px] sm:columns-2 lg:mt-[calc(60*var(--u))] lg:max-w-[calc(1160*var(--u))] lg:columns-3 lg:gap-[calc(22*var(--u))]"
        >
          {reviews.map((review) => (
            <div
              key={review.name}
              className="relative mb-[22px] inline-block w-full break-inside-avoid rounded-[20px] border border-[#EDEBE7] bg-white p-[24px] shadow-[0_1px_2px_rgba(23,24,28,0.05),0_12px_28px_-20px_rgba(23,24,28,0.28)] lg:mb-[calc(22*var(--u))] lg:rounded-[calc(20*var(--u))] lg:px-[calc(24*var(--u))] lg:py-[calc(26*var(--u))]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute top-[8px] right-[22px] font-serif text-[70px] leading-none text-[#2563EB] opacity-10"
              >
                ”
              </span>
              <div className="flex gap-[2px]">
                {[0, 1, 2, 3, 4].map((index) => (
                  <Star key={index} />
                ))}
              </div>
              <p className="mt-4 text-[15px] leading-[1.6] tracking-[-0.004em] text-[#2B2D33] lg:text-[calc(16*var(--u))]">
                {review.text}
              </p>
              <div className="my-[18px] h-px bg-[#F0EEEA] lg:mt-[calc(22*var(--u))] lg:mb-[calc(18*var(--u))]" />
              <div className="flex items-center gap-[12px]">
                <span className="relative inline-block shrink-0">
                  <span
                    style={{ backgroundImage: `url(${asset(review.avatar, 96)})` }}
                    className="block size-[44px] rounded-full bg-line bg-cover bg-center lg:size-[calc(44*var(--u))]"
                  />
                  <span className="absolute -right-[1px] -bottom-[1px] flex size-[17px] items-center justify-center rounded-[4px] border-2 border-white bg-[#0A66C2] text-white">
                    <LinkedIn width={9} height={9} />
                  </span>
                </span>
                <div>
                  <div className="text-[14.5px] font-bold text-[#17181C] lg:text-[calc(15*var(--u))]">
                    {review.name}
                  </div>
                  <div className="text-[12.5px] text-[#8B8D94] lg:text-[calc(13*var(--u))]">
                    {review.meta}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
