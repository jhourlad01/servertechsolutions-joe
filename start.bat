@echo off
setlocal

:: 1. Check for Docker installation
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in your PATH.
    echo Please install Docker Desktop ^(https://www.docker.com/products/docker-desktop/^) and try again.
    pause
    exit /b 1
)

echo [1/3] Resetting and rebuilding Docker containers...
docker compose down
docker compose up -d --build
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose failed to start containers.
    pause
    exit /b 1
)

echo [2/3] Waiting for PostgreSQL and API to be ready...
:check_db
docker compose exec api php artisan db:monitor --databases=pgsql >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 >nul
    goto check_db
)

:: Clear caches before running migrations/seeders
echo [2.5/3] Clearing Laravel caches...
docker compose exec api php artisan config:clear
docker compose exec api php artisan cache:clear

echo [3/3] Running migrations and seeders...
docker compose exec api php artisan migrate:fresh --seed
if %errorlevel% neq 0 (
    echo [ERROR] Migration and seeding failed.
    pause
    exit /b 1
)

echo.
echo Issue Intake System is ready!
echo URL: http://localhost:8080 ^(API^) / http://localhost ^(Client^)
echo.
echo 🛡️ Test Accounts:
echo - superadmin@servertech.com / password
echo - admin@servertech.com / password
echo.
pause
