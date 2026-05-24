@echo off
cd /d "%~dp0"

:: === 1️⃣ Install dependencies (inline, no new CMD window) ===
echo Installing dependencies...
call npm install >nul 2>&1

:: === 2️⃣ Start Node/React project in background (inline) ===
echo Starting Node/React server...
start "" /b cmd /c "npm run start-all"

:: Wait a few seconds for the server to start
timeout /t 5 /nobreak >nul

:: === 3️⃣ Launch Chrome in app mode ===
set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
start "" "%CHROME_PATH%" --app="http://localhost:5173" --user-data-dir="%TEMP%\ChromeApp"

:: === 4️⃣ Wait until Chrome closes ===
:WAIT_CHROME
tasklist /FI "IMAGENAME eq chrome.exe" | find /I "chrome.exe" >nul
if "%errorlevel%"=="0" (
    timeout /t 2 >nul
    goto WAIT_CHROME
)

:: === 5️⃣ Cleanup ===
echo Chrome closed. Cleaning up...

:: Kill Node and NPM processes
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM npm.exe /F >nul 2>&1

:: Kill processes listening on your ports
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo ✅ All processes stopped. Exiting.
exit /b
