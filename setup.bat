@echo off
echo ========================================
echo    Installation de PLANOGEC
echo ========================================
echo.
echo Les étapes qui suivent ne sont à réaliser qu'une seule fois.
echo.
echo Etape 1 : Configuration de Git
set /p USERNAME=Entrez votre nom d'utilisateur GitHub : 
set /p TOKEN=Entrez votre token GitHub : 
git config --global credential.helper store
echo https://%USERNAME%:%TOKEN%@github.com > %USERPROFILE%\.git-credentials
echo.
echo Etape 2 : Telechargement de PLANOGEC
git clone https://github.com/gwenlbt/ProjetP2I_PLANOGEC.git
cd ProjetP2I_PLANOGEC
echo.
echo Etape 3 : Installation des dependances backend
cd backend
call npm install
cd ..
echo.
echo Etape 4 : Installation des dependances frontend
cd ogec-dashboard
call npm install
cd ..
echo.
echo ========================================
echo    Installation terminee !
echo    Lancez lancer.bat pour demarrer.
echo ========================================
pause
