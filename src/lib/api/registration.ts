import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { EventRegistration, RegistrationStatus, Team, TeamMember } from '@/types'
import { getActiveStudent } from '@/lib/auth/authStore'
import { findStudentByRegisterNo } from '@/lib/data/studentsRoster'
import { EVENTS } from '@/lib/data/eventsData'

const LOCAL_STORAGE_REGISTRATIONS_KEY = 'blossoms_mock_student_registrations_v2'

export interface RegistrationResult {
  success: boolean
  registration_id?: string
  team_id?: string
  status?: RegistrationStatus
  error_code?: string
  message: string
  conflicts?: Array<{ event_title: string; starts_at: string; ends_at: string }>
}

export interface RegisterTeamParams {
  eventId: string
  teamName: string
  memberRollNumbers: string[]
}

// ── Default 2026 Seed Registrations Aligned with Official Master Schedule ─
function getDefaultSeedRegistrations(): EventRegistration[] {
  const acousticEvent = EVENTS.find((e) => e.slug === 'western-acoustic-band') || EVENTS[0]
  return [
    {
      id: 'reg-seed-2026-1',
      event_id: acousticEvent.id,
      student_id: '2610101',
      team_id: 'team-seed-1',
      registration_status: 'confirmed',
      registered_at: '2026-11-10T11:00:00+05:30',
      cancelled_at: null,
      team: {
        id: 'team-seed-1',
        event_id: acousticEvent.id,
        team_name: 'The Central Resonance',
        leader_student_id: '2610101',
        created_at: '2026-11-10T11:00:00+05:30',
        members: [
          {
            id: 'tm-1',
            team_id: 'team-seed-1',
            student_id: '2610101',
            is_leader: true,
            joined_at: '2026-11-10T11:00:00+05:30',
            student: {
              id: '2610101',
              full_name: 'Aaditya Sharma',
              register_number: '2610101',
              department_id: 'Commerce',
            },
          },
          {
            id: 'tm-2',
            team_id: 'team-seed-1',
            student_id: '2610102',
            is_leader: false,
            joined_at: '2026-11-10T11:00:00+05:30',
            student: {
              id: '2610102',
              full_name: 'Aanchal R',
              register_number: '2610102',
              department_id: 'Commerce',
            },
          },
          {
            id: 'tm-3',
            team_id: 'team-seed-1',
            student_id: '2610103',
            is_leader: false,
            joined_at: '2026-11-10T11:00:00+05:30',
            student: {
              id: '2610103',
              full_name: 'Aarav Nair',
              register_number: '2610103',
              department_id: 'Commerce',
            },
          },
        ],
      },
      event: acousticEvent,
    },
  ]
}

export function getStoredRegistrations(): EventRegistration[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REGISTRATIONS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  const seeds = getDefaultSeedRegistrations()
  saveStoredRegistrations(seeds)
  return seeds
}

export function saveStoredRegistrations(regs: EventRegistration[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_REGISTRATIONS_KEY, JSON.stringify(regs))
    window.dispatchEvent(new Event('blossoms-registrations-changed'))
  } catch {
    // ignore
  }
}

/** Retrieve all registrations across all students (used by Admin portal) */
export async function getAllRegistrations(): Promise<EventRegistration[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, event:events(*), team:teams(*)')
        .order('registered_at', { ascending: false })
      if (!error && data) return data as EventRegistration[]
    } catch {
      // fallback
    }
  }
  return getStoredRegistrations()
}

/** Retrieve registrations for the active student */
export async function getStudentRegistrations(): Promise<EventRegistration[]> {
  const activeStudent = getActiveStudent()
  const activeRoll = activeStudent?.rollNumber

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('event_registrations')
        .select('*, event:events(*, category:event_categories(*), schedule_slots:event_schedule_slots(*, venue:venues(*))), team:teams(*)')
        .order('registered_at', { ascending: false })

      if (activeRoll) {
        query = query.eq('student_id', activeRoll)
      }
      const { data, error } = await query
      if (!error && data) return data as EventRegistration[]
    } catch {
      // fallback
    }
  }

  const allRegs = getStoredRegistrations()
  if (!activeRoll) return allRegs

  // Return registrations where student is the registrant OR is listed in the team members
  return allRegs.filter((r) => {
    if (r.student_id === activeRoll) return true
    if (r.team?.members?.some((m) => m.student_id === activeRoll || m.student?.register_number === activeRoll)) return true
    return false
  })
}

