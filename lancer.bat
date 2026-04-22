@echo off
echo Démarrage de PLANOGEC...
cd /d "%~dp0"

echo Vérification des dépendances backend...
if not exist "%~dp0backend\node_modules" (
    echo Installation des dépendances backend...
    cd /d "%~dp0backend"
    call npm install
    cd /d "%~dp0"
)

echo Vérification des dépendances frontend...
if not exist "%~dp0ogec-dashboard\node_modules" (
    echo Installation des dépendances frontend...
    cd /d "%~dp0ogec-dashboard"
    call npm install
    cd /d "%~dp0"
)

start "Serveur PLANOGEC" cmd /k "cd /d "%~dp0backend" && node server.js"
timeout /t 2 /nobreak >nul

start "Interface PLANOGEC" cmd /k "cd /d "%~dp0ogec-dashboard" && npm start"
timeout /t 5 /nobreak >nul

start http://localhost:3000
echo PLANOGEC est lancé ! Vous pouvez fermer cette fenêtre.
pause
