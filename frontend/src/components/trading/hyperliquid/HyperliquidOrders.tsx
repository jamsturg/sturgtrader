import React, { useState, useEffect } from 'react';
import { Order } from '../../../services/hyperliquidService';
import { enhancedHyperliquidService } from '../../../services/enhancedHyperliquidService';

interface HyperliquidOrdersProps {
  refreshInterval?: number;
  onCancelOrder?: (result: any) => void;
}

const HyperliquidOrders: React.FC<HyperliquidOrdersProps> = ({
  refreshInterval = 10000,
  onCancelOrder
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set());

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enhancedHyperliquidService.getOpenOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up polling if refreshInterval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchOrders, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval]);

  const handleCancelOrder = async (symbol: string, orderId: string) => {
    try {
      setCancellingOrders(prev => new Set(prev).add(orderId));
      const result = await enhancedHyperliquidService.cancelOrder(symbol, orderId);
      
      if (result.success) {
        // Remove the cancelled order from the list
        setOrders(orders.filter(order => order.id !== orderId));
      }
      
      if (onCancelOrder) {
        onCancelOrder(result);
      }
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      setError(`Failed to cancel order: ${err.message}`);
    } finally {
      setCancellingOrders(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Open Orders</h3>
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Open Orders</h3>
        <div className="text-center text-red-500 py-6">
          {error}
          <button 
            onClick={fetchOrders}
            className="block mx-auto mt-2 text-sm bg-[var(--color-primary)] text-white px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Open Orders</h3>
        <div className="text-center text-gray-500 py-6">
          No open orders
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Open Orders</h3>
        <button 
          onClick={fetchOrders} 
          className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          Refresh
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Filled</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[var(--color-card-bg-secondary)]">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                  {order.symbol}
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm ${order.isBuy ? 'text-green-500' : 'text-red-500'}`}>
                  {order.isBuy ? 'BUY' : 'SELL'} {order.type.toUpperCase()}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  ${order.price.toFixed(2)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {order.size.toFixed(4)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(order.filled / order.size) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs">{((order.filled / order.size) * 100).toFixed(1)}%</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'open' ? 'bg-blue-100 text-blue-800' : 
                    order.status === 'partial' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'filled' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {(['open', 'partial'].includes(order.status)) && (
                    <button
                      onClick={() => handleCancelOrder(order.symbol, order.id)}
                      disabled={cancellingOrders.has(order.id)}
                      className={`text-red-600 hover:text-red-900 ${cancellingOrders.has(order.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {cancellingOrders.has(order.id) ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {loading && orders.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      )}
      
      {error && orders.length > 0 && (
        <div className="mt-4 text-center text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default HyperliquidOrders;
