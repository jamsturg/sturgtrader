import React, { useState, useEffect } from 'react';

interface OrderBookProps {
  pair: string;
}

interface Order {
  price: number;
  amount: number;
  total: number;
  type: 'buy' | 'sell';
}

const OrderBook: React.FC<OrderBookProps> = ({ pair }) => {
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [maxDepth, setMaxDepth] = useState<number>(0);
  const [spreadPercentage, setSpreadPercentage] = useState<string>('0.00');
  const [currentPrice, setCurrentPrice] = useState<string>('0.00');
  
  // Generate mock data for demo purposes
  useEffect(() => {
    // Reset when pair changes
    setBuyOrders([]);
    setSellOrders([]);
    
    // Generate mock price based on the pair
    const basePrice = pair.includes('BTC') ? 40000 :
                      pair.includes('ETH') ? 2500 :
                      pair.includes('XMR') ? 180 : 100;
    
    setCurrentPrice(basePrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
                      
    // Generate mock order book data
    const mockBuyOrders: Order[] = [];
    const mockSellOrders: Order[] = [];
    
    // Generate buy orders (lower than base price)
    for (let i = 1; i <= 15; i++) {
      const price = basePrice * (1 - (i * 0.001));
      const amount = Math.random() * 2 + 0.1;
      mockBuyOrders.push({
        price,
        amount,
        total: price * amount,
        type: 'buy'
      });
    }
    
    // Generate sell orders (higher than base price)
    for (let i = 1; i <= 15; i++) {
      const price = basePrice * (1 + (i * 0.001));
      const amount = Math.random() * 2 + 0.1;
      mockSellOrders.push({
        price,
        amount,
        total: price * amount,
        type: 'sell'
      });
    }
    
    // Sort orders
    mockBuyOrders.sort((a, b) => b.price - a.price);
    mockSellOrders.sort((a, b) => a.price - b.price);
    
    // Calculate max depth for visualization
    const allAmounts = [...mockBuyOrders, ...mockSellOrders].map(o => o.amount);
    setMaxDepth(Math.max(...allAmounts));
    
    // Calculate spread
    if (mockBuyOrders.length > 0 && mockSellOrders.length > 0) {
      const highestBid = mockBuyOrders[0].price;
      const lowestAsk = mockSellOrders[0].price;
      const spread = lowestAsk - highestBid;
      const spreadPct = (spread / highestBid) * 100;
      setSpreadPercentage(spreadPct.toFixed(2));
    }
    
    setBuyOrders(mockBuyOrders);
    setSellOrders(mockSellOrders);
  }, [pair]);
  
  // Calculate depth percentage for visualization
  const getDepthPercentage = (amount: number) => {
    return (amount / maxDepth) * 100;
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between text-xs font-medium bg-gray-800 rounded-t-md py-2 px-3 mb-1">
        <div className="w-1/3">PRICE</div>
        <div className="w-1/3 text-center">AMOUNT</div>
        <div className="w-1/3 text-right">TOTAL</div>
      </div>
      
      {/* Sell Orders (red) */}
      <div className="overflow-y-auto flex-1 scrollbar-thin mb-2">
        {sellOrders.map((order, index) => (
          <div key={`sell-${index}`} className="flex justify-between relative py-1 px-2 text-sm hover:bg-gray-800/30 border-b border-gray-800/30">
            {/* Depth visualization */}
            <div
              className="absolute right-0 top-0 h-full bg-red-500/10"
              style={{ width: `${getDepthPercentage(order.amount)}%` }}
            />
            
            <div className="w-1/3 text-red-400 z-10 font-medium">{order.price.toFixed(2)}</div>
            <div className="w-1/3 text-center z-10 text-gray-300">{order.amount.toFixed(5)}</div>
            <div className="w-1/3 text-right z-10 text-gray-300">{order.total.toFixed(2)}</div>
          </div>
        ))}
      </div>
      
      {/* Spread & Current price */}
      <div className="py-3 px-3 glass-panel metal-edge mb-2 flex justify-between items-center">
        <div className="text-gray-400 text-sm">
          Spread: <span className="text-white">{spreadPercentage}%</span>
        </div>
        <div className="text-center text-xl bright-blue-text font-bold">
          {currentPrice}
        </div>
        <div className="text-gray-400 text-sm">
          <span className="text-xs">24h</span> <span className="text-green-400">+1.2%</span>
        </div>
      </div>
      
      {/* Buy Orders (green) */}
      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {buyOrders.map((order, index) => (
          <div key={`buy-${index}`} className="flex justify-between relative py-1 px-2 text-sm hover:bg-gray-800/30 border-b border-gray-800/30">
            {/* Depth visualization */}
            <div
              className="absolute right-0 top-0 h-full bg-green-500/10"
              style={{ width: `${getDepthPercentage(order.amount)}%` }}
            />
            
            <div className="w-1/3 text-green-400 z-10 font-medium">{order.price.toFixed(2)}</div>
            <div className="w-1/3 text-center z-10 text-gray-300">{order.amount.toFixed(5)}</div>
            <div className="w-1/3 text-right z-10 text-gray-300">{order.total.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
