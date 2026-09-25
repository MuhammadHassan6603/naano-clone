import { initials } from '../lib/format'

const palette = [
  'bg-[#e6eefe] text-[#1d4ed8]',
  'bg-[#e4f5f1] text-[#0f6b5f]',
  'bg-[#fbeee0] text-[#8a4a0f]',
  'bg-[#f1e7f8] text-[#6b3a8f]',
  'bg-[#e8f3e2] text-[#3c6b1f]',
  'bg-[#fbe7ea] text-[#9b2c3d]',
]

const colourFor = (seed: string) => palette[[...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length]

const sizes = {
  md: 'size-12 text-base',
  lg: 'size-20 text-2xl',
  ring: 'size-[76px] text-[26px] ring-[3px] ring-accent shadow-[0_10px_24px_rgba(37,99,235,0.2)]',
}

export function Avatar({ name, seed, size = 'md' }: { name: string; seed: string; size?: keyof typeof sizes }) {
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full font-semibold ${sizes[size]} ${colourFor(seed)}`}>
      {initials(name)}
    </span>
  )
}
