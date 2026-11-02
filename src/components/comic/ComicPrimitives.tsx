import * as React from 'react'
import { cn } from '@/lib/utils'

/** Ben-Day Halftone dot background accent */
interface HalftoneProps {
  className?: string
  color?: 'black' | 'yellow' | 'blue' | 'red'
  size?: 'sm' | 'md' | 'lg'
}
export function HalftoneAccent({ className, color = 'black' }: HalftoneProps) {
  const dotClasses = {
    black:  'bended-dots opacity-30',
    yellow: 'bended-dots-yellow opacity-40',
    blue:   'bended-dots-blue opacity-50',
    red:    'bended-dots-red opacity-50',
  }

  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-0 pointer-events-none', dotClasses[color], className)}
    />
  )
}

/** Comic panel — bordered anthology content block */
interface ComicPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean
  panelNumber?: string
  caption?: string
}
export function ComicPanel({
  className,
  noPadding,
  panelNumber,
  caption,
  children,
  ...props
}: ComicPanelProps) {
  return (
    <div
      className={cn(
        'comic-panel relative overflow-hidden bg-white',
        !noPadding && 'p-6',
        className
      )}
      {...props}
    >
      <HalftoneAccent color="black" className="opacity-15" />
      
      {/* Top comic panel strip if numbered */}
      {(panelNumber || caption) && (
        <div className="flex items-center justify-between border-b-2 border-ink -mt-6 -mx-6 mb-4 px-4 py-1.5 bg-[#F5EBD4]">
          {panelNumber && (
            <span className="font-display tracking-wider text-xs uppercase text-ink font-bold">
              ★ {panelNumber}
            </span>
          )}
          {caption && (
            <span className="comic-caption-box text-[11px] py-0.5 px-2">
              {caption}
            </span>
          )}
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  )
}

/** Action burst — 12-point irregular comic starburst shape */
interface ActionBurstProps {
  children: React.ReactNode
  className?: string
  color?: 'yellow' | 'red' | 'blue' | 'teal'
  rotate?: string
}
export function ActionBurst({
  children,
  className,
  color = 'yellow',
  rotate = '-3deg',
}: ActionBurstProps) {
  const bgStyles = {
    yellow: 'bg-[#FFD43B] text-[#151515]',
    red:    'bg-[#793f98] text-white',
    blue:   'bg-[#3478F6] text-white',
    teal:   'bg-[#26A69A] text-white',
  }

  return (
    <div
      aria-hidden="false"
      className={cn(
        'relative inline-flex items-center justify-center p-4 drop-shadow-[3px_3px_0px_#151515]',
        className
      )}
      style={{ transform: `rotate(${rotate})` }}
    >
      <div
        className={cn(
          'w-28 h-28 flex items-center justify-center text-center font-display leading-tight tracking-wider',
          bgStyles[color]
        )}
        style={{
          clipPath:
            'polygon(50% 0%, 63% 28%, 95% 15%, 78% 44%, 100% 62%, 72% 70%, 75% 100%, 48% 82%, 25% 100%, 28% 70%, 0% 62%, 22% 44%, 5% 15%, 37% 28%)',
        }}
      >
        <div className="transform -rotate-2 select-none font-black text-sm px-2">
          {children}
        </div>
      </div>
    </div>
  )
}

/** Authentic Comic Speech Bubble with curved comic tail */
interface SpeechBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  direction?: 'down' | 'left' | 'right'
}
export function SpeechBubble({
  children,
  direction = 'down',
  className,
  ...props
}: SpeechBubbleProps) {
  return (
    <div className={cn('relative inline-block', className)} {...props}>
      <div className="border-2 border-ink rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-[3px_3px_0px_0px_#151515]">
        {children}
      </div>

      {/* SVG Comic Tail */}
      {direction === 'down' && (
        <svg
          className="absolute -bottom-3 left-6 w-5 h-4 overflow-visible"
          viewBox="0 0 20 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 0 C6 8, 8 14, 2 16 C12 12, 16 6, 16 0 Z"
            fill="#FFFFFF"
            stroke="#151515"
            strokeWidth="2"
          />
        </svg>
      )}

      {direction === 'left' && (
        <svg
          className="absolute top-3 -left-3 w-4 h-5 overflow-visible"
          viewBox="0 0 16 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M16 0 C8 6, 2 8, 0 2 C4 12, 10 16, 16 16 Z"
            fill="#FFFFFF"
            stroke="#151515"
            strokeWidth="2"
          />
        </svg>
      )}
    </div>
  )
}

/** Comic Caption Box — The iconic yellow narrative box */
export function ComicCaptionBox({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('comic-caption-box', className)}>
      <span className="text-primary font-black" aria-hidden="true">★</span>
      {children}
    </div>
  )
}

/** Comic Corner Box — Traditional vintage comic issue stamp */
export function ComicCornerBox({
  issueNo = 'ISSUE #25',
  theme = 'COMIC ANTHOLOGY',
  price = 'FREE ENTRY',
  className,
}: {
  issueNo?: string
  theme?: string
  price?: string
  className?: string
}) {
  return (
    <div className={cn('comic-corner-box inline-block', className)}>
      <div className="text-[10px] tracking-wider text-ink/70 tabular-nums font-bold border-b border-ink/40 pb-0.5">
        BLOSSOMS DOC
      </div>
      <div className="text-sm font-black text-[#793f98] my-0.5 leading-none">
        {issueNo}
      </div>
      <div className="text-[9px] uppercase tracking-tighter text-ink font-semibold border-b border-ink/40 pb-0.5">
        {theme}
      </div>
      <div className="text-[10px] font-black text-ink mt-0.5">
        {price}
      </div>
    </div>
  )
}

/** Display heading using Bangers font with optional comic 3D pop */
export interface DisplayTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p' | 'div'
  pop?: boolean
  yellow?: boolean
}

export function DisplayText({
  children,
  className,
  as: Tag = 'h2',
  pop = false,
  yellow = false,
  ...props
}: DisplayTextProps) {
  return (
    <Tag
      className={cn(
        'font-display tracking-wide leading-none uppercase select-none',
        pop && 'comic-title-pop',
        yellow && 'comic-title-yellow',
        !pop && !yellow && 'text-ink',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
