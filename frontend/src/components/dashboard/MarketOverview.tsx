import React, { useState, useEffect } from 'react';

interface Market {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
}

const MarketOverview: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([
    { symbol: 'BTC', name: 'Bitcoin', price: 55000, change24h: 2.3, volume24h: 21500000000 },
    { symbol: 'ETH', name: 'Ethereum', price: 2800, change24h: -1.2, volume24h: 12300000000 },
    { symbol: 'SOL', name: 'Solana', price: 120, change24h: 5.7, volume24h: 3400000000 },
    { symbol: 'AVAX', name: 'Avalanche', price: 38, change24h: 3.1, volume24h: 980000000 },
    { symbol: 'MATIC', name: 'Polygon', price: 0.85, change24h: -0.5, volume24h: 560000000 },
  ]);
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(1)}K`;
    }
    return `$${volume}`;
  };
  
  return (
    <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Market Overview</h3>
        <select className="px-2 py-1 text-sm bg-[var(--color-card-bg-secondary)] border border-[var(--color-border)] rounded-md">
          <option value="24h">24h</option>
          <option value="7d">7d</option>
          <option value="30d">30d</option>
        </select>
      </div>
      
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead>
            <tr className="text-xs font-medium text-gray-500 uppercase">
              <th className="px-3 py-2 text-left">Asset</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2 text-right">Change</th>
              <th className="px-3 py-2 text-right hidden sm:table-cell">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {markets.map((market) => (
              <tr key={market.symbol} className="hover:bg-[var(--color-card-bg-secondary)] cursor-pointer transition-colors">
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold mr-2">
                      {market.symbol.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-medium">{market.symbol}</div>
                      <div className="text-xs text-gray-500">{market.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right">
                  {formatCurrency(market.price)}
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-right ${
                  market.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right text-gray-500 hidden sm:table-cell">
                  {formatVolume(market.volume24h)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
        <button className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
          View All Markets →
        </button>
      </div>
    </div>
  );
};

export default MarketOverview;
