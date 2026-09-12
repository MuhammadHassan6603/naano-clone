import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from './Icons'
import { ease } from '../lib/motion'

export type FaqItem = { q: string; a: string }

type AccordionProps = {
  items: FaqItem[]
  openColor?: string
  firstBorder?: string
  className?: string
}

export function Accordion({
  items,
  openColor = '#111318',
  firstBorder = '#ECEAE6',
  className = '',
}: AccordionProps) {
  const [open, setOpen] = useState(0)

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isOpen = open === index
        return (
          <div
            key={item.q}
            className="border-t"
            style={{ borderTopColor: index === 0 ? firstBorder : '#ECEAE6' }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : index)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer touch-manipulation items-center justify-between gap-[18px] rounded-[14px] py-[22px] text-left transition-[background-color,padding] duration-[240ms] hover:bg-[#F3F9FC] hover:px-[14px] lg:gap-[calc(24*var(--u))] lg:rounded-[calc(14*var(--u))] lg:py-[calc(30*var(--u))] lg:hover:px-[calc(14*var(--u))]"
            >
              <span className="text-[17px] leading-[1.35] font-medium tracking-[-0.015em] text-[#17181C] lg:text-[calc(20*var(--u))]">
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0, color: isOpen ? openColor : '#9B9DA3' }}
                transition={{ duration: 0.3, ease }}
                className="inline-flex size-[24px] shrink-0 items-center justify-center lg:size-[calc(24*var(--u))]"
              >
                <ChevronDown width="18" height="18" strokeWidth={1.8} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.36, ease }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[680px] pb-[28px] text-[15.5px] leading-[1.65] text-[#6B6D74] lg:max-w-[calc(680*var(--u))] lg:pr-[calc(60*var(--u))] lg:pb-[calc(32*var(--u))] lg:text-[calc(16.5*var(--u))]">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
      <div className="border-t border-[#ECEAE6]" />
    </div>
  )
}
