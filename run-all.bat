@echo off
:menu
cls
echo =================================
echo   StudentOS Management Script
echo =================================
echo.
echo 1. Start Both Services (Frontend + Backend)
echo 2. Start Backend Only
echo 3. Start Frontend Only
echo 4. Kill All Services (Free Port 8081 ^& 5174)
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto start_all
if "%choice%"=="2" goto start_backend
if "%choice%"=="3" goto start_frontend
if "%choice%"=="4" goto kill_all
if "%choice%"=="5" goto eof

:start_all
echo Starting StudentOS Backend...
start cmd /k "cd backend && .\mvnw.cmd spring-boot:run"
echo Starting StudentOS Frontend...
start cmd /k "cd frontend && npm run dev"
echo Both services are launching in new windows.
pause
goto menu

:start_backend
echo Starting StudentOS Backend...
start cmd /k "cd backend && .\mvnw.cmd spring-boot:run"
pause
goto menu

:start_frontend
echo Starting StudentOS Frontend...
start cmd /k "cd frontend && npm run dev"
pause
goto menu

:kill_all
echo Killing Java processes (Backend)...
taskkill /F /IM java.exe /T >nul 2>&1
echo Killing Node processes (Frontend)...
taskkill /F /IM node.exe /T >nul 2>&1
echo Services have been forcefully stopped and ports freed!
pause
goto menu

:eof
exit
