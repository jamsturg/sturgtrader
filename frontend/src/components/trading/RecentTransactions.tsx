import React from 'react';

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  asset: string;
  amount: number;
  price?: number;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions = [] 
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="text-center text-gray-500 py-6">
          No recent transactions
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              {transactions.some(tx => tx.price !== undefined) && (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              )}
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tx.type === 'buy' ? 'bg-green-100 text-green-800' : 
                    tx.type === 'sell' ? 'bg-red-100 text-red-800' :
                    tx.type === 'deposit' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">{tx.asset}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">{tx.amount.toFixed(8)}</td>
                {transactions.some(tx => tx.price !== undefined) && (
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {tx.price ? `$${tx.price.toFixed(2)}` : '-'}
                  </td>
                )}
                <td className="px-3 py-2 whitespace-nowrap text-sm">{formatDate(tx.timestamp)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
        <button className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
          View All Transactions →
        </button>
      </div>
    </div>
  );
};

export default RecentTransactions;
