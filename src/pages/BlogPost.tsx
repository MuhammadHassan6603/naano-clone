import { Link, Navigate, useParams } from 'react-router-dom'
import { BlogFooter } from '../components/BlogFooter'
import { LinkedIn } from '../components/Icons'
import { rootAsset } from '../lib/assets'
import { getBlogPost } from '../lib/blogPosts'
import { useActiveHeading } from '../lib/useActiveHeading'

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 6v6l4 2" />
    <circle cx="12" cy="12" r="10" />
  </svg>
)

const DotOverlay = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 opacity-[0.14]"
    style={{
      backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
      backgroundSize: '26px 26px',
    }}
  />
)

export default function BlogPost() {
  const { slug = '' } = useParams()
  const post = getBlogPost(slug)
  const tocIds = post?.toc.map((item) => item.id) ?? []
  const active = useActiveHeading(tocIds)

  if (!post) return <Navigate to="/blog" replace />

  const Body = post.body

  return (
    <main className="font-jakarta min-h-screen bg-white text-[#111827]">
      <section
        className="relative overflow-hidden pt-28 pb-20 text-white sm:pt-32 sm:pb-24"
        style={{ background: post.gradient }}
      >
        <DotOverlay />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mb-10">
            <Link
              to="/blog"
              className="rounded-sm text-xs tracking-[0.14em] text-white/80 uppercase transition-colors duration-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 motion-reduce:transition-none"
            >
              ← Blog
            </Link>
          </div>
          <div className="max-w-[840px]">
            <div className="mb-6 flex items-center gap-3 text-[11px] tracking-[0.16em] text-white/85 uppercase">
              <span className="font-semibold">{post.category}</span>
              <span aria-hidden className="size-1 rounded-full bg-white/60" />
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon />
                {post.minutes} min read
              </span>
              <span aria-hidden className="size-1 rounded-full bg-white/60" />
              <span>EN</span>
            </div>
            <h1 className="mb-7 text-[clamp(32px,5vw,58px)] leading-[1.04] font-light tracking-[-0.025em]">
              {post.title}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              {post.description}
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 pt-12 pb-24 sm:px-6 sm:pt-16">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-x-10 lg:grid-cols-12 lg:gap-x-16">
          <article className="lg:order-1 lg:col-span-9">
            <div className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB] pb-7">
              <a
                href={post.author.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111827] focus-visible:ring-offset-2"
              >
                <span className="relative">
                  <img
                    src={rootAsset(post.author.avatar, 96)}
                    alt={post.author.name}
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                    className="size-11 rounded-full border border-[#E5E7EB] object-cover"
                  />
                  <span
                    aria-hidden
                    className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-[#0A66C2] ring-2 ring-white"
                  >
                    <LinkedIn width={10} height={10} className="text-white" />
                  </span>
                </span>
                <span>
                  <span className="block text-sm font-medium text-[#111827] group-hover:underline">
                    {post.author.name}
                  </span>
                  <span className="block text-xs text-[#6B7280]">{post.author.role}</span>
                </span>
              </a>
              <div className="space-y-0.5 text-xs text-[#6B7280] sm:text-right">
                <div>
                  Published{' '}
                  <time dateTime={post.dateISO} className="text-[#111827]">
                    {new Date(post.dateISO).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              </div>
            </div>

            <div className="prose-blog">
              <Body />
            </div>

            <div className="mt-14 flex flex-wrap gap-2 border-t border-[#E5E7EB] pt-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] tracking-[0.1em] text-[#6B7280] uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-14 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-7 sm:p-9">
              <p className="mb-3 text-[11px] tracking-[0.14em] text-[#6B7280] uppercase">
                Ready to try it
              </p>
              <h2 className="mb-4 text-2xl font-light tracking-[-0.02em] text-[#111827] sm:text-3xl">
                Run a creator-led growth campaign on Naano.
              </h2>
              <p className="mb-6 max-w-xl leading-relaxed text-[#4B5563]">
                Book fixed-price LinkedIn creator offers without a platform retainer on Self-Serve.
                Compare eligible creators and track campaign outcomes.
              </p>
              <Link
                to="/#pricing"
                className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#1F2937] motion-reduce:transition-none"
              >
                Start a campaign
                <span aria-hidden>→</span>
              </Link>
            </div>
          </article>

          <aside className="lg:order-2 lg:col-span-3">
            <nav
              aria-label="On this page"
              className="sticky top-24 hidden self-start text-sm lg:block"
            >
              <p className="mb-4 text-[10px] font-semibold tracking-[0.16em] text-[#6B7280] uppercase">
                On this page
              </p>
              <ul className="space-y-2.5 border-l border-[#E5E7EB]">
                {post.toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`-ml-px block border-l-2 py-0.5 pl-4 transition-colors duration-150 motion-reduce:transition-none ${
                        active === item.id
                          ? 'border-[#111827] font-medium text-[#111827]'
                          : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>

      <BlogFooter />
    </main>
  )
}
