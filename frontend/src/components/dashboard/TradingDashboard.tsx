import React, { useState } from 'react';
import PriceChart from '../trading/PriceChart';
import OrderBook from '../trading/OrderBook';
import TradingForm from '../trading/TradingForm';
import ActiveOrders from '../trading/ActiveOrders';
import AssetBalance from '../trading/AssetBalance';
import RecentTransactions from '../trading/RecentTransactions';
import ARToggle from '../ar/ARToggle';

const TradingDashboard: React.FC = () => {
  const [isARMode, setIsARMode] = useState(false);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1h');

  const toggleARMode = () => {
    setIsARMode(prev => !prev);
  };

  return (
    <div className="trading-dashboard">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Trading <span className="bright-blue-text">Dashboard</span>
          </h1>
          <p className="text-[var(--color-neutral)]">Trade across multiple exchanges with advanced analytics</p>
        </div>
        
        <div className="flex space-x-4 items-center">
          {/* Pair Selector */}
          <div className="glass-panel px-3 py-2 rounded-md flex items-center">
            <span className="mr-2 text-sm text-gray-400">Pair:</span>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="bg-transparent border-none focus:ring-1 focus:ring-[var(--color-positive)] text-white"
            >
              <option value="BTC/USDT">BTC/USDT</option>
              <option value="ETH/USDT">ETH/USDT</option>
              <option value="XMR/BTC">XMR/BTC</option>
              <option value="SOL/USDT">SOL/USDT</option>
            </select>
          </div>
          
          {/* AR Mode Toggle */}
          <ARToggle isActive={isARMode} onToggle={toggleARMode} />
        </div>
      </div>
      
      {isARMode ? (
        <div className="ar-container">
          {/* AR Mode will be implemented using Three.js */}
          <div className="glass-panel h-full flex flex-col items-center justify-center">
            <p className="text-xl mb-4">AR Mode Coming Soon</p>
            <button onClick={toggleARMode} className="btn-primary">Exit AR Mode</button>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Main Chart */}
          <div className="glass-panel p-5 dashboard-chart">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{selectedPair} Chart</h2>
              <div className="flex space-x-2">
                {['15m', '1h', '4h', '1d', '1w'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-md text-sm ${timeframe === tf ? 'bright-blue-bg text-black font-medium' : 'bg-gray-800 hover:bg-gray-700'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-container">
              <PriceChart pair={selectedPair} timeframe={timeframe} />
            </div>
          </div>
          
          {/* Order Book */}
          <div className="glass-panel p-5 dashboard-orderbook">
            <h2 className="text-lg font-semibold mb-4">Order Book</h2>
            <OrderBook pair={selectedPair} />
          </div>
          
          {/* Trading Form */}
          <div className="glass-panel p-5 dashboard-trading-form">
            <h2 className="text-lg font-semibold mb-4">Place Order</h2>
            <TradingForm pair={selectedPair} />
          </div>
          
          {/* Asset Balance */}
          <div className="glass-panel p-5 dashboard-balance">
            <h2 className="text-lg font-semibold mb-4">Balance</h2>
            <AssetBalance />
          </div>
          
          {/* Active Orders */}
          <div className="glass-panel p-5 dashboard-active-orders">
            <h2 className="text-lg font-semibold mb-4">Active Orders</h2>
            <ActiveOrders />
          </div>
          
          {/* Recent Transactions */}
          <div className="glass-panel p-5 dashboard-transactions">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <RecentTransactions />
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingDashboard;
