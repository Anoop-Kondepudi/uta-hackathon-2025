#!/bin/bash

# Simple script to start Cloudflare Tunnel in foreground
# Shows all logs in the terminal

echo "☁️  Starting Cloudflare Tunnel..."
echo "Press Ctrl+C to stop"
echo ""

cloudflared tunnel run farmpro
