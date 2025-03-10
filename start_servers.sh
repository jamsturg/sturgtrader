#!/bin/bash

echo "Starting backend server..."
npm start --prefix "/root/SturgTrader/backend" &  # Run backend in the background
sleep 10  # Wait for 10 seconds (adjust as needed)
echo "Starting frontend server..."
npm run dev --prefix "/root/SturgTrader/frontend"  # Run frontend
