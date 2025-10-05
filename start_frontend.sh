#!/bin/bash

# Simple script to start Next.js frontend in foreground
# Shows all logs in the terminal

echo "🚀 Starting FarmPro.Tech Frontend (Production Mode)..."
echo "Using .env.production for farmpro.tech"
echo "Press Ctrl+C to stop"
echo ""

cd /Users/anoopkondepudi/Desktop/hackathon

# Use production environment
NODE_ENV=production npm start
