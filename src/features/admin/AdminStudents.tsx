import { useState, useMemo } from 'react'
import { DisplayText } from '@/components/comic/ComicPrimitives'
import { Button } from '@/components/ui/Button'
import { Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, GraduationCap } from 'lucide-react'
import { STUDENT_ROSTER } from '@/lib/data/studentsRoster'

const PAGE_SIZE = 50

interface StudentEntry {
  registerNo: string
  name: string
  rawName: string
  className: string
  department: string
  campus: string
}

const ALL_STUDENTS: StudentEntry[] = Object.entries(STUDENT_ROSTER).map(([registerNo, data]) => ({
  registerNo,
  ...data,
}))

export default function AdminStudents() {
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Extract unique classes for filter dropdown
  const classes = useMemo(() => {
    const set = new Set<string>()
    for (const s of ALL_STUDENTS) {
      if (s.className) set.add(s.className)
    }
    return Array.from(set).sort()
  }, [])

  const filteredStudents = useMemo(() => {
    return ALL_STUDENTS.filter((s) => {
      if (classFilter !== 'all' && s.className !== classFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchRoll = s.registerNo.includes(q)
        const matchName = s.name.toLowerCase().includes(q)
        const matchClass = s.className.toLowerCase().includes(q)
        return matchRoll || matchName || matchClass
      }
      return true
    })
  }, [search, classFilter])

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE) || 1
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredStudents.slice(start, start + PAGE_SIZE)
  }, [filteredStudents, currentPage])

  function handleFilterChange(val: string) {
    setClassFilter(val)
    setCurrentPage(1)
  }

  function handleSearchChange(val: string) {
    setSearch(val)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <DisplayText as="h1" className="text-4xl">Verified Student Roster</DisplayText>
          <p className="text-sm text-ink/60 mt-1">
            Official Department of Commerce student database from <code className="font-bold text-ink">student_list_updated.xlsx</code>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#FFF8E8] border border-ink px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#151515]">
          <GraduationCap className="w-5 h-5 text-[#793f98]" />
          <span className="font-display text-base text-ink tabular-nums">
            {ALL_STUDENTS.length.toLocaleString()} Total Records
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#151515]">
          <p className="text-xs uppercase font-bold text-ink/50 tracking-wider">Total Enrolled</p>
          <p className="font-display text-3xl text-ink mt-0.5">{ALL_STUDENTS.length.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#151515]">
          <p className="text-xs uppercase font-bold text-[#26A69A] tracking-wider">Verified Records</p>
          <p className="font-display text-3xl text-[#26A69A] mt-0.5">100%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#151515]">
          <p className="text-xs uppercase font-bold text-[#793f98] tracking-wider">Active Classes</p>
          <p className="font-display text-3xl text-[#793f98] mt-0.5">{classes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-ink shadow-[2px_2px_0px_#151515]">
          <p className="text-xs uppercase font-bold text-ink/50 tracking-wider">Current Filter</p>
          <p className="font-display text-2xl text-ink mt-0.5 truncate">{filteredStudents.length} matches</p>
        </div>
      </div>

      {/* Search and Class Filter */}
      <div className="p-4 bg-white rounded-2xl border-2 border-ink shadow-[3px_3px_0px_#151515] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Search by 7-digit register number, student name, or section…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FFF8E8] border border-ink rounded-xl text-sm font-semibold text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-[#793f98]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink/50" />
          <select
            value={classFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 bg-[#FFF8E8] border border-ink rounded-xl text-xs font-bold text-ink uppercase tracking-wider focus:outline-none max-w-[200px]"
          >
            <option value="all">All Classes ({classes.length})</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="comic-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead className="border-b-2 border-ink bg-[#FFF8E8]">
              <tr>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Register Number</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Full Student Name</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Class / Section</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Department</th>
                <th className="px-4 py-3 text-left font-display text-xs uppercase tracking-wider text-ink">Campus</th>
                <th className="px-4 py-3 text-right font-display text-xs uppercase tracking-wider text-ink">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink/50 font-medium">
                    No students found matching "{search}".
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.registerNo} className="border-b border-ink/10 hover:bg-[#FFF8E8]/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-ink text-sm">
                      {s.registerNo}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {s.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-[#FFF8E8] border border-ink/40 text-ink text-xs font-bold px-2 py-0.5 rounded">
                        {s.className}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink/70">
                      {s.department}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink/60">
                      {s.campus}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00966b] bg-[#00966b]/10 border border-[#00966b]/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t-2 border-ink bg-[#FFF8E8] flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs font-semibold text-ink/70">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length} students
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <span className="text-xs font-bold px-2 tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
