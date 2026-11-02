import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-body font-semibold',
    'border-2 border-ink',
    'rounded-xl',
    'transition-all duration-100',
    'cursor-pointer select-none',
    'min-h-[44px] px-5 py-2',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
    'active:translate-x-[1px] active:translate-y-[1px]',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-white',
          'hover:opacity-90 active:scale-95',
        ],
        secondary: [
          'bg-blossoms-yellow text-ink',
          'hover:opacity-90 active:scale-95',
        ],
        outline: [
          'bg-paper text-ink',
          'hover:bg-gutter active:scale-95',
        ],
        ghost: [
          'border-transparent bg-transparent text-ink',
          'shadow-none',
          'hover:bg-gutter',
        ],
        danger: [
          'bg-comic-red-deep text-white',
          'hover:opacity-90 active:scale-95',
        ],
      },
      size: {
        sm:  'text-sm min-h-[36px] px-3 py-1.5 rounded-lg',
        md:  'text-base min-h-[44px] px-5 py-2',
        lg:  'text-lg min-h-[52px] px-6 py-3',
        icon:'min-h-[44px] min-w-[44px] px-2 py-2 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, asChild = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...(!asChild && { disabled: disabled || isLoading })}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            <span className="sr-only">Loading…</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
