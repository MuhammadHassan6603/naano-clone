import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftLong,
  ArrowRightLong,
  ArrowRightMid,
  Check,
  LinkedInBadge,
  LinkedInMark,
  PlayTriangle,
} from '../components/Icons'
import { asset, CASE_STUDY_VIDEO } from '../lib/assets'
import { ease } from '../lib/motion'

const POST_URL =
  'https://www.linkedin.com/posts/god-sfavour-joseph-sanyaolu-33494b227_i-fired-my-seo-agency-an-ai-agent-now-runs-share-7462843037375909888-GdjJ/'

const reveal = {
  initial: { opacity: 0, y: 28, scale: 0.985 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, amount: 0.15, margin: '0px 0px -60px 0px' },
} as const

const Rv = ({ delay = 0, children, ...rest }: { delay?: number; children: ReactNode } & Record<string, unknown>) => (
  <motion.div
    {...reveal}
    transition={{ opacity: { duration: 0.46, delay }, default: { duration: 0.56, ease, delay } }}
    {...rest}
  >
    {children}
  </motion.div>
)

const metrics = [
  { value: '150%', label: 'Return on ad spend (ROAS)' },
  { value: '1,500+', label: 'Qualified leads surfaced for outreach' },
  { value: 'Hundreds', label: 'Of sign-ups generated' },
  { value: '~20', label: 'Creator posts published' },
  { value: '15', label: 'Creators activated' },
  { value: '€5,000', label: 'Campaign budget' },
]

const reasons = [
  'Relevant creator matching instead of one expensive bet on a single influencer',
  'Multiple posts and angles instead of relying on one piece of content',
  'Centralized tracking across the entire campaign',
  'Qualified lead extraction directly into a dashboard',
  'Clear visibility into what actually drove commercial outcomes',
]

const section: React.CSSProperties = {
  maxWidth: 1160,
  margin: '0 auto',
  padding: 'clamp(56px, 10vw, 96px) clamp(20px, 5vw, 56px) 0',
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '300px 1fr',
  gap: 64,
  alignItems: 'start',
}

const stepNumber: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: '#9B9DA3',
}

const stepTitle: React.CSSProperties = {
  margin: '12px 0 0 0',
  fontSize: 34,
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: '#17181C',
}

const lead: React.CSSProperties = {
  margin: 0,
  fontSize: 21,
  lineHeight: 1.6,
  fontWeight: 500,
  letterSpacing: '-0.01em',
  color: '#26272C',
}

const body: React.CSSProperties = {
  margin: '22px 0 0 0',
  fontSize: 18,
  lineHeight: 1.65,
  color: '#55575E',
}

const strong: React.CSSProperties = { fontWeight: 700, color: '#17181C' }

