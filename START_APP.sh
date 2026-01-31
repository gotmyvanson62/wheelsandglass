#!/bin/bash

# Wheels and Glass - Start Development Servers

cd "$(dirname "$0")"

echo "🚀 Starting Wheels and Glass Development Servers..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if shared is built
if [ ! -d "shared/dist" ]; then
    echo "🔨 Building shared package..."
    npm run build:shared
fi

echo ""
echo "✅ Starting frontend at http://localhost:5173"
echo "✅ Starting backend at http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev
