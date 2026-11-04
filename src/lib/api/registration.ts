// Student registration. Every rule (window, team size, duplicates, profile) is enforced
// by the database functions; this file only calls them and shapes the results.
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Event, RegistrationStatus } from '@/types'
import { getEvents } from '@/lib/api/events'

export interface RegistrationResult {
  success: boolean
  registration_id?: string
  team_id?: string
  status?: RegistrationStatus
  error_code?: string
  message: string
  whatsapp_group_url?: string | null
}

export interface RegisterTeamParams {
  eventId: string
  teamName: string
  /** Register numbers of the other members; the signed-in student is added as leader. */
  memberRegisterNumbers: string[]
}

export interface TeamMemberSummary {
  register_number: string
  full_name: string
  class_name: string | null
  is_leader: boolean
}

export interface MyTeam {
  id: string
  team_name: string
  leader_student_id: string
  is_leader: boolean
  members: TeamMemberSummary[]
}

export interface MyRegistration {
  id: string
  event_id: string
  registration_status: RegistrationStatus
  registered_at: string
  cancelled_at: string | null
  attendance_status: 'present' | 'absent' | null
  whatsapp_group_url: string | null
  team: MyTeam | null
  event?: Event
}

export interface StudentSearchResult {
  register_number: string
  full_name: string
  class_name: string | null
}

const OFFLINE: RegistrationResult = {
  success: false,
  error_code: 'OFFLINE',
  message: 'Registration is unavailable: the site is not connected to its database.',
}

async function callRpc(name: string, args: Record<string, unknown>): Promise<RegistrationResult> {
  if (!isSupabaseConfigured) return OFFLINE
  const { data, error } = await supabase.rpc(name, args)
  if (error) return { success: false, error_code: error.code, message: error.message }
  return data as RegistrationResult
}

export function registerIndividualEvent(eventId: string): Promise<RegistrationResult> {
  return callRpc('register_individual_event', { p_event_id: eventId })
}

export function registerTeamEvent(params: RegisterTeamParams): Promise<RegistrationResult> {
  return callRpc('register_team_event', {
    p_event_id: params.eventId,
    p_team_name: params.teamName,
    p_member_register_numbers: params.memberRegisterNumbers,
  })
}

export function cancelRegistration(registrationId: string, reason?: string): Promise<RegistrationResult> {
  return callRpc('cancel_event_registration', { p_registration_id: registrationId, p_reason: reason ?? null })
}

/** The signed-in student's registrations (including team entries others made for them). */
export async function getStudentRegistrations(): Promise<MyRegistration[]> {
  if (!isSupabaseConfigured) return []
  const [{ data, error }, events] = await Promise.all([supabase.rpc('get_my_registrations'), getEvents()])
  if (error) throw new Error(error.message)
  const byId = new Map(events.map((e) => [e.id, e]))
  return ((data ?? []) as MyRegistration[]).map((r) => ({ ...r, event: byId.get(r.event_id) }))
}

export async function getTeamDetails(teamId: string): Promise<MyRegistration | null> {
  const regs = await getStudentRegistrations()
  return regs.find((r) => r.team?.id === teamId) ?? null
}

/** Teammate search: register-number prefix or part of a name, 3+ characters. */
export async function searchStudents(query: string): Promise<StudentSearchResult[]> {
  if (!isSupabaseConfigured || query.trim().length < 3) return []
  const { data, error } = await supabase.rpc('search_students', { p_query: query.trim() })
  if (error) throw new Error(error.message)
  return (data ?? []) as StudentSearchResult[]
}
