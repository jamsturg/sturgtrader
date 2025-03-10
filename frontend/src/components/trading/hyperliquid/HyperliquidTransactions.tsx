import React, { useState, useEffect } from 'react';
import { enhancedHyperliquidService, Transaction } from '../../../services/enhancedHyperliquidService';

interface HyperliquidTransactionsProps {
  refreshInterval?: number;
  limit?: number;
}

const HyperliquidTransactions: React.FC<HyperliquidTransactionsProps> = ({
  refreshInterval = 15000,
  limit = 10
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      if (!initialized) {
        setError(null);
      }
      
      // Check if service is authenticated
      if (!enhancedHyperliquidService.isAuthenticated()) {
        await enhancedHyperliquidService.initialize();
      }
      
      const data = await enhancedHyperliquidService.getRecentTransactions();
      
      // Sort by timestamp (newest first) and limit
      const sorted = data
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
      
      setTransactions(sorted);
      setInitialized(true);
    } catch (err: any) {
      if (!initialized) {
        setError(err.message || 'Failed to fetch transaction history');
      }
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Set up polling if refreshInterval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchTransactions, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, limit]);

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  if (loading && !initialized) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  if (error && !initialized) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="text-center text-red-500 py-6">
          {error}
          <button 
            onClick={fetchTransactions}
            className="block mx-auto mt-2 text-sm bg-[var(--color-primary)] text-white px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <button 
            onClick={fetchTransactions} 
            className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            Refresh
          </button>
        </div>
        <div className="text-center text-gray-500 py-6">
          No transactions found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <button 
          onClick={fetchTransactions} 
          className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Side</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Fee</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">PnL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {transactions.map((tx, index) => (
              <tr key={`${tx.id}-${index}`} className="hover:bg-[var(--color-card-bg-secondary)]">
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {formatTime(tx.timestamp)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                  {tx.symbol}
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm ${tx.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.type === 'buy' ? 'BUY' : 'SELL'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {tx.size.toFixed(4)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  ${tx.price.toFixed(2)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                  ${tx.fee.toFixed(2)}
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${
                  tx.pnl && tx.pnl > 0 ? 'text-green-500' : 
                  tx.pnl && tx.pnl < 0 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {tx.pnl ? `${tx.pnl > 0 ? '+' : ''}${tx.pnl.toFixed(2)}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {loading && transactions.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      )}
    </div>
  );
};

export default HyperliquidTransactions;
