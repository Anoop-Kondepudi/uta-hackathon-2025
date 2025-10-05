#!/bin/bash

# Start production server for FarmPro.Tech
echo "Starting FarmPro.Tech production server..."
echo "Your site will be accessible at http://farmpro.tech"
echo ""

# Check if build exists
if [ ! -d ".next" ]; then
    echo "No build found. Building first..."
    npm run build
fi

# Start the production server on port 3000
PORT=3000 npm start
