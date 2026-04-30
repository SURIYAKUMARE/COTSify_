# COTsify Auto Setup Script
# Run this in PowerShell: .\setup.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   COTsify - Auto Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Check Python ──────────────────────────────────────────────────────
Write-Host "[1/5] Checking Python..." -ForegroundColor Yellow
$pyPath = "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe"
if (!(Test-Path $pyPath)) {
    $pyPath = (Get-Command python -ErrorAction SilentlyContinue)?.Source
}
if (!$pyPath) {
    Write-Host "  ERROR: Python not found. Install from python.org" -ForegroundColor Red
    exit 1
}
Write-Host "  OK: $pyPath" -ForegroundColor Green

# ── Step 2: Install backend deps ──────────────────────────────────────────────
Write-Host "[2/5] Installing backend dependencies..." -ForegroundColor Yellow
& $pyPath -m pip install fastapi uvicorn python-dotenv httpx pydantic pydantic-settings supabase "pydantic[email]" -q
Write-Host "  OK: Backend packages installed" -ForegroundColor Green

# ── Step 3: Install frontend deps ─────────────────────────────────────────────
Write-Host "[3/5] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install --legacy-peer-deps --silent
Set-Location ..
Write-Host "  OK: Frontend packages installed" -ForegroundColor Green

# ── Step 4: Create .env files if missing ──────────────────────────────────────
Write-Host "[4/5] Setting up environment files..." -ForegroundColor Yellow

if (!(Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "  Created backend\.env" -ForegroundColor Green
} else {
    Write-Host "  backend\.env already exists" -ForegroundColor Gray
}

if (!(Test-Path "frontend\.env.local")) {
    @"
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
"@ | Out-File -FilePath "frontend\.env.local" -Encoding utf8
    Write-Host "  Created frontend\.env.local" -ForegroundColor Green
} else {
    Write-Host "  frontend\.env.local already exists" -ForegroundColor Gray
}

# ── Step 5: Start both servers ────────────────────────────────────────────────
Write-Host "[5/5] Starting servers..." -ForegroundColor Yellow
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; $pyPath -m uvicorn main:app --reload --port 8000" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  SERVERS STARTED!" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend  ->  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend   ->  http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs  ->  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  To enable Google / Phone login:" -ForegroundColor Yellow
Write-Host "  1. Create free account at supabase.com" -ForegroundColor White
Write-Host "  2. Get Project URL + Anon Key" -ForegroundColor White
Write-Host "  3. Paste into frontend\.env.local" -ForegroundColor White
Write-Host "  4. Enable Google in Supabase Auth settings" -ForegroundColor White
Write-Host ""

# Open Chrome
Start-Process "chrome.exe" "http://localhost:3000"
Write-Host "  Opened Chrome at localhost:3000" -ForegroundColor Green
Write-Host ""
