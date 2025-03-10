import React, { useState, useEffect } from 'react';

interface TradingFormProps {
  pair: string;
}

const TradingForm: React.FC<TradingFormProps> = ({ pair }) => {
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [total, setTotal] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [balance, setBalance] = useState({ base: 0, quote: 0 });
  
  // Set mock balances based on the current pair
  useEffect(() => {
    const [baseCurrency, quoteCurrency] = pair.split('/');
    
    // Mock balances for demo
    const mockBalances: Record<string, number> = {
      'BTC': 0.5,
      'ETH': 8.2,
      'XMR': 15.7,
      'SOL': 45.0,
      'USDT': 25000,
      'USD': 30000,
    };
    
    setBalance({
      base: mockBalances[baseCurrency] || 0,
      quote: mockBalances[quoteCurrency] || 0
    });
    
    // Set default price based on pair
    if (pair.includes('BTC')) {
      setPrice('40000');
    } else if (pair.includes('ETH')) {
      setPrice('2500');
    } else if (pair.includes('XMR')) {
      setPrice('180');
    } else {
      setPrice('100');
    }
  }, [pair]);
  
  // Calculate total when price or amount changes
  useEffect(() => {
    if (price && amount) {
      const calculatedTotal = parseFloat(price) * parseFloat(amount);
      setTotal(calculatedTotal.toFixed(2));
    } else {
      setTotal('');
    }
  }, [price, amount]);
  
  // Update amount when slider changes
  useEffect(() => {
    if (sliderValue > 0) {
      const maxAmount = side === 'buy' 
        ? parseFloat(total) > 0 ? balance.quote / parseFloat(price) : 0
        : balance.base;
      
      const newAmount = (maxAmount * sliderValue / 100).toFixed(8);
      setAmount(newAmount);
    }
  }, [sliderValue, side, balance, price, total]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would call an API to place the order
    console.log('Placing order:', {
      pair,
      type: orderType,
      side,
      price: orderType === 'limit' ? parseFloat(price) : undefined,
      amount: parseFloat(amount),
      total: parseFloat(total),
    });
    
    // Display success message
    alert(`${side.toUpperCase()} order placed successfully!`);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex mb-4">
        <button
          type="button"
          className={`flex-1 py-2 font-medium rounded-l-md transition-colors ${side === 'buy' ? 'bright-green-bg text-black' : 'bg-gray-700 text-white'}`}
          onClick={() => setSide('buy')}
        >
          Buy
        </button>
        <button
          type="button"
          className={`flex-1 py-2 font-medium rounded-r-md transition-colors ${side === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`}
          onClick={() => setSide('sell')}
        >
          Sell
        </button>
      </div>
      
      <div className="flex mb-4">
        <button
          type="button"
          className={`flex-1 py-1 text-sm font-medium rounded-l-md transition-colors ${orderType === 'limit' ? 'metallic-bg text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setOrderType('limit')}
        >
          Limit
        </button>
        <button
          type="button"
          className={`flex-1 py-1 text-sm font-medium rounded-r-md transition-colors ${orderType === 'market' ? 'metallic-bg text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setOrderType('market')}
        >
          Market
        </button>
      </div>
      
      {/* Available Balance */}
      <div className="mb-3 text-sm">
        <span className="text-gray-400">Available:</span>{' '}
        {side === 'buy' ? (
          <span className="bright-green-text">
            {balance.quote.toFixed(2)} {pair.split('/')[1]}
          </span>
        ) : (
          <span className="bright-green-text">
            {balance.base.toFixed(8)} {pair.split('/')[0]}
          </span>
        )}
      </div>
      
      {/* Price input (only for limit orders) */}
      {orderType === 'limit' && (
        <div className="mb-3">
          <label className="block text-sm text-gray-400 mb-1">Price</label>
          <div className="relative glass-panel rounded-md">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-transparent border-none py-2 px-3 text-white focus:ring-1 focus:ring-[var(--color-positive)]"
              placeholder="0.00"
              required
              step="0.00000001"
            />
            <div className="absolute right-3 top-2 text-gray-400">
              {pair.split('/')[1]}
            </div>
          </div>
        </div>
      )}
      
      {/* Amount input */}
      <div className="mb-3">
        <label className="block text-sm text-gray-400 mb-1">Amount</label>
        <div className="relative glass-panel rounded-md">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent border-none py-2 px-3 text-white focus:ring-1 focus:ring-[var(--color-positive)]"
            placeholder="0.00000000"
            required
            step="0.00000001"
          />
          <div className="absolute right-3 top-2 text-gray-400">
            {pair.split('/')[0]}
          </div>
        </div>
      </div>
      
      {/* Amount slider */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(e) => setSliderValue(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-md appearance-none cursor-pointer accent-[var(--color-positive)]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
      
      {/* Total */}
      <div className="mb-5">
        <label className="block text-sm text-gray-400 mb-1">Total</label>
        <div className="relative glass-panel rounded-md">
          <input
            type="number"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="w-full bg-transparent border-none py-2 px-3 text-white focus:ring-1 focus:ring-[var(--color-positive)]"
            placeholder="0.00"
            readOnly={orderType === 'limit'}
          />
          <div className="absolute right-3 top-2 text-gray-400">
            {pair.split('/')[1]}
          </div>
        </div>
      </div>
      
      {/* Submit button */}
      <button
        type="submit"
        className={`py-3 rounded-md font-medium transition-all duration-200 ${side === 'buy' ? 'bright-green-bg text-black' : 'bg-red-500 text-white'}`}
      >
        {side === 'buy' ? 'Buy' : 'Sell'} {pair.split('/')[0]}
      </button>
    </form>
  );
};

export default TradingForm;
