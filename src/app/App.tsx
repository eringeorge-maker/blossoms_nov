import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'

// Layouts
import { PublicShell }  from '@/components/layout/PublicShell'
import { StudentShell } from '@/components/layout/StudentShell'
import { AdminShell }   from '@/components/layout/AdminShell'
import { Skeleton }     from '@/components/ui/Skeleton'

// Lazy-loaded pages
const HomePage            = lazy(() => import('@/features/public/HomePage'))
const EventsPage          = lazy(() => import('@/features/events/EventsPage'))
const EventDetailPage     = lazy(() => import('@/features/events/EventDetailPage'))
const SchedulePage        = lazy(() => import('@/features/schedule/SchedulePage'))
const AnnouncementsPage   = lazy(() => import('@/features/announcements/AnnouncementsPage'))
const AboutPage           = lazy(() => import('@/features/public/AboutPage'))
const GalleryPage         = lazy(() => import('@/features/gallery/GalleryPage'))
const WinnersPage         = lazy(() => import('@/features/winners/WinnersPage'))
const LoginPage           = lazy(() => import('@/features/auth/LoginPage'))
const DesignSystemPage    = lazy(() => import('@/features/public/DesignSystemPage'))

// Student pages
const StudentDashboard    = lazy(() => import('@/features/student/StudentDashboard'))
const StudentEventsPage   = lazy(() => import('@/features/student/StudentEventsPage'))
const MyEventsPage        = lazy(() => import('@/features/student/MyEventsPage'))
const StudentSchedulePage = lazy(() => import('@/features/student/StudentSchedulePage'))
const ProfilePage         = lazy(() => import('@/features/student/ProfilePage'))
const TeamPage            = lazy(() => import('@/features/student/TeamPage'))

// Admin pages
const AdminOverview       = lazy(() => import('@/features/admin/AdminOverview'))
const AdminEventsPage     = lazy(() => import('@/features/admin/AdminEventsPage'))
const AdminEventEditor    = lazy(() => import('@/features/admin/AdminEventEditor'))
const AdminSchedulePage   = lazy(() => import('@/features/admin/AdminSchedulePage'))
const AdminRegistrations  = lazy(() => import('@/features/admin/AdminRegistrations'))
const AdminStudents       = lazy(() => import('@/features/admin/AdminStudents'))
const AdminCoordinators   = lazy(() => import('@/features/admin/AdminCoordinators'))
const AdminAnnouncements  = lazy(() => import('@/features/admin/AdminAnnouncements'))
const AdminContent        = lazy(() => import('@/features/admin/AdminContent'))
const AdminAudit          = lazy(() => import('@/features/admin/AdminAudit'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 2,
    },
  },
})

function PageFallback() {
  return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* ── Home route (Authentic Figma Modern Mobile Interface Design) ── */}
            <Route path="/" element={<HomePage />} />

            {/* ── Public routes ─────────────────────────────── */}
            <Route element={<PublicShell />}>
              <Route path="events" element={<EventsPage />} />
              <Route path="events/:slug" element={<EventDetailPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="winners" element={<WinnersPage />} />
              <Route path="results" element={<Navigate to="/winners" replace />} />
              <Route path="notice-board" element={<Navigate to="/announcements" replace />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="design-system" element={<DesignSystemPage />} />
            </Route>

            {/* ── Student routes (auth required) ────────────── */}
            <Route path="app" element={<StudentShell />}>
              <Route index element={<StudentDashboard />} />
              <Route path="events" element={<StudentEventsPage />} />
              <Route path="my-events" element={<MyEventsPage />} />
              <Route path="schedule" element={<StudentSchedulePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="teams/:teamId" element={<TeamPage />} />
            </Route>

            {/* ── Admin routes (auth + role required) ───────── */}
            <Route path="admin" element={<AdminShell />}>
              <Route index element={<AdminOverview />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="events/new" element={<AdminEventEditor />} />
              <Route path="events/:id" element={<AdminEventEditor />} />
              <Route path="schedule" element={<AdminSchedulePage />} />
              <Route path="registrations" element={<AdminRegistrations />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="coordinators" element={<AdminCoordinators />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="audit" element={<AdminAudit />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: '2px solid #1A1A1A',
            borderRadius: '12px',
            fontFamily: 'var(--font-body)',
            boxShadow: '3px 3px 0px 0px #1A1A1A',
          },
        }}
      />
    </QueryClientProvider>
  )
}
