import React, { useState } from 'react';
import Layout from '../layout/Layout';
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
    <Layout>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Trading <span className="bright-green-text">Dashboard</span>
          </h1>
          <p className="text-[var(--color-neutral)]">Trade across multiple exchanges with advanced analytics</p>
        </div>
        
        <div className="flex space-x-3 items-center">
          {/* Pair Selector */}
          <select 
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="glass-panel px-3 py-2 rounded-md bg-transparent border-none focus:ring-1 focus:ring-[var(--color-positive)]"
          >
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="XMR/BTC">XMR/BTC</option>
            <option value="SOL/USDT">SOL/USDT</option>
          </select>
          
          {/* AR Mode Toggle */}
          <ARToggle isActive={isARMode} onToggle={toggleARMode} />
        </div>
      </div>
      
      {isARMode ? (
        <div className="ar-container">
          {/* AR Mode will be implemented using Three.js */}
          <div className="glass-panel h-full flex items-center justify-center">
            <p className="text-xl">AR Mode Coming Soon</p>
            <button onClick={toggleARMode} className="btn-primary mt-4">Exit AR Mode</button>
          </div>
        </div>
      ) : (
        <div className="trading-grid gap-4">
          {/* Main Chart */}
          <div className="glass-panel col-span-2 row-span-2 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{selectedPair} Chart</h2>
              <div className="flex space-x-2">
                {['15m', '1h', '4h', '1d', '1w'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-md text-sm ${timeframe === tf ? 'bright-green-bg text-black' : 'bg-gray-700'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <PriceChart pair={selectedPair} timeframe={timeframe} />
          </div>
          
          {/* Order Book */}
          <div className="glass-panel row-span-2 p-4">
            <h2 className="text-lg font-semibold mb-4">Order Book</h2>
            <OrderBook pair={selectedPair} />
          </div>
          
          {/* Trading Form */}
          <div className="glass-panel p-4">
            <h2 className="text-lg font-semibold mb-4">Place Order</h2>
            <TradingForm pair={selectedPair} />
          </div>
          
          {/* Asset Balance */}
          <div className="glass-panel p-4">
            <h2 className="text-lg font-semibold mb-4">Balance</h2>
            <AssetBalance />
          </div>
          
          {/* Active Orders */}
          <div className="glass-panel p-4">
            <h2 className="text-lg font-semibold mb-4">Active Orders</h2>
            <ActiveOrders />
          </div>
          
          {/* Recent Transactions */}
          <div className="glass-panel p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <RecentTransactions />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TradingDashboard;
