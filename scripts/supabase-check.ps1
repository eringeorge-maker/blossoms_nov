# Checks the hosted Supabase database against the migrations in supabase/migrations,
# and applies any that are missing only after you confirm.
#
# Run from the repo root in your own terminal:
#   powershell -ExecutionPolicy Bypass -File scripts/supabase-check.ps1
#
# Nothing secret is saved: the password lives only in this PowerShell process and is
# cleared at the end. Reports go to supabase/.temp (git-ignored) so they can be reviewed.

# 'Continue', not 'Stop': Windows PowerShell treats any stderr line from the CLI (even a warning) as a
# terminating error under 'Stop'. Exit codes are checked explicitly instead.
$ErrorActionPreference = 'Continue'
Set-Location (Split-Path $PSScriptRoot -Parent)

$reportDir = 'supabase/.temp'
New-Item -ItemType Directory -Force $reportDir | Out-Null

function Read-Secret([string]$prompt) {
    $secure = Read-Host $prompt -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Invoke-Supabase([string[]]$cliArgs, [string]$reportFile) {
    $output = & npx --yes supabase@2 @cliArgs 2>&1 | Out-String
    $code = $LASTEXITCODE
    # Never write the connection string (it holds the password) into a report.
    $clean = $output -replace 'postgres(ql)?://[^\s"]+', 'postgresql://<redacted>'
    if ($reportFile) { Set-Content -Path (Join-Path $reportDir $reportFile) -Value $clean -Encoding utf8 }
    return @{ Code = $code; Output = $clean }
}

Write-Host ''
Write-Host 'Blossoms: Supabase check' -ForegroundColor Magenta
Write-Host 'Find these in the Supabase dashboard: Project Settings > General (Project ID) and Database (password).'
Write-Host ''

$ref = (Read-Host 'Project ID (the ref), or press Enter to sign in and pick from your projects').Trim()
if (-not $ref) {
    # Opens the browser to sign in with your Supabase account email; the CLI keeps only a revocable access token.
    & npx --yes supabase@2 login
    if ($LASTEXITCODE -ne 0) { Write-Host 'Sign-in did not complete.' -ForegroundColor Red; exit 1 }
    $projects = & npx --yes supabase@2 projects list --output-format json 2>$null | Out-String | ConvertFrom-Json
    if (-not $projects) { Write-Host 'No projects found on this account.' -ForegroundColor Red; exit 1 }
    for ($i = 0; $i -lt $projects.Count; $i++) {
        Write-Host ("  [{0}] {1}  ({2}, {3})" -f ($i + 1), $projects[$i].name, $projects[$i].id, $projects[$i].region)
    }
    $pick = [int](Read-Host 'Number of the Blossoms project') - 1
    $ref = $projects[$pick].id
    Write-Host "Using project $ref"
}
if ($ref -notmatch '^[a-z0-9]{20}$') { Write-Host 'That does not look like a 20-character project ID.' -ForegroundColor Red; exit 1 }
Write-Host 'Database password: Project Settings > Database. If nobody saved it, "Reset database password" there sets a new one.'
$password = Read-Secret 'Database password (hidden)'
$encoded = [Uri]::EscapeDataString($password)

# Direct connection first; many networks only reach Supabase over IPv4, which needs the session pooler.
$dbUrl = "postgresql://postgres:$encoded@db.$ref.supabase.co:5432/postgres"
Write-Host "`nConnecting..." -ForegroundColor Cyan
$list = Invoke-Supabase @('migration', 'list', '--db-url', $dbUrl) 'remote-migrations.txt'

if ($list.Code -ne 0) {
    Write-Host 'Direct connection failed. Use the session pooler instead.' -ForegroundColor Yellow
    Write-Host 'Dashboard: Connect > Session pooler. Copy just the host, e.g. aws-0-ap-south-1.pooler.supabase.com'
    $poolerHost = (Read-Host 'Session pooler host').Trim()
    $dbUrl = "postgresql://postgres.${ref}:$encoded@${poolerHost}:5432/postgres"
    $list = Invoke-Supabase @('migration', 'list', '--db-url', $dbUrl) 'remote-migrations.txt'
    if ($list.Code -ne 0) {
        Write-Host $list.Output
        Write-Host 'Could not connect. Check the password and host, then run again.' -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n1. Migrations (Local = in this repo, Remote = recorded as applied on the database)" -ForegroundColor Cyan
Write-Host $list.Output

Write-Host '2. Tables that exist on the database' -ForegroundColor Cyan
$tables = Invoke-Supabase @('inspect', 'db', 'table-stats', '--db-url', $dbUrl) 'remote-tables.txt'
Write-Host $tables.Output

Write-Host '3. What a push would change' -ForegroundColor Cyan
$dry = Invoke-Supabase @('db', 'push', '--dry-run', '--db-url', $dbUrl) 'remote-push-dry-run.txt'
Write-Host $dry.Output

$remoteHasTables = $tables.Output -match '\bstudents\b'
$pendingMatches = [regex]::Matches($dry.Output, '\b\d{3,}_[a-z0-9_]+\.sql\b')
$pending = $pendingMatches.Count -gt 0
$historyEmpty = $list.Output -notmatch '\|\s*\d{3,}\s*\|\s*\d{3,}'

if (-not $pending) {
    Write-Host 'Database is up to date with the repo. Nothing to apply.' -ForegroundColor Green
}
elseif ($remoteHasTables -and $historyEmpty) {
    # Schema was created by hand (SQL editor), so the CLI has no record of it. Pushing would re-run
    # 001 and fail on objects that already exist.
    Write-Host 'The tables already exist, but the migration history is empty (schema was added by hand).' -ForegroundColor Yellow
    Write-Host 'Not applying anything. Share supabase/.temp with Claude to decide which migrations to mark as applied.'
}
else {
    $answer = Read-Host 'Apply the pending migrations above to the hosted database? (y/N)'
    if ($answer -eq 'y') {
        $push = Invoke-Supabase @('db', 'push', '--db-url', $dbUrl) 'remote-push.txt'
        Write-Host $push.Output
        if ($push.Code -eq 0) { Write-Host 'Migrations applied.' -ForegroundColor Green }
        else { Write-Host 'Push failed. See supabase/.temp/remote-push.txt' -ForegroundColor Red }
    }
    else { Write-Host 'Skipped. Nothing was changed.' }
}

# Optional: point the app at this project. The anon key is the public client key, safe in .env.local.
Write-Host ''
$anon = (Read-Host 'Paste the anon public key to write .env.local (Project Settings > API), or press Enter to skip').Trim()
if ($anon) {
    Set-Content -Path '.env.local' -Encoding utf8 -Value @(
        "VITE_SUPABASE_URL=https://$ref.supabase.co",
        "VITE_SUPABASE_ANON_KEY=$anon"
    )
    Write-Host 'Wrote .env.local (git-ignored). Restart the dev server to pick it up.' -ForegroundColor Green
}

$password = $null; $encoded = $null; $dbUrl = $null
Write-Host "`nReports saved in supabase/.temp (no passwords inside)." -ForegroundColor Magenta
