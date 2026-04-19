@echo off
echo Mise à jour de PLANOGEC...
cd /d "%~dp0"
git pull
cd ogec-dashboard
call npm install
cd ../backend
call npm install
echo Mise à jour terminée !
pause
