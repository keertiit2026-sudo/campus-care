@echo off
title CampusCare Platform Launcher
echo ===================================================
echo   🌸 Launching CampusCare Platform
echo   College Facility Grievance & SLA Management
echo ===================================================
echo.
echo [1/3] Starting Backend API Server (Port 5000)...
start "CampusCare Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Web Client (Port 5173)...
start "CampusCare Frontend" cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Opening CampusCare in your default web browser...
start http://localhost:5173/welcome

echo.
echo ===================================================
echo   ✨ CampusCare is running successfully!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo.
echo   Demo Accounts:
echo   - Student: priya.sharma@college.edu / student123
echo   - Admin:   admin@college.edu / admin123
echo   - Staff:   alex.chen@college.edu / staff123
echo ===================================================
pause
