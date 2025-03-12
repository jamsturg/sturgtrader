import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ARToggle from '../ar/ARToggle';
import ARVisualization from '../ARVisualization/ARVisualization';
import HyperliquidPriceChart from '../trading/hyperliquid/HyperliquidPriceChart';
import HyperliquidOrderBook from '../trading/hyperliquid/HyperliquidOrderBook';
import HyperliquidPositions from '../trading/hyperliquid/HyperliquidPositions';
import HyperliquidOrders from '../trading/hyperliquid/HyperliquidOrders';
import AssetBalance from '../trading/AssetBalance';
import TradingForm from '../trading/TradingForm';

// Create QueryClient outside the component to prevent recreation on renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      refetchInterval: 30 * 1000, // 30 seconds
      retry: 1,
    },
  },
});

const TradingDashboard: React.FC = () => {
  const [isARMode, setIsARMode] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('1h');
  
  const availableSymbols = ['BTC', 'ETH', 'SOL', 'AVAX'];
  const availableTimeframes: Array<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'> = ['5m', '15m', '1h', '4h', '1d'];

  const toggleARMode = () => {
    setIsARMode(prev => !prev);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="trading-dashboard">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Trading <span className="text-blue-500">Dashboard</span>
            </h1>
            <p className="text-gray-400">Real-time data from Hyperliquid exchange</p>
          </div>
          
          <div className="flex space-x-4 items-center">
            {/* Symbol Selector */}
            <div className="bg-gray-800 px-3 py-2 rounded-md flex items-center">
              <div className="flex space-x-2">
                {availableSymbols.map(symbol => (
                  <button
                    key={symbol}
                    onClick={() => setActiveSymbol(symbol)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      activeSymbol === symbol
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
            
            {/* AR Mode Toggle */}
            <ARToggle isActive={isARMode} onToggle={toggleARMode} />
          </div>
        </div>
        
        {isARMode ? (
          <div className="ar-container">
            <ARVisualization symbol={activeSymbol} />
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Main Chart - Spans 8 columns */}
            <div className="col-span-8 bg-gray-800 p-5 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{activeSymbol}-USD Chart</h2>
                <div className="flex space-x-2">
                  {availableTimeframes.map(tf => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        timeframe === tf
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {tf === '1m' ? '1m' :
                       tf === '5m' ? '5m' :
                       tf === '15m' ? '15m' :
                       tf === '1h' ? '1h' :
                       tf === '4h' ? '4h' : '1d'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="chart-container h-[400px]">
                <HyperliquidPriceChart symbol={activeSymbol} timeframe={timeframe} />
              </div>
            </div>
            
            {/* Order Book - Spans 4 columns */}
            <div className="col-span-4 bg-gray-800 p-5 rounded-lg border border-gray-700">
              <HyperliquidOrderBook symbol={activeSymbol} />
            </div>
            
            {/* Trading Form - Spans 4 columns */}
            <div className="col-span-4 bg-gray-800 p-5 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Place Order</h2>
              <TradingForm pair={`${activeSymbol}/USDT`} />
            </div>
            
            {/* Asset Balance - Spans 4 columns */}
            <div className="col-span-4 bg-gray-800 p-5 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Balance</h2>
              <AssetBalance />
            </div>
            
            {/* Positions - Spans 4 columns */}
            <div className="col-span-4 bg-gray-800 p-5 rounded-lg border border-gray-700 dashboard-positions">
              <HyperliquidPositions />
            </div>
            
            {/* Active Orders - Spans 8 columns */}
            <div className="col-span-8 bg-gray-800 p-5 rounded-lg border border-gray-700 dashboard-active-orders">
              <HyperliquidOrders />
            </div>
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
};

export default TradingDashboard;
