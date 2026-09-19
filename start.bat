@echo off
echo ===================================================
echo  Starting HACKX Oil Spill Intelligence System
echo ===================================================

echo Starting Backend API (FastAPI) on http://127.0.0.1:8000...
start "HACKX Backend" cmd /k ".\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend UI (Vite) on http://localhost:5173...
start "HACKX Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo  Both services launched!
echo  - Workstation Dashboard: http://localhost:5173
echo  - API Swagger Docs:      http://127.0.0.1:8000/docs
echo ===================================================
pause
