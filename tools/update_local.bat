@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\update_local.ps1"
echo.
echo Hotovo. Pokud nebyla vypsana chyba, nahraj na GitHub soubory ze slozky web_dashboard:
echo - index.html
echo - styles.css
echo - app.js
echo - data.js
echo.
pause
