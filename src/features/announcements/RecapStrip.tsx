import type { RecapPanel, RecapTone, WeeklyRecap } from '@/types'

const TONES: Record<RecapTone, { bg: string; dark: boolean }> = {
  yellow: { bg: '#F8CA16', dark: false },
  purple: { bg: '#793F98', dark: true },
  blue: { bg: '#3A8EE6', dark: true },
  red: { bg: '#E5332A', dark: true },
  green: { bg: '#3FA34D', dark: true },
  cream: { bg: '#FDFAF0', dark: false },
}

export const RECAP_TONES = Object.keys(TONES) as RecapTone[]

// Panels sit on a three-column page: rows of wide + narrow, then three narrow, like a printed strip.
// The final panel stretches to close its row so the page never has a hole in it.
const SPAN_PATTERN = [2, 1, 1, 1, 1]
const SPAN_CLASS: Record<number, string> = { 1: '', 2: 'sm:col-span-2', 3: 'sm:col-span-3' }

function spansFor(count: number): number[] {
  const spans: number[] = []
  let used = 0
  for (let i = 0; i < count; i++) {
    let span = SPAN_PATTERN[i % SPAN_PATTERN.length]
    if (i === count - 1) span = used === 0 ? 3 : 3 - used
    spans.push(span)
    used = (used + span) % 3
  }
  return spans
}

function Panel({ panel, index, span }: { panel: RecapPanel; index: number; span: number }) {
  const tone = TONES[panel.tone] ?? TONES.yellow
  return (
    <li
      className={`recap-panel ${SPAN_CLASS[span]}`}
      style={{ background: tone.bg, color: tone.dark ? '#FDFAF0' : '#151515' }}
    >
      <span aria-hidden="true" className="recap-halftone" />
      <span className="recap-number font-comic-display">{index + 1}</span>

      {panel.sfx && (
        <p className="recap-sfx font-comic-display" aria-hidden="true">
          {panel.sfx}
        </p>
      )}

      {panel.speech && <p className="recap-speech font-comic-sub">{panel.speech}</p>}

      <p className="recap-caption font-comic-sub">{panel.caption}</p>
    </li>
  )
}

/** One week's recap, drawn as a comic strip: numbered panels with captions, speech bubbles and sound effects. */
export function RecapStrip({ recap, headingLevel = 'h2' }: { recap: WeeklyRecap; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  const spans = spansFor(recap.panels.length)
  return (
    <article className="recap-strip" aria-label={`${recap.week_label}: ${recap.title}`}>
      <header className="recap-header">
        <span className="recap-ribbon font-comic-display">{recap.week_label}</span>
        <Heading className="recap-title font-comic-display">{recap.title}</Heading>
      </header>
      <ol className="recap-grid">
        {recap.panels.map((panel, index) => (
          <Panel key={index} panel={panel} index={index} span={spans[index]} />
        ))}
      </ol>
    </article>
  )
}
