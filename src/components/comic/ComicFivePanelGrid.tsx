import { useNavigate } from 'react-router-dom'

/**
 * Authentic 5-Panel Comic Page Grid
 * Recreates the exact dynamic, angled-gutter comic book page layout from user reference.
 * Features 5 distinct event category panels with authentic Ben-Day halftone dot screens,
 * angled white gutters, heavy black ink outlines, and 3D pop comic typography.
 */
export function ComicFivePanelGrid() {
  const navigate = useNavigate()

  function handlePanelClick(slug: string) {
    navigate(`/events?category=${slug}`)
  }

  return (
    <div className="w-full max-w-[620px] mx-auto select-none">
      {/* ── Outer Comic Page Frame ─────────────────────────── */}
      <div className="relative bg-white p-2.5 sm:p-3 rounded-2xl border-[4px] border-[#151515] shadow-[6px_8px_0px_#151515]">
        <svg
          viewBox="0 0 600 880"
          className="w-full h-auto overflow-hidden rounded-xl bg-white block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* ── 1. Authentic Ben-Day Halftone Dot Patterns ──── */}
            <pattern
              id="comic-halftone"
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <circle cx="7" cy="7" r="4.6" fill="#000000" />
            </pattern>

            <pattern
              id="comic-halftone-dense"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <circle cx="6" cy="6" r="4.2" fill="#000000" />
            </pattern>

            {/* ── 2. Gradient Masks for Halftone Fading (Matches Image 1) ── */}
            {/* Panel 1: Cyan Blue (Top Left -> Bottom Right fade) */}
            <linearGradient id="fade-panel-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.18" />
              <stop offset="95%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <mask id="mask-p1">
              <rect x="0" y="0" width="600" height="880" fill="url(#fade-panel-1)" />
            </mask>

            {/* Panel 2: Crimson Red (Bottom Right -> Top Left fade) */}
            <linearGradient id="fade-panel-2" x1="1" y1="1" x2="0.05" y2="0.05">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.60" />
              <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <mask id="mask-p2">
              <rect x="0" y="0" width="600" height="880" fill="url(#fade-panel-2)" />
            </mask>

            {/* Panel 3: Hot Magenta (Bottom Left -> Top Right fade) */}
            <linearGradient id="fade-panel-3" x1="0" y1="1" x2="0.9" y2="0.1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <mask id="mask-p3">
              <rect x="0" y="0" width="600" height="880" fill="url(#fade-panel-3)" />
            </mask>

            {/* Panel 4: Warm Yellow (Bottom -> Top fade) */}
            <linearGradient id="fade-panel-4" x1="0.5" y1="1" x2="0.5" y2="0.05">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.52" />
              <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <mask id="mask-p4">
              <rect x="0" y="0" width="600" height="880" fill="url(#fade-panel-4)" />
            </mask>

            {/* Panel 5: Deep Violet/Purple (Bottom & Corners -> Center fade) */}
            <radialGradient id="fade-panel-5" cx="50%" cy="50%" r="65%">
              <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
            </radialGradient>
            <mask id="mask-p5">
              <rect x="0" y="0" width="600" height="880" fill="url(#fade-panel-5)" />
            </mask>

            {/* ── 3. ClipPaths for the 5 Dynamic Angled Panels ─── */}
            {/* Panel 1: Top-Left (LITERATURE) */}
            <clipPath id="clip-p1">
              <polygon points="12,12 296,12 346,260 12,248" />
            </clipPath>

            {/* Panel 2: Top-Right (ARTS) */}
            <clipPath id="clip-p2">
              <polygon points="306,12 588,12 588,286 356,260" />
            </clipPath>

            {/* Panel 3: Mid-Left (STAGE) */}
            <clipPath id="clip-p3">
              <polygon points="12,258 242,272 186,560 12,560" />
            </clipPath>

            {/* Panel 4: Mid-Right (THEATRE) */}
            <clipPath id="clip-p4">
              <polygon points="252,272 588,296 588,560 196,560" />
            </clipPath>

            {/* Panel 5: Bottom Wide Panel (SPECIAL EVENTS) */}
            <clipPath id="clip-p5">
              <polygon points="12,570 588,570 588,868 12,868" />
            </clipPath>
          </defs>

          {/* ═════════════════════════════════════════════════════ */}
          {/* ── PANEL 1: TOP LEFT · CYAN BLUE · LITERATURE ─────── */}
          {/* ═════════════════════════════════════════════════════ */}
          <g
            className="cursor-pointer transition-transform hover:opacity-95"
            onClick={() => handlePanelClick('literature')}
            tabIndex={0}
            role="button"
            aria-label="Literature Events - Read, Write, Speak"
          >
            {/* Base Color Fill */}
            <polygon
              points="12,12 296,12 346,260 12,248"
              fill="#009EE3"
            />
            {/* Ben-Day Halftone Dot Screen with Gradient Mask */}
            <g clipPath="url(#clip-p1)">
              <rect
                x="0"
                y="0"
                width="600"
                height="880"
                fill="url(#comic-halftone)"
                mask="url(#mask-p1)"
              />

              {/* Background Comic Burst Silhouette */}
              <text
                x="220"
                y="85"
                fill="#FFFFFF"
                opacity="0.22"
                fontFamily="Bangers, Impact, system-ui, sans-serif"
                fontSize="62"
                fontWeight="900"
                transform="rotate(-8 220 85)"
              >
                WORDS!
              </text>

              {/* Top Narrative Sticker */}
              <g transform="translate(26, 26)">
                <rect
                  x="0"
                  y="0"
                  width="132"
                  height="22"
                  rx="3"
                  fill="#FFD43B"
                  stroke="#151515"
                  strokeWidth="2"
                />
                <text
                  x="66"
                  y="15"
                  textAnchor="middle"
                  fill="#151515"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="9.5"
                  letterSpacing="0.8"
                >
                  ★ READ · WRITE · SPEAK
                </text>
              </g>

              {/* Main Comic Title */}
              <g transform="translate(26, 105)">
                {/* 3D Black Shadow */}
                <text
                  x="3"
                  y="3"
                  fill="#151515"
                  fontFamily="Bangers, Impact, system-ui, sans-serif"
                  fontSize="46"
                  fontWeight="900"
                  letterSpacing="1.5"
                >
                  LITERATURE
                </text>
                {/* Crisp White Fill with Black Stroke */}
                <text
                  x="0"
                  y="0"
                  fill="#FFFFFF"
                  stroke="#151515"
                  strokeWidth="3.5"
                  paintOrder="stroke fill"
                  fontFamily="Bangers, Impact, system-ui, sans-serif"
                  fontSize="46"
                  fontWeight="900"
                  letterSpacing="1.5"
                >
                  LITERATURE
                </text>
              </g>

              {/* Action Slogan */}
              <text
                x="28"
                y="134"
                fill="#FFEB99"
                fontFamily="system-ui, sans-serif"
                fontWeight="900"
                fontSize="10"
                letterSpacing="0.8"
              >
                DEBATE · QUIZ · JAM · WRITING
              </text>

              {/* Action Button Pill */}
              <g transform="translate(28, 178)">
                <rect
                  x="0"
                  y="0"
                  width="106"
                  height="26"
                  rx="13"
                  fill="#FFFFFF"
                  stroke="#151515"
                  strokeWidth="2.5"
                />
                <text
                  x="45"
                  y="17"
                  textAnchor="middle"
                  fill="#151515"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="10.5"
                  letterSpacing="0.5"
                >
                  8 EVENTS
                </text>
                <circle cx="92" cy="13" r="8" fill="#FFD43B" stroke="#151515" strokeWidth="1.5" />
                <text x="92" y="16.5" textAnchor="middle" fill="#151515" fontWeight="900" fontSize="10">→</text>
              </g>
            </g>

            {/* Heavy Black Inked Panel Border */}
            <polygon
              points="12,12 296,12 346,260 12,248"
              fill="none"
              stroke="#151515"
              strokeWidth="4"
              strokeLinejoin="miter"
            />
          </g>

          {/* ═════════════════════════════════════════════════════ */}
          {/* ── PANEL 2: TOP RIGHT · CRIMSON RED · ARTS ────────── */}
          {/* ═════════════════════════════════════════════════════ */}
          <g
            className="cursor-pointer transition-transform hover:opacity-95"
            onClick={() => handlePanelClick('arts')}
            tabIndex={0}
            role="button"
            aria-label="Arts Events - Paint, Design, Create"
          >
            {/* Base Color Fill */}
            <polygon
              points="306,12 588,12 588,286 356,260"
              fill="#E5004F"
            />
            {/* Ben-Day Halftone Dot Screen with Gradient Mask */}
            <g clipPath="url(#clip-p2)">
              <rect
                x="0"
                y="0"
                width="600"
                height="880"
                fill="url(#comic-halftone)"
                mask="url(#mask-p2)"
              />

              {/* Background Comic Burst Silhouette */}
              <text
                x="485"
                y="85"
                fill="#FFFFFF"
                opacity="0.22"
                fontFamily="Bangers, Impact, system-ui, sans-serif"
                fontSize="68"
                fontWeight="900"
                transform="rotate(6 485 85)"
              >
                CREATE!
              </text>

              {/* Top Narrative Sticker (Positioned inside red polygon) */}
              <g transform="translate(370, 26)">
                <rect
                  x="0"
                  y="0"
                  width="136"
                  height="22"
                  rx="3"
                  fill="#FFD43B"
                  stroke="#151515"
                  strokeWidth="2"
                />
                <text
                  x="68"
                  y="15"
                  textAnchor="middle"
                  fill="#151515"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="9.5"
                  letterSpacing="0.8"
                >
                  ★ PAINT · DESIGN · CREATE
                </text>
              </g>

              {/* Main Comic Title */}
              <g transform="translate(372, 105)">
                {/* 3D Black Shadow */}
                <text
                  x="3"
                  y="3"
                  fill="#151515"
                  fontFamily="Bangers, Impact, system-ui, sans-serif"
                  fontSize="50"
                  fontWeight="900"
                  letterSpacing="2"
                >
                  ARTS
                </text>
                {/* Crisp White Fill with Black Stroke */}
                <text
                  x="0"
                  y="0"
                  fill="#FFFFFF"
                  stroke="#151515"
                  strokeWidth="3.5"
                  paintOrder="stroke fill"
                  fontFamily="Bangers, Impact, system-ui, sans-serif"
                  fontSize="50"
                  fontWeight="900"
                  letterSpacing="2"
                >
                  ARTS
                </text>
              </g>

              {/* Action Slogan */}
              <text
                x="374"
                y="134"
                fill="#FFEB99"
                fontFamily="system-ui, sans-serif"
                fontWeight="900"
                fontSize="10"
                letterSpacing="0.8"
              >
                SKETCH · PAINT · CRAFT · POT
              </text>

              {/* Action Button Pill */}
              <g transform="translate(374, 178)">
                <rect
                  x="0"
                  y="0"
                  width="112"
                  height="26"
                  rx="13"
                  fill="#FFFFFF"
                  stroke="#151515"
                  strokeWidth="2.5"
                />
                <text
                  x="48"
                  y="17"
                  textAnchor="middle"
                  fill="#151515"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="10.5"
                  letterSpacing="0.5"
                >
                  10 EVENTS
                </text>
                <circle cx="98" cy="13" r="8" fill="#FFD43B" stroke="#151515" strokeWidth="1.5" />
                <text x="98" y="16.5" textAnchor="middle" fill="#151515" fontWeight="900" fontSize="10">→</text>
              </g>
            </g>

            {/* Heavy Black Inked Panel Border */}
            <polygon
              points="306,12 588,12 588,286 356,260"
              fill="none"
              stroke="#151515"
              strokeWidth="4"
              strokeLinejoin="miter"
            />
          </g>

          {/* ═════════════════════════════════════════════════════ */}
          {/* ── PANEL 3: MID LEFT · HOT MAGENTA · STAGE ────────── */}
          {/* ═════════════════════════════════════════════════════ */}
          <g
            className="cursor-pointer transition-transform hover:opacity-95"
            onClick={() => handlePanelClick('stage')}
            tabIndex={0}
            role="button"
            aria-label="Stage Events - Perform, Shine"
          >
            {/* Base Color Fill */}
            <polygon
              points="12,258 242,272 186,560 12,560"
              fill="#E4007F"
            />
            {/* Ben-Day Halftone Dot Screen with Gradient Mask */}
            <g clipPath="url(#clip-p3)">
              <rect
                x="0"
                y="0"
                width="600"
                height="880"
                fill="url(#comic-halftone-dense)"
                mask="url(#mask-p3)"
              />

              {/* Background Comic Burst Silhouette */}
              <text
                x="90"
                y="430"
                fill="#FFFFFF"
                opacity="0.18"
                fontFamily="Bangers, Impact, system-ui, sans-serif"
                fontSize="64"
                fontWeight="900"
                transform="rotate(-15 90 430)"
              >
                ROAR!
              </text>

              {/* Top Narrative Sticker */}
              <g transform="translate(24, 280)">
                <rect
                  x="0"
                  y="0"
                  width="122"
                  height="22"
                  rx="3"
                  fill="#FFD43B"
                  stroke="#151515"
                  strokeWidth="2"
                />
                <text
                  x="61"
                  y="15"
                  textAnchor="middle"
                  fill="#151515"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="9.5"
                  letterSpacing="0.8"
                >
                  ★ PERFORM · SHINE
                </text>
              </g>

              {/* Main Comic Title */}
              <g transform="translate(24, 365)">
                {/* 3D Black Shadow */}
                <text
                  x="3"
                  y="3"
                  fill="#151515"
                  fontFamily="Bangers, Impact, system-ui, sans-serif"
                  fontSize="48"
                  fontWeight="900"
                  letterSpacing="2"
                >
                  STAGE
                </text>
                {/* Crisp White Fill with Black Stroke */}
                <text
                  x="0"
                  y="0"
                  fill="#FFFFFF"
                  stroke="#151515"
                  strokeWidth="3.5"
                  paintOrder="stroke fill"
                  fontFamily="Bangers, Impact, system-ui, sans-serif"
                  fontSize="48"
                  fontWeight="900"
                  letterSpacing="2"
                >
                  STAGE
                </text>
              </g>

              {/* Action Slogan */}
              <text
                x="26"
                y="395"
                fill="#FFEB99"
                fontFamily="system-ui, sans-serif"
                fontWeight="900"
                fontSize="10"
                letterSpacing="0.8"
              >
                BANDS · DANCE · VOCALS · DUET
              </text>

              {/* Action Button Pill */}
              <g transform="translate(26, 490)">
                <rect
                  x="0"
                  y="0"
                  width="116"
                  height="26"
                  rx="13"
                  fill="#FFFFFF"
                  stroke="#151515"
                  strokeWidth="2.5"
                />
                <text
                  x="51"
                  y="17"
                  textAnchor="middle"
                  fill="#151515"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="10.5"
                  letterSpacing="0.5"
                >
                  8 SHOWDOWNS
                </text>
                <circle cx="102" cy="13" r="8" fill="#FFD43B" stroke="#151515" strokeWidth="1.5" />
                <text x="102" y="16.5" textAnchor="middle" fill="#151515" fontWeight="900" fontSize="10">→</text>
              </g>
            </g>

            {/* Heavy Black Inked Panel Border */}
            <polygon
              points="12,258 242,272 186,560 12,560"
              fill="none"
              stroke="#151515"
              strokeWidth="4"
              strokeLinejoin="miter"
            />
          </g>

          {/* ═════════════════════════════════════════════════════ */}
          {/* ── PANEL 4: MID RIGHT · GOLD YELLOW · THEATRE ─────── */}
          {/* ═════════════════════════════════════════════════════ */}
          <g
            className="cursor-pointer transition-transform hover:opacity-95"
            onClick={() => handlePanelClick('theatre')}
            tabIndex={0}
            role="button"
            aria-label="Theatre Events - Act, Emote, Drama"
          >
            {/* Base Color Fill */}
            <polygon
              points="252,272 588,296 588,560 196,560"
              fill="#FFD100"
            />
            {/* Ben-Day Halftone Dot Screen with Gradient Mask */}
            <g clipPath="url(#clip-p4)">
              <rect
                x="0"
                y="0"
                width="600"
                height="880"
                fill="url(#comic-halftone)"
                mask="url(#mask-p4)"
              />

              {/* Background Comic Burst Silhouette */}
              <text
                x="410"
                y="410"
                fill="#151515"
                opacity="0.12"
                fontFamily="Bangers, Impact, system-ui, sans-serif"
                fontSize="68"
                fontWeight="900"
                transform="rotate(5 410 410)"
              >
                DRAMA!
              </text>

              {/* Top Narrative Sticker */}
              <g transform="translate(268, 305)">
                <rect
                  x="0"
                  y="0"
                  width="132"
                  height="22"
                  rx="3"
                  fill="#FFFFFF"
                  stroke="#151515"
                  strokeWidth="2"
                />
                <text
                  x="66"
                  y="15"
                  textAnchor="middle"
                  fill="#151515"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="9.5"
                  letterSpacing="0.8"
                >
                  ★ ACT · EMOTE · DRAMA
                </text>
              </g>

              {/* Main Comic Title */}
              <g transform="translate(268, 375)">
                {/* 3D Black Shadow */}
                <text
                  x="3"
                  y="3"
                  fill="#151515"
                  fontFamily="Bangers, Impact, system-ui, sans-serif"
                  fontSize="50"
                  fontWeight="900"
                  letterSpacing="2"
                >
                  THEATRE
                </text>
                {/* Crisp White Fill with Black Stroke */}
                <text
                  x="0"
                  y="0"
                  fill="#FFFFFF"
                  stroke="#151515"
                  strokeWidth="3.5"
                  paintOrder="stroke fill"
                  fontFamily="Bangers, Impact, system-ui, sans-serif"
                  fontSize="50"
                  fontWeight="900"
                  letterSpacing="2"
                >
                  THEATRE
                </text>
              </g>

              {/* Action Slogan */}
              <text
                x="270"
                y="405"
                fill="#151515"
                fontFamily="system-ui, sans-serif"
                fontWeight="900"
                fontSize="10"
                letterSpacing="0.8"
              >
                PROSCENIUM · STREET PLAY · MIME · SHORT FILM
              </text>

              {/* Action Button Pill */}
              <g transform="translate(270, 490)">
                <rect
                  x="0"
                  y="0"
                  width="126"
                  height="26"
                  rx="13"
                  fill="#151515"
                  stroke="#151515"
                  strokeWidth="2.5"
                />
                <text
                  x="56"
                  y="17"
                  textAnchor="middle"
                  fill="#FFD43B"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="10.5"
                  letterSpacing="0.5"
                >
                  5 PRODUCTIONS
                </text>
                <circle cx="112" cy="13" r="8" fill="#FFFFFF" stroke="#151515" strokeWidth="1.5" />
                <text x="112" y="16.5" textAnchor="middle" fill="#151515" fontWeight="900" fontSize="10">→</text>
              </g>
            </g>

            {/* Heavy Black Inked Panel Border */}
            <polygon
              points="252,272 588,296 588,560 196,560"
              fill="none"
              stroke="#151515"
              strokeWidth="4"
              strokeLinejoin="miter"
            />
          </g>

          {/* ═════════════════════════════════════════════════════ */}
          {/* ── PANEL 5: BOTTOM FULL · DEEP PURPLE · SPECIALS ─── */}
          {/* ═════════════════════════════════════════════════════ */}
          <g
            className="cursor-pointer transition-transform hover:opacity-95"
            onClick={() => handlePanelClick('special-events')}
            tabIndex={0}
            role="button"
            aria-label="Special Events - Inauguration and Valedictory Ceremonies"
          >
            {/* Base Color Fill */}
            <polygon
              points="12,570 588,570 588,868 12,868"
              fill="#7928CA"
            />
            {/* Ben-Day Halftone Dot Screen with Gradient Mask */}
            <g clipPath="url(#clip-p5)">
              <rect
                x="0"
                y="0"
                width="600"
                height="880"
                fill="url(#comic-halftone)"
                mask="url(#mask-p5)"
              />

              {/* Background Comic Burst Silhouette */}
              <text
                x="300"
                y="740"
                textAnchor="middle"
                fill="#FFFFFF"
                opacity="0.14"
                fontFamily="Bangers, Impact, system-ui, sans-serif"
                fontSize="110"
                fontWeight="900"
              >
                LEGEND!
              </text>

              {/* Top Narrative Sticker */}
              <g transform="translate(30, 592)">
                <rect
                  x="0"
                  y="0"
                  width="186"
                  height="22"
                  rx="3"
                  fill="#FFD43B"
                  stroke="#151515"
                  strokeWidth="2"
                />
                <text
                  x="93"
                  y="15"
                  textAnchor="middle"
                  fill="#151515"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="9.5"
                  letterSpacing="0.8"
                >
                  ★ FESTIVAL HEADLINERS &amp; CEREMONIES
                </text>
              </g>

              {/* Title */}
              <g transform="translate(32, 665)">
                {/* 3D Black Shadow */}
                <text
                  x="3"
                  y="3"
                  fill="#151515"
                  fontFamily="Bangers, Impact, system-ui, sans-serif"
                  fontSize="50"
                  fontWeight="900"
                  letterSpacing="2"
                >
                  SPECIAL EVENTS
                </text>
                {/* Crisp White Fill with Black Stroke */}
                <text
                  x="0"
                  y="0"
                  fill="#FFFFFF"
                  stroke="#151515"
                  strokeWidth="3.5"
                  paintOrder="stroke fill"
                  fontFamily="Bangers, Impact, system-ui, sans-serif"
                  fontSize="50"
                  fontWeight="900"
                  letterSpacing="2"
                >
                  SPECIAL EVENTS
                </text>
              </g>

              {/* Slogan & Ceremony Info */}
              <text
                x="34"
                y="698"
                fill="#FFEB99"
                fontFamily="system-ui, sans-serif"
                fontWeight="900"
                fontSize="11.5"
                letterSpacing="0.8"
              >
                BLOSSOMS INAUGURATION (12 NOV) · GRAND VALEDICTORY (MAIN AUDI)
              </text>

              <text
                x="34"
                y="722"
                fill="#FFFFFF"
                opacity="0.85"
                fontFamily="system-ui, sans-serif"
                fontWeight="600"
                fontSize="10"
              >
                Bird's Park Amphitheatre, Campus Quadrangle &amp; Main Auditorium Ceremonies
              </text>

              {/* Action Button Pill */}
              <g transform="translate(34, 755)">
                <rect
                  x="0"
                  y="0"
                  width="170"
                  height="30"
                  rx="15"
                  fill="#FFD43B"
                  stroke="#151515"
                  strokeWidth="2.5"
                />
                <text
                  x="78"
                  y="19"
                  textAnchor="middle"
                  fill="#151515"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="11"
                  letterSpacing="0.8"
                >
                  EXPLORE CEREMONIES
                </text>
                <circle cx="152" cy="15" r="9" fill="#FFFFFF" stroke="#151515" strokeWidth="2" />
                <text x="152" y="19" textAnchor="middle" fill="#151515" fontWeight="900" fontSize="11">→</text>
              </g>
            </g>

            {/* Heavy Black Inked Panel Border */}
            <polygon
              points="12,570 588,570 588,868 12,868"
              fill="none"
              stroke="#151515"
              strokeWidth="4"
              strokeLinejoin="miter"
            />
          </g>
        </svg>
      </div>
    </div>
  )
}
