import { Link } from 'react-router-dom'
import { ComicFivePanelGrid } from '@/components/comic/ComicFivePanelGrid'
import { DisplayText, HalftoneAccent } from '@/components/comic/ComicPrimitives'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5B82E] py-3 sm:py-6 px-3 sm:px-6">
      {/* ── Main Container ──────────────────────────────────── */}
      <div className="max-w-[880px] mx-auto space-y-4">
        
        {/* ── 1. VINTAGE COMIC ISSUE TOP MASTHEAD ─────────────── */}
        <header className="bg-white border-[3px] border-[#151515] rounded-2xl shadow-[4px_4px_0px_#151515] p-3 sm:p-4 flex items-center justify-between gap-3 relative overflow-hidden">
          <HalftoneAccent color="yellow" className="opacity-15" />

          {/* Left: Classic Vintage Issue Corner Box */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-[#151515] text-[#FFD43B] px-2.5 py-1.5 rounded-lg border-2 border-[#151515] text-center font-display leading-none">
              <span className="block text-[8px] tracking-widest uppercase font-sans font-bold text-white/70">ISSUE</span>
              <span className="text-xl sm:text-2xl font-black">#25</span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-[#DC2626] text-white px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider">
                  OFFICIAL
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-[#151515]">
                  CHRIST (DEEMED TO BE UNIVERSITY)
                </span>
              </div>
              <DisplayText as="h1" className="text-2xl sm:text-3xl text-[#DC2626] font-black tracking-tight leading-none mt-0.5">
                BLOSSOMS 2026
              </DisplayText>
            </div>
          </div>

          {/* Right: Narrative Slogan Sticker */}
          <div className="hidden sm:block relative z-10">
            <div className="bg-[#FFD43B] text-[#151515] border-2 border-[#151515] px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_#151515] -rotate-1 text-right">
              <span className="font-display text-[9.5px] uppercase font-black block tracking-wider leading-tight">
                SAME STAGE.
              </span>
              <span className="font-display text-[9.5px] uppercase font-black block tracking-wider leading-tight text-[#DC2626]">
                DIFFERENT HEROES!
              </span>
            </div>
          </div>
        </header>

        {/* ── 2. THE 5-PANEL COMIC PAGE (Matches User Reference Image) ── */}
        <section aria-label="Official Festival Category Panels">
          <ComicFivePanelGrid />
        </section>

        {/* ── 3. FEATURE QUICK-LINKS: SCHEDULE & ANNOUNCEMENTS ─── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="Festival Timetable and Updates">
          {/* Schedule Banner */}
          <Link
            to="/schedule"
            className="group bg-[#DC2626] border-[3px] border-[#151515] rounded-2xl shadow-[4px_4px_0px_#151515] p-3 sm:p-3.5 flex items-center justify-between gap-2.5 relative overflow-hidden hover:translate-y-[-2px] transition-transform block"
          >
            <HalftoneAccent color="yellow" className="opacity-15 group-hover:opacity-25 transition-opacity" />
            <div className="relative z-10">
              <DisplayText as="h3" className="text-xl sm:text-2xl text-white tracking-wide comic-title-pop leading-tight">
                EVENT SCHEDULE
              </DisplayText>
              <span className="font-display text-[9.5px] uppercase font-black text-white/90 block mt-0.5 tracking-wider">
                36 SESSIONS · DATES &amp; VENUES
              </span>
            </div>
            <div className="relative z-10 bg-[#FFD43B] text-[#151515] border-2 border-[#151515] px-2.5 py-1 rounded-xl shadow-[2px_2px_0px_#151515] group-hover:scale-105 transition-transform font-display text-xs font-black uppercase">
              CHECK →
            </div>
          </Link>

          {/* Announcements Banner */}
          <Link
            to="/announcements"
            className="group bg-[#059669] border-[3px] border-[#151515] rounded-2xl shadow-[4px_4px_0px_#151515] p-3 sm:p-3.5 flex items-center justify-between gap-2.5 relative overflow-hidden hover:translate-y-[-2px] transition-transform block"
          >
            <HalftoneAccent color="yellow" className="opacity-15 group-hover:opacity-25 transition-opacity" />
            <div className="relative z-10">
              <DisplayText as="h3" className="text-xl sm:text-2xl text-white tracking-wide comic-title-pop leading-tight">
                ANNOUNCEMENTS
              </DisplayText>
              <span className="font-display text-[9.5px] uppercase font-black text-white/90 block mt-0.5 tracking-wider">
                LATEST BULLETINS &amp; ALERTS
              </span>
            </div>
            <div className="relative z-10 bg-white text-[#151515] border-2 border-[#151515] px-2.5 py-1 rounded-xl shadow-[2px_2px_0px_#151515] group-hover:scale-105 transition-transform font-display text-xs font-black uppercase">
              VIEW →
            </div>
          </Link>
        </section>

      </div>
    </div>
  )
}
