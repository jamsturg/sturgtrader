import React from 'react';

interface Asset {
  symbol: string;
  name: string;
  balance: number;
  valueInUSD: number;
  change24h: number;
}

interface AssetBalanceProps {
  assets?: Asset[];
}

const AssetBalance: React.FC<AssetBalanceProps> = ({ 
  assets = [
    { symbol: 'BTC', name: 'Bitcoin', balance: 0.05, valueInUSD: 2750, change24h: 1.2 },
    { symbol: 'ETH', name: 'Ethereum', balance: 1.2, valueInUSD: 3200, change24h: -0.8 },
    { symbol: 'USDT', name: 'Tether', balance: 5000, valueInUSD: 5000, change24h: 0.01 },
  ] 
}) => {
  const totalValue = assets.reduce((sum, asset) => sum + asset.valueInUSD, 0);
  
  return (
    <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Asset Balance</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-lg font-semibold">${totalValue.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {assets.map((asset) => (
          <div key={asset.symbol} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                {asset.symbol}
              </div>
              <div className="ml-3">
                <p className="font-medium">{asset.name}</p>
                <p className="text-sm text-gray-500">{asset.balance} {asset.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">${asset.valueInUSD.toLocaleString()}</p>
              <p className={`text-sm ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
        <button className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
          View All Assets →
        </button>
      </div>
    </div>
  );
};

export default AssetBalance;
