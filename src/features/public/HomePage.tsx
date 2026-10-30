import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Zap, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  ComicPanel,
  HalftoneAccent,
  DisplayText,
  ActionBurst,
  SpeechBubble,
  ComicCaptionBox,
  ComicCornerBox,
} from '@/components/comic/ComicPrimitives'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getCategories, getEvents } from '@/lib/api/events'
import { formatSlot } from '@/lib/utils'

export default function HomePage() {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: events = [] } = useQuery({
    queryKey: ['featured-events'],
    queryFn: () => getEvents(),
  })

  const featured = events.slice(0, 3)

  return (
    <div className="overflow-hidden">
      {/* ── HERO: AUTHENTIC COMIC COVER MASTHEAD ──────────────── */}
      <section
        className="relative bg-[#151515] text-[#FFF8E8] py-16 md:py-24 border-b-[3px] border-ink"
        aria-labelledby="hero-heading"
      >
        <HalftoneAccent color="red" className="opacity-20" />
        
        {/* Dynamic Comic Ray Burst Background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 75% 30%, #FFD43B 0%, transparent 60%), repeating-conic-gradient(from 0deg at 75% 30%, #F04438 0deg 15deg, transparent 15deg 30deg)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1240px] px-4 flex flex-col lg:flex-row items-center gap-12">
          {/* Main Hero Column */}
          <div className="flex-1 max-w-2xl">
            {/* Top Comic Badges */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <ComicCornerBox
                issueNo="VOL. '25"
                theme="DOC COMICS"
                price="FREE ENTRY"
              />
              <ComicCaptionBox>
                <span>PROLOGUE: WHERE CAMPUS VOICES BECOME LEGEND</span>
              </ComicCaptionBox>
            </div>

            {/* Comic 3D Title */}
            <DisplayText
              as="h1"
              id="hero-heading"
              className="text-5xl sm:text-6xl md:text-7xl leading-[0.95] mb-2 text-white comic-title-pop"
            >
              YOUR CAMPUS.
            </DisplayText>
            <DisplayText
              as="div"
              className="text-5xl sm:text-6xl md:text-7xl leading-[0.95] mb-6 comic-title-yellow"
            >
              YOUR STORY.
            </DisplayText>

            {/* Speech Dialogue Box */}
            <div className="mb-6">
              <SpeechBubble direction="down" className="max-w-md">
                <span className="text-[#F04438] font-black mr-1">CHRISTITES:</span>
                Welcome to Blossoms 2025! A three-day comic anthology celebrating creativity, music, theatrics, and poetry. No department barriers.
              </SpeechBubble>
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-wrap gap-4 items-center pt-2">
              <Button size="lg" variant="primary" asChild className="gap-2 text-lg shadow-[4px_4px_0px_#151515]">
                <Link to="/events">
                  <Zap className="w-5 h-5 fill-current" />
                  Explore The Panels <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="border-2 border-white bg-transparent text-white hover:bg-white/20 text-lg shadow-[3px_3px_0px_#151515]"
                asChild
              >
                <Link to="/schedule">
                  <CalendarDays className="w-5 h-5" /> Festival Timetable
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Hero Graphic / Comic Starburst */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center relative">
            <div className="absolute -top-6 -right-4 z-20">
              <span className="comic-caption-box rotate-6 shadow-[2px_2px_0px_#151515]">
                100% CROSS-CAMPUS
              </span>
            </div>

            <ActionBurst color="yellow" rotate="-4deg" className="w-48 h-48 sm:w-56 sm:h-56">
              <span className="text-xl sm:text-2xl font-black block">
                REGISTER<br />NOW!
              </span>
              <span className="text-[10px] tracking-normal font-sans uppercase block text-ink/80 mt-0.5">
                ALL DEPARTMENTS
              </span>
            </ActionBurst>

            {/* Floating comic stamp */}
            <div className="mt-4 bg-[#FFF8E8] text-[#151515] border-2 border-ink px-4 py-2 rounded-xl text-center shadow-[3px_3px_0px_#151515] rotate-2">
              <p className="font-display text-sm tracking-wider uppercase text-[#F04438] font-bold">
                ★ CENTRAL CAMPUS BANGALORE ★
              </p>
              <p className="text-xs text-ink/70 font-semibold">
                November 15–17, 2025
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK FACTS: COMIC TICKER ─────────────────────────── */}
      <section className="comic-ticker py-3" aria-label="Festival quick facts">
        <div className="mx-auto max-w-[1240px] px-4 flex flex-wrap items-center justify-around gap-4 md:gap-8 text-ink font-display text-sm md:text-base tracking-wider uppercase">
          <span className="flex items-center gap-1.5">
            <span className="text-[#F04438]">★</span> 15–17 NOVEMBER 2025
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <span className="text-[#F04438]">★</span> CENTRAL CAMPUS AUDITORIUMS
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#F04438]">★</span> 30+ STAGE &amp; LITERARY BATTLES
          </span>
          <span className="flex items-center gap-1.5 bg-[#F04438] text-white px-3 py-0.5 rounded-md border border-ink shadow-[1px_1px_0px_#151515]">
            <Sparkles className="w-3.5 h-3.5" /> OPEN ACROSS DEPARTMENTS
          </span>
        </div>
      </section>

      {/* ── PICK YOUR PANEL — CATEGORIES ──────────────────────── */}
      <section className="py-20 px-4 mx-auto max-w-[1240px]" aria-labelledby="categories-heading">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <ComicCaptionBox className="mb-2">
              ACT I: CHOOSE YOUR ARENA
            </ComicCaptionBox>
            <DisplayText as="h2" id="categories-heading" className="text-4xl sm:text-5xl">
              Pick Your Panel
            </DisplayText>
            <p className="text-ink/70 text-base mt-1">
              Every category is a different world. Jump into music, theatrics, poetry, or visual art.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/events">View All Events →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {categories.map((cat, index) => {
            const panelNum = `PANEL 0${index + 1}`
            const emoji =
              cat.slug === 'arts'
                ? '🎨'
                : cat.slug === 'literature'
                ? '📚'
                : cat.slug === 'stage'
                ? '🎭'
                : cat.slug === 'theatre'
                ? '🎬'
                : '⭐'
            return (
              <Link
                key={cat.slug}
                to={`/events?category=${cat.slug}`}
                className="comic-card group p-5 flex flex-col justify-between overflow-hidden bg-white hover:border-[#F04438]"
              >
                <HalftoneAccent color="yellow" className="opacity-0 group-hover:opacity-30 transition-opacity" />

                {/* Top comic label */}
                <div className="flex items-center justify-between border-b-2 border-ink/15 pb-2 mb-4">
                  <span className="font-display text-xs text-[#F04438] font-bold tracking-wider">
                    {panelNum}
                  </span>
                  <span className="text-xs font-mono font-bold text-ink/40">
                    VOL. 25
                  </span>
                </div>

                {/* Center visual */}
                <div className="text-center my-2">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
                    {emoji}
                  </div>
                  <DisplayText as="h3" className="text-2xl text-ink group-hover:text-[#F04438] transition-colors">
                    {cat.name}
                  </DisplayText>
                  <p className="text-xs text-ink/60 mt-1.5 line-clamp-2">
                    {cat.description || 'Showcase and competition events.'}
                  </p>
                </div>

                {/* Bottom link */}
                <div className="mt-4 pt-3 border-t-2 border-ink/15 text-center">
                  <span className="font-display text-xs tracking-wider uppercase text-ink group-hover:text-[#F04438] flex items-center justify-center gap-1 font-bold">
                    Enter Panel →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── FEATURED STRIP: COMIC STRIP SHOWCASE ──────────────── */}
      <section className="py-20 px-4 bg-[#F5EBD4] border-y-[3px] border-ink relative" aria-labelledby="featured-heading">
        <HalftoneAccent color="black" className="opacity-10" />

        <div className="relative z-10 mx-auto max-w-[1240px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ComicCaptionBox>
                  ACT II: SPOTLIGHT SPOT
                </ComicCaptionBox>
                <span className="comic-caption-box bg-[#F04438] text-white">
                  HIGH ENERGY
                </span>
              </div>
              <DisplayText as="h2" id="featured-heading" className="text-4xl sm:text-5xl">
                Featured Comic Strips
              </DisplayText>
              <p className="text-ink/70 text-base mt-1">
                The flagship battles of this edition. Spots fill up fast!
              </p>
            </div>
            <Button size="md" variant="outline" asChild>
              <Link to="/events">Browse All Panels →</Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((event, i) => {
              const firstSlot = event.schedule_slots?.[0]
              return (
                <ComicPanel
                  key={event.id}
                  panelNumber={`SCENE ${i + 1}`}
                  caption={event.category?.name?.toUpperCase() || 'STAGE'}
                  className="flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Badge variant={event.event_format === 'team' ? 'blue' : 'pink'}>
                        {event.event_format === 'team' ? 'Crew Battle' : 'Solo Entry'}
                      </Badge>
                      <Badge variant="open">Registration Open</Badge>
                    </div>

                    <DisplayText as="h3" className="text-3xl text-ink leading-tight pt-1">
                      {event.title}
                    </DisplayText>

                    <p className="text-sm text-ink/70 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="bg-[#FFF8E8] border border-ink/20 p-3 rounded-xl text-xs space-y-1 font-medium">
                      <p className="text-ink flex items-center gap-1.5">
                        <span>📅</span>
                        <span>{firstSlot ? formatSlot(firstSlot.starts_at, firstSlot.ends_at) : 'Slot TBA'}</span>
                      </p>
                      <p className="text-ink/70 flex items-center gap-1.5">
                        <span>📍</span>
                        <span>{firstSlot?.venue?.name || 'Central Campus Grounds'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t-2 border-ink/15">
                    <Button size="sm" variant="primary" className="w-full text-base font-display tracking-wider uppercase" asChild>
                      <Link to={`/events/${event.slug}`}>
                        Read Rules &amp; Register →
                      </Link>
                    </Button>
                  </div>
                </ComicPanel>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW TO JOIN: 4-PANEL STORY ───────────────────────── */}
      <section className="py-20 px-4 mx-auto max-w-[1240px]" aria-labelledby="howto-heading">
        <div className="text-center max-w-xl mx-auto mb-12">
          <ComicCaptionBox className="mb-2">
            THE PARTICIPANT'S MANUAL
          </ComicCaptionBox>
          <DisplayText as="h2" id="howto-heading" className="text-4xl sm:text-5xl">
            How To Join The Story
          </DisplayText>
          <p className="text-ink/70 text-base mt-2">
            Four simple panels to go from reader to registered performer.
          </p>
        </div>

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {[
            {
              panel: 'PANEL 1',
              title: 'IDENTIFY',
              desc: 'Sign in with your verified CHRIST institutional credentials.',
              tag: 'SECURE SSO',
            },
            {
              panel: 'PANEL 2',
              title: 'EXPLORE',
              desc: 'Browse events across all 5 panels. Department is never a barrier.',
              tag: 'OPEN TO ALL',
            },
            {
              panel: 'PANEL 3',
              title: 'REGISTER',
              desc: 'Register solo or assemble your crew. Check live capacity.',
              tag: 'INSTANT CONFIRM',
            },
            {
              panel: 'PANEL 4',
              title: 'TAKE STAGE',
              desc: 'Access your personal timetable and make campus history.',
              tag: 'SHOWTIME',
            },
          ].map((item, idx) => (
            <li key={item.panel} className="comic-card p-5 bg-white relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b-2 border-ink pb-2 mb-3">
                  <span className="comic-caption-box text-[11px] py-0 px-2 bg-[#FFD43B]">
                    {item.panel}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider font-mono text-ink/40">
                    STEP 0{idx + 1}
                  </span>
                </div>
                <DisplayText as="h3" className="text-2xl text-ink mb-2">
                  {item.title}
                </DisplayText>
                <p className="text-sm text-ink/70 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-ink/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#F04438] font-mono">
                  {item.tag}
                </span>
                <span className="font-display text-lg text-ink font-black">
                  ★
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <Button size="lg" variant="primary" asChild className="text-lg px-8 shadow-[4px_4px_0px_#151515]">
            <Link to="/login">
              Sign In To Pick Your Panel →
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
