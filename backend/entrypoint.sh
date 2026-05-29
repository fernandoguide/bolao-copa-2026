#!/bin/sh
echo "🌱 Running seed..."
node dist/seeds/run-seed.js || echo "⚠️  Seed failed (may already be populated)"
echo "🚀 Starting app..."
exec node dist/main
