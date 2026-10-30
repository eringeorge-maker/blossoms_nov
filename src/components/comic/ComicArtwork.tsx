/** 
 * Authentic Hand-Crafted Comic Vector Illustrations
 * High-definition vector art with bold black ink outlines, hatching, and pop colors.
 */

// ── 1. Christ University Campus Central Block & Dome ───────────
export function ChristCampusDomeIllustration({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Comic Blue Sky & Sunburst */}
      <rect width="200" height="160" fill="#38B6FF" />
      <path d="M0 0L200 160M200 0L0 160M100 0V160M0 80H200" stroke="#5CC7FF" strokeWidth="6" opacity="0.4" />
      
      {/* Fluffy Comic Cloud */}
      <path
        d="M20 40C20 30 32 24 42 28C48 20 62 20 68 28C76 26 84 32 84 40C88 44 86 52 80 56C80 58 40 58 30 56C22 52 18 46 20 40Z"
        fill="#FFFFFF"
        stroke="#151515"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Background Campus Trees */}
      <circle cx="15" cy="135" r="18" fill="#10B981" stroke="#151515" strokeWidth="2.5" />
      <circle cx="32" cy="140" r="14" fill="#059669" stroke="#151515" strokeWidth="2.5" />
      <circle cx="185" cy="135" r="20" fill="#10B981" stroke="#151515" strokeWidth="2.5" />

      {/* Main Campus Sandstone Facade */}
      <rect x="75" y="70" width="110" height="75" fill="#E8B86D" stroke="#151515" strokeWidth="3" />
      {/* Architectural Windows */}
      <path d="M88 85H102V105H88Z M115 85H129V105H115Z M142 85H156V105H142Z M168 85H180V105H168Z" fill="#151515" />
      <path d="M88 115H102V140H88Z M115 115H129V140H115Z M142 115H156V140H142Z M168 115H180V140H168Z" fill="#151515" />

      {/* Iconic Central Dome Tower */}
      <rect x="110" y="45" width="55" height="30" fill="#D69E4E" stroke="#151515" strokeWidth="3" />
      <path d="M110 45C110 20 165 20 165 45H110Z" fill="#2A75D3" stroke="#151515" strokeWidth="3" />
      {/* Dome Ribs */}
      <path d="M137.5 22V45 M122 28C125 35 125 45 125 45 M153 28C150 35 150 45 150 45" stroke="#151515" strokeWidth="2" />
      {/* Dome Finial Cross */}
      <path d="M137.5 12V22 M134 16H141" stroke="#FFD43B" strokeWidth="3" strokeLinecap="round" />

      {/* Central Block Classical Pediment / Arches */}
      <polygon points="110,48 137.5,35 165,48" fill="#FCE7A6" stroke="#151515" strokeWidth="2.5" />

      {/* Ink Hatching Details */}
      <path d="M78 80H182 M78 110H182" stroke="#151515" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  )
}

// ── 2. ARTS: Painter's Palette & Brushes ───────────────────────
export function ArtsPaletteIllustration({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Angled Paintbrush 1 */}
      <g transform="rotate(-30 60 60)">
        <path d="M72 15L78 40L68 40L74 15Z" fill="#151515" />
        <path d="M68 40H78V58H68Z" fill="#D1D5DB" stroke="#151515" strokeWidth="2" />
        <path d="M70 58L72 105L74 105L76 58Z" fill="#B45309" stroke="#151515" strokeWidth="2.5" />
      </g>

      {/* Angled Paintbrush 2 */}
      <g transform="rotate(15 60 60)">
        <path d="M62 8L68 32L58 32L64 8Z" fill="#F04438" />
        <path d="M58 32H68V48H58Z" fill="#E5E7EB" stroke="#151515" strokeWidth="2" />
        <path d="M60 48L62 100L64 100L66 48Z" fill="#92400E" stroke="#151515" strokeWidth="2.5" />
      </g>

      {/* Wooden Painter's Palette with Drop Shadow */}
      <path
        d="M25 65C18 45 35 25 58 25C82 25 100 40 102 62C104 82 85 98 68 98C58 98 52 92 46 92C38 92 34 98 25 90C16 82 20 72 25 65Z"
        fill="#151515"
        transform="translate(4, 4)"
      />
      <path
        d="M25 65C18 45 35 25 58 25C82 25 100 40 102 62C104 82 85 98 68 98C58 98 52 92 46 92C38 92 34 98 25 90C16 82 20 72 25 65Z"
        fill="#FBBF24"
        stroke="#151515"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Palette Thumb Hole */}
      <ellipse cx="38" cy="78" rx="7" ry="9" fill="#E91E63" stroke="#151515" strokeWidth="2.5" />

      {/* Vibrant Paint Blobs */}
      <circle cx="45" cy="40" r="7" fill="#3B82F6" stroke="#151515" strokeWidth="2" />
      <circle cx="64" cy="35" r="8" fill="#EF4444" stroke="#151515" strokeWidth="2" />
      <circle cx="84" cy="45" r="7" fill="#10B981" stroke="#151515" strokeWidth="2" />
      <circle cx="90" cy="65" r="8" fill="#8B5CF6" stroke="#151515" strokeWidth="2" />
      <circle cx="75" cy="82" r="7" fill="#F97316" stroke="#151515" strokeWidth="2" />

      {/* Wet paint gloss marks */}
      <path d="M43 38C44 36 46 36 47 38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M62 33C63 31 66 31 67 33" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ── 3. LITERATURE: Stack of Books & Feather Quill ─────────────
