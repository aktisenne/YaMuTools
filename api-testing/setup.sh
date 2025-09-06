#!/bin/bash

# YaMuTools API Testing Environment Setup
# This script sets up and starts the API testing environment

echo "🚀 Setting up YaMuTools API Testing Environment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "test-runner.html" ]; then
    echo "❌ Error: Please run this script from the api-testing directory"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required to run the test server"
    echo "Please install Python 3 and try again"
    exit 1
fi

echo "📦 Starting local test server on http://localhost:8000"
echo "🌐 Open your browser to: http://localhost:8000/test-runner.html"
echo ""
echo "📋 Instructions:"
echo "1. Open the test runner in your browser"
echo "2. Get a Yandex Music OAuth token"
echo "3. Enter the token and click 'Store Token'"
echo "4. Click 'Validate Token' to ensure it works"
echo "5. Run the API tests"
echo ""
echo "🔑 To get an OAuth token:"
echo "1. Go to https://oauth.yandex.ru/"
echo "2. Create an application or use existing"
echo "3. Copy your Client ID"
echo "4. Use the 'Get Auth URL' button in the test runner"
echo ""
echo "⚠️  Important: Never commit real tokens to version control!"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 -m http.server 8000
