import React from 'react';

interface BotPerformanceProps {
  bots: any[];
}

const BotPerformance: React.FC<BotPerformanceProps> = ({ bots }) => {
  // Calculate summary statistics
  const totalProfit = bots.reduce((sum, bot) => sum + bot.profit, 0);
  const avgProfitPercent = bots.length > 0 
    ? bots.reduce((sum, bot) => sum + bot.profitPercent, 0) / bots.length 
    : 0;
  const activeBots = bots.filter(bot => bot.status === "active").length;
  
  return (
    <div className="glass-panel p-5 rounded-lg mb-8">
      <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Total Bots</div>
          <div className="text-2xl font-bold">{bots.length}</div>
        </div>
        
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Active Bots</div>
          <div className="text-2xl font-bold">{activeBots}</div>
        </div>
        
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Total Profit</div>
          <div className={`text-2xl font-bold ${totalProfit >= 0 ? "bright-green-text" : "text-red-500"}`}>
            {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(2)} USDT
          </div>
        </div>
        
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Average Performance</div>
          <div className={`text-2xl font-bold ${avgProfitPercent >= 0 ? "bright-green-text" : "text-red-500"}`}>
            {avgProfitPercent >= 0 ? "+" : ""}{avgProfitPercent.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotPerformance;