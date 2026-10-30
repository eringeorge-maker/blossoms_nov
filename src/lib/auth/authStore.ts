// ── Simple Roll-Number Authentication System for Blossoms ──────

export interface StudentProfile {
  rollNumber: string // exactly 6 digits
  name: string
  className?: string
  department?: string
  campus?: string
}

const STORAGE_KEY_STUDENT = 'blossoms_student_session'
const STORAGE_KEY_ADMIN = 'blossoms_admin_session'

// Initial seed roster (will be updated when the user provides the official document)
export const SEEDED_STUDENT_ROSTER: Record<string, { name: string; className: string; department: string }> = {
  '241201': { name: 'Arjun Nair', className: '3 BBA A', department: 'Management' },
  '241202': { name: 'Ananya Sharma', className: '2 BCA B', department: 'Computer Science' },
  '241203': { name: 'Rohan Verma', className: '3 BA ENG', department: 'English' },
  '241204': { name: 'Priya Iyer', className: '1 BCOM C', department: 'Commerce' },
  '241205': { name: 'Kavya Menon', className: '2 BSC PSY', department: 'Psychology' },
  '241206': { name: 'Siddharth Rao', className: '3 BTECH CS', department: 'Computer Science' },
}

/** Check if current roll number is valid 6 digits */
export function isValidRollNumber(roll: string): boolean {
  return /^\d{6}$/.test(roll.trim())
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

/** Log in student by 6-digit roll number */
export function loginStudent(rollNumber: string): { success: boolean; student?: StudentProfile; error?: string } {
  const cleanRoll = rollNumber.trim()
  if (!isValidRollNumber(cleanRoll)) {
    return { success: false, error: 'Roll number must be exactly 6 digits (e.g. 241201).' }
  }

  // Lookup in seeded roster or create friendly profile
  const match = SEEDED_STUDENT_ROSTER[cleanRoll]
  const profile: StudentProfile = {
    rollNumber: cleanRoll,
    name: match?.name || `Student ${cleanRoll}`,
    className: match?.className || 'CHRIST Student',
    department: match?.department || 'Central Campus',
    campus: 'Central Campus',
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

/** Log in developer admin */
export function loginDeveloperAdmin(): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN, 'true')
    window.dispatchEvent(new Event('blossoms-auth-changed'))
  } catch {
    // ignore
  }
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
