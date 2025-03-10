import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import HyperliquidPositions from '../components/trading/hyperliquid/HyperliquidPositions';
import HyperliquidOrders from '../components/trading/hyperliquid/HyperliquidOrders';
import HyperliquidTradingForm from '../components/trading/hyperliquid/HyperliquidTradingForm';
import { Position } from '../services/hyperliquidService';

const Hyperliquid: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  
  // Handle selecting a position to autofill the trading form
  const handlePositionSelect = (position: Position) => {
    setSelectedSymbol(position.symbol);
  };

  // Handle successful order submission
  const handleOrderSubmit = (result: any) => {
    console.log('Order submitted:', result);
    // You could add notifications or other feedback here
  };

  return (
    <Layout>
      <div className="container mx-auto mt-6 px-4">
        <h1 className="text-3xl font-bold mb-8 text-[var(--color-text-primary)]">Hyperliquid Trading</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trading Section - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Positions */}
            <HyperliquidPositions 
              refreshInterval={15000} 
              onPositionSelect={handlePositionSelect}
            />
            
            {/* Open Orders */}
            <HyperliquidOrders 
              refreshInterval={15000} 
            />
          </div>
          
          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-6">
            {/* Trading Form */}
            <HyperliquidTradingForm 
              defaultSymbol={selectedSymbol} 
              onOrderSubmit={handleOrderSubmit}
            />
            
            {/* Trading Info */}
            <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Hyperliquid</h3>
              <p className="text-sm mb-3">
                Hyperliquid is a high-performance decentralized derivatives exchange that offers:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1 mb-4">
                <li>Low fees and fast execution</li>
                <li>Up to 20x leverage on perpetual contracts</li>
                <li>Deep liquidity and narrow spreads</li>
                <li>Advanced order types (limit, market, post-only)</li>
                <li>Cross-margining for efficient capital use</li>
              </ul>
              <p className="text-sm">
                <a 
                  href="https://hyperliquid.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                >
                  Learn more about Hyperliquid →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Hyperliquid;
