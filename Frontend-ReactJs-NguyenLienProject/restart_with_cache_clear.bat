@echo off
echo =======================================
echo 🌐 Translation Cache Clear & Restart
echo =======================================
echo.

echo 🧹 Step 1: Clearing browser cache...
echo Please manually clear browser cache or:
echo - Press Ctrl+Shift+Delete
echo - Or use Ctrl+Shift+R for hard refresh
echo.

echo 🔄 Step 2: Restart React Development Server
echo.

cd /d "c:\MyProject\MyEffort\Frontend-ReactJs-NguyenLienProject"

echo Current directory: %CD%
echo.

echo Stopping any running React servers...
taskkill /f /im node.exe /t 2>nul

echo.
echo Starting fresh React development server...
echo.

npm start

pause