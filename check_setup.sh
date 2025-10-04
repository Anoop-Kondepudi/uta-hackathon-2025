#!/bin/bash

echo "🔍 Checking Mango Disease Detection Setup..."
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    echo "   Please run this from: /Users/anoopkondepudi/Desktop/hackathon"
    exit 1
fi

echo "✅ In correct directory"
echo ""

# Check backend directory
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found"
    exit 1
fi

echo "✅ Backend directory exists"
echo ""

# Check for model file
if [ -f "backend/mango_diseases.pkl" ]; then
    echo "✅ Model file found (mango_diseases.pkl)"
    ls -lh backend/mango_diseases.pkl | awk '{print "   Size: " $5}'
else
    echo "⚠️  Model file NOT found"
    echo "   Please copy mango_diseases.pkl to backend/ directory:"
    echo "   cp /path/to/mango_diseases.pkl backend/"
fi

echo ""

# Check if venv exists
if [ -d "backend/venv" ]; then
    echo "✅ Python virtual environment exists"
else
    echo "⚠️  Python virtual environment not set up"
    echo "   Run: cd backend && ./setup.sh"
fi

echo ""

# Check if backend is running
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Backend server is RUNNING on port 8000"
    echo ""
    echo "   Checking model status..."
    MODEL_STATUS=$(curl -s http://localhost:8000/ | grep -o '"model_loaded":[^,}]*' | cut -d':' -f2)
    if [ "$MODEL_STATUS" = "true" ]; then
        echo "   ✅ Model is LOADED"
        echo ""
        echo "   Available diseases:"
        curl -s http://localhost:8000/diseases | python3 -m json.tool | grep '"diseases"' -A 20
    else
        echo "   ❌ Model is NOT loaded"
    fi
else
    echo "❌ Backend server is NOT running"
    echo "   Start it with: cd backend && ./start_backend.sh"
fi

echo ""

# Check if frontend is running
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Frontend server is RUNNING on port 3000"
else
    echo "⚠️  Frontend server is NOT running"
    echo "   Start it with: npm run dev"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if curl -s http://localhost:8000/ > /dev/null 2>&1 && curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "🎉 Everything is running!"
    echo ""
    echo "📍 URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Detector: http://localhost:3000/detector"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
else
    echo "⚠️  Not everything is running yet"
    echo ""
    echo "To start backend:"
    echo "   cd backend && ./start_backend.sh"
    echo ""
    echo "To start frontend:"
    echo "   npm run dev"
fi

echo ""
