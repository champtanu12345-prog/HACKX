Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Starting HACKX Oil Spill Intelligence System" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host "Starting Backend API (FastAPI) on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\.venv\Scripts\python.exe' -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting Frontend UI (Vite) on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev"

Write-Host "`nBoth services launched!" -ForegroundColor Green
Write-Host " - Workstation Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host " - API Swagger Docs:      http://127.0.0.1:8000/docs" -ForegroundColor White
