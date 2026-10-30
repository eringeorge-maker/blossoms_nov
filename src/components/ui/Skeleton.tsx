import * as React from 'react'
import { cn } from '@/lib/utils'

/** Skeleton shimmer for loading states */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gutter',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

/** Skeleton for an event card */
function EventCardSkeleton() {
  return (
    <div className="comic-card p-4 space-y-3">
      <Skeleton className="h-4 w-20 rounded-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-8 w-16 rounded-xl" />
      </div>
    </div>
  )
}

export { Skeleton, EventCardSkeleton }
