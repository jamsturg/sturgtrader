import React, { useState, useEffect, useRef } from 'react';
import { enhancedHyperliquidService } from '../../../services/enhancedHyperliquidService';

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
  depth: number;
}

interface HyperliquidOrderBookProps {
  symbol: string;
  depth?: number;
  onPriceSelect?: (price: number) => void;
}

const HyperliquidOrderBook: React.FC<HyperliquidOrderBookProps> = ({
  symbol,
  depth = 10,
  onPriceSelect
}) => {
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [midPrice, setMidPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [spread, setSpread] = useState<{ value: number; percent: number }>({ value: 0, percent: 0 });
  
  // Refs for WebSocket cleanup
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load and subscribe to order book data
  useEffect(() => {
    let isMounted = true;
    
    const loadOrderBook = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Initial order book snapshot
        const l2Data = await enhancedHyperliquidService.info.l2Snapshot(symbol);
        
        if (!isMounted) return;
        
        if (l2Data && l2Data.levels && l2Data.levels.length >= 2) {
          processOrderBookData(l2Data.levels);
        }
        
        // Subscribe to real-time updates
        unsubscribeRef.current = enhancedHyperliquidService.subscribeToMarketUpdates(symbol, (update) => {
          if (update && update.data && update.data.levels) {
            processOrderBookData(update.data.levels);
          }
        });
        
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load order book');
          console.error('Error loading order book:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadOrderBook();
    
    // Cleanup subscription
    return () => {
      isMounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [symbol]);
  
  // Process order book data and calculate derived values
  const processOrderBookData = (levels: any) => {
    if (!levels || levels.length < 2) return;
    
    // Process asks (sells)
    const askEntries: OrderBookEntry[] = [];
    let askTotal = 0;
    
    // Assuming first array is asks
    const rawAsks = levels[0] || [];
    
    for (let i = 0; i < Math.min(depth, rawAsks.length); i++) {
      const ask = rawAsks[i];
      if (!ask) continue;
      
      const price = parseFloat(ask.px);
      const size = parseFloat(ask.sz);
      askTotal += size;
      
      askEntries.push({
        price,
        size,
        total: askTotal,
        depth: 0 // Will calculate after sorting
      });
    }
    
    // Process bids (buys)
    const bidEntries: OrderBookEntry[] = [];
    let bidTotal = 0;
    
    // Assuming second array is bids
    const rawBids = levels[1] || [];
    
    for (let i = 0; i < Math.min(depth, rawBids.length); i++) {
      const bid = rawBids[i];
      if (!bid) continue;
      
      const price = parseFloat(bid.px);
      const size = parseFloat(bid.sz);
      bidTotal += size;
      
      bidEntries.push({
        price,
        size,
        total: bidTotal,
        depth: 0 // Will calculate after sorting
      });
    }
    
    // Sort asks ascending by price
    askEntries.sort((a, b) => a.price - b.price);
    
    // Sort bids descending by price
    bidEntries.sort((a, b) => b.price - a.price);
    
    // Calculate depth percentages
    const maxDepth = Math.max(
      askEntries.length > 0 ? askEntries[askEntries.length - 1].total : 0,
      bidEntries.length > 0 ? bidEntries[bidEntries.length - 1].total : 0
    );
    
    if (maxDepth > 0) {
      askEntries.forEach(ask => {
        ask.depth = (ask.total / maxDepth) * 100;
      });
      
      bidEntries.forEach(bid => {
        bid.depth = (bid.total / maxDepth) * 100;
      });
    }
    
    // Calculate mid price and spread
    if (askEntries.length > 0 && bidEntries.length > 0) {
      const lowestAsk = askEntries[0].price;
      const highestBid = bidEntries[0].price;
      const mid = (lowestAsk + highestBid) / 2;
      
      setMidPrice(mid);
      
      const spreadValue = lowestAsk - highestBid;
      const spreadPercent = (spreadValue / mid) * 100;
      
      setSpread({
        value: spreadValue,
        percent: spreadPercent
      });
    }
    
    setAsks(askEntries);
    setBids(bidEntries);
  };
  
  const handlePriceClick = (price: number) => {
    if (onPriceSelect) {
      onPriceSelect(price);
    }
  };
  
  if (isLoading && asks.length === 0 && bids.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Order Book</h3>
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Order Book</h3>
        <div className="text-center text-red-500 py-6">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Order Book</h3>
      
      {/* Spread info */}
      {midPrice && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <div>
            <span className="text-gray-500">Mid Price:</span>{' '}
            <span className="font-medium">${midPrice.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-500">Spread:</span>{' '}
            <span className="font-medium">${spread.value.toFixed(2)} ({spread.percent.toFixed(3)}%)</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-1 mb-1 text-xs text-gray-500">
        <div className="text-left">Size ({symbol})</div>
        <div className="text-center">Price (USD)</div>
        <div className="text-right">Total</div>
      </div>
      
      {/* Asks (sell orders) - displayed in reverse order */}
      <div className="overflow-hidden mb-2">
        {asks.slice().reverse().map((ask, index) => (
          <div 
            key={`ask-${index}`}
            className="grid grid-cols-3 gap-1 py-1 text-xs relative cursor-pointer hover:bg-[var(--color-card-bg-secondary)]"
            onClick={() => handlePriceClick(ask.price)}
          >
            <div className="text-left relative z-10">
              {ask.size.toFixed(4)}
            </div>
            <div className="text-center font-mono text-red-500 font-medium relative z-10">
              {ask.price.toFixed(2)}
            </div>
            <div className="text-right relative z-10">
              {ask.total.toFixed(4)}
            </div>
            <div 
              className="absolute top-0 right-0 h-full bg-red-100 dark:bg-red-900 opacity-20"
              style={{ width: `${ask.depth}%` }}
            />
          </div>
        ))}
      </div>
      
      {/* Price divider */}
      {midPrice && (
        <div className="border-t border-b border-[var(--color-border)] py-1 mb-2 text-center text-sm font-medium">
          ${midPrice.toFixed(2)}
        </div>
      )}
      
      {/* Bids (buy orders) */}
      <div className="overflow-hidden">
        {bids.map((bid, index) => (
          <div 
            key={`bid-${index}`}
            className="grid grid-cols-3 gap-1 py-1 text-xs relative cursor-pointer hover:bg-[var(--color-card-bg-secondary)]"
            onClick={() => handlePriceClick(bid.price)}
          >
            <div className="text-left relative z-10">
              {bid.size.toFixed(4)}
            </div>
            <div className="text-center font-mono text-green-500 font-medium relative z-10">
              {bid.price.toFixed(2)}
            </div>
            <div className="text-right relative z-10">
              {bid.total.toFixed(4)}
            </div>
            <div 
              className="absolute top-0 right-0 h-full bg-green-100 dark:bg-green-900 opacity-20"
              style={{ width: `${bid.depth}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HyperliquidOrderBook;
