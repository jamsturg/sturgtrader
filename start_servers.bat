@echo off
echo Starting backend server...
set HYPERLIQUID_SECRET_KEY=0xcf7d508A1190b46F988eA181E96F13e34a576570
set HYPERLIQUID_ACCOUNT_ADDRESS=your_hyperliquid_account_address
set HYPERLIQUID_VAULT_ADDRESS=your_hyperliquid_vault_address
set ARBITRUM_RPC_URL=your_arbitrum_rpc_url
start /B /D "C:\Users\adam\Desktop\SturgTrader\backend" npm start
timeout /t 10

echo Starting frontend server...
start /B /D "C:\Users\adam\Desktop\SturgTrader\frontend" npm run dev
