@echo off
REM FifthDraft - Supabase Setup Script
REM Run this after Docker Desktop is installed and running

echo ========================================
echo FifthDraft - Supabase Setup
echo ========================================
echo.

REM Check if Docker is running
echo [1/5] Checking Docker status...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/
    echo.
    pause
    exit /b 1
)

docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop is not running
    echo Please start Docker Desktop and wait for it to fully start
    echo Then run this script again
    echo.
    pause
    exit /b 1
)

echo Docker is running! ✓
echo.

REM Start Supabase
echo [2/5] Starting Supabase local development...
echo This may take 2-3 minutes on first run...
echo.
call npx supabase start

if %errorlevel% neq 0 (
    echo ERROR: Failed to start Supabase
    echo Check the error message above
    echo.
    pause
    exit /b 1
)

echo.
echo Supabase started successfully! ✓
echo.

REM Apply migrations
echo [3/5] Applying database migrations...
call npx supabase db reset

if %errorlevel% neq 0 (
    echo ERROR: Failed to apply migrations
    echo Check the error message above
    echo.
    pause
    exit /b 1
)

echo.
echo Migrations applied successfully! ✓
echo.

REM Check migration status
echo [4/5] Verifying migrations...
call npx supabase migration list
echo.

REM Final instructions
echo [5/5] Setup complete! ✓
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Copy the ANON KEY and SERVICE_ROLE KEY from above
echo 2. Edit .env.local file with these keys
echo 3. Run: npm run dev
echo 4. Open: http://localhost:3000
echo 5. Open Supabase Studio: http://localhost:54323
echo.
echo ========================================
echo.
pause
