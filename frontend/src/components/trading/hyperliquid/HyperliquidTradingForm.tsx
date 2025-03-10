import React, { useState, useEffect } from 'react';
import { enhancedHyperliquidService, MarketData } from '../../../services/enhancedHyperliquidService';

interface HyperliquidTradingFormProps {
  defaultSymbol?: string;
  defaultPrice?: string;
  onOrderSubmit?: (result: any) => void;
}

type OrderTypeOption = 'limit' | 'market' | 'postOnly';

const HyperliquidTradingForm: React.FC<HyperliquidTradingFormProps> = ({
  defaultSymbol = 'BTC',
  defaultPrice = '',
  onOrderSubmit
}) => {
  // Form state
  const [symbol, setSymbol] = useState<string>(defaultSymbol);
  const [isBuy, setIsBuy] = useState<boolean>(true);
  const [size, setSize] = useState<string>('');
  const [price, setPrice] = useState<string>(defaultPrice);
  const [orderType, setOrderType] = useState<OrderTypeOption>('limit');
  const [timeInForce, setTimeInForce] = useState<'GTC' | 'IOC' | 'FOK'>('GTC');
  const [leverage, setLeverage] = useState<string>('1');
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [availableSymbols] = useState<string[]>(['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC']);

  // Update price when defaultPrice changes
  useEffect(() => {
    if (defaultPrice && orderType !== 'market') {
      setPrice(defaultPrice);
    }
  }, [defaultPrice, orderType]);

  // Update symbol when defaultSymbol changes
  useEffect(() => {
    setSymbol(defaultSymbol);
  }, [defaultSymbol]);

  // Fetch market data for selected symbol
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await enhancedHyperliquidService.getMarketData(symbol);
        setMarketData(data);
        if (data && data.markPrice && orderType !== 'market' && !price) {
          setPrice(data.markPrice.toString());
        }
      } catch (err) {
        console.error(`Error fetching market data for ${symbol}:`, err);
      }
    };

    fetchMarketData();
    // Set up polling for market data updates
    const intervalId = setInterval(fetchMarketData, 10000);
    return () => clearInterval(intervalId);
  }, [symbol, orderType, price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs
      if (!symbol) {
        throw new Error('Symbol is required');
      }
      
      if (!size || parseFloat(size) <= 0) {
        throw new Error('Please enter a valid size');
      }
      
      if (orderType !== 'market' && (!price || parseFloat(price) <= 0)) {
        throw new Error('Please enter a valid price');
      }

      // Submit order with the enhanced service
      const result = await enhancedHyperliquidService.placeOrder({
        symbol,
        isBuy,
        size: parseFloat(size),
        price: parseFloat(price || '0'),
        orderType,
        reduceOnly: false
      });

      if (result.success) {
        setSuccess(`Order successfully placed!`);
        // Reset form fields
        setSize('');
        if (orderType === 'market') {
          setPrice('');
        }
        
        if (onOrderSubmit) {
          onOrderSubmit(result);
        }
      } else {
        throw new Error(result.message || 'Order placement failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while placing the order');
      console.error('Error submitting order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderTypeChange = (type: OrderTypeOption) => {
    setOrderType(type);
    // Clear price for market orders
    if (type === 'market') {
      setPrice('');
    } else if (marketData && marketData.markPrice) {
      // Set price to current market price for limit orders
      setPrice(marketData.markPrice.toString());
    }
  };

  // Calculate order value
  const orderValue = size && price ? (parseFloat(size) * parseFloat(price)).toFixed(2) : '0.00';
  
  // Calculate leverage-adjusted order value
  const leverageAdjustedValue = size && price && leverage 
    ? (parseFloat(size) * parseFloat(price) / parseFloat(leverage)).toFixed(2) 
    : '0.00';

  return (
    <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Place Order</h3>
      
      {marketData && (
        <div className="mb-4 p-3 bg-[var(--color-card-bg-secondary)] rounded">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Mark Price</span>
              <p className="font-medium">${marketData.markPrice.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">24h Change</span>
              <p className={`font-medium ${marketData.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Funding Rate</span>
              <p className={`font-medium ${marketData.fundingRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {marketData.fundingRate >= 0 ? '+' : ''}{marketData.fundingRate.toFixed(4)}%
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Symbol Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          >
            {availableSymbols.map((sym) => (
              <option key={sym} value={sym}>{sym}-PERP</option>
            ))}
          </select>
        </div>
        
        {/* Buy/Sell Tabs */}
        <div className="mb-4">
          <div className="flex border border-[var(--color-border)] rounded-md overflow-hidden">
            <button
              type="button"
              className={`flex-1 py-2 text-center ${
                isBuy 
                  ? 'bg-green-500 text-white' 
                  : 'bg-[var(--color-card-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card-bg)]'
              }`}
              onClick={() => setIsBuy(true)}
            >
              Buy
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-center ${
                !isBuy 
                  ? 'bg-red-500 text-white' 
                  : 'bg-[var(--color-card-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card-bg)]'
              }`}
              onClick={() => setIsBuy(false)}
            >
              Sell
            </button>
          </div>
        </div>
        
        {/* Order Type Tabs */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Order Type</label>
          <div className="flex border border-[var(--color-border)] rounded-md overflow-hidden">
            <button
              type="button"
              className={`flex-1 py-1 text-center text-sm ${
                orderType === 'limit' 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'bg-[var(--color-card-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card-bg)]'
              }`}
              onClick={() => handleOrderTypeChange('limit')}
            >
              Limit
            </button>
            <button
              type="button"
              className={`flex-1 py-1 text-center text-sm ${
                orderType === 'market' 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'bg-[var(--color-card-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card-bg)]'
              }`}
              onClick={() => handleOrderTypeChange('market')}
            >
              Market
            </button>
            <button
              type="button"
              className={`flex-1 py-1 text-center text-sm ${
                orderType === 'postOnly' 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'bg-[var(--color-card-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card-bg)]'
              }`}
              onClick={() => handleOrderTypeChange('postOnly')}
            >
              Post Only
            </button>
          </div>
        </div>
        
        {/* Size Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Size ({symbol})</label>
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Enter size"
            step="0.001"
            min="0"
            className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            required
          />
        </div>
        
        {/* Price Input (hidden for market orders) */}
        {orderType !== 'market' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Price (USD)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              required
            />
          </div>
        )}
        
        {/* Leverage Slider (only for perpetuals) */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium">Leverage</label>
            <span className="text-sm">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={leverage}
            onChange={(e) => setLeverage(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1x</span>
            <span>5x</span>
            <span>10x</span>
            <span>15x</span>
            <span>20x</span>
          </div>
        </div>
        
        {/* Time in Force (for limit orders) */}
        {orderType !== 'market' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Time in Force</label>
            <select
              value={timeInForce}
              onChange={(e) => setTimeInForce(e.target.value as any)}
              className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="GTC">Good Till Cancel (GTC)</option>
              <option value="IOC">Immediate or Cancel (IOC)</option>
              <option value="FOK">Fill or Kill (FOK)</option>
            </select>
          </div>
        )}
        
        {/* Order Summary */}
        <div className="mb-4 p-3 bg-[var(--color-card-bg-secondary)] rounded">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-sm text-gray-500">Order Value</span>
              <p className="font-medium">${orderValue}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Required Margin</span>
              <p className="font-medium">${leverageAdjustedValue}</p>
            </div>
          </div>
        </div>
        
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md font-medium ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          } ${
            isBuy 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {loading ? 'Processing...' : isBuy ? 'Buy' : 'Sell'} {symbol}
        </button>
      </form>
    </div>
  );
};

export default HyperliquidTradingForm;
