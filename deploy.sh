#!/bin/bash
# deploy.sh - Zero Downtime Deployment Script for VPS

echo "🚀 Starting Deployment..."

# 1. Pull latest code
git pull origin main

# 2. Build the new images (this takes time but doesn't cause downtime)
echo "📦 Building new Docker images..."
docker compose build

# 3. Restart containers. 
# We use docker compose up -d which will recreate only changed containers.
echo "🔄 Updating containers..."
docker compose up -d

# 4. Clean up old dangling images to save space
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment complete!"