export function LiteratureBooksIllustration({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Book 1 (Bottom - Blue) */}
      <g>
        <rect x="20" y="82" width="75" height="18" rx="2" fill="#151515" transform="translate(3, 3)" />
        <rect x="20" y="82" width="75" height="18" rx="2" fill="#1D4ED8" stroke="#151515" strokeWidth="3" />
        <rect x="30" y="85" width="62" height="12" fill="#FFFFFF" stroke="#151515" strokeWidth="1.5" />
        <line x1="25" y1="83" x2="25" y2="99" stroke="#FFD43B" strokeWidth="3" />
      </g>

      {/* Book 2 (Middle - Red) */}
      <g transform="rotate(-3 55 70)">
        <rect x="22" y="66" width="70" height="17" rx="2" fill="#151515" transform="translate(3, 3)" />
        <rect x="22" y="66" width="70" height="17" rx="2" fill="#DC2626" stroke="#151515" strokeWidth="3" />
        <rect x="32" y="69" width="57" height="11" fill="#FFFFFF" stroke="#151515" strokeWidth="1.5" />
        <line x1="27" y1="67" x2="27" y2="82" stroke="#FFD43B" strokeWidth="3" />
      </g>

      {/* Book 3 (Top - Emerald Green) */}
      <g transform="rotate(2 55 52)">
        <rect x="25" y="50" width="65" height="16" rx="2" fill="#151515" transform="translate(3, 3)" />
        <rect x="25" y="50" width="65" height="16" rx="2" fill="#059669" stroke="#151515" strokeWidth="3" />
        <rect x="34" y="53" width="53" height="10" fill="#FFFFFF" stroke="#151515" strokeWidth="1.5" />
        <line x1="30" y1="51" x2="30" y2="65" stroke="#FFD43B" strokeWidth="3" />
      </g>

      {/* Feather Quill Pen */}
      <g transform="rotate(35 85 45)">
        <path
          d="M85 10C85 10 95 25 93 45C92 58 87 70 85 85C83 70 78 58 77 45C75 25 85 10 85 10Z"
          fill="#FFFFFF"
          stroke="#151515"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Quill Spine */}
        <line x1="85" y1="12" x2="85" y2="92" stroke="#151515" strokeWidth="2.5" />
        {/* Golden Nib */}
        <polygon points="82,90 88,90 85,98" fill="#F59E0B" stroke="#151515" strokeWidth="1.5" />
        {/* Feather vane cuts */}
        <path d="M85 30L92 35 M85 42L91 48 M85 32L78 37 M85 45L79 50" stroke="#151515" strokeWidth="1.5" />
      </g>

      {/* Ink Splash Accent */}
      <circle cx="102" cy="98" r="3" fill="#151515" />
      <circle cx="108" cy="95" r="1.5" fill="#151515" />
    </svg>
  )
}

