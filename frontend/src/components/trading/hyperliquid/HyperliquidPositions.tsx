import { useQuery } from '@tanstack/react-query';
import { freqtradeApi } from '../../../services/freqtradeApi';
import { HyperliquidPosition } from '../../../lib/hyperliquid-sdk/types';

interface FreqtradeTrade {
  pair: string;
  profit: number;
  amount: number;
  currentRate: number;
  openRate: number;
  duration?: number;
}

export default function HyperliquidPositions() {
  // Use the 'Hyperliquid Gucky' strategy from the available strategies
  const { data: positions = [], error: err, isLoading } = useQuery<FreqtradeTrade[]>({
    queryKey: ['hyperliquid-positions'],
    queryFn: () => freqtradeApi.getOpenTrades('Hyperliquid Gucky'),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Hyperliquid Positions</h3>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (err) {
    console.error(err);
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Hyperliquid Positions</h3>
        <div className="text-center text-red-500 py-4">Error loading positions</div>
      </div>
    );
  }

  // Convert freqtrade trades format to HyperliquidPosition format for compatibility
  const formattedPositions: HyperliquidPosition[] = positions.map((trade: FreqtradeTrade) => ({
    symbol: trade.pair,
    side: trade.profit >= 0 ? 'LONG' : 'SHORT', // Simplified assumption
    leverage: 3, // Default leverage
    notional: trade.amount * trade.currentRate,
    entryPx: trade.openRate,
    markPx: trade.currentRate,
    unrealizedPnl: trade.profit,
    liquidationPx: trade.openRate * (trade.profit >= 0 ? 0.7 : 1.3), // Simplified calculation
    timestamp: trade.duration ? Date.now() - (trade.duration * 3600 * 1000) : Date.now() // Convert duration from hours to timestamp
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Hyperliquid Positions</h3>
      <div className="grid grid-cols-1 gap-2">
        {formattedPositions.length > 0 ? (
          formattedPositions.map((position) => (
            <div key={position.symbol} className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono ${position.side === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                    {position.symbol}
                  </span>
                  <span className="text-xs text-gray-400">{position.leverage}x</span>
                </div>
                <span className="font-medium">${position.notional.toLocaleString()}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Entry:</span>
                  <span>${position.entryPx.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mark:</span>
                  <span>${position.markPx.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">PNL:</span>
                  <span className={position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ${position.unrealizedPnl.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Liq Price:</span>
                  <span>${position.liquidationPx.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-400">No open positions</div>
        )}
      </div>
    </div>
  );
}
