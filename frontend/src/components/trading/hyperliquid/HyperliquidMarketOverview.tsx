import React, { useState, useEffect } from 'react';
import { enhancedHyperliquidService, MarketData } from '../../../services/enhancedHyperliquidService';

interface HyperliquidMarketOverviewProps {
  onSelectMarket?: (symbol: string) => void;
  highlightedSymbol?: string;
}

const HyperliquidMarketOverview: React.FC<HyperliquidMarketOverviewProps> = ({
  onSelectMarket,
  highlightedSymbol
}) => {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({
    key: 'volume24h',
    direction: 'descending'
  });

  // Fetch all available markets
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const data = await enhancedHyperliquidService.getAllMarketData();
        setMarkets(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch market data');
        console.error('Error fetching market data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();

    // Set up polling for regular updates
    const intervalId = setInterval(fetchMarkets, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle sorting logic
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort the markets based on current sort configuration
  const sortedMarkets = [...markets].sort((a, b) => {
    if (a[sortConfig.key as keyof MarketData] < b[sortConfig.key as keyof MarketData]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key as keyof MarketData] > b[sortConfig.key as keyof MarketData]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Handle market selection
  const handleMarketClick = (symbol: string) => {
    if (onSelectMarket) {
      onSelectMarket(symbol);
    }
  };

  if (loading && markets.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  if (error && markets.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
        <div className="text-center text-red-500 py-6">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead>
            <tr>
              <th 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => requestSort('name')}
              >
                Symbol
                {sortConfig.key === 'name' && (
                  <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => requestSort('markPrice')}
              >
                Price
                {sortConfig.key === 'markPrice' && (
                  <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => requestSort('change24h')}
              >
                24h Change
                {sortConfig.key === 'change24h' && (
                  <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => requestSort('volume24h')}
              >
                24h Volume
                {sortConfig.key === 'volume24h' && (
                  <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => requestSort('fundingRate')}
              >
                Funding Rate
                {sortConfig.key === 'fundingRate' && (
                  <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {sortedMarkets.map((market) => (
              <tr 
                key={market.name}
                onClick={() => handleMarketClick(market.name)}
                className={`cursor-pointer hover:bg-[var(--color-card-bg-secondary)] ${
                  highlightedSymbol === market.name ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center">
                    <div className="mr-2">
                      <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                        {market.name.substring(0, 2)}
                      </div>
                    </div>
                    <div>
                      <div>{market.name}</div>
                      <div className="text-xs text-gray-500">PERP</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                  ${market.markPrice.toFixed(2)}
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${
                  market.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                  ${(market.volume24h / 1000).toFixed(1)}K
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${
                  market.fundingRate >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {market.fundingRate >= 0 ? '+' : ''}{market.fundingRate.toFixed(4)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {loading && markets.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      )}
    </div>
  );
};

export default HyperliquidMarketOverview;
