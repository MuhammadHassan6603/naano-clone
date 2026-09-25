import { initials } from '../lib/format'

const palette = [
  'bg-[#dff3ef] text-[#0b5e57]',
  'bg-[#e6ecfb] text-[#2b4a9b]',
  'bg-[#fbeee0] text-[#8a4a0f]',
  'bg-[#f1e7f8] text-[#6b3a8f]',
  'bg-[#e8f3e2] text-[#3c6b1f]',
  'bg-[#fbe7ea] text-[#9b2c3d]',
]

const colourFor = (seed: string) => palette[[...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length]

export function Avatar({ name, seed, size = 'md' }: { name: string; seed: string; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'size-20 text-2xl' : 'size-12 text-base'
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full font-semibold ${box} ${colourFor(seed)}`}>
      {initials(name)}
    </span>
  )
}
