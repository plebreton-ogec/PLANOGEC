@echo off
echo ========================================
echo    Installation de PLANOGEC
echo ========================================
echo.
echo Telechargement de PLANOGEC...
git clone https://github.com/gwenlbt/ProjetP2I_PLANOGEC.git
cd ProjetP2I_PLANOGEC
echo.
echo Installation des dependances backend...
cd backend
call npm install
cd ..
echo.
echo Installation des dependances frontend...
cd ogec-dashboard
call npm install
cd ..
echo.
echo Deplacement des scripts de lancement...
copy "%~dp0lancer.bat" "%~dp0ProjetP2I_PLANOGEC\lancer.bat" >nul
copy "%~dp0maj.bat" "%~dp0ProjetP2I_PLANOGEC\maj.bat" >nul
echo.
echo ========================================
echo    Installation terminee !
echo    Ouvrez le dossier ProjetP2I_PLANOGEC
echo    et lancez lancer.bat pour demarrer.
echo ========================================
pause
