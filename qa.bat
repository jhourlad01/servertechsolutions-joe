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
echo - Running PHPStan (Level 1)...
if exist vendor\bin\phpstan (
    call php vendor\bin\phpstan analyze -c phpstan.neon --memory-limit=1G
    if errorlevel 1 (
        echo [ERROR] PHPStan analysis failed.
        popd
        exit /b 1
    )
) else (
    echo [SKIP] PHPStan not found.
)

echo.
echo - Running PHPCS (PSR-12)...
if exist vendor\bin\phpcs (
    call php vendor\bin\phpcs --standard=PSR12 app routes database --ignore=*/tests/*,*/vendor/*,*.blade.php
    if errorlevel 1 (
        echo [ERROR] PHPCS standard violations found.
        popd
        exit /b 1
    )
) else (
    echo [SKIP] PHPCS not found.
)

popd

echo.
echo ========================================
echo [SUCCESS] 100%% QA Passed (Syntax + Lint)
echo ========================================
echo.
pause
