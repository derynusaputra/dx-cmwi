# =============================================================================
# Setup Script - Aplikasi Lokal di Windows Server (Tanpa Docker)
# Jalankan sebagai Administrator di PowerShell
# =============================================================================

param(
    [string]$AppDir = "C:\AppLokal",
    [string]$ServerIP = "0.0.0.0"
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n>>> $Message" -ForegroundColor Cyan
}

function Write-OK {
    param([string]$Message)
    Write-Host "    [OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "    [!]  $Message" -ForegroundColor Yellow
}

# Cek Administrator
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Script harus dijalankan sebagai Administrator!" -ForegroundColor Red
    exit 1
}

Write-Host "=============================================" -ForegroundColor Magenta
Write-Host "  Setup Aplikasi Lokal - Windows Server      " -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta

# =============================================================================
# 1. Install Chocolatey (package manager)
# =============================================================================
Write-Step "Mengecek Chocolatey..."
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Warn "Chocolatey belum ada, menginstall..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-OK "Chocolatey berhasil diinstall"
} else {
    Write-OK "Chocolatey sudah ada"
}

# =============================================================================
# 2. Install Go
# =============================================================================
Write-Step "Mengecek Go..."
if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    Write-Warn "Go belum ada, menginstall..."
    choco install golang -y
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-OK "Go berhasil diinstall"
} else {
    Write-OK "Go sudah ada: $(go version)"
}

# =============================================================================
# 3. Install Node.js
# =============================================================================
Write-Step "Mengecek Node.js..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Warn "Node.js belum ada, menginstall..."
    choco install nodejs-lts -y
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-OK "Node.js berhasil diinstall"
} else {
    Write-OK "Node.js sudah ada: $(node -v)"
}

# =============================================================================
# 4. Install PostgreSQL
# =============================================================================
Write-Step "Mengecek PostgreSQL..."
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if (-not $pgService) {
    Write-Warn "PostgreSQL belum ada, menginstall..."
    choco install postgresql15 --params '/Password:1234567890' -y
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

    # Tunggu service PostgreSQL siap
    Start-Sleep -Seconds 5

    # Buat database dan user
    $pgBin = "C:\Program Files\PostgreSQL\15\bin"
    if (Test-Path $pgBin) {
        $env:PGPASSWORD = "1234567890"
        & "$pgBin\psql.exe" -U postgres -c "CREATE USER bosani WITH PASSWORD '1234567890';" 2>$null
        & "$pgBin\psql.exe" -U postgres -c "CREATE DATABASE dbl OWNER bosani;" 2>$null
        & "$pgBin\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE dbl TO bosani;" 2>$null
    }
    Write-OK "PostgreSQL berhasil diinstall"
} else {
    Write-OK "PostgreSQL sudah ada"
}

# =============================================================================
# 5. Install NSSM (Non-Sucking Service Manager)
# =============================================================================
Write-Step "Mengecek NSSM..."
if (-not (Get-Command nssm -ErrorAction SilentlyContinue)) {
    Write-Warn "NSSM belum ada, menginstall..."
    choco install nssm -y
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-OK "NSSM berhasil diinstall"
} else {
    Write-OK "NSSM sudah ada"
}

# =============================================================================
# 6. Salin file aplikasi ke direktori permanen
# =============================================================================
Write-Step "Menyiapkan direktori aplikasi di $AppDir..."

if (-not (Test-Path $AppDir)) {
    New-Item -ItemType Directory -Path $AppDir -Force | Out-Null
}
New-Item -ItemType Directory -Path "$AppDir\be" -Force | Out-Null
New-Item -ItemType Directory -Path "$AppDir\fe" -Force | Out-Null
New-Item -ItemType Directory -Path "$AppDir\logs" -Force | Out-Null

# Salin file project (jalankan dari root folder project)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Copy-Item "$ScriptDir\be\*" "$AppDir\be\" -Recurse -Force
Copy-Item "$ScriptDir\fe\*" "$AppDir\fe\" -Recurse -Force
Copy-Item "$ScriptDir\.env" "$AppDir\.env" -Force
Write-OK "File aplikasi disalin ke $AppDir"

# =============================================================================
# 7. Build Backend (Go)
# =============================================================================
Write-Step "Build backend Go..."
Set-Location "$AppDir\be"
go mod tidy
go build -o "$AppDir\be\server.exe" .
Write-OK "Backend berhasil di-build: $AppDir\be\server.exe"

