# Simple deployment script for SturgTrader frontend
# This will create a simple HTTP server to host the static files

Write-Host "Starting SturgTrader deployment..." -ForegroundColor Green

# Check if http-server is installed
try {
    $httpServerVersion = npm list -g http-server
    if (-not ($httpServerVersion -match "http-server")) {
        Write-Host "Installing http-server globally..." -ForegroundColor Yellow
        npm install -g http-server
    }
} catch {
    Write-Host "Installing http-server globally..." -ForegroundColor Yellow
    npm install -g http-server
}

# Set the port (8081 to avoid conflict with Freqtrade on 8080)
$port = 8081

Write-Host "Starting SturgTrader on http://localhost:$port" -ForegroundColor Cyan
Write-Host "Your Freqtrade strategies are accessible through the Freqtrade Dashboard link" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Start the server with CORS enabled to allow communications
Set-Location out
http-server -p $port --cors -o
