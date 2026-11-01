import { Link } from 'react-router-dom'
import type { ComponentType, ReactNode } from 'react'
import {
  ArtsIllustration,
  CampusHeritageDome,
  LiteratureIllustration,
  StageIllustration,
  TheatreIllustration,
} from '@/components/comic/CategoryIllustrations'
import {
  AnnouncementsMegaphoneIllustration,
  ScheduleCalendarIllustration,
} from '@/components/comic/ComicArtwork'
import { PublicHeader } from '@/components/layout/PublicHeader'

interface HomePanel {
  slug: string
  title: string
  tagline: string
  bgHex: string
  captionHex: string
  clipPath: string
  Illustration: ComponentType<{ className?: string }>
}

const HOME_PANELS: HomePanel[] = [
  {
    slug: 'arts',
    title: 'ARTS',
    tagline: 'PAINT. DESIGN. EXPRESS.',
    bgHex: '#ed1e79',
    captionHex: '#f9d423',
    clipPath: 'polygon(0% 0%, 93% 1.5%, 100% 100%, 0% 98%)',
    Illustration: ArtsIllustration,
  },
  {
    slug: 'literature',
    title: 'LITERATURE',
    tagline: 'SPEAK. WRITE. THINK.',
    bgHex: '#0088e8',
    captionHex: '#f9d423',
    clipPath: 'polygon(0% 1.5%, 93% 3.5%, 100% 98%, 7% 100%)',
    Illustration: LiteratureIllustration,
  },
  {
    slug: 'stage',
    title: 'STAGE',
    tagline: 'PERFORM. INSPIRE.',
    bgHex: '#fdb813',
    captionHex: '#fdfaf0',
    clipPath: 'polygon(0% 3.5%, 93% 0%, 100% 100%, 7% 98%)',
    Illustration: StageIllustration,
  },
  {
    slug: 'theatre',
    title: 'THEATRE',
    tagline: 'ACT. IMAGINE. BRING STORIES ALIVE.',
    bgHex: '#861ec2',
    captionHex: '#f9d423',
    clipPath: 'polygon(0% 0%, 100% 2.5%, 100% 100%, 7% 100%)',
    Illustration: TheatreIllustration,
  },
]

function ArrowChip() {
  return (
    <span
      aria-hidden="true"
      className="w-[48px] h-[48px] rounded-full bg-[#fdfaf0] border-[3px] border-[#0f0f0f] flex items-center justify-center shrink-0"
    >
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
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
  bgHex,
  icon,
  trailing,
  onClick,
}: {
  title: string
  subtitle: string
  bgHex: string
  icon: ReactNode
  trailing: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ backgroundColor: bgHex }}
      className="w-full min-h-[88px] border-[4px] border-[#0f0f0f] px-5 py-2 flex items-center justify-between gap-4 text-left cursor-pointer active:scale-[0.99] focus-visible:outline-[4px] focus-visible:outline-offset-2 focus-visible:outline-[#0f0f0f]"
    >
      <span className="flex items-center gap-4 min-w-0">
        <span className="w-[56px] h-[56px] p-1 rounded-md bg-[#fdfaf0] border-[3px] border-[#0f0f0f] flex items-center justify-center shrink-0">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block font-comic-display text-white text-[clamp(26px,3vw,40px)] leading-none">
            {title}
          </span>
          <span className="block font-comic-sub text-white text-[clamp(13px,1.2vw,17px)] mt-1">
            {subtitle}
          </span>
        </span>
      </span>
      {trailing}
    </button>
  )
}

interface DesktopHomeProps {
  onOpenSchedule: () => void
  onOpenAnnouncements: () => void
}

