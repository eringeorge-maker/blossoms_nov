// ── Official Department of Commerce (DOC) Authentication System ──────
import { findStudentByRegisterNo, SAMPLE_STUDENTS, STUDENT_ROSTER } from '@/lib/data/studentsRoster'

export interface StudentProfile {
  rollNumber: string // 7-digit university register number (or roll number)
  name: string
  className?: string
  department?: string
  campus?: string
}

const STORAGE_KEY_STUDENT = 'blossoms_student_session'
const STORAGE_KEY_ADMIN = 'blossoms_admin_session'

// Re-export roster for compatibility with existing imports
export const SEEDED_STUDENT_ROSTER = STUDENT_ROSTER
export { SAMPLE_STUDENTS }

/** Check if input is a valid 6-8 digit register / roll number (official CHRIST register numbers are 7 digits) */
export function isValidRollNumber(roll: string): boolean {
  return /^\d{6,8}$/.test(roll.trim())
}

/** Get active logged in student from localStorage */
export function getActiveStudent(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENT)
    if (!raw) return null
    return JSON.parse(raw) as StudentProfile
  } catch {
    return null
  }
}

/** Log in student by official register number */
export function loginStudent(rollNumber: string): { success: boolean; student?: StudentProfile; error?: string } {
  const cleanRoll = rollNumber.trim()
  if (!cleanRoll) {
    return { success: false, error: 'Please enter your register number.' }
  }

  if (!isValidRollNumber(cleanRoll)) {
    return { success: false, error: 'Register number must be 7 digits (e.g. 2610101).' }
  }

  // Lookup in official student roster from Student List 2026-27.xlsx
  const match = findStudentByRegisterNo(cleanRoll)
  if (!match) {
    return {
      success: false,
      error: `Register number "${cleanRoll}" not found in the official Department of Commerce student list. Please check your 7-digit register number.`,
    }
  }

  const profile: StudentProfile = {
    rollNumber: cleanRoll,
    name: match.name,
    className: match.className,
    department: match.department,
    campus: match.campus,
  }

  try {
    localStorage.setItem(STORAGE_KEY_STUDENT, JSON.stringify(profile))
    window.dispatchEvent(new Event('blossoms-auth-changed'))
  } catch {
    // ignore storage quota error
  }

  return { success: true, student: profile }
}

/** Logout current student */
export function logoutStudent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_STUDENT)
    window.dispatchEvent(new Event('blossoms-auth-changed'))
  } catch {
    // ignore
  }
}

/** Check if developer admin is authenticated */
export function isDeveloperAdmin(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_ADMIN) === 'true'
  } catch {
    return false
  }
}

// Checked in the browser only: this keeps casual visitors out of the dev console,
// but it is not a substitute for server-side auth (Supabase roles / RLS).
const DEV_CONSOLE_PASSCODE = 'blossoms2026'

/** Log in developer admin; returns false when the passcode is wrong */
export function loginDeveloperAdmin(passcode: string): boolean {
  if (passcode !== DEV_CONSOLE_PASSCODE) return false
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN, 'true')
    window.dispatchEvent(new Event('blossoms-auth-changed'))
  } catch {
    // ignore
  }
  return true
}

/** Logout developer admin */
export function logoutDeveloperAdmin(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ADMIN)
    window.dispatchEvent(new Event('blossoms-auth-changed'))
  } catch {
    // ignore
  }
}
