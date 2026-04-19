@echo off
echo Démarrage de PLANOGEC...
cd /d "%~dp0"
start "Serveur PLANOGEC" cmd /k "cd backend && node server.js"
timeout /t 2 /nobreak >nul
cd ogec-dashboard
start "Interface PLANOGEC" cmd /k "npm start"
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo PLANOGEC est lancé ! Vous pouvez fermer cette fenêtre.
pause
