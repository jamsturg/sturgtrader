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

// Crypto icons background colors
const cryptoBgColors: Record<string, string> = {
  BTC: 'bg-[#F7931A]/20',
  ETH: 'bg-[#627EEA]/20',
  USDT: 'bg-[#26A17B]/20',
  SOL: 'bg-[#9945FF]/20',
  ADA: 'bg-[#0033AD]/20',
  XRP: 'bg-[#00AEFF]/20',
  DOT: 'bg-[#E6007A]/20',
};

const AssetBalance: React.FC<AssetBalanceProps> = ({
  assets = [
    { symbol: 'BTC', name: 'Bitcoin', balance: 0.05, valueInUSD: 2750, change24h: 1.2 },
    { symbol: 'ETH', name: 'Ethereum', balance: 1.2, valueInUSD: 3200, change24h: -0.8 },
    { symbol: 'USDT', name: 'Tether', balance: 5000, valueInUSD: 5000, change24h: 0.01 },
  ]
}) => {
  const totalValue = assets.reduce((sum, asset) => sum + asset.valueInUSD, 0);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-800">
        <div>
          <h3 className="text-lg font-semibold bright-blue-text">Asset Balance</h3>
          <p className="text-sm text-gray-400">Updated 2 minutes ago</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Value</p>
          <p className="text-xl font-bold">${totalValue.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="space-y-4 overflow-auto flex-grow">
        {assets.map((asset) => (
          <div key={asset.symbol} className="flex items-center justify-between p-2 hover:bg-gray-800/30 rounded-md transition-colors">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-md ${cryptoBgColors[asset.symbol] || 'bg-gray-700'} flex items-center justify-center p-1 mr-3 shadow-md`}>
                <span className="text-xl font-bold">{asset.symbol}</span>
              </div>
              <div>
                <p className="font-semibold text-white">{asset.name}</p>
                <p className="text-sm text-gray-400">
                  {asset.balance.toLocaleString(undefined, {
                    minimumFractionDigits: asset.symbol === 'USDT' ? 0 : 5,
                    maximumFractionDigits: asset.symbol === 'USDT' ? 0 : 5
                  })} {asset.symbol}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">${asset.valueInUSD.toLocaleString()}</p>
              <p className={`text-sm font-medium ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-800 text-center">
        <button className="btn-secondary text-sm w-full">
          View All Assets →
        </button>
      </div>
    </div>
  );
};

export default AssetBalance;
