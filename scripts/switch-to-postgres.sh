#!/bin/bash
# Script to switch from MySQL to PostgreSQL

echo "🔄 Switching to PostgreSQL..."

# Backup original files
echo "📦 Creating backups..."
cp drizzle/schema.ts drizzle/schema.mysql.backup.ts
cp server/db.ts server/db.mysql.backup.ts

# Replace schema with PostgreSQL version
echo "🔧 Updating schema..."
cp drizzle/schema.postgres.ts drizzle/schema.ts

# Replace db with PostgreSQL version
echo "🔧 Updating database connection..."
cp server/db.postgres.ts server/db.ts

# Update drizzle config
echo "🔧 Updating drizzle config..."
cp drizzle.config.postgres.ts drizzle.config.ts

echo "✅ PostgreSQL migration complete!"
echo "🔍 Next steps:"
echo "  1. Run: npm run db:push:postgres"
echo "  2. Test the application locally"
echo "  3. Deploy to Vercel"
