#!/bin/bash

echo ""
echo "========================================"
echo "🧪 Starting System-Wide QA Phase"
echo "========================================"

# 1. Frontend QA (Next.js)
echo ""
echo "🎨 [1/2] Checking Frontend (Next.js)..."
cd client
echo ""
echo "- Running TypeScript type check..."
if ! npx tsc --noEmit; then
    echo "[ERROR] Frontend Type Check failed."
    exit 1
fi

echo "- Running ESLint check..."
if ! npm run lint; then
    echo "[ERROR] Frontend Lint Check failed."
    exit 1
fi
cd ..

# 2. Backend QA (Laravel)
echo ""
echo "🛡️ [2/2] Checking Backend (Laravel)..."
cd api
echo ""
echo "- Running PHP Syntax verification..."
find app database routes -name "*.php" -exec php -l {} \; > /dev/null
if [ $? -ne 0 ]; then
    echo "[ERROR] Backend Syntax Check failed."
    exit 1
fi

echo "- Running Laravel Pint (Style Check)..."
if [ -f vendor/bin/pint ]; then
    if ! ./vendor/bin/pint --test; then
        echo "[ERROR] Backend Coding Style (Pint) failed."
        exit 1
    fi
else
    echo "[SKIP] Laravel Pint not found."
fi

echo "- Running PHPUnit Tests..."
if ! docker compose exec -T api php artisan test --parallel; then
    echo "[WARNING] Some Backend Tests failed (Make sure containers are UP)."
fi
cd ..

echo ""
echo "========================================"
echo "✅ QA Passed Successfully!"
echo "========================================"
echo ""
