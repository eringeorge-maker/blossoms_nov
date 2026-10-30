import { clsx, type ClassValue } from 'clsx'

/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** Format a date-string in Asia/Kolkata for display */
export function formatIST(
  iso: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  }
): string {
  if (!iso) return 'TBD'
  return new Intl.DateTimeFormat('en-IN', {
    ...opts,
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso))
}

/** Format just the date in IST */
export function formatISTDate(iso: string | null | undefined): string {
  if (!iso) return 'TBD'
  return formatIST(iso, { dateStyle: 'medium' })
}

/** Format just the time in IST */
export function formatISTTime(iso: string | null | undefined): string {
  if (!iso) return 'TBD'
  return formatIST(iso, { timeStyle: 'short' })
}

/** Format a slot as "10:00 AM – 12:00 PM, 15 Nov 2025" */
export function formatSlot(
  starts_at: string | null,
  ends_at: string | null
): string {
  if (!starts_at) return 'TBD'
  const date = formatISTDate(starts_at)
  const start = formatISTTime(starts_at)
  const end = ends_at ? formatISTTime(ends_at) : ''
  return end ? `${date}, ${start} – ${end}` : `${date}, ${start}`
}

/** Truncate text to N chars with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '…'
}
