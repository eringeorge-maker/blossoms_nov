import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { EventRegistration, RegistrationStatus } from '@/types'

const LOCAL_STORAGE_REGISTRATIONS_KEY = 'blossoms_mock_student_registrations'

export interface RegistrationResult {
  success: boolean
  registration_id?: string
  status?: RegistrationStatus
  error_code?: string
  message: string
  conflicts?: Array<{ event_title: string; starts_at: string; ends_at: string }>
}

function getStoredMockRegistrations(): EventRegistration[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REGISTRATIONS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return [
    {
      id: 'mock-reg-1',
      event_id: 'e-1',
      student_id: 'mock-student-1',
      team_id: 'team-mock-1',
      registration_status: 'confirmed',
      registered_at: '2025-11-02T10:00:00+05:30',
      cancelled_at: null,
      event: {
        id: 'e-1',
        title: 'Battle of the Bands',
        slug: 'battle-of-bands',
        category_id: 'cat-3',
        description: null,
        rules_markdown: null,
        poster_url: null,
        thumbnail_url: null,
        event_format: 'team',
        min_team_size: 3,
        max_team_size: 8,
        registration_opens_at: null,
        registration_closes_at: null,
        capacity: 25,
        waitlist_enabled: true,
        cancellation_allowed: false,
        conflict_policy: 'warn',
        status: 'published',
        organiser_contact: 'doc.music@christuniversity.in',
        created_by: null,
        created_at: '',
        updated_at: '',
        schedule_slots: [
          {
            id: 'slot-1',
            event_id: 'e-1',
            venue_id: 'v-1',
            slot_title: 'Prelims Round',
            starts_at: '2025-11-15T09:00:00+05:30',
            ends_at: '2025-11-15T13:00:00+05:30',
            timezone: 'Asia/Kolkata',
            status: 'scheduled',
            venue: { id: 'v-1', name: 'Main Auditorium', campus_id: 'cc-1', building: 'Central Block', room: 'Ground Floor', capacity: 1200, maps_url: null, created_at: '' }
          }
        ]
      }
    }
  ]
}

function saveStoredMockRegistrations(regs: EventRegistration[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_REGISTRATIONS_KEY, JSON.stringify(regs))
  } catch {
    // ignore
  }
}

export async function registerIndividualEvent(eventId: string): Promise<RegistrationResult> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('register_individual_event', {
        p_event_id: eventId,
      })
      if (!error && data) {
        return data as RegistrationResult
      }
      return {
        success: false,
        message: error?.message || 'Server registration check failed',
      }
    } catch (e: unknown) {
      return {
        success: false,
        message: e instanceof Error ? e.message : 'Registration request failed',
      }
    }
  }

  // ── Mock local registration ──
  const regs = getStoredMockRegistrations()
  const existing = regs.find((r) => r.event_id === eventId && r.registration_status !== 'cancelled')
  if (existing) {
    return {
      success: false,
      error_code: 'ALREADY_REGISTERED',
      message: 'You are already registered for this event.',
    }
  }

  const newReg: EventRegistration = {
    id: `mock-reg-${Date.now()}`,
    event_id: eventId,
    student_id: 'mock-student-1',
    team_id: null,
    registration_status: 'confirmed',
    registered_at: new Date().toISOString(),
    cancelled_at: null,
  }

  regs.unshift(newReg)
  saveStoredMockRegistrations(regs)

  return {
    success: true,
    registration_id: newReg.id,
    status: 'confirmed',
    message: "You're registered for the event! Check your dashboard for details.",
  }
}

export async function cancelRegistration(registrationId: string, reason?: string): Promise<RegistrationResult> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('cancel_event_registration', {
        p_registration_id: registrationId,
        p_reason: reason || null,
      })
      if (!error && data) return data as RegistrationResult
      return { success: false, message: error?.message || 'Cancellation failed' }
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : 'Cancellation error' }
    }
  }

  const regs = getStoredMockRegistrations()
  const idx = regs.findIndex((r) => r.id === registrationId)
  if (idx !== -1) {
    regs[idx].registration_status = 'cancelled'
    regs[idx].cancelled_at = new Date().toISOString()
    saveStoredMockRegistrations(regs)
    return { success: true, message: 'Registration cancelled.' }
  }

  return { success: false, message: 'Registration not found' }
}

export async function getStudentRegistrations(): Promise<EventRegistration[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, event:events(*, category:event_categories(*), schedule_slots:event_schedule_slots(*, venue:venues(*))), team:teams(*)')
        .order('registered_at', { ascending: false })
      if (!error && data) return data as EventRegistration[]
    } catch (e) {
      console.warn('Failed to fetch student registrations from Supabase, using mock', e)
    }
  }

  return getStoredMockRegistrations()
}
