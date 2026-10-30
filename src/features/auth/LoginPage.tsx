import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DisplayText, ComicPanel, SpeechBubble } from '@/components/comic/ComicPrimitives'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type Step = 'email' | 'otp'

export default function LoginPage() {
  const [step, setStep]       = useState<Step>('email')
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [searchParams]        = useSearchParams()
  const navigate              = useNavigate()
  const redirect              = searchParams.get('redirect') ?? '/app'

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Phase 4: supabase.auth.signInWithOtp({ email })
      await new Promise((r) => setTimeout(r, 1000)) // mock delay
      setStep('otp')
    } catch {
      setError('Could not send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Phase 4: supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
      // Then match to student roster
      await new Promise((r) => setTimeout(r, 1000))
      navigate(redirect, { replace: true })
    } catch {
      setError('Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <SpeechBubble className="mb-6">
          🔐 CHRIST University Identity
        </SpeechBubble>

        <ComicPanel>
          {step === 'email' ? (
            <>
              <DisplayText as="h1" className="text-3xl mb-1">Sign In</DisplayText>
              <p className="text-sm text-ink/60 mb-6">
                Use your CHRIST institutional email address. A one-time code will be sent to verify your identity.
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
                <Input
                  label="Institutional Email"
                  type="email"
                  placeholder="yourname@christuniversity.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  hint="Use your @christuniversity.in email address."
                  error={error ?? undefined}
                />
                <Button type="submit" size="lg" className="w-full" isLoading={loading}>
                  Send Verification Code <ArrowRight className="w-5 h-5" />
                </Button>
              </form>
              <p className="text-xs text-ink/40 mt-4 text-center">
                Your register number is an identifier, not a password. Never share it as a credential.
              </p>
            </>
          ) : (
            <>
              <DisplayText as="h1" className="text-3xl mb-1">Enter Code</DisplayText>
              <p className="text-sm text-ink/60 mb-6">
                We sent a verification code to <strong>{email}</strong>.
                Enter it below to sign in.
              </p>
              <form onSubmit={handleOtpSubmit} className="space-y-4" noValidate>
                <Input
                  label="Verification Code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  required
                  error={error ?? undefined}
                />
                <Button type="submit" size="lg" className="w-full" isLoading={loading}>
                  Verify &amp; Sign In
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => { setStep('email'); setError(null); setOtp('') }}
                >
                  ← Use a different email
                </Button>
              </form>
              <p className="text-xs text-ink/40 mt-4 text-center">
                Code expires in 10 minutes. If no match is found in the student roster,
                please contact the festival support team.
              </p>
            </>
          )}
        </ComicPanel>
      </div>
    </div>
  )
}
