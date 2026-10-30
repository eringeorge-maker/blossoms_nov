import { DisplayText, ComicPanel } from '@/components/comic/ComicPrimitives'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const MOCK_STUDENT = {
  full_name: 'Priya Sharma',
  register_number: '2212001',
  institutional_email: 'priya.sharma@christuniversity.in',
  department: 'Computer Science',
  campus: 'Central Campus',
  year_of_study: 3,
  phone: '',
}

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-[600px] px-4 py-6 space-y-6">
      <DisplayText as="h1" className="text-4xl">My Profile</DisplayText>

      <ComicPanel>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blossoms-red border-2 border-ink flex items-center justify-center text-paper font-display text-3xl">
            {MOCK_STUDENT.full_name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-2xl">{MOCK_STUDENT.full_name}</h2>
            <p className="text-sm text-ink/60">{MOCK_STUDENT.register_number}</p>
          </div>
        </div>

        <dl className="space-y-3 mb-6">
          {[
            { label: 'Email',         value: MOCK_STUDENT.institutional_email, locked: true },
            { label: 'Department',    value: MOCK_STUDENT.department,           locked: true },
            { label: 'Campus',        value: MOCK_STUDENT.campus,               locked: true },
            { label: 'Year of Study', value: `Year ${MOCK_STUDENT.year_of_study}`, locked: true },
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
            defaultValue={MOCK_STUDENT.phone}
            hint="Only used for event-specific communications if needed."
          />
          <Button type="submit">Save Changes</Button>
        </form>
      </ComicPanel>

      <Button variant="outline" className="w-full" onClick={() => {}}>
        Sign Out
      </Button>
    </div>
  )
}
