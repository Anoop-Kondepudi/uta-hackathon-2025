#!/bin/bash

echo "🔧 Setting up Python backend..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Python 3 found"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the backend server:"
echo "  1. Make sure mango_diseases.pkl is in the backend/ directory"
echo "  2. Run: source venv/bin/activate"
echo "  3. Run: python main.py"
echo ""
echo "Or use the start script:"
echo "  ./start_backend.sh"
