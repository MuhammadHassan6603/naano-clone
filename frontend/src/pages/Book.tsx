import { Link } from 'react-router-dom'
import { ArrowLeftLong, ArrowRightMid, Check } from '../components/Icons'
import { asset, brandLogos } from '../lib/assets'

const CALENDAR =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1jAKngmC-PGgCsMuK4Z7fnFDMmnjZRJjHEReGR7wAALR7mdOwyUx55Owm06Iood6_ZaWIG8HlU?gv=true'

const promises = [
  'Creator angles tailored to your market',
  'Recommended campaign format and budget',
  'A clear launch plan for your next campaign',
]

const trustedLogos = brandLogos.filter((logo) =>
  ['lemlist', 'folk', 'Ringover', 'Attio', 'gojiberry'].includes(logo.name),
)

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m22 8-6 4 6 4V8Z" />
    <rect width="14" height="12" x="2" y="6" rx="2" />
  </svg>
)

const chip: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 10px',
  border: '1px solid #E7E5E1',
  borderRadius: 8,
  fontSize: 12.5,
  fontWeight: 600,
  color: '#2C2E33',
}

export default function Book() {
  return (
    <>
      <div className="bg-noise" aria-hidden />
      <div
        className="naano-lp"
        data-lp-fluid
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FCFCFB',
          color: '#17181C',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'clamp(16px, 3vw, 24px) clamp(20px, 5vw, 48px)',
            borderBottom: '1px solid #EFEDE9',
          }}
        >
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <img
              src={asset('naano-logo-nav.png', 384)}
              alt="naano"
              width={114}
              height={26}
              style={{ height: 26, width: 'auto', display: 'block' }}
            />
          </Link>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#55575E',
              fontSize: 14.5,
              fontWeight: 600,
            }}
          >
            <ArrowLeftLong />
            Back to homepage
          </Link>
        </header>

        <main
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 940,
            margin: '0 auto',
            padding: 'clamp(32px, 6vw, 56px) clamp(20px, 5vw, 48px) 64px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <section style={{ width: '100%', maxWidth: 680, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--accent)' }}>
              CAMPAIGN STRATEGY CALL
            </div>
            <h1
              style={{
                margin: '20px 0 0 0',
                fontSize: 'clamp(36px, 8vw, 52px)',
                lineHeight: 1.04,
                fontWeight: 700,
                letterSpacing: '-0.035em',
                color: '#0E0F12',
                textWrap: 'balance',
              }}
            >
              Let's build your next creator campaign.
            </h1>
            <p
              style={{
                margin: '22px auto 0',
                fontSize: 19,
                lineHeight: 1.5,
                color: '#55575E',
                maxWidth: 500,
              }}
            >
              In 30 minutes, we'll map the right creator angles, campaign format and budget for your
              ICP.
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '14px 26px',
                marginTop: 32,
              }}
            >
              {promises.map((promise) => (
                <div key={promise} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'rgba(37,99,235,0.1)',
                    }}
                  >
                    <Check style={{ color: 'var(--accent)' }} />
                  </span>
                  <span style={{ fontSize: 15.5, fontWeight: 500, color: '#2C2E33' }}>{promise}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={{ width: '100%', marginTop: 44 }}>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E7E5E1',
                borderRadius: 16,
                padding: 'clamp(16px, 3vw, 26px) clamp(16px, 3vw, 26px) 22px',
                boxShadow: '0 1px 3px rgba(17,18,28,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '0 4px',
                  flexWrap: 'wrap',
                  rowGap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', rowGap: 8 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: '#0E0F12',
                    }}
                  >
                    Book a campaign call
                  </h2>
                  <span style={chip}>
                    <ClockIcon />
                    30 min
                  </span>
                  <span style={chip}>
                    <VideoIcon />
                    Video call
                  </span>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 11px',
                    background: '#F5F4F1',
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#55575E',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A' }} />
                  Available
                </span>
              </div>

              <div
                style={{
                  marginTop: 18,
                  border: '1px solid #E7E5E1',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#FFFFFF',
                }}
              >
                <iframe
                  title="Book a campaign call with Naano"
                  src={CALENDAR}
                  width="100%"
                  height={620}
                  style={{ border: 0, display: 'block', width: '100%' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginTop: 16,
                  padding: '14px 4px 2px',
                  borderTop: '1px solid #F0EEEA',
                  flexWrap: 'wrap',
                  rowGap: 10,
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: '#A7A9AF' }}>
                  You'll receive a Google Calendar invite instantly.
                </p>
                <a
                  href="mailto:info@naano.com"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13.5,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    color: 'var(--accent)',
                  }}
                >
                  Prefer email? Contact us
                  <ArrowRightMid width={14} height={14} />
                </a>
              </div>
            </div>
          </section>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 30,
              marginTop: 40,
              opacity: 0.9,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.01em', color: '#A7A9AF' }}>
              Trusted by B2B teams at
            </span>
            {trustedLogos.map((logo) => (
              <div
                key={logo.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 24,
                  width: 80,
                }}
              >
                <img
                  src={asset(logo.file, 256)}
                  alt={logo.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    maxHeight: 22,
                    maxWidth: 80,
                    objectFit: 'contain',
                    display: 'block',
                    filter: 'grayscale(1)',
                    opacity: 0.6,
                  }}
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}