// ── 4. STAGE: Classic Vintage Chrome Microphone ───────────────
export function StageMicrophoneIllustration({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Radiating Sound Waves / Speed Lines */}
      <g stroke="#151515" strokeWidth="2.5" strokeLinecap="round">
        <path d="M25 45C20 52 20 62 25 70" />
        <path d="M16 38C8 48 8 68 16 80" strokeWidth="3" />
        <path d="M95 45C100 52 100 62 95 70" />
        <path d="M104 38C112 48 112 68 104 80" strokeWidth="3" />
        {/* Top sound sparks */}
        <line x1="60" y1="12" x2="60" y2="20" strokeWidth="3" />
        <line x1="45" y1="16" x2="49" y2="23" strokeWidth="2.5" />
        <line x1="75" y1="16" x2="71" y2="23" strokeWidth="2.5" />
      </g>

      {/* Microphone Drop Shadow */}
      <ellipse cx="63" cy="55" rx="22" ry="32" fill="#151515" />

      {/* Outer Microphone Body Capsule */}
      <rect
        x="42"
        y="25"
        width="36"
        height="56"
        rx="18"
        fill="#9CA3AF"
        stroke="#151515"
        strokeWidth="3.5"
      />

      {/* Chrome Inner Shading */}
      <rect x="46" y="28" width="28" height="50" rx="14" fill="#E5E7EB" />
      <rect x="48" y="30" width="10" height="46" rx="5" fill="#FFFFFF" opacity="0.8" />

      {/* Horizontal Grill Ribs */}
      <line x1="44" y1="36" x2="76" y2="36" stroke="#151515" strokeWidth="2" />
      <line x1="43" y1="42" x2="77" y2="42" stroke="#151515" strokeWidth="2.5" />
      <line x1="42" y1="48" x2="78" y2="48" stroke="#151515" strokeWidth="2.5" />
      <line x1="42" y1="54" x2="78" y2="54" stroke="#151515" strokeWidth="2.5" />
      <line x1="42" y1="60" x2="78" y2="60" stroke="#151515" strokeWidth="2.5" />
      <line x1="43" y1="66" x2="77" y2="66" stroke="#151515" strokeWidth="2" />
      <line x1="45" y1="72" x2="75" y2="72" stroke="#151515" strokeWidth="2" />

      {/* Vertical Spine Bar */}
      <line x1="60" y1="26" x2="60" y2="80" stroke="#151515" strokeWidth="3" />

      {/* Pivot Mount & Neck */}
      <rect x="53" y="80" width="14" height="12" fill="#4B5563" stroke="#151515" strokeWidth="2.5" />
      <rect x="56" y="92" width="8" height="18" fill="#1F2937" stroke="#151515" strokeWidth="2.5" />

      {/* Circular Stand Base */}
      <ellipse cx="60" cy="110" rx="26" ry="6" fill="#151515" />
      <ellipse cx="60" cy="108" rx="25" ry="5" fill="#4B5563" stroke="#151515" strokeWidth="2.5" />
    </svg>
  )
}

// ── 5. THEATRE: Comedy & Tragedy Masks ─────────────────────────
export function TheatreMasksIllustration({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Tragedy Mask (Back / Purple Blue) */}
      <g transform="rotate(-15 45 60)">
        {/* Shadow */}
        <ellipse cx="43" cy="63" rx="23" ry="30" fill="#151515" />
        <ellipse cx="40" cy="60" rx="23" ry="30" fill="#3B82F6" stroke="#151515" strokeWidth="3" />
        {/* Sad Eyebrows & Eyes */}
        <path d="M26 48C30 52 35 53 38 50" stroke="#151515" strokeWidth="3" strokeLinecap="round" />
        <path d="M43 50C46 53 51 52 55 48" stroke="#151515" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="32" cy="56" rx="4" ry="5" fill="#151515" />
        <ellipse cx="49" cy="56" rx="4" ry="5" fill="#151515" />
        {/* Sad downturned mouth */}
        <path d="M28 80C34 72 47 72 53 80" stroke="#151515" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>

      {/* Comedy Mask (Front / White & Gold) */}
      <g transform="rotate(12 75 60)">
        {/* Shadow */}
        <ellipse cx="73" cy="63" rx="24" ry="31" fill="#151515" />
        <ellipse cx="70" cy="60" rx="24" ry="31" fill="#FFFFFF" stroke="#151515" strokeWidth="3.5" />
        {/* Happy Curved Eyebrows */}
        <path d="M57 48C60 44 66 44 69 48" stroke="#151515" strokeWidth="3" strokeLinecap="round" />
        <path d="M74 48C77 44 83 44 86 48" stroke="#151515" strokeWidth="3" strokeLinecap="round" />
        {/* Almond smiling eyes */}
        <path d="M58 55C62 52 66 52 70 55C66 58 62 58 58 55Z" fill="#151515" />
        <path d="M73 55C77 52 81 52 85 55C81 58 77 58 73 55Z" fill="#151515" />
        {/* Big Joyful Smile */}
        <path d="M57 70C63 85 79 85 85 70Z" fill="#151515" stroke="#151515" strokeWidth="2" />
        <path d="M60 71C65 77 77 77 82 71" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
        {/* Cheerful blush circles */}
        <circle cx="56" cy="66" r="3" fill="#FCA5A5" opacity="0.6" />
        <circle cx="86" cy="66" r="3" fill="#FCA5A5" opacity="0.6" />
      </g>
    </svg>
  )
}

