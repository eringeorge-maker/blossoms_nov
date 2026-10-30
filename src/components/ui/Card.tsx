import * as React from 'react'
import { cn } from '@/lib/utils'

/** Generic comic-bordered card */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'panel' | 'card'
}

function Card({ className, variant = 'card', ...props }: CardProps) {
  return (
    <div
      className={cn(
        variant === 'panel' ? 'comic-panel' : 'comic-card',
        'p-4',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-3 border-b-2 border-ink pb-2', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-display text-xl text-ink', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-3 border-t-2 border-ink pt-2', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter }
