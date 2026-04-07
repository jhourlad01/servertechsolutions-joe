@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo [QA] Starting System-Wide Quality Check
echo ========================================

:: 1. Frontend QA (Next.js)
echo.
echo [1/2] Checking Frontend (Next.js)...
pushd client
echo.
echo - Running TypeScript type check...
call npx tsc --noEmit
if errorlevel 1 (
    echo [ERROR] Frontend Type Check failed.
    popd
    exit /b 1
)

echo - Running ESLint check...
call npm run lint
if errorlevel 1 (
    echo [ERROR] Frontend Lint Check failed.
    popd
    exit /b 1
)
popd

:: 2. Backend QA (Laravel)
echo.
echo [2/2] Checking Backend (Laravel)...
pushd api
echo.
echo - Running PHP Syntax verification...
:: Simple CMD loop to avoid parentheses issues
for /R app %%f in (*.php) do php -l "%%f" >nul 2>&1 || (echo [ERROR] Syntax error in %%f && popd && exit /b 1)
for /R database %%f in (*.php) do php -l "%%f" >nul 2>&1 || (echo [ERROR] Syntax error in %%f && popd && exit /b 1)
for /R routes %%f in (*.php) do php -l "%%f" >nul 2>&1 || (echo [ERROR] Syntax error in %%f && popd && exit /b 1)

echo - Running Laravel Pint (Style Check)...
if exist vendor\bin\pint (
    call php vendor\bin\pint --test
    if errorlevel 1 (
        echo [ERROR] Backend Coding Style issues found.
        popd
        exit /b 1
    )
) else (
    echo [SKIP] Laravel Pint not found. Run "composer install" on host.
)

popd

echo.
echo ========================================
echo [SUCCESS] 100%% QA Passed (Syntax + Lint)
echo ========================================
echo.
pause
