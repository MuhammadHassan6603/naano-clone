const WIDTHS = [640, 1080, 1920] as const

export const asset = (file: string, width = 1200) =>
  `https://naano.com/_next/image?url=%2Flp%2F${file}&w=${width}&q=75`

export const assetSrcSet = (file: string) => WIDTHS.map((w) => `${asset(file, w)} ${w}w`).join(', ')

export const CLOUDS = 'hero-clouds-cotton-blue-v7.png'
export const CLOUD_LAYER = 'cloud-layer-bottom-v1.png'
export const FOOTER_CLOUDS = 'footer-cloud-transition-v2.png'
export const LOGO = 'naano-logo-nav.png'
