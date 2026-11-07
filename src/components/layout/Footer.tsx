import { Link } from 'react-router-dom'
import blossomsLogoUrl from '@/assets/brand/blossoms-2026-27-lockup.webp'
import christLogoUrl from '@/assets/brand/christ-university.webp'
import docLogoUrl from '@/assets/brand/doc-mark-black.webp'
import docAnalyticaUrl from '@/assets/brand/doc-analytica.webp'

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t-[2.5px] border-ink bg-primary text-white mt-20 relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none halftone-dots-light" />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-5">
          <img src={blossomsLogoUrl} alt="Blossoms: Be the best, 2026–27" className="w-[280px] max-w-full h-auto" />
          <p className="text-sm text-white/90 max-w-md leading-relaxed">
            The official digital anthology of the annual cultural festival at CHRIST (Deemed to be University). Organised by the Department of Commerce.
          </p>
          <div className="inline-flex items-center gap-6 bg-caption-cream border-2 border-ink rounded-[14px] shadow-comic-sm px-5 py-3">
            <img src={christLogoUrl} alt="CHRIST (Deemed to be University)" className="h-11 w-auto" loading="lazy" decoding="async" />
            <img src={docLogoUrl} alt="Department of Commerce" className="h-9 w-auto" loading="lazy" decoding="async" />
          </div>
          <a
            href="https://docanalytica.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Doc Analytica (opens in a new tab)"
            onClick={(event) => {
              // Always a new tab, never replace the festival site.
              event.preventDefault()
              window.open("https://docanalytica.vercel.app/", "_blank", "noopener,noreferrer")
            }}
            className="flex w-fit items-center bg-white border-2 border-ink rounded-[14px] shadow-comic-sm px-4 py-2 hover:-translate-y-0.5 transition-transform"
          >
            <img src={docAnalyticaUrl} alt="Doc Analytica" className="h-14 w-auto" loading="lazy" decoding="async" />
          </a>
        </div>

        <nav aria-label="Footer navigation">
          <h3 className="font-display text-xl text-comic-yellow mb-3 tracking-wider uppercase flex items-center gap-1.5">
            <span aria-hidden="true">★</span> Quick Panels
          </h3>
          <ul className="flex flex-col gap-2 text-sm font-semibold">
            {[
              ['All Events', '/events'],
              ['The Timetable', '/schedule'],
              ['Announcements', '/announcements'],
              ['Hall of Fame', '/winners'],
              ['Photo Gallery', '/gallery'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link to={href} className="text-white/90 hover:text-comic-yellow transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 id="contact" className="font-display text-xl text-comic-yellow mb-3 tracking-wider uppercase flex items-center gap-1.5">
            <span aria-hidden="true">★</span> Contact Us
          </h3>
          <p className="text-sm text-white/90 leading-relaxed">
            Department of Commerce<br />
            CHRIST (Deemed to be University)<br />
            Hosur Road, Bengaluru – 560029
          </p>
          <p className="text-sm mt-3">
            <a href="mailto:doc@christuniversity.in" className="text-comic-yellow hover:underline">
              doc@christuniversity.in
            </a>
          </p>
          <p className="text-xs text-white/80 mt-3 leading-relaxed">
            Questions about an event? Its event heads are listed on the event&apos;s page.
          </p>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/20 py-4 text-center text-xs text-white/80">
        <p>© {CURRENT_YEAR} Blossoms Festival · CHRIST (Deemed to be University) · Edition 2026–27</p>
      </div>
    </footer>
  )
}
