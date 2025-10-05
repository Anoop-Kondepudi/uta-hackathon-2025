#!/bin/bash

# Complete startup script for FarmPro.Tech with Cloudflare Tunnel
# =================================================================

echo "🌾 Starting FarmPro.Tech with Cloudflare Tunnel..."
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pm2 delete farmpro 2>/dev/null || true
pm2 delete farmpro-backend 2>/dev/null || true
pm2 delete farmpro-tunnel 2>/dev/null || true

# Start the Next.js frontend
echo "🚀 Starting Next.js frontend..."
cd /Users/anoopkondepudi/Desktop/hackathon
pm2 start npm --name "farmpro" -- start

# Start the Python backend
echo "🐍 Starting Python backend..."
pm2 start "python3 /Users/anoopkondepudi/Desktop/hackathon/backend/main.py" --name "farmpro-backend"

# Start the Cloudflare tunnel
echo "☁️  Starting Cloudflare Tunnel..."
pm2 start cloudflared --name "farmpro-tunnel" -- tunnel run farmpro

# Save the PM2 process list
pm2 save

echo ""
echo "✅ All services started!"
echo ""
pm2 list
echo ""
echo "📊 View logs:"
echo "  pm2 logs farmpro          - Frontend logs"
echo "  pm2 logs farmpro-backend  - Backend logs"
echo "  pm2 logs farmpro-tunnel   - Tunnel logs"
echo ""
echo "🌐 Your site should be live at: https://farmpro.tech"
echo ""
