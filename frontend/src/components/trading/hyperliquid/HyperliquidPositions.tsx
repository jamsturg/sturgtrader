import { useQuery } from 'react-query';
import { FreqtradeApiService } from '../services/api/freqtradeApi';
import { HyperliquidPosition } from '../../../lib/hyperliquid-sdk/types';

const apiService = new FreqtradeApiService();

export default function HyperliquidPositions() {
  const { data: positions = [], error: err } = useQuery<HyperliquidPosition[]>(
    'hyperliquid-positions',
    apiService.getPositions
  );

  if (err) {
    console.error(err);
    return <div>Error loading positions</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Hyperliquid Positions</h3>
      <div className="grid grid-cols-1 gap-2">
        {positions?.map((position) => (
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
        ))}
      </div>
    </div>
  );
}
