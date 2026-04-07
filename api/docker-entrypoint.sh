#!/bin/bash
set -e

# Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    echo "APP_KEY not set — generating one..."
    export APP_KEY=$(php artisan key:generate --show --no-ansi)
    echo "Generated APP_KEY: $APP_KEY"
fi

# Write a minimal .env so Laravel can boot
cat > /var/www/html/.env <<EOF
APP_NAME=ServerTechAPI
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=http://localhost

LOG_CHANNEL=stderr
LOG_LEVEL=error

DB_CONNECTION=${DB_CONNECTION:-mysql}
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE:-servertechsolutions}
DB_USERNAME=${DB_USERNAME:-servertechsolutions}
DB_PASSWORD=${DB_PASSWORD:-secret}

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
EOF

# Clear and cache config
php artisan config:clear
php artisan storage:link --force || true
php artisan config:cache

# Start Apache
exec apache2-foreground
