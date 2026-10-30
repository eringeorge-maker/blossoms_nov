import * as React from 'react'
import { AlertCircle, Inbox, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
      role="status"
    >
      <div className="mb-4 text-ink/30" aria-hidden="true">
        {icon ?? <Inbox className="w-16 h-16" />}
      </div>
      <h3 className="font-display text-2xl text-ink mb-2">{title}</h3>
      {description && (
        <p className="text-base text-ink/60 max-w-sm">{description}</p>
      )}
      {action && (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  retry?: () => void
  className?: string
}

function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred. Please try again.',
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-16 h-16 text-blossoms-red mb-4" aria-hidden="true" />
      <h3 className="font-display text-2xl text-ink mb-2">{title}</h3>
      <p className="text-base text-ink/60 max-w-sm">{description}</p>
      {retry && (
        <Button className="mt-6" onClick={retry} variant="outline">
          Try again
        </Button>
      )}
    </div>
  )
}

function OfflineState() {
  return (
    <EmptyState
      icon={<WifiOff className="w-16 h-16 text-blossoms-red" />}
      title="You're offline"
      description="Check your connection and try again."
    />
  )
}

export { EmptyState, ErrorState, OfflineState }
