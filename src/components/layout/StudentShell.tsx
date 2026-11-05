import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth/authStore'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Student pages live inside the public site (same header, footer and tabs).
 * This only checks that a student is signed in; the student tabs are in PublicHeader.
 */
export function StudentShell() {
  const location = useLocation()
  const auth = useAuth()

  if (!auth.ready) {
    return (
      <div className="mx-auto max-w-[1240px] p-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }
  if (!auth.student) {
    return <Navigate to={`/login?role=student&redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  return (
    <div className="pb-8">
      <Outlet />
    </div>
  )
}