# =============================================================================
# 8. Build Frontend (Next.js)
# =============================================================================
Write-Step "Install dependensi dan build frontend Next.js..."
Set-Location "$AppDir\fe"
npm install
npm run build
Write-OK "Frontend berhasil di-build"

# =============================================================================
# 9. Daftarkan sebagai Windows Service dengan NSSM
# =============================================================================
Write-Step "Mendaftarkan layanan Windows..."

$nodePath = (Get-Command node).Source
$npmPath  = (Get-Command npm).Source

# Hapus service lama jika ada
foreach ($svc in @("AppLokal-Backend","AppLokal-Frontend")) {
    $existing = Get-Service -Name $svc -ErrorAction SilentlyContinue
    if ($existing) {
        Stop-Service -Name $svc -Force -ErrorAction SilentlyContinue
        nssm remove $svc confirm
        Write-Warn "Service lama '$svc' dihapus"
    }
}

# --- Service Backend ---
nssm install AppLokal-Backend "$AppDir\be\server.exe"
nssm set AppLokal-Backend AppDirectory "$AppDir\be"
nssm set AppLokal-Backend AppEnvironmentExtra "GIN_MODE=release" "PORT=8080"
nssm set AppLokal-Backend AppStdout "$AppDir\logs\backend-stdout.log"
nssm set AppLokal-Backend AppStderr "$AppDir\logs\backend-stderr.log"
nssm set AppLokal-Backend AppRotateFiles 1
nssm set AppLokal-Backend AppRotateBytes 10485760
nssm set AppLokal-Backend Start SERVICE_AUTO_START
nssm set AppLokal-Backend ObjectName LocalSystem
Write-OK "Service backend terdaftar"

# --- Service Frontend ---
nssm install AppLokal-Frontend "$nodePath"
nssm set AppLokal-Frontend AppParameters "node_modules\.bin\next start -p 3000"
nssm set AppLokal-Frontend AppDirectory "$AppDir\fe"
nssm set AppLokal-Frontend AppStdout "$AppDir\logs\frontend-stdout.log"
nssm set AppLokal-Frontend AppStderr "$AppDir\logs\frontend-stderr.log"
nssm set AppLokal-Frontend AppRotateFiles 1
nssm set AppLokal-Frontend AppRotateBytes 10485760
nssm set AppLokal-Frontend Start SERVICE_AUTO_START
nssm set AppLokal-Frontend ObjectName LocalSystem
Write-OK "Service frontend terdaftar"

# =============================================================================
# 10. Buka port firewall
# =============================================================================
Write-Step "Mengatur Windows Firewall..."

$rules = @(
    @{ Name = "AppLokal-Backend-8080"; Port = 8080 },
    @{ Name = "AppLokal-Frontend-3000"; Port = 3000 }
)

foreach ($rule in $rules) {
    $existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if ($existing) {
        Remove-NetFirewallRule -DisplayName $rule.Name
    }
    New-NetFirewallRule `
        -DisplayName $rule.Name `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort $rule.Port `
        -Action Allow `
        -Profile Domain,Private | Out-Null
    Write-OK "Port $($rule.Port) dibuka (jaringan lokal saja)"
}

# =============================================================================
# 11. Jalankan service
# =============================================================================
Write-Step "Menjalankan layanan..."

Start-Service -Name AppLokal-Backend
Start-Sleep -Seconds 3
Start-Service -Name AppLokal-Frontend
Start-Sleep -Seconds 3

$beStatus = (Get-Service -Name AppLokal-Backend).Status
$feStatus = (Get-Service -Name AppLokal-Frontend).Status
Write-OK "Backend : $beStatus"
Write-OK "Frontend: $feStatus"

# =============================================================================
# Ringkasan
# =============================================================================
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" } | Select-Object -First 1).IPAddress

Write-Host "`n=============================================" -ForegroundColor Magenta
Write-Host "  Setup Selesai!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Aplikasi bisa diakses dari jaringan lokal:"
Write-Host "  Frontend  : http://$localIP`:3000" -ForegroundColor Yellow
Write-Host "  Backend   : http://$localIP`:8080"  -ForegroundColor Yellow
Write-Host "  Health    : http://$localIP`:8080/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Log ada di: $AppDir\logs\"
Write-Host "  Kelola service:"
Write-Host "    Start  -> Start-Service AppLokal-Backend / AppLokal-Frontend"
Write-Host "    Stop   -> Stop-Service  AppLokal-Backend / AppLokal-Frontend"
Write-Host "    Status -> Get-Service   AppLokal-*"
Write-Host ""
Write-Host "  Service otomatis restart saat Windows reboot." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Magenta
