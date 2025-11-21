#!/bin/bash

echo "🎯 Frontend Donation System - Quick Start"
echo "=========================================="
echo ""

# Check if services are running
check_service() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo "✅ $name is running"
        return 0
    else
        echo "❌ $name is NOT running"
        return 1
    fi
}

echo "📡 Checking Services..."
check_service "http://localhost:8004/health" "Payment Service (8004)"
check_service "http://localhost:9001/health" "Wallet Service (9001)"
echo ""

echo "🚀 Starting Frontend Development Server..."
echo ""
echo "Make sure you have:"
echo "1. Created .env file with VITE_PAYMENT_SERVICE_URL=http://localhost:8004"
echo "2. Installed dependencies: npm install"
echo ""
echo "Starting server..."

npm run dev
