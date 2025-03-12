import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import HyperliquidPositions from '../components/trading/hyperliquid/HyperliquidPositions';
import HyperliquidOrderBook from '../components/trading/hyperliquid/HyperliquidOrderBook';
import HyperliquidPriceChart from '../components/trading/hyperliquid/HyperliquidPriceChart';
import HyperliquidOrders from '../components/trading/hyperliquid/HyperliquidOrders';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1
    },
  },
});

export default function HyperliquidTradingPage() {
  // Default symbol to BTC
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const availableSymbols = ['BTC', 'ETH', 'SOL', 'AVAX'];

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Hyperliquid Trading</h1>
          
          <div className="flex space-x-2">
            {availableSymbols.map((symbol) => (
              <button
                key={symbol}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  activeSymbol === symbol
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                onClick={() => setActiveSymbol(symbol)}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Price chart */}
          <div className="lg:col-span-2">
            <HyperliquidPriceChart symbol={activeSymbol} />
          </div>
          
          {/* Right column - Order book */}
          <div>
            <HyperliquidOrderBook symbol={activeSymbol} />
          </div>
          
          {/* Positions and open orders section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <HyperliquidPositions />
            </div>
            
            <div>
              <HyperliquidOrders />
            </div>
          </div>
          
          {/* Trading form or other widgets could go here */}
          <div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">{activeSymbol} Trading Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">24h Volume:</span>
                  <span>$24,582,312</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Funding Rate:</span>
                  <span className="text-green-400">0.01%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Open Interest:</span>
                  <span>$143.2M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Index Price:</span>
                  <span>${activeSymbol === 'BTC' ? '67,241.32' :
                          activeSymbol === 'ETH' ? '3,452.78' :
                          activeSymbol === 'SOL' ? '145.23' : '39.87'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </QueryClientProvider>
  );
}
