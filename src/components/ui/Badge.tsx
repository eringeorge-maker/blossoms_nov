import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1',
    'font-body font-semibold text-xs uppercase tracking-wide',
    'border border-ink rounded-full',
    'px-2.5 py-0.5',
  ],
  {
    variants: {
      variant: {
        default:    'bg-ink text-paper',
        outline:    'bg-transparent text-ink',
        red:        'bg-blossoms-red text-white border-blossoms-red',
        yellow:     'bg-blossoms-yellow text-ink border-blossoms-yellow',
        green:      'bg-blossoms-green text-white border-blossoms-green',
        blue:       'bg-blossoms-blue text-white border-blossoms-blue',
        pink:       'bg-blossoms-pink text-white border-blossoms-pink',
        // Registration states
        open:       'bg-blossoms-green text-white border-blossoms-green',
        closed:     'bg-ink text-paper',
        full:       'bg-blossoms-red text-white border-blossoms-red',
        soon:       'bg-blossoms-yellow text-ink border-blossoms-yellow',
        waitlist:   'bg-blossoms-blue text-white border-blossoms-blue',
        cancelled:  'bg-gutter text-ink line-through',
        registered: 'bg-blossoms-green text-white border-blossoms-green',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
