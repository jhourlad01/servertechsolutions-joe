@echo off
setlocal enabledelayedexpansion

:: 1. Load Port Settings from .env
if not exist .env (
    echo [ERROR] .env file not found!
    exit /b 1
)

for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    set "key=%%a"
    set "val=%%b"
    if "!key!"=="CLIENT_PORT" set "PORT_CLIENT=!val!"
    if "!key!"=="API_PORT" set "PORT_API=!val!"
)

if "%PORT_CLIENT%"=="" ( echo [ERROR] CLIENT_PORT missing in .env & exit /b 1 )
if "%PORT_API%"=="" ( echo [ERROR] API_PORT missing in .env & exit /b 1 )

:: 2. Clear Port Conflicts using DOS commands
echo [0/3] Clearing port conflicts...
for %%p in (%PORT_CLIENT% %PORT_API%) do (
    for /f "tokens=5" %%i in ('netstat -aon ^| findstr /c:":%%p " ^| findstr "LISTENING"') do (
        echo [INFO] Port %%p is used by PID %%i. Terminating...
        taskkill /F /PID %%i >nul 2>&1
    )
)

:: 2. Check for Docker installation and daemon status
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in your PATH.
    echo Please install Docker Desktop ^(https://www.docker.com/products/docker-desktop/^) and try again.
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon is not running.
    echo Please start Docker Desktop and ensure the engine is ready before running this script.
    exit /b 1
)

set PRUNE_FLAG=
if "%~1"=="--prune" (
    echo [INFO] Pruning orphaned containers enabled.
    set PRUNE_FLAG=--remove-orphans
)

echo Resetting and rebuilding Docker containers...
docker compose down %PRUNE_FLAG%
docker compose up -d --build %PRUNE_FLAG%
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose failed to start containers.
    exit /b 1
)

echo Waiting for API and DB to be ready...
:check_api
:: Rapid check (1s) instead of slow ping
docker compose exec api php artisan db:monitor --databases=pgsql >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 1 /nobreak >nul
    goto check_api
)

:: Clear caches before running migrations/seeders
echo Running maintenance tasks...
docker compose exec api php artisan config:clear >nul 2>&1
docker compose exec api php artisan cache:clear >nul 2>&1

echo Running migrations and seeders...
docker compose exec api php artisan migrate:fresh --seed
if %errorlevel% neq 0 (
    echo [ERROR] Migration and seeding failed.
    exit /b 1
)

echo.
echo Issue Intake System is ready!
echo URL: http://localhost:%PORT_API% (API) / http://localhost:%PORT_CLIENT% (Client)
echo.
echo 🛡️ Test Accounts:
echo.
echo   [Administrators]
echo   - superadmin@servertech.com / password
echo   - admin@servertech.com / password
echo.
echo   [Technicians]
echo   - isaac.c@servertech.com / password
echo.
echo   [Support Agents]
echo   - sarah.c@servertech.com / password
echo.
echo   [Customers]
echo   - wick@customera.com / password
echo   - ripley@customerb.com / password
echo.
