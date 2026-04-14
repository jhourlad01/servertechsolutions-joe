#!/bin/bash
set -e

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    echo "APP_KEY not set — generating one..."
    export APP_KEY=$(php artisan key:generate --show --no-ansi)
    echo "Generated APP_KEY: $APP_KEY"
fi

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Function to update .env values from environment variables
update_env() {
    local key=$1
    local value=$2
    if [ ! -z "$value" ]; then
        if grep -q "^$key=" .env; then
            sed -i "s|^$key=.*|$key=$value|" .env
        else
            echo "$key=$value" >> .env
        fi
    fi
}

# Sync critical env vars to the .env file if they aren't already there or if passed via Docker
# But don't overwrite the ones we've carefully tuned for the gateway
update_env "APP_KEY" "$APP_KEY"
update_env "APP_ENV" "$APP_ENV"
update_env "APP_DEBUG" "$APP_DEBUG"
update_env "DB_CONNECTION" "$DB_CONNECTION"
update_env "DB_HOST" "$DB_HOST"
update_env "DB_PORT" "$DB_PORT"
update_env "DB_DATABASE" "$DB_DATABASE"
update_env "DB_USERNAME" "$DB_USERNAME"
update_env "DB_PASSWORD" "$DB_PASSWORD"

# Only update these if not already in .env or if we specifically want to force them
# For now, let's respect what's already in the .env if it was mounted or generated
if ! grep -q "SANCTUM_STATEFUL_DOMAINS" .env; then
    update_env "APP_URL" "http://localhost:${API_PORT:-8080}"
    update_env "FRONTEND_URL" "http://localhost:${CLIENT_PORT:-80}"
    update_env "SANCTUM_STATEFUL_DOMAINS" "localhost,127.0.0.1"
fi

# Run migrations
echo "Running migrations and seeders..."
php artisan migrate --force --seed

# Clear and cache config
php artisan config:clear
php artisan storage:link --force || true
php artisan config:cache

# Start PHP-FPM
php-fpm
