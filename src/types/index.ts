// ── Core app types for Blossoms Fest ─────────────────────────

// ── Enums ─────────────────────────────────────────────────────
export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled' | 'archived'
export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled'
export type EventFormat = 'individual' | 'team' | 'either'
export type ScheduleSlotStatus = 'scheduled' | 'tbd' | 'cancelled' | 'rescheduled'
export type AnnouncementSeverity = 'normal' | 'important' | 'urgent'
export type UserRole = 'student' | 'event_coordinator' | 'content_editor' | 'analyst' | 'super_admin'

// ── Registration availability display states ─────────────────
export type RegistrationDisplayStatus =
  | 'coming_soon'
  | 'open'
  | 'closing_soon'
  | 'closed'
  | 'full'
  | 'waitlist_open'
  | 'cancelled'
  | 'completed'
  | 'restricted'
  | 'already_registered'

// ── Domain entities ───────────────────────────────────────────
export interface Campus {
  id: string
  name: string
  code: string
  created_at: string
}

export interface Department {
  id: string
  name: string
  code: string
  campus_id: string
  created_at: string
}

export interface EventCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon_url: string | null
  display_order: number
  created_at: string
}

export interface Venue {
  id: string
  name: string
  campus_id: string | null
  building: string | null
  room: string | null
  capacity: number | null
  maps_url: string | null
  created_at: string
}

export interface EventScheduleSlot {
  id: string
  event_id: string
  venue_id: string | null
  slot_title: string | null
  slot_date?: string | null      // 'YYYY-MM-DD' — set even when the timing is not fixed (online, TBA)
  starts_at: string | null       // ISO timestamptz
  ends_at: string | null         // ISO timestamptz
  timezone: string               // 'Asia/Kolkata'
  status: ScheduleSlotStatus
  venue?: Venue | null
}

export interface EventContact {
  id?: string
  event_id?: string
  role: 'faculty_coordinator' | 'student_head'
  name: string
  phone?: string | null
  display_order: number
}

export interface EventEligibilityRule {
  id: string
  event_id: string
  rule_type: 'all_students' | 'include_campus' | 'include_department' | 'exclude_department'
  campus_id: string | null
  department_id: string | null
  reason: string | null
}

export interface Event {
  id: string
  title: string
  slug: string
  category_id: string
  category?: EventCategory
  description: string | null
  rules_markdown: string | null
  poster_url: string | null
  thumbnail_url: string | null
  event_format: EventFormat
  min_team_size: number | null
  max_team_size: number | null
  registration_opens_at: string | null
  registration_closes_at: string | null
  capacity: number | null
  waitlist_enabled: boolean
  cancellation_allowed: boolean
  conflict_policy: 'warn' | 'block' | 'ignore'
  status: EventStatus
  organiser_contact: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  /** false for ceremonies such as inaugurations that take no sign-ups */
  registration_enabled?: boolean
  /** manual switch admins flip to stop new registrations */
  registration_closed?: boolean
  whatsapp_group_url?: string | null
  points?: number | null
  /** every student must attend; no registration, counted present unless marked absent */
  is_mandatory?: boolean
  finals_rule?: string | null
  contacts?: EventContact[]
  schedule_slots?: EventScheduleSlot[]
  eligibility_rules?: EventEligibilityRule[]
  registration_count?: number
  registration_display_status?: RegistrationDisplayStatus
  user_registration?: EventRegistration | null
}

export interface Student {
  id: string
  auth_user_id: string | null
  register_number: string
  full_name: string
  institutional_email: string
  phone: string | null
  campus_id: string
  department_id: string
  deanery_id: string | null
  year_of_study: number | null
  student_status: 'active' | 'inactive' | 'suspended'
  is_verified: boolean
  profile_complete: boolean
  campus?: Campus
  department?: Department
}

export interface AdminProfile {
  id: string
  auth_user_id: string
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
}

export interface Team {
  id: string
  event_id: string
  team_name: string
  leader_student_id: string
  created_at: string
  members?: TeamMember[]
}

export interface TeamMember {
  id: string
  team_id: string
  student_id: string
  is_leader: boolean
  joined_at: string
  student?: Pick<Student, 'id' | 'full_name' | 'register_number' | 'department_id'>
}

export interface EventRegistration {
  id: string
  event_id: string
  student_id: string
  team_id: string | null
  registration_status: RegistrationStatus
  registered_at: string
  cancelled_at: string | null
  event?: Event
  team?: Team
}

export type RecapTone = 'yellow' | 'purple' | 'blue' | 'red' | 'green' | 'cream'

export interface RecapPanel {
  caption: string
  speech?: string
  sfx?: string
  tone: RecapTone
}

export interface WeeklyRecap {
  id: string
  week_label: string
  title: string
  panels: RecapPanel[]
  is_published: boolean
  published_at: string | null
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  severity: AnnouncementSeverity
  is_pinned: boolean
  is_published: boolean
  publish_at: string | null
  expires_at: string | null
  created_by: string | null
  created_at: string
}

// ── API response wrappers ─────────────────────────────────────
export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: { code: string; message: string }
}

export type ApiResult<T> = ApiSuccess<T> | ApiError

// ── Pagination ────────────────────────────────────────────────
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}
