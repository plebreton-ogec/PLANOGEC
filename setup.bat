@echo off
echo Configuration de PLANOGEC...
cd /d "%~dp0"
echo Entrez votre token GitHub (fourni par le developpeur) :
set /p TOKEN=
git config --global credential.helper store
echo https://VOTRE_NOM_UTILISATEUR:%TOKEN%@github.com > %USERPROFILE%\.git-credentials
echo Configuration terminee !
pause
