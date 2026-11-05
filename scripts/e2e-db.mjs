#!/usr/bin/env node
// Runs supabase/tests/e2e_full_flow.sql against the linked Supabase project and
// prints a readable report. The SQL rolls itself back, so no test data is kept.
//
//   npm run test:e2e                       (uses the linked project)
//   SUPABASE_PROJECT_REF=xxxx npm run test:e2e
//
// Exit code: 0 when nothing failed (warnings allowed), 1 otherwise.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sqlFile = path.join('supabase', 'tests', 'e2e_full_flow.sql')
const ref = process.env.SUPABASE_PROJECT_REF ?? 'ypxqtqmodcstqfnumcuq'

const args = ['supabase@2', 'db', 'query', '--linked', '--project-ref', ref, '-f', sqlFile, '--output-format', 'json']
const run = spawnSync('npx', args, { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' })
const out = `${run.stdout ?? ''}\n${run.stderr ?? ''}`

const start = out.indexOf('E2E_REPORT')
if (start < 0) {
  console.error('Could not find the E2E report. Raw output:\n' + out)
  process.exit(1)
}
// The report is inside a JSON-escaped error string; undo the escaping.
let report = out.slice(start)
report = report.split(/\\+"/)[0].replace(/\\+n/g, '\n').replace(/\\+$/gm, '')
report = report.replace(/\nCONTEXT:[\s\S]*$/, '').trim()

const lines = report.split('\n')
const [, pass, fail, warn] = lines[0].match(/pass=(\d+) fail=(\d+) warn=(\d+)/) ?? []
console.log(`\nBlossoms E2E: ${pass} passed, ${fail} failed, ${warn} warnings\n`)
for (const line of lines.slice(1)) {
  if (line.startsWith('PASSED ')) console.log('  passed steps: ' + line.slice(7).replace(/,/g, ' '))
  else if (line.trim()) console.log('  ' + line)
}
console.log('\n(all test rows were rolled back)\n')
process.exit(Number(fail) > 0 || pass === undefined ? 1 : 0)
