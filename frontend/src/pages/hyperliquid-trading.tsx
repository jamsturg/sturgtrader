import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import HyperliquidPositions from '../components/trading/hyperliquid/HyperliquidPositions';
import HyperliquidOrders from '../components/trading/hyperliquid/HyperliquidOrders';
import HyperliquidTradingForm from '../components/trading/hyperliquid/HyperliquidTradingForm';
import HyperliquidPriceChart from '../components/trading/hyperliquid/HyperliquidPriceChart';
import HyperliquidOrderBook from '../components/trading/hyperliquid/HyperliquidOrderBook';
import HyperliquidTransactions from '../components/trading/hyperliquid/HyperliquidTransactions';
import HyperliquidMarketOverview from '../components/trading/hyperliquid/HyperliquidMarketOverview';
import { enhancedHyperliquidService } from '../services/enhancedHyperliquidService';

const HyperliquidTrading: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('1h');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  
  // Initialize the enhanced service when the page loads
  useEffect(() => {
    const initService = async () => {
      try {
        setIsInitializing(true);
        
        // In a real app, you would get the private key from a more secure source
        // This is just for demo purposes - ideally would use a wallet integration
        const privateKey = process.env.NEXT_PUBLIC_HYPERLIQUID_PRIVATE_KEY;
        const isAuth = await enhancedHyperliquidService.initialize(privateKey);
        
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('Failed to initialize hyperliquid service:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initService();
  }, []);
  
  // Handle market selection from the market overview
  const handleMarketSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  // Handle selecting a position 
  const handlePositionSelect = (position: any) => {  // Using any to avoid type conflicts
    setSelectedSymbol(position.symbol);
  };

  // Handle selecting a price from the order book
  const handlePriceSelect = (price: number) => {
    setSelectedPrice(price.toString());
  };

  // Handle successful order submission
  const handleOrderSubmit = (result: any) => {
    console.log('Order submitted:', result);
    // You could add notifications or other feedback here
  };

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="py-6">
          <h1 className="text-3xl font-bold mb-6 text-[var(--color-text-primary)]">Hyperliquid Trading</h1>
          
          {isInitializing ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - 8/12 width */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Chart */}
                <HyperliquidPriceChart
                  symbol={selectedSymbol}
                  timeframe={timeframe}
                  height={400}
                />
                
                {/* Order Book & Positions Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <HyperliquidOrderBook
                    symbol={selectedSymbol}
                    depth={12}
                    onPriceSelect={handlePriceSelect}
                  />
                  
                  <HyperliquidPositions
                    refreshInterval={15000}
                    onPositionSelect={handlePositionSelect}
                  />
                </div>
                
                {/* Market Overview */}
                <HyperliquidMarketOverview 
                  onSelectMarket={handleMarketSelect}
                  highlightedSymbol={selectedSymbol}
                />
                
                {/* Orders & Transactions Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <HyperliquidOrders
                    refreshInterval={15000}
                  />
                  
                  <HyperliquidTransactions
                    refreshInterval={30000}
                    limit={10}
                  />
                </div>
              </div>
              
              {/* Right Column - 4/12 width */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Trading Form */}
                <HyperliquidTradingForm
                  defaultSymbol={selectedSymbol}
                  defaultPrice={selectedPrice}
                  onOrderSubmit={handleOrderSubmit}
                />
                
                {/* Trading Info */}
                <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Hyperliquid</h3>
                  <p className="text-sm mb-3">
                    Hyperliquid is a high-performance decentralized derivatives exchange built for professional traders:
                  </p>
                  <ul className="text-sm list-disc pl-5 space-y-1 mb-4">
                    <li>Low fees and fast execution</li>
                    <li>Up to 20x leverage on perpetual contracts</li>
                    <li>Deep liquidity and narrow spreads</li>
                    <li>Advanced order types (limit, market, post-only)</li>
                    <li>Cross-margining for efficient capital use</li>
                  </ul>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                    <p className="font-medium mb-1">SDK Integration</p>
                    <p>This trading interface utilizes the official Hyperliquid TypeScript SDK for enhanced performance and reliability.</p>
                  </div>
                  <p className="text-sm mt-4">
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HyperliquidTrading;
