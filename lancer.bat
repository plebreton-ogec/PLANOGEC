@echo off
echo Démarrage de PLANOGEC...
cd /d "%~dp0"

start "Serveur PLANOGEC" cmd /k "cd /d "%~dp0backend" && node server.js"
timeout /t 2 /nobreak >nul

start "Interface PLANOGEC" cmd /k "cd /d "%~dp0ogec-dashboard" && npm start"
timeout /t 5 /nobreak >nul

start http://localhost:3000
echo PLANOGEC est lancé ! Vous pouvez fermer cette fenêtre.
pause
