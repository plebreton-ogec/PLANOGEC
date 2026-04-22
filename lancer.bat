@echo off
echo Démarrage de PLANOGEC...
cd /d "%~dp0ProjetP2I_PLANOGEC"

start "Serveur PLANOGEC" cmd /k "cd /d "%~dp0ProjetP2I_PLANOGEC\backend" && node server.js"
timeout /t 2 /nobreak >nul

start "Interface PLANOGEC" cmd /k "cd /d "%~dp0ProjetP2I_PLANOGEC\ogec-dashboard" && npm start"
timeout /t 5 /nobreak >nul

start http://localhost:3000
echo PLANOGEC est lancé ! Vous pouvez fermer cette fenêtre.
pause
