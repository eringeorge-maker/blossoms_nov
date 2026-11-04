import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CheckCircle2 } from 'lucide-react'
import { DisplayText, ComicPanel } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { saveProfilePhone, signOut, useAuth } from '@/lib/auth/authStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { student } = useAuth()
  const [phone, setPhone] = useState(student?.phone ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!student) return null
  const next = searchParams.get('next')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const res = await saveProfilePhone(phone)
    setSaving(false)
    if (!res.ok) return setError(res.message ?? 'Could not save.')
    toast.success('Profile saved')
    if (next && next.startsWith('/')) navigate(next)
  }

  async function handleLogout() {
    await signOut()
    navigate('/login?role=student', { replace: true })
  }

  const rows = [
    { label: 'Register number', value: student.registerNumber },
    { label: 'Class', value: student.className ?? '—' },
    { label: 'Programme', value: student.programme ? `${student.programme}${student.yearOfStudy ? ` · Year ${student.yearOfStudy}` : ''}` : '—' },
    { label: 'Department', value: student.department ?? 'Department of Commerce' },
    { label: 'Campus', value: student.campus ?? 'Central Campus' },
    { label: 'Email', value: student.email ?? '—' },
  ]

  return (
    <div className="mx-auto max-w-[600px] px-4 py-6 space-y-6">
      <DisplayText as="h1" className="text-4xl">My profile</DisplayText>

      <ComicPanel>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary border-2 border-ink flex items-center justify-center text-paper font-display text-3xl" aria-hidden="true">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-2xl">{student.name}</h2>
            {student.profileComplete ? (
              <Badge variant="registered" className="mt-1">
                <CheckCircle2 className="w-3 h-3" /> Profile complete
              </Badge>
            ) : (
              <Badge variant="soon" className="mt-1">Phone number needed</Badge>
            )}
          </div>
        </div>

        <dl className="space-y-1 mb-6">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-3 py-2 border-b border-ink/10 last:border-0">
              <dt className="text-sm text-ink/60 font-medium">{label}</dt>
              <dd className="text-sm font-semibold text-ink text-right break-all">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-ink/50 mb-5">
          These details come from the Department of Commerce student list. If something is wrong, tell your class rep or a
          Blossoms admin.
        </p>

        <form onSubmit={handleSave} className="space-y-4" noValidate>
          <Input
            label="Mobile number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setError(null)
            }}
            hint="Required to register. Event heads use it to reach you about your event."
            error={error ?? undefined}
            required
          />
          <Button type="submit" isLoading={saving}>
            {student.profileComplete ? 'Save changes' : next ? 'Save and continue' : 'Save'}
          </Button>
        </form>
      </ComicPanel>

      <Button variant="outline" className="w-full" onClick={handleLogout}>
        Sign out
      </Button>
    </div>
  )
}
