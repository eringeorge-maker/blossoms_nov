import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, AlertCircle, MailCheck, ShieldCheck, UserCheck } from 'lucide-react'
import { DisplayText, ComicPanel } from '@/components/comic/ComicPrimitives'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  isValidRegisterNumber,
  requestAdminCode,
  requestStudentCode,
  signOut,
  useAuth,
  verifyEmailCode,
} from '@/lib/auth/authStore'
import { cn } from '@/lib/utils'
import purpleBurstUrl from '@/assets/brand/bg-purple-burst.svg'

type LoginRole = 'student' | 'admin'
type Step = 'details' | 'code'

const CHRIST_EMAIL = /^[^\s@]+@([a-z0-9-]+\.)*christuniversity\.in$/i

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const [role, setRole] = useState<LoginRole>(searchParams.get('role') === 'admin' ? 'admin' : 'student')
  const [step, setStep] = useState<Step>('details')
  const [registerNumber, setRegisterNumber] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [nameHint, setNameHint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const redirect = searchParams.get('redirect')

  // Already signed in (or just came back from the email link): go where this role belongs.
  useEffect(() => {
    if (!auth.ready || loading) return
    if (role === 'admin' && auth.admin) navigate(redirect ?? '/admin', { replace: true })
    else if (role === 'student' && auth.student) navigate(redirect ?? '/app', { replace: true })
    else if (auth.admin && !auth.student) navigate('/admin', { replace: true })
    else if (auth.student && !auth.admin) navigate(redirect ?? '/app', { replace: true })
    else if (auth.email && auth.linkError) {
      setError(auth.linkError)
      void signOut()
    }
  }, [auth, role, redirect, navigate, loading])

  function switchRole(next: LoginRole) {
    setRole(next)
    setStep('details')
    setCode('')
    setError(null)
  }

  async function sendCode() {
    setError(null)
    if (role === 'student') {
      if (!isValidRegisterNumber(registerNumber)) return setError('Enter your 7-digit register number.')
      if (!CHRIST_EMAIL.test(email.trim())) return setError('Use your CHRIST email (ending in christuniversity.in).')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError('Enter your admin email address.')
    }

    setLoading(true)
    const res = role === 'student' ? await requestStudentCode(registerNumber, email) : await requestAdminCode(email)
    setLoading(false)
    if (!res.ok) return setError(res.message ?? 'Could not send the code.')
    setNameHint(res.nameHint ?? null)
    setStep('code')
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^\d{6}$/.test(code.trim())) return setError('Enter the 6-digit code from the email.')
    setLoading(true)
    const res = await verifyEmailCode(email, code)
    if (!res.ok) {
      setLoading(false)
      setError(res.message ?? 'Sign-in failed.')
      if (res.email) await signOut()
      return
    }
    if (role === 'admin' && !res.admin) {
      setLoading(false)
      setError('This email is not on the Blossoms admin list. Ask a super admin to invite you.')
      await signOut()
      return
    }
    setLoading(false)
    navigate(redirect ?? (role === 'admin' ? '/admin' : '/app'), { replace: true })
  }

  return (
    <div
      style={{ backgroundImage: `url(${purpleBurstUrl})` }}
      className="min-h-[85vh] bg-cover bg-center flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-xl">
        <p className="mb-4 text-xs font-bold text-white uppercase">★ Christ University · Blossoms 2026-27 ★</p>

        <div
          role="tablist"
          aria-label="Sign in as"
          className="grid grid-cols-2 gap-3 mb-6 p-1.5 bg-paper border-2 border-ink rounded-2xl shadow-[3px_3px_0px_var(--color-ink)]"
        >
          <RoleTab active={role === 'student'} onClick={() => switchRole('student')} icon={<UserCheck className="w-4 h-4" />}>
            Student
          </RoleTab>
          <RoleTab active={role === 'admin'} onClick={() => switchRole('admin')} icon={<ShieldCheck className="w-4 h-4" />}>
            Admin
          </RoleTab>
        </div>

        <ComicPanel className="bg-white p-6 sm:p-8">
          <DisplayText as="h1" className="text-3xl sm:text-4xl text-ink mb-2">
            {step === 'code' ? 'Check your email' : role === 'student' ? 'Student sign in' : 'Admin sign in'}
          </DisplayText>

          {step === 'details' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void sendCode()
              }}
              className="space-y-5"
              noValidate
            >
              <p className="text-sm text-ink/70">
                {role === 'student'
                  ? 'Enter your register number and CHRIST email. We email you a 6-digit code: no password needed.'
                  : 'Enter the email you were invited with. We email you a 6-digit code.'}
              </p>

              {role === 'student' && (
                <Input
                  label="Register number"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={7}
                  placeholder="e.g. 2610101"
                  value={registerNumber}
                  onChange={(e) => {
                    setRegisterNumber(e.target.value.replace(/\D/g, '').slice(0, 7))
                    setError(null)
                  }}
                  className="tabular-nums tracking-[0.2em] text-lg"
                  autoFocus
                  required
                />
              )}

              <Input
                label={role === 'student' ? 'CHRIST email' : 'Admin email'}
                type="email"
                autoComplete="email"
                placeholder={role === 'student' ? 'firstname.lastname@bcom.christuniversity.in' : 'you@example.com'}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                autoFocus={role === 'admin'}
                required
              />

              <ErrorLine message={error} />

              <Button type="submit" size="lg" className="w-full gap-2 shadow-[4px_4px_0px_var(--color-ink)]" isLoading={loading}>
                Email me a code <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5" noValidate>
              <div className="flex items-start gap-3 rounded-xl border-2 border-ink bg-paper p-3">
                <MailCheck className="w-5 h-5 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm text-ink">
                  We sent a code to <strong className="break-all">{email.trim().toLowerCase()}</strong>.
                  {nameHint && (
                    <>
                      {' '}
                      Signing in as <strong>{nameHint}</strong> ({registerNumber}).
                    </>
                  )}{' '}
                  You can also open the link in that email on this device.
                </p>
              </div>

              <Input
                label="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setError(null)
                }}
                className="tabular-nums tracking-[0.5em] text-center text-2xl"
                autoFocus
                required
              />

              <ErrorLine message={error} />

              <Button type="submit" size="lg" className="w-full gap-2 shadow-[4px_4px_0px_var(--color-ink)]" isLoading={loading}>
                Sign in <ArrowRight className="w-5 h-5" />
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep('details')
                    setCode('')
                    setError(null)
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> Change details
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void sendCode()}
                  className="font-semibold text-ink/70 hover:text-ink hover:underline disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          {role === 'student' && step === 'details' && (
            <p className="mt-6 border-t-2 border-ink/10 pt-4 text-xs text-ink/60">
              Your email is linked to your register number the first time you sign in. If someone else has already
              linked your number, ask a Blossoms admin to reset it.
            </p>
          )}
        </ComicPanel>
      </div>
    </div>
  )
}

function RoleTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-display text-sm md:text-base tracking-wider uppercase font-bold transition-all',
        active ? 'bg-primary text-white shadow-[2px_2px_0px_var(--color-ink)] -translate-y-0.5' : 'text-ink/70 hover:text-ink hover:bg-white/60'
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="flex items-start gap-1.5 text-sm text-comic-red-deep font-semibold">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}
