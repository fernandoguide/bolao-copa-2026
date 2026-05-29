#!/bin/sh
set -e
echo "📦 DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'NO!')"

# Retry migrations up to 5 times with delay
MAX_RETRIES=5
RETRY=0
until [ $RETRY -ge $MAX_RETRIES ]; do
  echo "🗃️ Running migrations... (attempt $((RETRY+1))/$MAX_RETRIES)"
  if ./node_modules/.bin/typeorm migration:run -d dist/config/data-source.js; then
    echo "✅ Migrations complete"
    break
  fi
  RETRY=$((RETRY+1))
  if [ $RETRY -lt $MAX_RETRIES ]; then
    echo "⏳ Retrying in 5s..."
    sleep 5
  else
    echo "❌ Migrations failed after $MAX_RETRIES attempts"
    exit 1
  fi
done

echo "🌱 Running seed..."
node dist/seeds/run-seed.js || echo "⚠️ Seed skipped (may already exist)"
echo "✅ Seed complete"
echo "🚀 Starting app..."
exec node dist/main
