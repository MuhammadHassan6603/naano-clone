export type Post = {
  name: string
  avatar: string
  meta: string
  text: string
  image: string
  alt: string
  stats: [string, string, string]
  brand: string
  brandFile: string
  brandHeight: number
  href: string
}

export const posts: Post[] = [
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
