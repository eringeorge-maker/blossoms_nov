import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { PublicHeader } from '@/components/layout/PublicHeader'
import artsUrl from '@/assets/brand/panel-arts.png'
import literatureUrl from '@/assets/brand/panel-literature.png'
import stageUrl from '@/assets/brand/panel-stage.png'
import theatreUrl from '@/assets/brand/panel-theatre.png'
import blossomsLogoUrl from '@/assets/brand/blossoms-2026-27-lockup.png'
import purpleBurstUrl from '@/assets/brand/bg-purple-burst.png'

interface HomePanel {
  slug: 'arts' | 'literature' | 'stage' | 'theatre'
  title: string
  tagline: string
  captionHex: string
  art: string
  artStyle: CSSProperties
  clipPath: string
  box: CSSProperties
  wording: CSSProperties
  arrow: CSSProperties
}

// All panels share one page-wide coordinate system, so neighbouring edges stay one even gutter apart.
const HOME_PANELS: HomePanel[] = [
  {
    slug: 'arts',
    title: 'ARTS',
    tagline: 'PAINT. DESIGN. EXPRESS.',
    captionHex: '#f9d423',
    art: artsUrl,
    artStyle: { objectPosition: '0 64%', transform: 'scale(1.3)', transformOrigin: 'left center' },
    clipPath: 'polygon(52.81% 1.11%, 77.34% 1.11%, 75.39% 39.17%, 50.63% 37.78%)',
    box: { left: '50.63%', top: '1.11%', width: '26.72%', height: '38.06%' },
    wording: { left: '53.75%', top: '2.8%' },
    arrow: { left: '70.3%', top: '30%' },
  },
  {
    slug: 'literature',
    title: 'LITERATURE',
    tagline: 'SPEAK. WRITE. THINK.',
    captionHex: '#f9d423',
    art: literatureUrl,
    artStyle: { objectPosition: '70% 0', transform: 'scale(1.08)', transformOrigin: 'center top' },
    clipPath: 'polygon(77.97% 1.11%, 99.38% 1.11%, 99.38% 40.56%, 76.02% 39.17%)',
    box: { left: '76.02%', top: '1.11%', width: '23.36%', height: '39.44%' },
    wording: { left: '78.6%', top: '2.8%' },
    arrow: { left: '94.7%', top: '31.7%' },
  },
  {
    slug: 'stage',
    title: 'STAGE',
    tagline: 'PERFORM. INSPIRE.',
    captionHex: '#fdfaf0',
    art: stageUrl,
    artStyle: { objectPosition: '100% 0', transform: 'scale(1.4)', transformOrigin: 'right top' },
    clipPath: 'polygon(0.63% 36.11%, 40.63% 38.33%, 37.5% 83.33%, 0.63% 83.33%)',
    box: { left: '0.63%', top: '36.11%', width: '40%', height: '47.22%' },
    wording: { left: '2%', top: '38.9%' },
    arrow: { left: '32.3%', top: '75%' },
  },
  {
    slug: 'theatre',
    title: 'THEATRE',
    tagline: 'ACT. IMAGINE. BRING STORIES ALIVE.',
    captionHex: '#f9d423',
    art: theatreUrl,
    artStyle: { objectPosition: '100% 100%', transform: 'scale(1.12)', transformOrigin: 'right bottom' },
    clipPath: 'polygon(41.25% 38.33%, 99.38% 41.67%, 99.38% 83.33%, 38.13% 83.33%)',
    box: { left: '38.13%', top: '38.33%', width: '61.25%', height: '45%' },
    wording: { left: '42.8%', top: '41.1%' },
    arrow: { left: '94.7%', top: '75%' },
  },
]

function ArrowChip({ style }: { style: CSSProperties }) {
  return (
    <span aria-hidden="true" className="home-arrow" style={style}>
      <svg viewBox="0 0 16 16" fill="none">
        <path
          d="M3 8H13M13 8L8.8 3.8M13 8L8.8 12.2"
          stroke="#0f0f0f"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function FeatureBanner({
  title,
  subtitle,
  clipPath,
  textLeft,
  origin,
  delay,
  onClick,
}: {
  title: string
  subtitle: string
  clipPath: string
  textLeft: string
  origin: string
  delay: string
  onClick: () => void
}) {
  return (
    <div className="home-pop" style={{ transformOrigin: origin }}>
      <button
        type="button"
        onClick={onClick}
        className="home-panel home-banner"
        style={{ clipPath, animationDelay: delay }}
      >
        <span className="home-banner-text" style={{ left: textLeft }}>
          <span className="font-comic-display home-banner-title">{title}</span>
          <span className="font-comic-sub home-banner-subtitle">{subtitle}</span>
        </span>
      </button>
    </div>
  )
}

interface DesktopHomeProps {
  animateIn: boolean
  onOpenSchedule: () => void
  onOpenAnnouncements: () => void
}

/** The wide-screen home page: one full comic page split by an even ink gutter. */
export default function DesktopHome({ animateIn, onOpenSchedule, onOpenAnnouncements }: DesktopHomeProps) {
  return (
    <div className="hidden md:flex flex-col min-h-screen w-full bg-[#0f0f0f]">
      <PublicHeader />

      <main id="main-content" className={cn('home-page', animateIn && 'home-page--slam')}>
        <div
          className="home-panel home-hero"
          style={{
            backgroundImage: `url(${purpleBurstUrl})`,
            clipPath: 'polygon(0.63% 1.11%, 52.19% 1.11%, 50% 37.78%, 0.63% 35%)',
          }}
        >
          <div className="home-hero-content">
            <h1 className="m-0">
              <img src={blossomsLogoUrl} alt="Blossoms: Be the best, 2026–27" className="home-hero-logo" />
            </h1>
            <p className="home-hero-line font-comic-sub">YOUR CAMPUS. YOUR STORY.</p>
          </div>
        </div>

        <nav aria-label="Event categories">
          {HOME_PANELS.map(({ slug, title, tagline, captionHex, art, artStyle, clipPath, box, wording, arrow }, index) => (
            <Link
              key={slug}
              to={`/events?category=${slug}`}
              aria-label={`${title} events: ${tagline}`}
              className="home-panel home-category"
              style={{ clipPath, animationDelay: `${0.12 * (index + 1)}s` }}
            >
              <span className="home-art" style={box}>
                <img src={art} alt="" style={artStyle} />
              </span>
              <span className="home-wording" style={wording}>
                <span className="font-comic-display comic-title-white home-title">{title}</span>
                <span className="font-comic-sub home-tagline" style={{ backgroundColor: captionHex }}>
                  {tagline}
                </span>
              </span>
              <ArrowChip style={arrow} />
            </Link>
          ))}
        </nav>

        <FeatureBanner
          title="EVENT SCHEDULE"
          subtitle="DATES, TIMINGS & VENUES"
          clipPath="polygon(0.63% 84.44%, 49.38% 84.44%, 48.75% 98.89%, 0.63% 98.89%)"
          textLeft="2.3%"
          origin="25% 99%"
          delay="0.6s"
          onClick={onOpenSchedule}
        />
        <FeatureBanner
          title="ANNOUNCEMENTS"
          subtitle="LIVE FEST UPDATES"
          clipPath="polygon(50% 84.44%, 99.38% 84.44%, 99.38% 98.89%, 49.38% 98.89%)"
          textLeft="51.7%"
          origin="75% 99%"
          delay="0.7s"
          onClick={onOpenAnnouncements}
        />
      </main>
    </div>
  )
}
