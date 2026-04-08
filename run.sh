#!/bin/bash

echo "🚀 Starting Chemical Monitoring System..."

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

echo "📥 Installing dependencies..."
pip install -r backend/requirements.txt
pip install -r sensor_simulator/requirements.txt

echo "🧠 Starting Backend..."
cd backend
uvicorn main:app --reload &
BACKEND_PID=$!
cd ..

echo "🤖 Starting Sensor Simulator..."
cd sensor_simulator
python simulator.py &
SIM_PID=$!
cd ..

echo "🌐 Opening Frontend as an application..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
if [ -d "/Applications/Google Chrome.app" ]; then
    open -na "Google Chrome" --args --app="file://$SCRIPT_DIR/frontend/index.html"
else
    open "$SCRIPT_DIR/frontend/index.html"  # Fallback
fi

echo "✅ System Running!"
echo "Backend: http://127.0.0.1:8000"
echo "Press CTRL+C to stop"

# Wait so script doesn't exit
wait