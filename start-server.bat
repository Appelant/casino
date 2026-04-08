@echo off
chcp 65001 > nul
echo ========================================
echo   ZeroVirguleChance - Serveur Complet
echo ========================================
echo.

:: Verifier que Node.js est installe
where node > nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installe !
    echo Telecharge-le sur https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Demarrage du serveur backend...
echo.

:: Creer le dossier data s'il n'existe pas
if not exist "data" mkdir data

:: Demarrer le backend en arriere-plan
start /B cmd /c "npm run server"

:: Attendre que le backend demarre
echo Attente du demarrage du backend...
timeout /t 3 /nobreak > nul

:: Tester si le backend repond
curl -s http://localhost:3001/health > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERREUR: Le backend n'a pas repondu !
    echo Verifie qu'il n'y a pas d'erreur ci-dessus.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Backend demarre avec succes sur http://localhost:3001
echo.

echo [3/3] Build du frontend...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ERREUR: Le build a echoue !
    pause
    exit /b 1
)

echo.
echo Build termine avec succes !
echo.
echo [4/4] Demarrage du serveur frontend...
echo.
echo ========================================
echo   SERVEURS PRETS
echo ========================================
echo.
echo Frontend : http://localhost:3000
echo Backend  : http://localhost:3001
echo.
echo Appuie sur Ctrl+C pour arreter le serveur frontend
echo Le backend tourne dans une fenetre separee
echo.

:: Lancer le serveur frontend
npx serve dist -p 3000 -n

pause
