import React from 'react';

interface Order {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  filled: number;
  status: 'open' | 'partial' | 'closed' | 'canceled';
  timestamp: number;
}

interface ActiveOrdersProps {
  orders?: Order[];
  onCancelOrder?: (orderId: string) => void;
}

const ActiveOrders: React.FC<ActiveOrdersProps> = ({ 
  orders = [], 
  onCancelOrder = () => {} 
}) => {
  if (orders.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Active Orders</h3>
        <div className="text-center text-gray-500 py-6">
          No active orders
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Active Orders</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pair</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Filled</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-3 py-2 whitespace-nowrap text-sm">{order.pair}</td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm ${order.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                  {order.type.toUpperCase()}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">{order.price.toFixed(2)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">{order.amount.toFixed(8)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(order.filled / order.amount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs">{((order.filled / order.amount) * 100).toFixed(1)}%</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'open' ? 'bg-blue-100 text-blue-800' : 
                    order.status === 'partial' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'closed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {(order.status === 'open' || order.status === 'partial') && (
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => onCancelOrder(order.id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveOrders;
