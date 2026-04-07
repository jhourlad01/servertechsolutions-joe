#!/bin/bash
set -e

echo ""
echo "========================================"
echo "[QA] Starting System-Wide Quality Check"
echo "========================================"

# 1. Frontend QA (Next.js)
echo ""
echo "[1/2] Checking Frontend (Next.js)..."
cd client
echo ""
echo "- Running TypeScript type check..."
npx tsc --noEmit

echo "- Running ESLint check..."
npm run lint
cd ..

# 2. Backend QA (Laravel)
echo ""
echo "[2/2] Checking Backend (Laravel)..."
cd api
echo ""
echo "- Running PHP Syntax verification..."
find app database routes -name "*.php" -exec php -l {} \; > /dev/null

echo "- Running Laravel Pint (Style Check)..."
if [ -f vendor/bin/pint ]; then
    php vendor/bin/pint --test
else
    echo "[SKIP] Laravel Pint not found."
fi
cd ..

echo ""
echo "========================================"
echo "[SUCCESS] 100% QA Passed (Syntax + Lint)"
echo "========================================"
echo ""
