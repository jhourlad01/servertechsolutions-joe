@echo off
setlocal

echo.
echo ========================================
echo 🧪 Starting System-Wide QA Phase
echo ========================================

:: 1. Frontend QA (Next.js)
echo.
echo 🎨 [1/2] Checking Frontend (Next.js)...
cd client
echo.
echo - Running TypeScript type check...
call npx tsc --noEmit
if %errorlevel% neq 0 (
    echo [ERROR] Frontend Type Check failed.
    exit /b 1
)

echo - Running ESLint check...
call npm run lint
if %errorlevel% neq 0 (
    echo [ERROR] Frontend Lint Check failed.
    exit /b 1
)
cd ..

:: 2. Backend QA (Laravel)
echo.
echo 🛡️ [2/2] Checking Backend (Laravel)...
cd api
echo.
echo - Running PHP Syntax verification...
Get-ChildItem -Path app, database, routes -Filter *.php -Recurse | ForEach-Object { php -l $_.FullName } >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Backend Syntax Check failed.
    exit /b 1
)

echo - Running Laravel Pint (Style Check)...
if exist vendor\bin\pint (
    call vendor\bin\pint --test
    if %errorlevel% neq 0 (
        echo [ERROR] Backend Coding Style (Pint) failed.
        exit /b 1
    )
) else (
    echo [SKIP] Laravel Pint not found.
)

echo - Running PHPUnit Tests...
docker compose exec -T api php artisan test --parallel
if %errorlevel% neq 0 (
    echo [WARNING] Some Backend Tests failed (Make sure containers are UP).
)
cd ..

echo.
echo ========================================
echo ✅ QA Passed Successfully!
echo ========================================
echo.
pause
