@echo off
chcp 65001 > nul
title ZeroVirguleChance - Serveur Reseau

echo ========================================
echo   ZeroVirguleChance - Serveur Reseau
echo ========================================
echo.

:: 1. Trouver l'IP locale automatiquement
echo [1/5] Detection de l'IP locale...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"Adresse IPv4" ^| findstr /V:"127.0.0.1"') do (
    set "IP=%%a"
    goto :found
)
:found
set "IP=%IP: =%"
if "%IP%"=="" set "IP=localhost"
echo     IP detectee : %IP%
echo.

:: 2. Creer/MAJ le fichier .env
echo [2/5] Configuration du fichier .env...
(
echo # URL du serveur backend - Genere automatiquement
echo VITE_API_URL=http://%IP%:3001/api
) > .env
echo     Fichier .env cree avec VITE_API_URL=http://%IP%:3001/api
echo.

:: 3. Verifier Node.js
echo [3/5] Verification de Node.js...
where node > nul 2>&1
if %errorlevel% neq 0 (
    echo     ERREUR: Node.js n'est pas installe !
    echo     Telecharge-le sur https://nodejs.org
    pause
    exit /b 1
)
echo     Node.js installe : OK
echo.

:: 4. Ouvrir les ports du pare-feu (admin requis)
echo [4/5] Configuration du pare-feu Windows...
net session > nul 2>&1
if %errorlevel% neq 0 (
    echo     ATTENTION: Lance ce script en mode Administrateur pour ouvrir les ports
    echo     Sinon, les autres appareils ne pourront pas se connecter.
    echo.
    echo     Pour ouvrir les ports, execute dans PowerShell (admin):
    echo     New-NetFirewallRule -DisplayName "ZVC Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
    echo     New-NetFirewallRule -DisplayName "ZVC Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
    echo.
) else (
    netsh advfirewall firewall add rule name="ZVC Backend" dir=in action=allow protocol=TCP localport=3001 > nul 2>&1
    netsh advfirewall firewall add rule name="ZVC Frontend" dir=in action=allow protocol=TCP localport=3000 > nul 2>&1
    echo     Ports 3000 et 3001 ouverts dans le pare-feu : OK
)
echo.

:: 5. Demarrer les serveurs
echo [5/5] Demarrage des serveurs...
echo.

:: Creer le dossier data
if not exist "data" mkdir data

:: Lancer le backend dans une nouvelle fenetre
start "ZVC Backend" cmd /k "title ZVC Backend && npm run server"

:: Attendre le backend
echo Attente du demarrage du backend (3s)...
timeout /t 3 /nobreak > nul

:: Build + frontend
echo Build du frontend...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ERREUR: Le build a echoue !
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SERVEURS PRETS
echo ========================================
echo.
echo   Frontend : http://%IP%:3000
echo   Backend  : http://%IP%:3001
echo.
echo   Sur les autres appareils, ouvre:
echo   --^> http://%IP%:3000
echo.
echo   Appuie sur Ctrl+C pour arreter le serveur frontend
echo   Le backend tourne dans une fenetre separee
echo ========================================
echo.

npx serve dist -p 3000 -n

pause
