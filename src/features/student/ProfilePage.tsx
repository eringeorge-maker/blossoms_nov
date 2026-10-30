import { DisplayText, ComicPanel } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getActiveStudent, logoutStudent } from '@/lib/auth/authStore'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const navigate = useNavigate()
  const student = getActiveStudent() || {
    rollNumber: '241201',
    name: 'Student 241201',
    className: '3 BBA A',
    department: 'Management',
    campus: 'Central Campus',
  }

  function handleLogout() {
    logoutStudent()
    navigate('/login?role=student', { replace: true })
  }
  return (
    <div className="mx-auto max-w-[600px] px-4 py-6 space-y-6">
      <DisplayText as="h1" className="text-4xl">My Profile</DisplayText>

      <ComicPanel>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blossoms-red border-2 border-ink flex items-center justify-center text-paper font-display text-3xl">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-2xl">{student.name}</h2>
            <p className="text-sm text-ink/60 font-mono font-bold">Roll #{student.rollNumber}</p>
          </div>
        </div>

        <dl className="space-y-3 mb-6">
          {[
            { label: 'Roll Number',   value: student.rollNumber,  locked: true },
            { label: 'Class / Sec',   value: student.className || 'CHRIST Student', locked: true },
            { label: 'Department',    value: student.department || 'Central Campus', locked: true },
            { label: 'Campus',        value: 'Central Campus Bangalore', locked: true },
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

        <form className="space-y-4">
          <Input
            label="Mobile Number (optional)"
            type="tel"
            placeholder="+91 98765 43210"
            defaultValue=""
            hint="Only used for event-specific communications if needed."
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
