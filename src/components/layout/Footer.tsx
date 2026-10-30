import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t-[3px] border-ink bg-[#151515] text-[#FFF8E8] mt-20 relative overflow-hidden">
      {/* Halftone ambient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10 pointer-events-none bended-dots"
      />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column with Comic Seal */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#F04438] border-2 border-white flex items-center justify-center font-display text-xl text-white">
              B
            </span>
            <span className="font-display text-4xl text-[#FFD43B] tracking-wider uppercase leading-none">
              Blossoms '25
            </span>
          </div>
          <p className="text-sm text-[#FFF8E8]/80 max-w-md leading-relaxed">
            The official digital anthology of the annual cultural festival at CHRIST (Deemed to be University), Central Campus. Organised and curated by the Department of Cultures (DOC).
          </p>

          <div className="inline-flex items-center gap-2 bg-[#1C1C1C] border border-white/20 px-3 py-1.5 rounded-lg text-xs font-mono text-[#FFD43B]">
            <Sparkles className="w-3.5 h-3.5 text-[#F04438]" />
            <span>APPROVED BY DOC COMICS GROUP · VOL. 2025</span>
          </div>
        </div>

        {/* Quick Links */}
        <nav aria-label="Footer navigation">
          <h3 className="font-display text-xl text-[#FFD43B] mb-3 tracking-wider uppercase flex items-center gap-1.5">
            <span>★</span> Quick Panels
          </h3>
          <ul className="flex flex-col gap-2 text-sm font-semibold">
            {[
              ['All Events', '/events'],
              ['The Timetable', '/schedule'],
              ['Announcements', '/announcements'],
              ['About Festival', '/about'],
              ['Hall of Fame', '/winners'],
              ['Photo Gallery', '/gallery'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link to={href} className="text-[#FFF8E8]/75 hover:text-[#FFD43B] transition-colors flex items-center gap-1.5">
                  <span className="text-[#F04438] text-xs">▸</span> {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact & Barcode */}
        <div className="space-y-4">
          <h3 className="font-display text-xl text-[#FFD43B] mb-3 tracking-wider uppercase flex items-center gap-1.5">
            <span>★</span> Festival Office
          </h3>
          <p className="text-sm text-[#FFF8E8]/75 leading-relaxed">
            Department of Cultures (DOC)<br />
            CHRIST (Deemed to be University)<br />
            Hosur Road, Bengaluru – 560029
          </p>
          <p className="text-xs text-[#FFD43B] font-mono">
            doc@christuniversity.in
          </p>

          {/* Comic Barcode Stamp */}
          <div className="pt-2">
            <div className="bg-white text-black p-2 border border-black inline-block font-mono text-[9px] tracking-widest text-center shadow-[2px_2px_0px_#F04438]">
              <div className="flex items-center justify-center gap-[2px] h-6 mb-1">
                <span className="w-[2px] h-full bg-black"></span>
                <span className="w-[1px] h-full bg-black"></span>
                <span className="w-[3px] h-full bg-black"></span>
                <span className="w-[1px] h-full bg-black"></span>
                <span className="w-[2px] h-full bg-black"></span>
                <span className="w-[4px] h-full bg-black"></span>
                <span className="w-[1px] h-full bg-black"></span>
                <span className="w-[3px] h-full bg-black"></span>
                <span className="w-[2px] h-full bg-black"></span>
                <span className="w-[1px] h-full bg-black"></span>
                <span className="w-[3px] h-full bg-black"></span>
                <span className="w-[2px] h-full bg-black"></span>
              </div>
              BLOSSOMS-2025-DOC
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-[#FFF8E8]/40 font-mono">
        © {new Date().getFullYear()} Blossoms Festival · CHRIST (Deemed to be University) · Comics Theme Edition
      </div>
    </footer>
  )
}
