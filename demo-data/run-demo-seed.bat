@echo off
setlocal
cd /d "%~dp0"

echo ==============================================
echo UniConnect - Demo Data Seeder
echo ==============================================
echo.

if not exist "serviceAccountKey.json" (
  echo ERROR: serviceAccountKey.json was not found.
  echo.
  echo Download it from Firebase Console ^> Project Settings ^> Service Accounts
  echo ^> Generate New Private Key, then place it in this folder.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\firebase-admin" (
  echo Installing Firebase Admin SDK...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Check your internet connection and Node.js installation.
    pause
    exit /b 1
  )
)

echo.
echo Seeding demo data...
node seed-demo-data.js
if errorlevel 1 (
  echo.
  echo Demo data import failed.
  pause
  exit /b 1
)

echo.
echo Demo data import completed successfully.
pause
