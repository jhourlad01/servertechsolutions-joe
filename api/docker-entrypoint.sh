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

# Sync critical env vars to the .env file so Laravel's config:cache sees them
update_env "APP_KEY" "$APP_KEY"
update_env "APP_ENV" "$APP_ENV"
update_env "APP_DEBUG" "$APP_DEBUG"
update_env "DB_CONNECTION" "$DB_CONNECTION"
update_env "DB_HOST" "$DB_HOST"
update_env "DB_PORT" "$DB_PORT"
update_env "DB_DATABASE" "$DB_DATABASE"
update_env "DB_USERNAME" "$DB_USERNAME"
update_env "DB_PASSWORD" "$DB_PASSWORD"
update_env "APP_URL" "http://localhost:${API_PORT}"
update_env "FRONTEND_URL" "http://localhost:${CLIENT_PORT}"
update_env "SANCTUM_STATEFUL_DOMAINS" "localhost,127.0.0.1,localhost:${API_PORT},localhost:${CLIENT_PORT},127.0.0.1:${API_PORT},127.0.0.1:${CLIENT_PORT}"
update_env "SESSION_DRIVER" "$SESSION_DRIVER"
update_env "SESSION_LIFETIME" "$SESSION_LIFETIME"


# Clear and cache config
php artisan config:clear
php artisan storage:link --force || true
php artisan config:cache

# Start PHP-FPM
php-fpm
