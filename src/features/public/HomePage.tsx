import { Link } from 'react-router-dom'
import {
  ChristCampusDomeIllustration,
  ArtsPaletteIllustration,
  LiteratureBooksIllustration,
  StageMicrophoneIllustration,
  TheatreMasksIllustration,
  ScheduleCalendarIllustration,
  AnnouncementsMegaphoneIllustration,
} from '@/components/comic/ComicArtwork'
import { DisplayText, HalftoneAccent } from '@/components/comic/ComicPrimitives'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5B82E] py-4 px-3 sm:px-6 md:py-8">
      {/* ── Main Mobile / Comic Issue Container ───────────────── */}
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto space-y-3.5">
        
        {/* ── 1. TOP ROW: HERO TITLE & CAMPUS SPLIT PANELS ───── */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-3.5" aria-label="Blossoms 2026 Festival Masthead">
          {/* Left Panel: Explosive Title Banner */}
          <div className="bg-[#FFF8E8] border-[3px] border-[#151515] rounded-2xl shadow-[4px_4px_0px_#151515] p-2.5 sm:p-4 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[148px] sm:min-h-[165px]">
            {/* Comic Cloud Burst / Starburst Background */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #FFD43B 20%, transparent 20%), radial-gradient(circle, #F04438 20%, transparent 20%)',
                backgroundSize: '12px 12px',
                backgroundPosition: '0 0, 6px 6px',
              }}
            />

            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Arched Vibrant Red BLOSSOMS with Comic Starburst */}
              <div className="relative w-full max-w-[170px] sm:max-w-[200px] flex items-center justify-center -rotate-2">
                <svg viewBox="0 0 200 65" className="w-full h-auto overflow-visible select-none drop-shadow-[2px_3px_0px_#151515]">
                  {/* Comic Explosion Burst Cloud */}
                  <path
                    d="M100 2 L115 14 L138 6 L142 22 L165 20 L160 36 L182 44 L168 56 L180 70 L158 72 L150 90 L130 80 L115 95 L100 82 L85 95 L70 80 L50 90 L42 72 L20 70 L32 56 L18 44 L40 36 L35 20 L58 22 L62 6 L85 14 Z"
                    fill="#FFE58F"
                    stroke="#151515"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Vibrant Red BLOSSOMS Text with Clean Black Outline */}
                  <text
                    x="100"
                    y="46"
                    textAnchor="middle"
                    fill="#DC2626"
                    stroke="#151515"
                    strokeWidth="3.5"
                    paintOrder="stroke fill"
                    style={{
                      fontFamily: 'Bangers, Impact, system-ui, sans-serif',
                      fontSize: '44px',
                      letterSpacing: '1px',
                      fontWeight: 900,
                    }}
                  >
                    BLOSSOMS
                  </text>
                  {/* Subtle Red Highlight Sheen */}
                  <text
                    x="99"
                    y="44"
                    textAnchor="middle"
                    fill="#F87171"
                    opacity="0.45"
                    style={{
                      fontFamily: 'Bangers, Impact, system-ui, sans-serif',
                      fontSize: '42px',
                      letterSpacing: '1px',
                      fontWeight: 900,
                      pointerEvents: 'none',
                    }}
                  >
                    BLOSSOMS
                  </text>
                </svg>
              </div>

              {/* 2026 Comic Ribbon */}
              <div className="bg-white border-[2.5px] border-[#151515] px-3.5 py-0.5 rounded-lg shadow-[2px_2px_0px_#151515] -mt-1 rotate-1 z-10">
                <span className="font-display text-lg sm:text-xl text-[#151515] tracking-widest font-black leading-none block">
                  2026
                </span>
              </div>

              {/* Narrative Sticker Box */}
              <div className="mt-2 bg-[#FFD43B] text-[#151515] border-2 border-[#151515] px-2.5 py-0.5 rounded-md shadow-[2px_2px_0px_#151515] -rotate-1 z-10">
                <span className="font-display text-[9px] sm:text-[10.5px] tracking-wider uppercase font-black block leading-tight">
                  SAME STAGE. DIFFERENT HEROES!
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Christ University Campus Dome */}
          <div className="bg-[#28A8EA] border-[3px] border-[#151515] rounded-2xl shadow-[4px_4px_0px_#151515] relative overflow-hidden min-h-[148px] sm:min-h-[165px] flex items-center justify-center">
            {/* Campus Dome Vector Illustration */}
            <ChristCampusDomeIllustration className="w-full h-full object-cover scale-105" />

            {/* Pinned Comic Dialogue Sticker */}
            <div className="absolute top-2 left-2 z-10 bg-white text-[#151515] border-2 border-[#151515] px-2 py-1 rounded-lg shadow-[2.5px_2.5px_0px_#151515] rotate-1 max-w-[130px] sm:max-w-[155px]">
              <span className="font-display text-[8.5px] sm:text-[9.5px] tracking-wide uppercase font-black block leading-tight text-center">
                CULTURE. CREATIVITY. COMMUNITY.
              </span>
            </div>
          </div>
        </section>

        {/* ── 2. MAIN 2x2 COMIC CATEGORY GRID ──────────────────── */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-3.5" aria-label="Event Categories">
          
          {/* 🎨 ARTS PANEL */}
          <Link
            to="/events?category=arts"
            className="group bg-[#E0245E] border-[3px] border-[#151515] rounded-2xl shadow-[4px_4px_0px_#151515] p-3 sm:p-4 relative overflow-hidden flex flex-col justify-between min-h-[175px] sm:min-h-[200px] hover:translate-y-[-2px] transition-transform block"
          >
            <HalftoneAccent color="yellow" className="opacity-15 group-hover:opacity-25 transition-opacity" />

            {/* Header / Titles */}
            <div className="relative z-10">
              <DisplayText as="h2" className="text-3xl sm:text-4xl text-white tracking-wide comic-title-pop">
                ARTS
              </DisplayText>
              <div className="inline-block mt-1 bg-[#FFD43B] text-[#151515] border-2 border-[#151515] px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_#151515] -rotate-1">
                <span className="font-display text-[9px] sm:text-[10px] tracking-wider uppercase font-black block">
                  PAINT. DESIGN. CREATE!
                </span>
              </div>
            </div>

            {/* Illustration */}
            <div className="absolute right-[-2px] bottom-0 pointer-events-none group-hover:scale-105 transition-transform">
              <ArtsPaletteIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            {/* Circular Arrow Action Button */}
            <div className="self-end mt-auto relative z-10">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#151515] shadow-[2px_2px_0px_#151515] flex items-center justify-center text-[#151515] font-black text-sm group-hover:bg-[#FFD43B] group-hover:translate-x-0.5 transition-all">
                →
              </div>
            </div>
          </Link>

          {/* 📚 LITERATURE PANEL */}
          <Link
            to="/events?category=literature"
            className="group bg-[#00A8FF] border-[3px] border-[#151515] rounded-2xl shadow-[4px_4px_0px_#151515] p-3 sm:p-4 relative overflow-hidden flex flex-col justify-between min-h-[175px] sm:min-h-[200px] hover:translate-y-[-2px] transition-transform block"
          >
            <HalftoneAccent color="yellow" className="opacity-15 group-hover:opacity-25 transition-opacity" />

            {/* Header / Titles */}
            <div className="relative z-10">
              <DisplayText as="h2" className="text-3xl sm:text-4xl text-white tracking-wide comic-title-pop">
                LITERATURE
              </DisplayText>
              <div className="inline-block mt-1 bg-[#FFD43B] text-[#151515] border-2 border-[#151515] px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_#151515] rotate-1">
                <span className="font-display text-[9px] sm:text-[10px] tracking-wider uppercase font-black block">
                  READ. WRITE. SPEAK!
                </span>
              </div>
            </div>

            {/* Illustration */}
            <div className="absolute right-[-2px] bottom-0 pointer-events-none group-hover:scale-105 transition-transform">
              <LiteratureBooksIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            {/* Circular Arrow Action Button */}
            <div className="self-end mt-auto relative z-10">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#151515] shadow-[2px_2px_0px_#151515] flex items-center justify-center text-[#151515] font-black text-sm group-hover:bg-[#FFD43B] group-hover:translate-x-0.5 transition-all">
                →
              </div>
            </div>
          </Link>

          {/* 🎭 STAGE PANEL */}
          <Link
            to="/events?category=stage"
            className="group bg-[#FF9F1C] border-[3px] border-[#151515] rounded-2xl shadow-[4px_4px_0px_#151515] p-3 sm:p-4 relative overflow-hidden flex flex-col justify-between min-h-[175px] sm:min-h-[200px] hover:translate-y-[-2px] transition-transform block"
          >
            <HalftoneAccent color="red" className="opacity-15 group-hover:opacity-25 transition-opacity" />

            {/* Header / Titles */}
            <div className="relative z-10">
              <DisplayText as="h2" className="text-3xl sm:text-4xl text-white tracking-wide comic-title-pop">
                STAGE
              </DisplayText>
              <div className="inline-block mt-1 bg-[#FFF8E8] text-[#151515] border-2 border-[#151515] px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_#151515] -rotate-1">
                <span className="font-display text-[9px] sm:text-[10px] tracking-wider uppercase font-black block">
                  PERFORM. SHINE!
                </span>
              </div>
            </div>

            {/* Illustration */}
            <div className="absolute right-[-2px] bottom-0 pointer-events-none group-hover:scale-105 transition-transform">
              <StageMicrophoneIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            {/* Circular Arrow Action Button */}
            <div className="self-end mt-auto relative z-10">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#151515] shadow-[2px_2px_0px_#151515] flex items-center justify-center text-[#151515] font-black text-sm group-hover:bg-[#FFD43B] group-hover:translate-x-0.5 transition-all">
                →
              </div>
            </div>
          </Link>

          {/* 🎬 THEATRE PANEL */}
          <Link
            to="/events?category=theatre"
            className="group bg-[#7C3AED] border-[3px] border-[#151515] rounded-2xl shadow-[4px_4px_0px_#151515] p-3 sm:p-4 relative overflow-hidden flex flex-col justify-between min-h-[175px] sm:min-h-[200px] hover:translate-y-[-2px] transition-transform block"
          >
            <HalftoneAccent color="yellow" className="opacity-15 group-hover:opacity-25 transition-opacity" />

            {/* Header / Titles */}
            <div className="relative z-10">
              <DisplayText as="h2" className="text-3xl sm:text-4xl text-white tracking-wide comic-title-pop">
                THEATRE
              </DisplayText>
              <div className="inline-block mt-1 bg-[#FFD43B] text-[#151515] border-2 border-[#151515] px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_#151515] rotate-1">
                <span className="font-display text-[8.5px] sm:text-[9.5px] tracking-wider uppercase font-black block">
                  ACT. EMOTE. BRING STORIES ALIVE!
                </span>
              </div>
            </div>

            {/* Illustration */}
            <div className="absolute right-[-2px] bottom-0 pointer-events-none group-hover:scale-105 transition-transform">
              <TheatreMasksIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>

            {/* Circular Arrow Action Button */}
            <div className="self-end mt-auto relative z-10">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#151515] shadow-[2px_2px_0px_#151515] flex items-center justify-center text-[#151515] font-black text-sm group-hover:bg-[#FFD43B] group-hover:translate-x-0.5 transition-all">
                →
              </div>
            </div>
          </Link>

        </section>

        {/* ── 3. FEATURE BANNER: EVENT SCHEDULE ────────────────── */}
        <section aria-label="Festival Timetable">
          <Link
            to="/schedule"
            className="group bg-[#DC2626] border-[3px] border-[#151515] rounded-2xl shadow-[4px_4px_0px_#151515] p-3.5 sm:p-4 flex items-center justify-between gap-3 relative overflow-hidden hover:translate-y-[-2px] transition-transform block"
          >
            <HalftoneAccent color="yellow" className="opacity-15 group-hover:opacity-25 transition-opacity" />

            <div className="flex items-center gap-3 relative z-10 min-w-0">
              {/* 3D Calendar Illustration */}
              <div className="flex-shrink-0 group-hover:rotate-3 transition-transform">
                <ScheduleCalendarIllustration className="w-14 h-14 sm:w-16 sm:h-16" />
              </div>

              {/* Text Info */}
              <div className="min-w-0">
                <DisplayText as="h3" className="text-2xl sm:text-3xl text-white tracking-wide comic-title-pop leading-tight">
                  EVENT SCHEDULE
                </DisplayText>
                <div className="mt-1 inline-block bg-white text-[#151515] border-2 border-[#151515] px-2.5 py-0.5 rounded-full shadow-[1.5px_1.5px_0px_#151515]">
                  <span className="font-display text-[9px] sm:text-[10px] tracking-wider uppercase font-black block">
                    DATES, TIMINGS &amp; VENUES
                  </span>
                </div>
              </div>
            </div>

            {/* Exploding Yellow Starburst: CHECK NOW! */}
            <div className="relative z-10 flex-shrink-0">
              <div className="bg-[#FFD43B] text-[#151515] border-[2.5px] border-[#151515] px-3 py-2 rounded-xl shadow-[3px_3px_0px_#151515] rotate-3 group-hover:scale-105 group-hover:rotate-6 transition-transform text-center">
                <span className="font-display text-xs sm:text-sm tracking-wider uppercase font-black block leading-none">
                  CHECK<br />NOW!
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* ── 4. FEATURE BANNER: ANNOUNCEMENTS ─────────────────── */}
        <section aria-label="Official Announcements">
          <Link
            to="/announcements"
            className="group bg-[#059669] border-[3px] border-[#151515] rounded-2xl shadow-[4px_4px_0px_#151515] p-3.5 sm:p-4 flex items-center justify-between gap-3 relative overflow-hidden hover:translate-y-[-2px] transition-transform block"
          >
            <HalftoneAccent color="yellow" className="opacity-15 group-hover:opacity-25 transition-opacity" />

            <div className="flex items-center gap-3 relative z-10 min-w-0">
              {/* Golden Megaphone Illustration */}
              <div className="flex-shrink-0 group-hover:-rotate-3 transition-transform">
                <AnnouncementsMegaphoneIllustration className="w-14 h-14 sm:w-16 sm:h-16" />
              </div>

              {/* Text Info */}
              <div className="min-w-0">
                <DisplayText as="h3" className="text-2xl sm:text-3xl text-white tracking-wide comic-title-pop leading-tight">
                  ANNOUNCEMENTS
                </DisplayText>
                <div className="mt-1 inline-block bg-white text-[#151515] border-2 border-[#151515] px-2.5 py-0.5 rounded-full shadow-[1.5px_1.5px_0px_#151515]">
                  <span className="font-display text-[9px] sm:text-[10px] tracking-wider uppercase font-black block">
                    STAY UPDATED
                  </span>
                </div>
              </div>
            </div>

            {/* Circular Arrow Action Button */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#151515] shadow-[2px_2px_0px_#151515] flex items-center justify-center text-[#151515] font-black text-sm group-hover:bg-[#FFD43B] group-hover:translate-x-0.5 transition-all">
                →
              </div>
            </div>
          </Link>
        </section>

      </div>
    </div>
  )
}
