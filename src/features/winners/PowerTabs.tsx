import { useEffect, useRef, useState } from 'react'
import './powers.css'

export type PowerKey = 'arts' | 'literature' | 'stage' | 'theatre' | 'other'

interface PowerTab {
  key: PowerKey
  label: string
}

/** Fingers held up per category: 1, 2, 3, 4 (and a fist for anything else). */
const SLOTS = [30, 45, 60, 75]
const LEN = [44, 58, 62, 52]
const EXTENDED: Record<PowerKey, number[]> = {
  arts: [1],
  literature: [1, 2],
  stage: [1, 2, 3],
  theatre: [0, 1, 2, 3],
  other: [],
}
const SKIN: Record<PowerKey, { fill: string; light: string }> = {
  arts: { fill: '#2d5bd0', light: '#7aa3ff' },
  literature: { fill: '#3a72e8', light: '#b4cdff' },
  stage: { fill: '#e8962b', light: '#f8cf7c' },
  theatre: { fill: '#e0561f', light: '#ffb347' },
  other: { fill: '#793f98', light: '#c293de' },
}
const WORD: Record<PowerKey, string> = {
  arts: 'ZAP!',
  literature: 'STRETCH!',
  stage: 'SMASH!',
  theatre: 'BLAZE!',
  other: 'POW!',
}
const INK = '#1a1209'
const SPLATS = ['#ff4f8b', '#ffd23f', '#3aa7ff', '#37d67a', '#a855f7']

function Flames() {
  return (
    <g>
      {SLOTS.map((x, i) => {
        const c = x + 7.5
        const h = LEN[i] + 34
        return (
          <g key={x} className="pw-flame" style={{ animationDelay: `${i * 120}ms` }}>
            <path
              d={`M${c - 17} 74 C${c - 22} 50 ${c - 5} 44 ${c} ${72 - h} C${c + 5} 44 ${c + 22} 50 ${c + 17} 74 Z`}
              fill="#ffd23f"
              stroke={INK}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d={`M${c - 9} 72 C${c - 12} 56 ${c - 2} 52 ${c} ${72 - h * 0.62} C${c + 2} 52 ${c + 12} 56 ${c + 9} 72 Z`}
              fill="#ff7a1a"
            />
          </g>
        )
      })}
    </g>
  )
}

function Hand({ kind, go }: { kind: PowerKey; go: boolean }) {
  const { fill, light } = SKIN[kind]
  const ext = EXTENDED[kind]
  return (
    <svg
      className={`pw-hand pw-hand--${kind} ${go ? 'pw-hand--go' : ''}`}
      viewBox="0 0 120 160"
      overflow="visible"
      aria-hidden="true"
    >
      {kind === 'theatre' && <Flames />}

      {/* dashed "stretch" echo behind the fingers */}
      {kind === 'literature' && (
        <g className="pw-echo">
          {ext.map((i) => (
            <rect
              key={i}
              x={SLOTS[i] - 5}
              y={62 - LEN[i] - 26}
              width="25"
              height={LEN[i] + 40}
              rx="12"
              fill="rgb(200 220 255 / 0.55)"
              stroke="#fff"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          ))}
        </g>
      )}

      <rect x="40" y="104" width="40" height="60" fill={fill} stroke={INK} strokeWidth="3.5" />

      {ext.map((i) => (
        <g key={i} className="pw-finger">
          <rect x={SLOTS[i]} y={62 - LEN[i]} width="15" height={LEN[i] + 14} rx="7.5" fill={fill} stroke={INK} strokeWidth="3.5" />
          <path d={`M${SLOTS[i] + 4} ${62 - LEN[i] + 10} v${LEN[i] - 14}`} stroke={light} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
          {kind === 'stage' && (
            <path
              d={`M${SLOTS[i]} ${62 - LEN[i] / 2} h15 M${SLOTS[i]} ${62 - LEN[i] + 14} h15`}
              stroke={INK}
              strokeWidth="2.5"
              fill="none"
            />
          )}
        </g>
      ))}

      {/* folded fingers: just the knuckles */}
      {SLOTS.map((x, i) =>
        ext.includes(i) ? null : <rect key={x} x={x} y="52" width="15" height="20" rx="7.5" fill={fill} stroke={INK} strokeWidth="3.5" />
      )}

      <rect x="26" y="60" width="68" height="52" rx="15" fill={fill} stroke={INK} strokeWidth="3.5" />
      <rect x="14" y="74" width="24" height="38" rx="12" transform="rotate(-14 26 93)" fill={fill} stroke={INK} strokeWidth="3.5" />
      <path d="M22 84 v14" stroke={light} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M36 70 q6 -4 12 0 M54 68 q6 -3 12 0 M72 70 q6 -3 12 0" stroke={light} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M32 106 h56 M34 110 h52" stroke={INK} strokeWidth="1.6" opacity="0.35" />

      {kind === 'stage' && (
        <>
          <path d="M34 66 l8 10 -4 8 9 9 M82 64 l-6 12 6 8" stroke={INK} strokeWidth="2.2" fill="none" />
          <path className="pw-crack" d="M60 60 L52 76 L66 88 L54 108" stroke={INK} strokeWidth="3.5" fill="none" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}

/** Short-lived effects that fire when a medallion is pressed. They remount on every press. */
function Effects({ kind }: { kind: PowerKey }) {
  return (
    <div className="pw-fx" aria-hidden="true">
      <span className="pw-word">{WORD[kind]}</span>

      {kind === 'arts' && (
        <>
          <i className="pw-orb" />
          {SPLATS.concat(SPLATS).map((c, i) => (
            <i key={i} className="pw-splat" style={{ ['--a' as string]: `${i * 36}deg`, ['--c' as string]: c, animationDelay: `${i * 18}ms` }} />
          ))}
        </>
      )}

      {kind === 'literature' && [0, 1, 2].map((i) => <i key={i} className="pw-whoosh" style={{ ['--i' as string]: i }} />)}

      {kind === 'stage' && (
        <>
          <i className="pw-shock" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <i key={i} className="pw-debris" style={{ ['--a' as string]: `${i * 45 + 20}deg`, ['--d' as string]: `${46 + (i % 3) * 14}px` }} />
          ))}
        </>
      )}

      {kind === 'theatre' && (
        <>
          <i className="pw-heat" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <i key={i} className="pw-ember" style={{ ['--x' as string]: `${(i - 3) * 13}px`, animationDelay: `${i * 90}ms` }} />
          ))}
        </>
      )}

      {kind === 'other' && <i className="pw-shock" />}
    </div>
  )
}

