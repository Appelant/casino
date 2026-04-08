@echo off
echo ========================================
echo   ZeroVirguleChance - Serveur Local
echo ========================================
echo.
echo Build du projet...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ERREUR: Le build a echoue!
    pause
    exit /b 1
)

echo.
echo Build termine avec succes!
echo.
echo Le serveur est accessible a l'adresse:
echo   -> http://localhost:3000
echo   -> http://<ton-ip-locale>:3000 (depuis un autre appareil)
echo.
echo Appuie sur Ctrl+C pour arreter le serveur
echo.

:: Lancer le serveur sur le port 3000, accessible depuis le reseau local
serve dist -p 3000 -n

pause
