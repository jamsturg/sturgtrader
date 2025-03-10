import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';

interface Strategy {
  name: string;
  configFile: string;
  status: 'running' | 'stopped';
  profit: number;
  allocation: number;
}

const FreqtradeIntegration: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([
    { 
      name: 'Hyperliquid Gucky', 
      configFile: 'config-hl-gucky.json',
      status: 'running',
      profit: 2.34,
      allocation: 15
    },
    { 
      name: 'Elliott Wave v5', 
      configFile: 'config-elliotv5.json',
      status: 'running',
      profit: -0.89,
      allocation: 10
    },
    { 
      name: 'MACD Strategy', 
      configFile: 'config-macd.json',
      status: 'stopped',
      profit: 1.45,
      allocation: 15
    },
    { 
      name: 'VWAP Strategy', 
      configFile: 'config-vwap.json',
      status: 'running',
      profit: 0.76,
      allocation: 10
    }
  ]);
  
  const [totalBankroll, setTotalBankroll] = useState(50);
  const [dockerStatus, setDockerStatus] = useState({
    running: true,
    diskUsage: 77, // percentage of available space used
    containers: 4
  });

  // Toggle strategy status
  const toggleStrategy = (index: number) => {
    const newStrategies = [...strategies];
    newStrategies[index].status = newStrategies[index].status === 'running' ? 'stopped' : 'running';
    setStrategies(newStrategies);
  };

  // Calculate total profit percentage
  const calculateTotalProfit = () => {
    const totalProfit = strategies.reduce((sum, strategy) => sum + strategy.profit, 0);
    return (totalProfit / totalBankroll) * 100;
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Freqtrade <span className="bright-green-text">Integration</span>
        </h1>
        <p className="text-[var(--color-neutral)]">Manage your Freqtrade trading strategies</p>
      </div>

      {/* Docker Status Panel */}
      <div className="glass-panel p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-2">Docker Status</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className={dockerStatus.running ? "text-green-500" : "text-red-500"}>
                  {dockerStatus.running ? "Running" : "Stopped"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Disk Usage</p>
                <p className={dockerStatus.diskUsage > 90 ? "text-red-500" : "text-white"}>
                  {dockerStatus.diskUsage}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Containers</p>
                <p className="text-white">{dockerStatus.containers} active</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm">Clean Space</button>
            <button className="btn-primary text-sm">Restart Docker</button>
          </div>
        </div>
      </div>

      {/* Bankroll Overview */}
      <div className="glass-panel p-4 mb-6">
        <h2 className="text-xl font-bold mb-2">Bankroll Overview</h2>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-gray-400 text-sm">Total Bankroll</p>
              <p className="text-2xl font-bold">${totalBankroll.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Profit/Loss</p>
              <p className={`text-2xl font-bold ${calculateTotalProfit() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {calculateTotalProfit() >= 0 ? '+' : ''}{calculateTotalProfit().toFixed(2)}%
              </p>
            </div>
          </div>
          <button className="btn-primary">Adjust Allocation</button>
        </div>
      </div>

      {/* Strategies Table */}
      <div className="glass-panel p-4">
        <h2 className="text-xl font-bold mb-4">Trading Strategies</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Strategy</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Config File</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Profit/Loss</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Allocation</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {strategies.map((strategy, index) => (
                <tr key={strategy.name} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium">{strategy.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                    {strategy.configFile}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      strategy.status === 'running' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}>
                      {strategy.status === 'running' ? 'Running' : 'Stopped'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-right ${
                    strategy.profit >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {strategy.profit >= 0 ? '+' : ''}{strategy.profit.toFixed(2)} USDT
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    ${strategy.allocation.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => toggleStrategy(index)}
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          strategy.status === 'running' 
                            ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' 
                            : 'bg-green-900/30 hover:bg-green-900/50 text-green-400'
                        }`}
                      >
                        {strategy.status === 'running' ? 'Stop' : 'Start'}
                      </button>
                      <button className="px-2 py-1 rounded-md text-xs font-medium bg-blue-900/30 hover:bg-blue-900/50 text-blue-400">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="btn-primary">
            Add New Strategy
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default FreqtradeIntegration;
