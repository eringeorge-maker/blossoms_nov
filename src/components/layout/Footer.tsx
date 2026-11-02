import { Link } from 'react-router-dom'
import blossomsLogoUrl from '@/assets/brand/blossoms-2026-27-lockup.png'
import christLogoUrl from '@/assets/brand/christ-university.png'
import docLogoUrl from '@/assets/brand/doc-mark-black.png'

export function Footer() {
  return (
    <footer className="border-t-[2.5px] border-ink bg-primary text-white mt-20 relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none halftone-dots-light" />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-5">
          <img src={blossomsLogoUrl} alt="Blossoms: Be the best, 2026–27" className="w-[280px] max-w-full h-auto" />
          <p className="text-sm text-white/90 max-w-md leading-relaxed">
            The official digital anthology of the annual cultural festival at CHRIST (Deemed to be University), Central Campus. Organised by the Department of Commerce.
          </p>
          <div className="inline-flex items-center gap-6 bg-caption-cream border-2 border-ink rounded-[14px] shadow-comic-sm px-5 py-3">
            <img src={christLogoUrl} alt="CHRIST (Deemed to be University)" className="h-11 w-auto" />
            <img src={docLogoUrl} alt="Department of Commerce" className="h-9 w-auto" />
          </div>
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
              ['About Festival', '/about'],
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
          <h3 className="font-display text-xl text-comic-yellow mb-3 tracking-wider uppercase flex items-center gap-1.5">
            <span aria-hidden="true">★</span> Festival Office
          </h3>
          <p className="text-sm text-white/90 leading-relaxed">
            Department of Commerce<br />
            CHRIST (Deemed to be University)<br />
            Hosur Road, Bengaluru – 560029
          </p>
          <p className="text-sm text-comic-yellow mt-3">doc@christuniversity.in</p>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/20 py-4 text-center text-xs text-white/80">
        © {new Date().getFullYear()} Blossoms Festival · CHRIST (Deemed to be University) · Edition 2026–27
      </div>
    </footer>
  )
}
