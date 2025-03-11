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
  const [estimatedFee, setEstimatedFee] = useState<string>('0.00');
  
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
      
      // Calculate estimated fee (0.1% of total)
      const fee = calculatedTotal * 0.001;
      setEstimatedFee(fee.toFixed(2));
    } else {
      setTotal('');
      setEstimatedFee('0.00');
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
      {/* Trading type tabs */}
      <div className="flex mb-5">
        <button
          type="button"
          className={`flex-1 py-2.5 font-medium rounded-l-md transition-colors ${side === 'buy' ? 'bright-blue-bg text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          onClick={() => setSide('buy')}
        >
          Buy
        </button>
        <button
          type="button"
          className={`flex-1 py-2.5 font-medium rounded-r-md transition-colors ${side === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          onClick={() => setSide('sell')}
        >
          Sell
        </button>
      </div>
      
      {/* Order type selector */}
      <div className="flex mb-5 bg-gray-800 rounded-md p-1">
        <button
          type="button"
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${orderType === 'limit' ? 'glass-panel' : 'text-gray-300 hover:text-white'}`}
          onClick={() => setOrderType('limit')}
        >
          Limit
        </button>
        <button
          type="button"
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${orderType === 'market' ? 'glass-panel' : 'text-gray-300 hover:text-white'}`}
          onClick={() => setOrderType('market')}
        >
          Market
        </button>
      </div>
      
      {/* Available Balance */}
      <div className="flex justify-between items-center mb-4 p-2 rounded-md bg-gray-800/50">
        <span className="text-sm text-gray-400">Available Balance:</span>
        {side === 'buy' ? (
          <span className="bright-blue-text font-medium">
            {balance.quote.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {pair.split('/')[1]}
          </span>
        ) : (
          <span className="bright-blue-text font-medium">
            {balance.base.toLocaleString(undefined, {minimumFractionDigits: 8, maximumFractionDigits: 8})} {pair.split('/')[0]}
          </span>
        )}
      </div>
      
      {/* Price input (only for limit orders) */}
      {orderType === 'limit' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-gray-400">Price</label>
            <span className="text-xs text-gray-500">Market Price: {pair.includes('BTC') ? '40,000.00' : pair.includes('ETH') ? '2,500.00' : '180.00'}</span>
          </div>
          <div className="relative glass-panel rounded-md">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-transparent border-none py-2.5 px-3 text-white focus:ring-1 focus:ring-[var(--color-positive)]"
              placeholder="0.00"
              required
              step="0.00000001"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              {pair.split('/')[1]}
            </div>
          </div>
        </div>
      )}
      
      {/* Amount input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Amount</label>
        <div className="relative glass-panel rounded-md">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent border-none py-2.5 px-3 text-white focus:ring-1 focus:ring-[var(--color-positive)]"
            placeholder="0.00000000"
            required
            step="0.00000001"
          />
          <div className="absolute right-3 top-2.5 text-gray-400">
            {pair.split('/')[0]}
          </div>
        </div>
      </div>
      
      {/* Amount slider */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">0%</span>
          <div className="flex space-x-2">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => setSliderValue(percent)}
                className="px-2 py-0.5 text-xs rounded bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                {percent}%
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500">100%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(e) => setSliderValue(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-800 rounded-md appearance-none cursor-pointer accent-[var(--color-positive)]"
        />
      </div>
      
      {/* Total */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Total</label>
        <div className="relative glass-panel rounded-md">
          <input
            type="number"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="w-full bg-transparent border-none py-2.5 px-3 text-white focus:ring-1 focus:ring-[var(--color-positive)]"
            placeholder="0.00"
            readOnly={orderType === 'limit'}
          />
          <div className="absolute right-3 top-2.5 text-gray-400">
            {pair.split('/')[1]}
          </div>
        </div>
      </div>
      
      {/* Fee estimate */}
      <div className="flex justify-between items-center mb-5 text-sm bg-gray-800/30 p-2 rounded">
        <span className="text-gray-400">Estimated Fee:</span>
        <span>
          {estimatedFee} {pair.split('/')[1]} <span className="text-gray-500 text-xs">(0.1%)</span>
        </span>
      </div>
      
      {/* Submit button */}
      <button
        type="submit"
        className={`py-3 rounded-md font-medium text-base transition-all duration-200 shadow-lg ${
          side === 'buy'
            ? 'bright-blue-bg text-black hover:shadow-[0_0_15px_rgba(0,153,255,0.5)]'
            : 'bg-red-500 text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]'
        }`}
      >
        {side === 'buy' ? 'Buy' : 'Sell'} {pair.split('/')[0]}
      </button>
    </form>
  );
};

export default TradingForm;