export default function CaseStudy() {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const play = () => {
    setPlaying(true)
    video.current?.play()
  }

  return (
    <>
      <div className="bg-noise" aria-hidden />
      <main className="naano-lp" data-lp-fluid style={{ background: '#FCFCFB', color: '#17181C' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px clamp(20px, 5vw, 56px)',
            background: 'rgba(252,252,251,0.82)',
            backdropFilter: 'saturate(180%) blur(12px)',
            WebkitBackdropFilter: 'saturate(180%) blur(12px)',
            borderBottom: '1px solid rgba(232,230,226,0.9)',
          }}
        >
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <img
              src={asset('naano-logo-nav.png', 384)}
              alt="naano"
              width={123}
              height={28}
              style={{ height: 28, width: 'auto', display: 'block' }}
            />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              to="/#testimonial"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#55575E',
                fontSize: 14.5,
                fontWeight: 600,
                padding: '10px 4px',
              }}
            >
              <ArrowLeftLong />
              All stories
            </Link>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                whiteSpace: 'nowrap',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 600,
                background: '#17181C',
                borderRadius: 999,
                padding: '11px 20px',
              }}
            >
              Book a call
              <ArrowRightLong />
            </Link>
          </div>
        </header>

        <section
          style={{
            maxWidth: 1160,
            margin: '0 auto',
            padding: 'clamp(40px, 8vw, 72px) clamp(20px, 5vw, 56px) 40px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 72, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--accent)' }}>
                  CASE STUDY
                </span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C9CBD1' }} />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: '#9B9DA3' }}>
                  LINKEDIN CREATOR CAMPAIGN
                </span>
              </div>
              <img
                src={asset('logo-blogseo.png', 384)}
                alt="BlogSEO"
                style={{ height: 34, width: 'auto', display: 'block', marginTop: 26 }}
              />
              <h1
                style={{
                  margin: '26px 0 0 0',
                  fontSize: 52,
                  lineHeight: 1.06,
                  fontWeight: 700,
                  letterSpacing: '-0.035em',
                  color: '#0E0F12',
                  textWrap: 'balance',
                  maxWidth: 640,
                }}
              >
                How BlogSEO turned creator marketing into a measurable acquisition channel
              </h1>
              <p style={{ margin: '24px 0 0 0', fontSize: 19, lineHeight: 1.55, color: '#55575E', maxWidth: 560 }}>
                After one €2,000 sponsored post returned just three sign-ups, BlogSEO rebuilt creator
                marketing on Naano, and turned it into predictable, trackable pipeline.
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  marginTop: 34,
                  flexWrap: 'wrap',
                  rowGap: 14,
                }}
              >
                <a
                  href={POST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-fluid-cta
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    whiteSpace: 'nowrap',
                    background: '#17181C',
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: 600,
                    padding: '16px 28px',
                    borderRadius: 12,
                  }}
                >
                  <LinkedInMark width={16} height={16} fill="#FFFFFF" />
                  View a campaign post
                </a>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: '#9B9DA3' }}>B2B SaaS · SEO</span>
              </div>
            </div>

            <div
              style={{
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                backgroundColor: '#0E0F12',
                aspectRatio: '4 / 5',
                boxShadow: '0 24px 60px -22px rgba(23,24,28,0.4)',
              }}
            >
              <video
                ref={video}
                src={CASE_STUDY_VIDEO}
                playsInline
                controls={playing}
                preload="metadata"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {!playing && (
                <button
                  type="button"
                  onClick={play}
                  aria-label="Play the BlogSEO case study video"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    padding: 0,
                    border: 0,
                    background: '#0E0F12',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={asset('naano-logo-footer.png', 640)}
                    alt="Naano"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '42%',
                      transform: 'translate(-50%, -50%)',
                      width: '52%',
                      height: 'auto',
                    }}
                  />
                  <span
                    className="naano-pulse"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '58%',
                      transform: 'translate(-50%, -50%)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 66,
                      height: 66,
                      background: '#FFFFFF',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                    }}
                  >
                    <PlayTriangle style={{ color: 'var(--accent)' }} />
                  </span>
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: '22px 20px 18px',
                      background: 'linear-gradient(to top, rgba(11,12,15,0.82), rgba(11,12,15,0))',
                      textAlign: 'left',
                      pointerEvents: 'none',
                    }}
                  >
                    <span style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                      Vincent Josse
                    </span>
                    <span
                      style={{ display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,0.82)', marginTop: 2 }}
                    >
                      CEO &amp; Founder, BlogSEO
                    </span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1160, margin: '28px auto 0', padding: '0 clamp(20px, 5vw, 56px)' }}>
          <Rv
            style={{
              background: '#FFFFFF',
              border: '1px solid #E7E5E1',
              borderRadius: 20,
              padding: 'clamp(28px, 5vw, 44px) clamp(20px, 4vw, 40px)',
              boxShadow: '0 1px 3px rgba(17,18,28,0.04)',
            }}
          >
            <div
              data-case-metrics
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 24px' }}
            >
              {metrics.map((metric) => (
                <div key={metric.label} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 46,
                      fontWeight: 700,
                      letterSpacing: '-0.035em',
                      color: '#0E0F12',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {metric.value}
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 500, color: '#55575E', marginTop: 12 }}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </Rv>
        </section>

        <section style={section}>
          <Rv style={grid}>
            <div>
              <div style={stepNumber}>01</div>
              <h2 style={stepTitle}>The challenge</h2>
            </div>
            <div style={{ maxWidth: 640 }}>
              <p style={lead}>
                Before Naano, BlogSEO had already tested influencer marketing. They paid{' '}
                <span style={strong}>€2,000 for a single sponsored post</span> and generated only
                three sign-ups.
              </p>
              <p style={body}>
                The conclusion was simple: creator marketing looked expensive, difficult to track,
                and impossible to scale with confidence.
              </p>
              <p style={{ ...body, margin: '18px 0 0 0' }}>
                They didn't need more reach. They needed a predictable way to find relevant creators,
                activate them at scale, and turn engagement into pipeline.
              </p>
              <div
                data-case-compare
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  marginTop: 34,
                  border: '1px solid #EDEBE7',
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: '#FFFFFF',
                }}
              >
                <div style={{ flex: 1, padding: '22px 24px' }}>
                  <div style={{ fontSize: 13, color: '#9B9DA3', fontWeight: 600 }}>Old approach</div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: '#17181C',
                      marginTop: 8,
                    }}
                  >
                    €2,000
                  </div>
                  <div style={{ fontSize: 14, color: '#8B8D94', marginTop: 4 }}>one sponsored post</div>
                </div>
                <div style={{ width: 1, background: '#EDEBE7' }} />
                <div style={{ flex: 1, padding: '22px 24px' }}>
                  <div style={{ fontSize: 13, color: '#9B9DA3', fontWeight: 600 }}>Result</div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: '#DC2626',
                      marginTop: 8,
                    }}
                  >
                    3 sign-ups
                  </div>
                  <div style={{ fontSize: 14, color: '#8B8D94', marginTop: 4 }}>
                    no way to trace or repeat it
                  </div>
                </div>
              </div>
            </div>
          </Rv>
        </section>

        <section style={section}>
          <Rv style={grid}>
            <div>
              <div style={stepNumber}>02</div>
              <h2 style={stepTitle}>The campaign</h2>
            </div>
            <div style={{ maxWidth: 640 }}>
              <p style={lead}>
                BlogSEO launched a LinkedIn creator campaign with Naano, matched with{' '}
                <span style={strong}>~10 relevant creators</span> and a{' '}
                <span style={strong}>€5,000 budget</span>.
              </p>
              <p style={body}>
                Over the campaign, creators published around 15 posts designed to reach BlogSEO's
                target audience and generate qualified demand. Every post was tracked through Naano,
                so the team could see which creators and which content generated real commercial
                intent.
              </p>
              <a
                href={POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-chip"
                style={{
                  display: 'block',
                  marginTop: 32,
                  border: '1px solid #EDEBE7',
                  borderRadius: 16,
                  background: '#FFFFFF',
                  padding: '20px 22px',
                  boxShadow: '0 1px 2px rgba(17,18,28,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: '#EDEBE7',
                      backgroundImage: `url("${asset('avatar-joseph.webp', 96)}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#17181C' }}>
                        Creator campaign post
                      </span>
                      <LinkedInBadge />
                    </div>
                    <div style={{ fontSize: 13, color: '#8B8D94', marginTop: 1 }}>
                      Tracked in Naano · LinkedIn
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    margin: '14px 0 0 0',
                    fontSize: 15.5,
                    lineHeight: 1.5,
                    color: '#26272C',
                    fontWeight: 500,
                  }}
                >
                  "I fired my SEO agency. An AI agent now runs it.", one of the creator posts that
                  drove qualified demand for BlogSEO.
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 16,
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: 'var(--accent)',
                  }}
                >
                  View one of the posts
                  <ArrowRightMid />
                </div>
              </a>
            </div>
          </Rv>
        </section>

        <section style={section}>
          <Rv style={grid}>
            <div>
              <div style={stepNumber}>03</div>
              <h2 style={stepTitle}>The results</h2>
            </div>
            <div style={{ maxWidth: 640 }}>
              <p style={lead}>
                For BlogSEO, the value wasn't just visibility. The campaign created a structured list
                of people who had engaged, <span style={strong}>1,500+ qualified leads</span>{' '}
                surfaced in the dashboard, ready to reactivate through outbound.
              </p>
              <p style={body}>
                Instead of treating creator marketing as an awareness play, the team could connect
                creator content to leads, conversations, and revenue, landing at{' '}
                <span style={{ fontWeight: 600, color: '#17181C' }}>150% ROAS</span>.
              </p>
            </div>
          </Rv>
        </section>

        <section style={section}>
          <Rv style={grid}>
            <div>
              <div style={stepNumber}>04</div>
              <h2 style={stepTitle}>Why it worked</h2>
              <p style={{ margin: '16px 0 0 0', fontSize: 16, lineHeight: 1.55, color: '#8B8D94' }}>
                The difference wasn't spending more on creators. Naano made the campaign operational.
              </p>
            </div>
            <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {reasons.map((reason) => (
                <div
                  key={reason}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 15,
                    padding: '20px 0',
                    borderTop: '1px solid #ECEAE6',
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'rgba(37,99,235,0.1)',
                      marginTop: 1,
                    }}
                  >
                    <Check style={{ color: 'var(--accent)' }} />
                  </span>
                  <span style={{ fontSize: 18, lineHeight: 1.5, fontWeight: 500, color: '#26272C' }}>
                    {reason}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #ECEAE6' }} />
            </div>
          </Rv>
        </section>

        <section
          style={{
            maxWidth: 1000,
            margin: '110px auto 0',
            padding: '0 clamp(20px, 5vw, 56px)',
            textAlign: 'center',
          }}
        >
          <Rv style={{ width: 46, height: 2, background: 'var(--accent)', borderRadius: 2, margin: '0 auto' }}>
            {null}
          </Rv>
          <Rv delay={0.03}>
            <blockquote
              style={{
                margin: '40px 0 0 0',
                fontSize: 40,
                lineHeight: 1.3,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: '#17181C',
                textWrap: 'balance',
              }}
            >
              "We had tried influencer marketing before and spent €2,000 on one post for three
              sign-ups. With Naano, we saw <span style={{ color: 'var(--accent)' }}>150% ROAS</span>{' '}
              and generated more than 1,500 leads we could follow up with."
            </blockquote>
          </Rv>
          <Rv
            delay={0.06}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 44 }}
          >
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#6B72E8',
                backgroundImage: `url("${asset('avatar-g.png', 96)}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0,
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#17181C' }}>Vincent Josse</div>
              <div style={{ fontSize: 14, color: '#8B8D94', marginTop: 2 }}>CEO &amp; Founder, BlogSEO</div>
            </div>
          </Rv>
        </section>

        <section
          style={{
            maxWidth: 1160,
            margin: '110px auto 0',
            padding: '0 clamp(20px, 5vw, 56px) clamp(72px, 12vw, 120px)',
          }}
        >
          <div
            data-case-cta
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: '#101113',
              borderRadius: 24,
              padding: 'clamp(44px, 8vw, 72px) clamp(24px, 5vw, 64px)',
              textAlign: 'center',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', color: '#7FA0F0' }}>
                BUILD YOUR LINKEDIN CREATOR CAMPAIGN
              </div>
              <h2
                style={{
                  margin: '22px auto 0',
                  maxWidth: 660,
                  fontSize: 46,
                  lineHeight: 1.08,
                  fontWeight: 700,
                  letterSpacing: '-0.035em',
                  color: '#FFFFFF',
                  textWrap: 'balance',
                }}
              >
                Turn creator engagement into pipeline.
              </h2>
              <p
                style={{
                  margin: '22px auto 0',
                  maxWidth: 520,
                  fontSize: 18,
                  lineHeight: 1.55,
                  color: '#AEB0B6',
                }}
              >
                Run a campaign with creators your buyers already trust, track the results, and turn
                engagement into revenue.
              </p>
              <Link
                to="/register"
                data-fluid-cta
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 11,
                  marginTop: 38,
                  background: '#FFFFFF',
                  color: '#101113',
                  fontSize: 16.5,
                  fontWeight: 600,
                  padding: '17px 30px',
                  borderRadius: 12,
                }}
              >
                Launch your campaign with Naano
                <ArrowRightLong width={17} height={17} />
              </Link>
            </div>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -70,
                textAlign: 'center',
                fontSize: 240,
                lineHeight: 0.78,
                fontWeight: 800,
                letterSpacing: '-0.05em',
                color: 'rgba(255,255,255,0.04)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              naano
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
