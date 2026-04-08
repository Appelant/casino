@echo off
chcp 65001 > nul
title ZeroVirguleChance - Dev

:: Auto-detect local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"Adresse IPv4" ^| findstr /V:"127.0.0.1"') do (
    set "IP=%%a"
    goto :found
)
:found
set "IP=%IP: =%"
if "%IP%"=="" set "IP=localhost"

:: Create data folder if needed
if not exist "data" mkdir data

echo ========================================
echo   ZVC Dev Mode
echo ========================================
echo.
echo   Frontend : http://%IP%:5173
echo   Backend  : http://%IP%:3001
echo.
echo ========================================
echo.

:: Start backend in a separate window
start "ZVC Backend" cmd /k "npm run server"

:: Start Vite dev server (hot reload) in this window
npm run dev
