const WIDTHS = [96, 256, 384, 640, 828, 1080, 1200, 1920, 2048] as const

export const asset = (file: string, width = 1200) =>
  `https://naano.com/_next/image?url=%2Flp%2F${file}&w=${width}&q=75`

export const assetSrcSet = (file: string, max = 1920) =>
  WIDTHS.filter((w) => w <= max)
    .map((w) => `${asset(file, w)} ${w}w`)
    .join(', ')

export const CASE_STUDY_VIDEO =
  'https://api.naano.xyz/storage/v1/object/public/marketing-assets/case-studies/blogseo-vincent-josse.mp4'

export const brandLogos = [
  { name: 'lemlist', file: 'logo-lemlist.png' },
  { name: 'folk', file: 'logo-folk.png' },
  { name: 'Leadbay', file: 'logo-leadbay.png' },
  { name: 'Ringover', file: 'logo-ringover.png' },
  { name: 'Attio', file: 'logo-attio.jpg' },
  { name: 'La Growth Machine', file: 'logo-lagrowthmachine.png' },
  { name: 'gojiberry', file: 'logo-gojiberry.png' },
  { name: 'ChatSEO', file: 'logo-chatseo.png' },
  { name: 'Abyssale', file: 'logo-abyssale.png' },
]
