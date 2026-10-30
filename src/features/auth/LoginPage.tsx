import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, UserCheck, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react'
import { DisplayText, ComicPanel, ComicCaptionBox, SpeechBubble } from '@/components/comic/ComicPrimitives'
import { Button } from '@/components/ui/Button'
import { loginStudent, loginDeveloperAdmin, isValidRollNumber, SEEDED_STUDENT_ROSTER } from '@/lib/auth/authStore'
import { cn } from '@/lib/utils'

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
    const cleaned = val.replace(/\D/g, '').slice(0, 6)
    setRollNumber(cleaned)
    if (error) setError(null)
  }

  function handleStudentLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!rollNumber) {
      setError('Please enter your 6-digit roll number.')
      return
    }

    if (!isValidRollNumber(rollNumber)) {
      setError('Roll number must be exactly 6 digits (e.g. 241201).')
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
    setLoading(true)
    setTimeout(() => {
      loginDeveloperAdmin()
      setLoading(false)
      navigate('/admin', { replace: true })
    }, 300)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Top Comic Dialogue Header */}
        <div className="flex items-center justify-between mb-4">
          <ComicCaptionBox>
            GATEWAY 01 · IDENTITY CHECK
          </ComicCaptionBox>
          <span className="text-xs font-mono font-bold text-ink/60 uppercase">
            ★ CHRIST UNIVERSITY ★
          </span>
        </div>

        <SpeechBubble className="mb-6">
          {role === 'student'
            ? '🎓 Students: Simply enter your 6-digit roll number to step into the registration arena! No password required.'
            : '🛠️ Developers & Organisers: Access the administration panel to manage schedules, slots, and entries.'}
        </SpeechBubble>

        {/* ── ROLE SWITCHER TABS ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1.5 bg-[#FFF8E8] border-2 border-ink rounded-2xl shadow-[3px_3px_0px_#151515]">
          <button
            type="button"
            onClick={() => { setRole('student'); setError(null) }}
            className={cn(
              'flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-display text-sm md:text-base tracking-wider uppercase font-bold transition-all',
              role === 'student'
                ? 'bg-[#F04438] text-white shadow-[2px_2px_0px_#151515] -translate-y-0.5'
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
                <span className="bg-[#FFD43B] text-ink text-[11px] font-mono font-bold px-2 py-0.5 border border-ink rounded">
                  NO PASSWORD NEEDED
                </span>
              </div>

              <p className="text-sm text-ink/70 mb-6 font-medium">
                Enter your <strong>6-digit roll number</strong> to access your personal dashboard, browse competition panels, and register for events.
              </p>

              <form onSubmit={handleStudentLogin} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="rollNumber" className="block font-display text-sm uppercase tracking-wider text-ink mb-2 font-bold">
                    6-Digit Roll Number
                  </label>
                  <div className="relative">
                    <input
                      id="rollNumber"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      placeholder="e.g. 241201"
                      value={rollNumber}
                      onChange={(e) => handleRollChange(e.target.value)}
                      className={cn(
                        'w-full px-4 py-3.5 bg-[#FFF8E8] border-2 border-ink rounded-xl font-mono text-2xl tracking-[0.25em] text-center font-bold text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-[#F04438] transition-all',
                        error ? 'border-[#F04438] bg-red-50' : 'border-ink'
                      )}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-ink/40">
                      {rollNumber.length}/6
                    </div>
                  </div>

                  {error && (
                    <p className="flex items-center gap-1.5 text-xs text-[#F04438] font-bold mt-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </p>
                  )}
                </div>

                {/* Sample roll numbers helper */}
                <div className="bg-[#FFF8E8] p-3 rounded-xl border border-ink/20">
                  <p className="text-[11px] font-mono font-bold text-ink/60 uppercase mb-1.5">
                    ★ Click any test roll number to autofill:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(SEEDED_STUDENT_ROSTER).slice(0, 4).map(([roll, info]) => (
                      <button
                        key={roll}
                        type="button"
                        onClick={() => { setRollNumber(roll); setError(null) }}
                        className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-ink/30 hover:border-ink hover:bg-[#FFD43B] transition-colors"
                      >
                        <strong>{roll}</strong> ({info.name.split(' ')[0]})
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
                  <Sparkles className="w-5 h-5 fill-current" />
                  Enter Registration Portal <ArrowRight className="w-5 h-5" />
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-ink/10 text-center">
                <p className="text-xs text-ink/50 font-medium">
                  All enrolled students are eligible across departments. Your roll number instantly connects you to your event roster.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <DisplayText as="h1" className="text-3xl sm:text-4xl text-ink">
                  Admin &amp; Dev Portal
                </DisplayText>
                <span className="bg-[#151515] text-[#FFD43B] text-[11px] font-mono font-bold px-2 py-0.5 border border-ink rounded">
                  DEVELOPER CONSOLE
                </span>
              </div>

              <p className="text-sm text-ink/70 mb-6 font-medium">
                Administration mode for festival coordinators and developer staff to review live entries, manage venue allocations, and adjust festival schedules.
              </p>

              <form onSubmit={handleAdminLogin} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="adminKey" className="block font-display text-sm uppercase tracking-wider text-ink mb-2 font-bold">
                    Developer Passcode (Optional)
                  </label>
                  <input
                    id="adminKey"
                    type="password"
                    placeholder="Enter admin passcode (or leave blank for dev bypass)"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FFF8E8] border-2 border-ink rounded-xl text-sm font-medium text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-[#151515]"
                  />
                  <p className="text-[11px] text-ink/50 mt-1.5 font-medium">
                    ⚡ Developer bypass is enabled for local and campus testing.
                  </p>
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
                  className="text-xs font-display text-[#F04438] hover:underline uppercase font-bold"
                >
                  ← Back to Student Login
                </button>
                <span className="text-xs font-mono text-ink/50">Admin v1.0</span>
              </div>
            </div>
          )}
        </ComicPanel>
      </div>
    </div>
  )
}
