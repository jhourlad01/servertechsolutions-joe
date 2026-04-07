#!/bin/bash

# 1. Check for Docker installation
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed or not in your PATH."
    echo "Please install Docker Desktop (https://www.docker.com/products/docker-desktop/) and try again."
    exit 1
fi

echo "[1/3] Resetting and rebuilding Docker containers..."
docker compose down
if ! docker compose up -d --build; then
    echo "[ERROR] Docker Compose failed to start containers."
    exit 1
fi

echo "[2/3] Waiting for PostgreSQL and API to be ready..."
until docker compose exec api php artisan db:monitor --databases=pgsql > /dev/null 2>&1; do
  echo "Still waiting for database..."
  sleep 2
done

echo "[3/3] Running migrations and seeders..."
if ! docker compose exec api php artisan migrate:fresh --seed; then
    echo "[ERROR] Migration and seeding failed."
    exit 1
fi

echo ""
echo "Issue Intake System is ready!"
echo "URL: http://localhost:8080 (API) / http://localhost (Client)"
echo ""
echo "🛡️ Test Accounts:"
echo " - superadmin@servertech.com / password"
echo " - admin@servertech.com / password"
echo ""
