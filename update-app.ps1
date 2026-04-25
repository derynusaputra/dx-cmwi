# =============================================================================
# Update Script - Jalankan saat ada perubahan kode
# Jalankan sebagai Administrator
# =============================================================================

param([string]$AppDir = "C:\AppLokal")

Write-Host ">>> Menghentikan service..." -ForegroundColor Cyan
Stop-Service -Name AppLokal-Frontend -Force -ErrorAction SilentlyContinue
Stop-Service -Name AppLokal-Backend  -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ">>> Menyalin file terbaru..." -ForegroundColor Cyan
Copy-Item "$ScriptDir\be\*" "$AppDir\be\" -Recurse -Force
Copy-Item "$ScriptDir\fe\*" "$AppDir\fe\" -Recurse -Force
Copy-Item "$ScriptDir\.env" "$AppDir\.env" -Force

Write-Host ">>> Build backend..." -ForegroundColor Cyan
Set-Location "$AppDir\be"
go build -o "$AppDir\be\server.exe" .

Write-Host ">>> Build frontend..." -ForegroundColor Cyan
Set-Location "$AppDir\fe"
npm run build

Write-Host ">>> Menjalankan ulang service..." -ForegroundColor Cyan
Start-Service -Name AppLokal-Backend
Start-Sleep -Seconds 2
Start-Service -Name AppLokal-Frontend

Write-Host "Update selesai!" -ForegroundColor Green
Get-Service AppLokal-* | Select-Object Name, Status
