#!/bin/sh

# Exit on error
set -e

echo "Starting backend server..."
echo "Running Prisma migrations..."

# Run migrations with better error handling
npx prisma migrate deploy

echo "Migrations completed successfully"
echo "Starting Node.js application..."

# Start the application
exec node dist/server.js
