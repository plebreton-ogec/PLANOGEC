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
echo ========================================
echo    Installation terminee !
echo    Lancez lancer.bat pour demarrer.
echo ========================================
pause