// ── 6. SCHEDULE: 3D Calendar Icon ──────────────────────────────
export function ScheduleCalendarIllustration({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Shadow */}
      <rect x="18" y="24" width="68" height="64" rx="10" fill="#151515" />
      {/* Calendar Body */}
      <rect x="15" y="20" width="68" height="64" rx="10" fill="#FFFFFF" stroke="#151515" strokeWidth="3.5" />
      {/* Red Header Bar */}
      <path d="M15 30C15 24.4772 19.4772 20 25 20H73C78.5228 20 83 24.4772 83 30V38H15V30Z" fill="#DC2626" stroke="#151515" strokeWidth="3" />
      
      {/* Spiral Binder Loops */}
      <rect x="28" y="14" width="6" height="12" rx="3" fill="#E5E7EB" stroke="#151515" strokeWidth="2.5" />
      <rect x="46" y="14" width="6" height="12" rx="3" fill="#E5E7EB" stroke="#151515" strokeWidth="2.5" />
      <rect x="64" y="14" width="6" height="12" rx="3" fill="#E5E7EB" stroke="#151515" strokeWidth="2.5" />

      {/* Date Grid Squares with Red Highlights */}
      <rect x="24" y="46" width="8" height="8" rx="1.5" fill="#151515" />
      <rect x="36" y="46" width="8" height="8" rx="1.5" fill="#EF4444" />
      <rect x="48" y="46" width="8" height="8" rx="1.5" fill="#151515" />
      <rect x="60" y="46" width="8" height="8" rx="1.5" fill="#151515" />

      <rect x="24" y="58" width="8" height="8" rx="1.5" fill="#151515" />
      <rect x="36" y="58" width="8" height="8" rx="1.5" fill="#151515" />
      <rect x="48" y="58" width="8" height="8" rx="1.5" fill="#FFD43B" />
      <rect x="60" y="58" width="8" height="8" rx="1.5" fill="#EF4444" />

      <rect x="24" y="70" width="8" height="8" rx="1.5" fill="#151515" />
      <rect x="36" y="70" width="8" height="8" rx="1.5" fill="#151515" />
      <rect x="48" y="70" width="8" height="8" rx="1.5" fill="#151515" />
      <rect x="60" y="70" width="8" height="8" rx="1.5" fill="#10B981" />
    </svg>
  )
}

// ── 7. ANNOUNCEMENTS: Vintage Golden Megaphone ─────────────────
export function AnnouncementsMegaphoneIllustration({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Soundwaves */}
      <g stroke="#151515" strokeWidth="2.5" strokeLinecap="round">
        <path d="M72 32C78 40 78 60 72 68" />
        <path d="M82 25C90 38 90 62 82 75" strokeWidth="3" />
      </g>

      {/* Shadow */}
      <path d="M22 42L58 22V78L22 58Z" fill="#151515" transform="translate(3, 3)" />

      {/* Megaphone Cone Body */}
      <path
        d="M20 40L60 20V80L20 60Z"
        fill="#FBBF24"
        stroke="#151515"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Front Bell Opening */}
      <ellipse cx="60" cy="50" rx="8" ry="30" fill="#F59E0B" stroke="#151515" strokeWidth="3.5" />
      <ellipse cx="60" cy="50" rx="4" ry="20" fill="#151515" />

      {/* Rear Mouthpiece */}
      <rect x="12" y="44" width="8" height="12" rx="2" fill="#DC2626" stroke="#151515" strokeWidth="2.5" />

      {/* Handle Grip */}
      <path
        d="M26 56L30 82C30 84 34 85 36 83L42 58"
        fill="#EF4444"
        stroke="#151515"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Chrome Accent Band */}
      <path d="M38 31V69" stroke="#151515" strokeWidth="2" strokeDasharray="2 2" />
    </svg>
  )
}
