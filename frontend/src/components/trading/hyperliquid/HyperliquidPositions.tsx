import React, { useState, useEffect } from 'react';
import { Position } from '../../../services/hyperliquidService';
import { enhancedHyperliquidService } from '../../../services/enhancedHyperliquidService';

interface HyperliquidPositionsProps {
  refreshInterval?: number;
  onPositionSelect?: (position: Position) => void;
}

const HyperliquidPositions: React.FC<HyperliquidPositionsProps> = ({
  refreshInterval = 10000,
  onPositionSelect
}) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enhancedHyperliquidService.getPositions();
      setPositions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch positions');
      console.error('Error fetching positions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();

    // Set up polling if refreshInterval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchPositions, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval]);

  const handlePositionClick = (position: Position) => {
    if (onPositionSelect) {
      onPositionSelect(position);
    }
  };

  if (loading && positions.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Hyperliquid Positions</h3>
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Hyperliquid Positions</h3>
        <div className="text-center text-red-500 py-6">
          {error}
          <button 
            onClick={fetchPositions}
            className="block mx-auto mt-2 text-sm bg-[var(--color-primary)] text-white px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Hyperliquid Positions</h3>
        <div className="text-center text-gray-500 py-6">
          No open positions
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Hyperliquid Positions</h3>
        <button 
          onClick={fetchPositions} 
          className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          Refresh
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entry Price</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mark Price</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">PnL</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Leverage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {positions.map((position) => (
              <tr 
                key={position.symbol}
                onClick={() => handlePositionClick(position)}
                className="cursor-pointer hover:bg-[var(--color-card-bg-secondary)]"
              >
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                  {position.symbol}
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm ${position.size > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {position.size > 0 ? '+' : ''}{position.size.toFixed(4)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  ${position.entryPrice.toFixed(2)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  ${position.markPrice.toFixed(2)}
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                  {position.leverage}x
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {loading && positions.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      )}
    </div>
  );
};

export default HyperliquidPositions;
