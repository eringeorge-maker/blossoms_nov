import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, UserCheck, ShieldAlert, AlertCircle } from 'lucide-react'
import { DisplayText, ComicPanel } from '@/components/comic/ComicPrimitives'
import { Button } from '@/components/ui/Button'
import { loginStudent, loginDeveloperAdmin, isValidRollNumber, SAMPLE_STUDENTS } from '@/lib/auth/authStore'
import { cn } from '@/lib/utils'
import purpleBurstUrl from '@/assets/brand/bg-purple-burst.svg'

type LoginRole = 'student' | 'admin'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const initialRole = (searchParams.get('role') as LoginRole) || 'student'
  const [role, setRole] = useState<LoginRole>(initialRole)
  const [rollNumber, setRollNumber] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const redirect = searchParams.get('redirect') ?? '/app'

  function handleRollChange(val: string) {
    // Only accept numeric characters up to 6 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 7)
    setRollNumber(cleaned)
    if (error) setError(null)
  }

  function handleStudentLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!rollNumber) {
      setError('Please enter your 7-digit register number.')
      return
    }

    if (!isValidRollNumber(rollNumber)) {
      setError('Register number must be 7 digits (e.g. 2610101).')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const res = loginStudent(rollNumber)
      setLoading(false)
      if (res.success) {
        navigate(redirect, { replace: true })
      } else {
        setError(res.error || 'Login failed')
      }
    }, 300)
  }

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setTimeout(() => {
      const ok = loginDeveloperAdmin(adminKey)
      setLoading(false)
      if (ok) {
        navigate('/admin', { replace: true })
      } else {
        setError('Incorrect developer passcode.')
      }
    }, 300)
  }

  return (
    <div style={{ backgroundImage: `url(${purpleBurstUrl})` }} className="min-h-[85vh] bg-cover bg-center flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Top Comic Dialogue Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-white uppercase">
            ★ CHRIST UNIVERSITY ★
          </span>
        </div>

        {/* ── ROLE SWITCHER TABS ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1.5 bg-[#FFF8E8] border-2 border-ink rounded-2xl shadow-[3px_3px_0px_#151515]">
          <button
            type="button"
            onClick={() => { setRole('student'); setError(null) }}
            className={cn(
              'flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-display text-sm md:text-base tracking-wider uppercase font-bold transition-all',
              role === 'student'
                ? 'bg-[#793f98] text-white shadow-[2px_2px_0px_#151515] -translate-y-0.5'
                : 'text-ink/70 hover:text-ink hover:bg-white/60'
            )}
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('admin'); setError(null) }}
            className={cn(
              'flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-display text-sm md:text-base tracking-wider uppercase font-bold transition-all',
              role === 'admin'
                ? 'bg-[#151515] text-[#FFD43B] shadow-[2px_2px_0px_#151515] -translate-y-0.5'
                : 'text-ink/70 hover:text-ink hover:bg-white/60'
            )}
          >
            <ShieldAlert className="w-4 h-4 text-[#FFD43B]" />
            <span>Admin / Dev</span>
          </button>
        </div>

        {/* ── LOGIN FORM CARD ──────────────────────────────────── */}
        <ComicPanel className="bg-white p-6 sm:p-8">
          {role === 'student' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <DisplayText as="h1" className="text-3xl sm:text-4xl text-ink">
                  Student Sign In
                </DisplayText>
                <span className="bg-[#FFD43B] text-ink text-[11px] tabular-nums font-bold px-2 py-0.5 border border-ink rounded">
                  NO PASSWORD NEEDED
                </span>
              </div>

              <form onSubmit={handleStudentLogin} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="rollNumber" className="block font-display text-sm uppercase tracking-wider text-ink mb-2 font-bold">
                    7-Digit Register / Roll Number
                  </label>
                  <div className="relative">
                    <input
                      id="rollNumber"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={7}
                      autoFocus
                      placeholder="e.g. 2610101"
                      value={rollNumber}
                      onChange={(e) => handleRollChange(e.target.value)}
                      className={cn(
                        'w-full px-4 py-3.5 bg-[#FFF8E8] border-2 border-ink rounded-xl tabular-nums text-2xl tracking-[0.25em] text-center font-bold text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-[#793f98] transition-all',
                        error ? 'border-[#df1b23] bg-red-50' : 'border-ink'
                      )}
                    />
<div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs tabular-nums font-bold text-ink/40">
                      {rollNumber.length}/7
                    </div>
                  </div>

                  {error && (
                    <p className="flex items-center gap-1.5 text-xs text-[#df1b23] font-bold mt-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </p>
                  )}
                </div>

                {/* Sample roll numbers helper */}
                <div className="bg-[#FFF8E8] p-3 rounded-xl border border-ink/20">
                  <p className="text-[11px] tabular-nums font-bold text-ink/60 uppercase mb-1.5">
                    ★ Click any test roll number to autofill:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_STUDENTS.map((item) => (
                      <button
                        key={item.roll}
                        type="button"
onClick={() => { setRollNumber(item.roll); setError(null) }}
                        className="text-[11px] tabular-nums bg-white px-2 py-1 rounded border border-ink/30 hover:border-ink hover:bg-[#FFD43B] transition-colors"
                      >
                        <strong>{item.roll}</strong> ({item.name.split(' ')[0]} · {item.className})
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full text-lg gap-2 shadow-[4px_4px_0px_#151515]"
                  isLoading={loading}
                >
                                    Enter Registration Portal <ArrowRight className="w-5 h-5" />
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-ink/10 text-center">
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <DisplayText as="h1" className="text-3xl sm:text-4xl text-ink">
                  Admin &amp; Dev Portal
                </DisplayText>
                <span className="bg-[#151515] text-[#FFD43B] text-[11px] tabular-nums font-bold px-2 py-0.5 border border-ink rounded">
                  DEVELOPER CONSOLE
                </span>
              </div>

              <p className="text-sm text-ink/70 mb-6 font-medium">
                Administration mode for festival coordinators and developer staff to review live entries, manage venue allocations, and adjust festival schedules.
              </p>

              <form onSubmit={handleAdminLogin} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="adminKey" className="block font-display text-sm uppercase tracking-wider text-ink mb-2 font-bold">
                    Developer Passcode
                  </label>
                  <input
                    id="adminKey"
                    type="password"
                    placeholder="Enter admin passcode"
                    value={adminKey}
                    onChange={(e) => { setAdminKey(e.target.value); if (error) setError(null) }}
                    className={cn(
                      'w-full px-4 py-3 bg-[#FFF8E8] border-2 border-ink rounded-xl text-sm font-medium text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-[#151515]',
                      error ? 'border-[#df1b23] bg-red-50' : 'border-ink'
                    )}
                  />
                  {error && (
                    <p className="flex items-center gap-1.5 text-xs text-[#df1b23] font-bold mt-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full text-lg bg-[#151515] text-white hover:bg-[#151515]/90 border-2 border-ink shadow-[4px_4px_0px_#151515] gap-2"
                  isLoading={loading}
                >
                  <ShieldAlert className="w-5 h-5 text-[#FFD43B]" />
                  Enter Developer Console <ArrowRight className="w-5 h-5" />
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-ink/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className="text-xs font-display text-[#793f98] hover:underline uppercase font-bold"
                >
                  ← Back to Student Login
                </button>
                <span className="text-xs tabular-nums text-ink/50">Admin v1.0</span>
              </div>
            </div>
          )}
        </ComicPanel>
      </div>
    </div>
  )
}
