#!/bin/sh
set -e

echo "========================================="
echo "Starting FastNotes API..."
echo "========================================="
echo "DATABASE_URL: ${DATABASE_URL:-'not set'}"
echo "CORS_ORIGINS: ${CORS_ORIGINS:-'not set'}"
echo "SECRET_KEY: ${SECRET_KEY:+'***set***'}"
echo "Working directory: $(pwd)"
echo "Contents of /app:"
ls -la /app
echo "========================================="

# Create data directory if it doesn't exist
mkdir -p /app/data
echo "Created/verified /app/data directory"

# Start uvicorn
echo "Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips "*"
