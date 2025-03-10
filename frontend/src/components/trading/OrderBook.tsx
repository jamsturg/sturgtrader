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
  
  // Generate mock data for demo purposes
  useEffect(() => {
    // Reset when pair changes
    setBuyOrders([]);
    setSellOrders([]);
    
    // Generate mock price based on the pair
    const basePrice = pair.includes('BTC') ? 40000 : 
                      pair.includes('ETH') ? 2500 : 
                      pair.includes('XMR') ? 180 : 100;
                      
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
    
    setBuyOrders(mockBuyOrders);
    setSellOrders(mockSellOrders);
  }, [pair]);
  
  // Calculate depth percentage for visualization
  const getDepthPercentage = (amount: number) => {
    return (amount / maxDepth) * 100;
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between text-sm text-gray-400 mb-2 px-1">
        <div className="w-1/3">Price</div>
        <div className="w-1/3 text-center">Amount</div>
        <div className="w-1/3 text-right">Total</div>
      </div>
      
      {/* Sell Orders (red) */}
      <div className="overflow-y-auto flex-1 mb-4">
        {sellOrders.map((order, index) => (
          <div key={`sell-${index}`} className="flex justify-between relative py-1 px-1 text-sm hover:bg-white/5">
            {/* Depth visualization */}
            <div 
              className="absolute right-0 top-0 h-full bg-red-500/10" 
              style={{ width: `${getDepthPercentage(order.amount)}%` }}
            />
            
            <div className="w-1/3 text-red-400 z-10">{order.price.toFixed(2)}</div>
            <div className="w-1/3 text-center z-10">{order.amount.toFixed(5)}</div>
            <div className="w-1/3 text-right z-10">{order.total.toFixed(2)}</div>
          </div>
        ))}
      </div>
      
      {/* Current price */}
      <div className="py-2 px-1 glass-panel metal-edge mb-4">
        <div className="text-center text-xl bright-green-text font-bold">
          {pair.includes('BTC') ? '40,000.00' : 
           pair.includes('ETH') ? '2,500.00' : 
           pair.includes('XMR') ? '180.00' : '100.00'}
        </div>
      </div>
      
      {/* Buy Orders (green) */}
      <div className="overflow-y-auto flex-1">
        {buyOrders.map((order, index) => (
          <div key={`buy-${index}`} className="flex justify-between relative py-1 px-1 text-sm hover:bg-white/5">
            {/* Depth visualization */}
            <div 
              className="absolute right-0 top-0 h-full bg-green-500/10" 
              style={{ width: `${getDepthPercentage(order.amount)}%` }}
            />
            
            <div className="w-1/3 text-green-400 z-10">{order.price.toFixed(2)}</div>
            <div className="w-1/3 text-center z-10">{order.amount.toFixed(5)}</div>
            <div className="w-1/3 text-right z-10">{order.total.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