interface PowerTabsProps {
  tabs: PowerTab[]
  active: PowerKey
  counts: Partial<Record<PowerKey, number>>
  onSelect: (key: PowerKey) => void
}

/**
 * Four hand-sign medallions (1, 2, 3, 4 fingers) that double as the category tabs.
 * Pressing one fires its power. Power up all four and the squad assembles.
 */
export function PowerTabs({ tabs, active, counts, onSelect }: PowerTabsProps) {
  const [fx, setFx] = useState<{ key: PowerKey; id: number } | null>(null)
  const [assemble, setAssemble] = useState(0)
  const visited = useRef(new Set<PowerKey>())
  const idRef = useRef(0)

  useEffect(() => {
    if (!assemble) return
    const t = window.setTimeout(() => setAssemble(0), 3200)
    return () => window.clearTimeout(t)
  }, [assemble])

  function press(key: PowerKey) {
    onSelect(key)
    setFx({ key, id: ++idRef.current })
    visited.current.add(key)
    const core = ['arts', 'literature', 'stage', 'theatre'] as const
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced && core.every((k) => visited.current.has(k))) {
      visited.current.clear()
      window.setTimeout(() => setAssemble(++idRef.current), 650)
    }
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = tabs[(index + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]
    press(next.key)
    document.getElementById(`results-tab-${next.key}`)?.focus()
  }

  return (
    <>
      <div className="pw-stage">
        <p className="pw-hint">Tap a hand to power up</p>
        <div role="tablist" aria-label="Result categories" className={`pw-row ${assemble ? 'pw-row--assemble' : ''}`}>
          {tabs.map((t, i) => {
            const go = fx?.key === t.key ? fx.id : 0
            return (
              <button
                key={t.key}
                id={`results-tab-${t.key}`}
                type="button"
                role="tab"
                aria-selected={active === t.key}
                aria-controls="results-tabpanel"
                tabIndex={active === t.key ? 0 : -1}
                className={`pw-btn pw-btn--${t.key}`}
                onClick={() => press(t.key)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                <span className="pw-circle">
                  <span className="pw-stack">
                    <Hand key={go} kind={t.key} go={go > 0} />
                  </span>
                  {go > 0 && <Effects key={go} kind={t.key} />}
                  <span className="pw-count">{counts[t.key] ?? 0}</span>
                </span>
                <span className="pw-label">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {assemble > 0 && (
        <div key={assemble} className="pw-assemble" aria-hidden="true">
          <div className="pw-assemble-rays" />
          <p className="pw-assemble-text">
            <span>Blossoms</span>
            <strong>Assemble!</strong>
          </p>
        </div>
      )}
    </>
  )
}