/** The mobile home page's comic stack, re-flowed to fill one wide viewport. */
export default function DesktopHome({ onOpenSchedule, onOpenAnnouncements }: DesktopHomeProps) {
  return (
    <div className="hidden md:flex flex-col min-h-screen w-full bg-[#f8ca16] halftone-dots">
      <PublicHeader />

      <main
        id="main-content"
        className="flex-1 w-full max-w-[1640px] mx-auto px-6 lg:px-10 py-5 grid gap-4 grid-rows-[auto_minmax(560px,1fr)_auto] lg:grid-rows-[minmax(190px,0.62fr)_minmax(340px,1fr)_auto]"
      >
        {/* Masthead */}
        <section className="relative bg-[#fdfaf0] border-[4px] border-[#0f0f0f] rounded-[20px] flex items-stretch justify-between gap-6 overflow-hidden p-4">
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
            <h1 className="font-comic-display text-[#df1b23] leading-[0.82] tracking-wider text-[clamp(84px,min(13vw,21vh),210px)]">
              BLOSSOMS
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="bg-[#f8ca16] border-[3px] border-[#0f0f0f] px-4 py-0.5 -rotate-2 font-comic-display text-[#0f0f0f] text-[clamp(26px,3vw,42px)] leading-tight">
                2026
              </span>
              <p className="bg-white border-[3px] border-[#0f0f0f] px-4 py-1.5 rotate-1 font-comic-sub text-[#0f0f0f] text-[clamp(15px,1.7vw,24px)] leading-none">
                SAME STAGE. DIFFERENT HEROES!
              </p>
            </div>
          </div>

          <div className="relative w-[27%] min-w-[190px] max-w-[420px] bg-[#0088e8] border-[4px] border-[#0f0f0f] rounded-[12px] overflow-hidden flex items-end justify-center">
            <span className="absolute top-2.5 left-2.5 z-10 bg-[#fdfaf0] border-[2.5px] border-[#0f0f0f] px-2.5 py-0.5 font-comic-sub text-[15px] -rotate-2">
              CAMPUS HERITAGE
            </span>
            <CampusHeritageDome className="w-[92%] h-[86%] pointer-events-none" />
          </div>
        </section>

        {/* Category panels */}
        <nav aria-label="Event categories" className="grid grid-cols-2 lg:grid-cols-4 gap-2 min-h-0">
          {HOME_PANELS.map(({ slug, title, tagline, bgHex, captionHex, clipPath, Illustration }, index) => (
            <Link
              key={slug}
              to={`/events?category=${slug}`}
              style={{ backgroundColor: bgHex, clipPath }}
              className={`group relative block h-full min-h-[270px] overflow-hidden halftone-dots-dense select-none focus-visible:outline-[5px] focus-visible:-outline-offset-[12px] focus-visible:outline-[#0f0f0f] ${
                index === 0 ? '' : 'lg:-ml-[7%]'
              } ${index === 2 ? 'max-lg:ml-0' : ''} ${index % 2 === 1 ? 'max-lg:-ml-[7%]' : ''}`}
            >
              <div className={`relative z-20 pt-5 pr-4 ${index === 0 || index === 2 ? 'pl-5' : 'pl-[13%]'}`}>
                <h2 className="font-comic-display comic-title-white leading-[0.9] tracking-wide -rotate-3 origin-left text-[clamp(44px,5vw,74px)]">
                  {title}
                </h2>
                <p
                  style={{ backgroundColor: captionHex }}
                  className="mt-2 inline-block max-w-[230px] border-[3px] border-[#0f0f0f] px-3 py-1 -rotate-3 font-comic-sub text-[#0f0f0f] text-[clamp(14px,1.35vw,19px)] leading-[1.05] text-center"
                >
                  {tagline}
                </p>
              </div>
              <Illustration className="absolute bottom-0 left-[3%] w-[82%] h-[58%] z-10 pointer-events-none transition-transform duration-200 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
              <span className="absolute right-[9%] bottom-5 z-20">
                <ArrowChip />
              </span>
            </Link>
          ))}
        </nav>

        {/* Schedule & announcements */}
        <section className="grid grid-cols-2 gap-4">
          <FeatureBanner
            title="EVENT SCHEDULE"
            subtitle="DATES, TIMINGS & VENUES"
            bgHex="#df1b23"
            onClick={onOpenSchedule}
            icon={<ScheduleCalendarIllustration className="w-full h-full" />}
            trailing={
              <span className="bg-[#f8ca16] border-[3px] border-[#0f0f0f] px-3 py-1 font-comic-sub text-[17px] rotate-1 shrink-0 hidden xl:inline-block">
                CHECK NOW!
              </span>
            }
          />
          <FeatureBanner
            title="ANNOUNCEMENTS"
            subtitle="LIVE FEST UPDATES"
            bgHex="#00966b"
            onClick={onOpenAnnouncements}
            icon={<AnnouncementsMegaphoneIllustration className="w-full h-full" />}
            trailing={<ArrowChip />}
          />
        </section>
      </main>
    </div>
  )
}
