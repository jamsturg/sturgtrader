@echo off
echo Starting backend server...
start /B npm start --prefix "/root/SturgTrader/backend"
timeout /t 10

echo Starting frontend server...
start /B npm run dev --prefix "/root/SturgTrader/frontend"