/** Register for an individual solo event */
export async function registerIndividualEvent(eventId: string): Promise<RegistrationResult> {
  const activeStudent = getActiveStudent()
  const studentRoll = activeStudent?.rollNumber || '2610101'

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('register_individual_event', {
        p_event_id: eventId,
      })
      if (!error && data) return data as RegistrationResult
      return { success: false, message: error?.message || 'Server registration check failed' }
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : 'Registration request failed' }
    }
  }

  // ── Mock local registration ──
  const regs = getStoredRegistrations()
  const existing = regs.find(
    (r) => r.event_id === eventId && r.student_id === studentRoll && r.registration_status !== 'cancelled'
  )
  if (existing) {
    return {
      success: false,
      error_code: 'ALREADY_REGISTERED',
      message: 'You are already registered for this event.',
    }
  }

  const eventObj = EVENTS.find((e) => e.id === eventId)

  const newReg: EventRegistration = {
    id: `reg-${Date.now()}-${studentRoll}`,
    event_id: eventId,
    student_id: studentRoll,
    team_id: null,
    registration_status: 'confirmed',
    registered_at: new Date().toISOString(),
    cancelled_at: null,
    event: eventObj,
  }

  regs.unshift(newReg)
  saveStoredRegistrations(regs)

  return {
    success: true,
    registration_id: newReg.id,
    status: 'confirmed',
    message: "You're registered for the event! Check your dashboard for details.",
  }
}

/** Register for a team event with verified team members */
export async function registerTeamEvent(params: RegisterTeamParams): Promise<RegistrationResult> {
  const { eventId, teamName, memberRollNumbers } = params
  const activeStudent = getActiveStudent()

  if (!activeStudent) {
    return { success: false, message: 'You must be signed in with your register number to form a crew.' }
  }

  const cleanTeamName = teamName.trim()
  if (!cleanTeamName) {
    return { success: false, message: 'Please provide a valid team name.' }
  }

  const eventObj = EVENTS.find((e) => e.id === eventId)
  if (!eventObj) {
    return { success: false, message: 'Event not found.' }
  }

  // Ensure unique list including leader
  const allRolls = Array.from(new Set([activeStudent.rollNumber, ...memberRollNumbers.map((r) => r.trim()).filter(Boolean)]))

  const min = eventObj.min_team_size || 2
  const max = eventObj.max_team_size || 15

  if (allRolls.length < min) {
    return {
      success: false,
      message: `Team size is too small. ${eventObj.title} requires at least ${min} members.`,
    }
  }
  if (allRolls.length > max) {
    return {
      success: false,
      message: `Team size exceeds limit. Maximum allowed is ${max} performers.`,
    }
  }

  // Validate that all entered roll numbers exist in the university roster
  const validatedMembers: TeamMember[] = []
  const teamId = `team-${Date.now()}`

  for (const roll of allRolls) {
    const isLeader = roll === activeStudent.rollNumber
    const verified = findStudentByRegisterNo(roll)
    if (!verified && !isLeader) {
      return {
        success: false,
        message: `Teammate register number "${roll}" was not found in the official university roster.`,
      }
    }
    validatedMembers.push({
      id: `tm-${teamId}-${roll}`,
      team_id: teamId,
      student_id: roll,
      is_leader: isLeader,
      joined_at: new Date().toISOString(),
      student: {
        id: roll,
        full_name: verified ? verified.name : activeStudent.name,
        register_number: roll,
        department_id: verified ? verified.department : (activeStudent.department || 'Commerce'),
      },
    })
  }

  const teamData: Team = {
    id: teamId,
    event_id: eventId,
    team_name: cleanTeamName,
    leader_student_id: activeStudent.rollNumber,
    created_at: new Date().toISOString(),
    members: validatedMembers,
  }

  const regs = getStoredRegistrations()
  // Check if leader already registered
  const existing = regs.find(
    (r) => r.event_id === eventId && r.student_id === activeStudent.rollNumber && r.registration_status !== 'cancelled'
  )
  if (existing) {
    return {
      success: false,
      error_code: 'ALREADY_REGISTERED',
      message: 'You are already registered in a team for this event.',
    }
  }

  const newReg: EventRegistration = {
    id: `reg-${Date.now()}-${activeStudent.rollNumber}`,
    event_id: eventId,
    student_id: activeStudent.rollNumber,
    team_id: teamId,
    registration_status: 'confirmed',
    registered_at: new Date().toISOString(),
    cancelled_at: null,
    team: teamData,
    event: eventObj,
  }

  regs.unshift(newReg)
  saveStoredRegistrations(regs)

  return {
    success: true,
    registration_id: newReg.id,
    team_id: teamId,
    status: 'confirmed',
    message: `Team "${cleanTeamName}" has been successfully registered!`,
  }
}

/** Retrieve team details by ID */
export function getTeamDetails(teamId: string): { team: Team | null; event: any | null } {
  const regs = getStoredRegistrations()
  const found = regs.find((r) => r.team_id === teamId || r.team?.id === teamId)
  if (found && found.team) {
    return { team: found.team, event: found.event || null }
  }
  return { team: null, event: null }
}

/** Cancel a student registration */
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

  const regs = getStoredRegistrations()
  const idx = regs.findIndex((r) => r.id === registrationId)
  if (idx !== -1) {
    regs[idx].registration_status = 'cancelled'
    regs[idx].cancelled_at = new Date().toISOString()
    saveStoredRegistrations(regs)
    return { success: true, message: 'Registration cancelled.' }
  }

  return { success: false, message: 'Registration not found' }
}
