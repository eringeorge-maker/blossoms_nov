import * as React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${inputId}-error`
    const hintId  = `${inputId}-hint`

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-ink"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-blossoms-red" aria-hidden="true">*</span>
          )}
        </label>
        {hint && (
          <p id={hintId} className="text-xs text-ink/60">
            {hint}
          </p>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border-2 border-ink bg-paper px-4 py-2.5',
            'text-base text-ink placeholder:text-ink/40',
            'focus:outline-none focus:border-blossoms-red',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-blossoms-red focus:border-blossoms-red',
            className
          )}
          aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-blossoms-red font-medium">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
