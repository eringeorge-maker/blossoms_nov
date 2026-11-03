import { useState } from 'react'
import { DisplayText, ComicPanel } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getActiveStudent, logoutStudent } from '@/lib/auth/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const navigate = useNavigate()
  const student = getActiveStudent()
  const [mobile, setMobile] = useState(() => {
    return localStorage.getItem(`blossoms_mobile_${student?.rollNumber}`) || ''
  })

  if (!student) {
    navigate('/login?role=student', { replace: true })
    return null
  }

  function handleLogout() {
    logoutStudent()
    navigate('/login?role=student', { replace: true })
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (student) {
      localStorage.setItem(`blossoms_mobile_${student.rollNumber}`, mobile)
    }
    toast.success('Mobile contact saved successfully!')
  }

  return (
    <div className="mx-auto max-w-[600px] px-4 py-6 space-y-6">
      <DisplayText as="h1" className="text-4xl">My Profile</DisplayText>

      <ComicPanel>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary border-2 border-ink flex items-center justify-center text-paper font-display text-3xl">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-2xl">{student.name}</h2>
            <p className="text-sm text-ink/60 tabular-nums font-bold">Roll #{student.rollNumber}</p>
          </div>
        </div>

        <dl className="space-y-3 mb-6">
          {[
            { label: 'Register Number', value: student.rollNumber,  locked: true },
            { label: 'Class / Sec',     value: student.className || 'CHRIST Student', locked: true },
            { label: 'Department',      value: student.department || 'Department of Commerce', locked: true },
            { label: 'Campus',          value: student.campus || 'Central Campus Bangalore', locked: true },
          ].map(({ label, value, locked }) => (
            <div key={label} className="flex justify-between gap-3 py-2 border-b border-ink/10 last:border-0">
              <dt className="text-sm text-ink/50 font-medium">{label}</dt>
              <dd className="text-sm font-semibold text-ink flex items-center gap-2">
                {value}
                {locked && <Badge variant="outline" className="text-[10px] px-1.5">University record</Badge>}
              </dd>
            </div>
          ))}
        </dl>

        <p className="text-xs text-ink/40 mb-4">
          Fields marked "University record" are sourced from the official student roster and cannot be edited here.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Mobile Number (optional)"
            type="tel"
            placeholder="+91 98765 43210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            hint="Only used for emergency event-specific coordination if needed."
          />
          <Button type="submit">Save Changes</Button>
        </form>
      </ComicPanel>

      <Button variant="outline" className="w-full border-2 border-ink" onClick={handleLogout}>
        Sign Out (Roll #{student.rollNumber})
      </Button>
    </div>
  )
}
