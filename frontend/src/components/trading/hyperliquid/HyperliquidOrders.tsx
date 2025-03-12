import { useQuery } from '@tanstack/react-query';
import hyperfluidApi from '../../../services/api/hyperfluidApi';
import { HyperliquidOrder } from '../../../lib/hyperliquid-sdk/types';

export default function HyperliquidOrders() {
  const { data: orders = [], isLoading } = useQuery<HyperliquidOrder[]>({
    queryKey: ['hyperliquid-orders'],
    queryFn: async (): Promise<HyperliquidOrder[]> => {
      try {
        return await hyperfluidApi.getOpenOrders();
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        return [];
      }
    },
    refetchInterval: 3000
  });

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Open Orders</h3>
      <div className="grid grid-cols-1 gap-2">
        {(orders ?? []).map((order) => (
          <div key={order.orderId} className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-mono ${order.side === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                  {order.symbol}
                </span>
                <span className="text-xs text-gray-400">{order.type}</span>
              </div>
              <span className="font-medium">{order.quantity.toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span>${order.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={
                  order.status === 'filled' ? 'text-green-400' :
                  order.status === 'canceled' ? 'text-gray-400' : 'text-yellow-400'
                }>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Open Orders</h3>
      <div className="grid grid-cols-1 gap-2">
        {orders.map((order) => (
          <div key={order.orderId} className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-mono ${order.side === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                  {order.symbol}
                </span>
                <span className="text-xs text-gray-400">{order.type}</span>
              </div>
              <span className="font-medium">{order.quantity.toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span>${order.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={
                  order.status === 'filled' ? 'text-green-400' : 
                  order.status === 'canceled' ? 'text-gray-400' : 'text-yellow-400'
                }>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
