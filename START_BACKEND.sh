#!/bin/bash
# Start Backend Service Script

echo "🚀 Starting Sui Transaction Backend Service..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating it..."
    cat > .env << EOF
PRIVATE_KEY=suiprivkey1qpqvahn5pprg8w7hqve5n5k4q2vp932pwgu3nwl9d6792jrx0rxh2wcknyz
PORT=3000
EOF
    echo "✅ Created .env file"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✅ Starting backend service on port 3000..."
echo "📡 Mint endpoint: http://localhost:3000/mint"
echo "📡 Transfer endpoint: http://localhost:3000/transfer"
echo ""
echo "⚠️  Keep this terminal open!"
echo ""
echo "To use in PlayFab:"
echo "1. Go to PlayFab > Content > Title Data"
echo "2. Add key: BACKEND_SERVICE_URL"
echo "3. Value: http://your-public-ip:3000/mint"
echo "   (or use ngrok for local testing: ngrok http 3000)"
echo ""

npm start

