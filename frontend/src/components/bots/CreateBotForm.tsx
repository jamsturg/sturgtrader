import React, { useState } from 'react';

interface CreateBotFormProps {
  onSubmit: (botData: any) => void;
  onCancel: () => void;
}

const CreateBotForm: React.FC<CreateBotFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'arbitrage',
    exchanges: [],
    tradingPairs: [],
    riskLevel: 'medium',
    maxTradeSize: 100,
    description: ''
  });

  const [availableExchanges] = useState([
    'Binance', 'Bittrex', 'Coinbase', 'Kraken', 'Hyperliquid', 'TradeOgre', 'Coinsspot'
  ]);

  const [availablePairs] = useState([
    'BTC/USDT', 'ETH/USDT', 'XMR/BTC', 'SOL/USDT', 'XMR/USDT', 'ETH/BTC'
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExchangeToggle = (exchange: string) => {
    setFormData(prev => {
      const exchanges = prev.exchanges.includes(exchange)
        ? prev.exchanges.filter(e => e !== exchange)
        : [...prev.exchanges, exchange];
      return { ...prev, exchanges };
    });
  };

  const handlePairToggle = (pair: string) => {
    setFormData(prev => {
      const tradingPairs = prev.tradingPairs.includes(pair)
        ? prev.tradingPairs.filter(p => p !== pair)
        : [...prev.tradingPairs, pair];
      return { ...prev, tradingPairs };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    if (!formData.name) {
      alert('Bot name is required');
      return;
    }
    if (formData.exchanges.length === 0) {
      alert('Please select at least one exchange');
      return;
    }
    if (formData.tradingPairs.length === 0) {
      alert('Please select at least one trading pair');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="glass-panel p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Create New Trading Bot</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bot Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="My Trading Bot"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bot Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="arbitrage">Arbitrage Bot</option>
                <option value="grid">Grid Trading Bot</option>
                <option value="dca">DCA Bot</option>
                <option value="custom">Custom Strategy</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Risk Level</label>
              <select
                name="riskLevel"
                value={formData.riskLevel}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Max Trade Size (USDT)</label>
              <input
                type="number"
                name="maxTradeSize"
                value={formData.maxTradeSize}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Exchanges</label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-800 border border-gray-700 rounded-md">
                {availableExchanges.map(exchange => (
                  <button
                    key={exchange}
                    type="button"
                    onClick={() => handleExchangeToggle(exchange)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${formData.exchanges.includes(exchange)
                      ? 'bright-green-bg text-black'
                      : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {exchange}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Trading Pairs</label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-800 border border-gray-700 rounded-md">
                {availablePairs.map(pair => (
                  <button
                    key={pair}
                    type="button"
                    onClick={() => handlePairToggle(pair)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${formData.tradingPairs.includes(pair)
                      ? 'bright-green-bg text-black'
                      : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe your bot strategy..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bright-green-bg text-black hover:bg-green-400 rounded-md transition-colors"
          >
            Create Bot
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBotForm;
