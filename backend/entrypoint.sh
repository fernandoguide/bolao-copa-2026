#!/bin/sh
set -e
echo "📦 DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'NO!')"
echo "🗃️ Running migrations..."
./node_modules/.bin/typeorm migration:run -d dist/config/data-source.js
echo "✅ Migrations complete"
echo "🌱 Running seed..."
node dist/seeds/run-seed.js
echo "✅ Seed complete"
echo "🚀 Starting app..."
exec node dist/main
