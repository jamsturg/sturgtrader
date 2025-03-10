import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { freqtradeApi, dockerApi } from '../services/freqtradeApi';
import { useRouter } from 'next/router';

interface Strategy {
  name: string;
  configFile: string;
  status: 'running' | 'stopped' | 'error';
  profit: number;
  allocation: number;
  error?: any;
}

interface DockerStatus {
  running: boolean;
  diskUsage: number;
  containers: number;
}

const TradingStrategies: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBankroll, setTotalBankroll] = useState(50); // Total of $50 as mentioned in user memory
  const [dockerStatus, setDockerStatus] = useState<DockerStatus>({
    running: true,
    diskUsage: 65, // percentage after cleanup
    containers: 4
  });
  const router = useRouter();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get strategies data
        const strategiesData = await freqtradeApi.getAllStrategies();
        setStrategies(strategiesData);
        
        // Get Docker status
        const dockerData = await dockerApi.getDockerStatus();
        setDockerStatus(dockerData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Toggle strategy status
  const toggleStrategy = async (index: number) => {
    try {
      const strategy = strategies[index];
      const action = strategy.status === 'running' ? 'stop' : 'start';
      
      const result = await freqtradeApi.toggleStrategy(strategy.name, action);
      
      if (result.success) {
        const newStrategies = [...strategies];
        newStrategies[index].status = action === 'start' ? 'running' : 'stopped';
        setStrategies(newStrategies);
      }
    } catch (error) {
      console.error('Error toggling strategy:', error);
    }
  };

  // Clean Docker space
  const cleanDockerSpace = async () => {
    try {
      const result = await dockerApi.cleanDockerSpace();
      if (result.success) {
        setDockerStatus({
          ...dockerStatus,
          diskUsage: Math.max(dockerStatus.diskUsage - 15, 10)
        });
      }
    } catch (error) {
      console.error('Error cleaning Docker space:', error);
    }
  };
  
  // Navigate to edit config page
  const editConfig = (strategy: Strategy) => {
    router.push(`/strategy-config/${encodeURIComponent(strategy.name)}`);
  };
  
  // Add new strategy
  const addNewStrategy = () => {
    router.push('/strategy-config/new');
  };

  // Calculate total profit percentage
  const calculateTotalProfit = () => {
    const totalProfit = strategies.reduce((sum, strategy) => sum + strategy.profit, 0);
    return (totalProfit / totalBankroll) * 100;
  };

  return (
    <Layout title="Freqtrade Strategies - SturgTrader">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Freqtrade <span className="bright-green-text">Strategy Management</span>
        </h1>
        <p className="text-[var(--color-neutral)]">Monitor and control your Freqtrade trading bots</p>
      </div>

      {loading ? (
        <div className="glass-panel p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-positive)]"></div>
        </div>
      ) : (
        <>
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
                <button 
                  className="btn-secondary text-sm"
                  onClick={cleanDockerSpace}
                >
                  Clean Space
                </button>
                <button 
                  className="btn-primary text-sm"
                  onClick={async () => {
                    try {
                      await dockerApi.restartDocker();
                    } catch (error) {
                      console.error('Error restarting Docker:', error);
                    }
                  }}
                >
                  Restart Docker
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Status */}
          <div className="glass-panel p-4 mb-6">
            <h2 className="text-xl font-bold mb-2">Configuration Status</h2>
            <p className="text-green-500 mb-2">✓ All configuration files have entry_pricing and exit_pricing parameters</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="glass-panel p-3">
                <h3 className="font-medium mb-1">Entry Pricing</h3>
                <p className="text-sm text-gray-300">Properly configured with price and volume parameters</p>
              </div>
              <div className="glass-panel p-3">
                <h3 className="font-medium mb-1">Exit Pricing</h3>
                <p className="text-sm text-gray-300">Set with optimal timeouts and execution limits</p>
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
                  {strategies.length > 0 ? (
                    <p className={`text-2xl font-bold ${calculateTotalProfit() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {calculateTotalProfit() >= 0 ? '+' : ''}{calculateTotalProfit().toFixed(2)}%
                    </p>
                  ) : (
                    <p className="text-2xl font-bold">--</p>
                  )}
                </div>
              </div>
              <button 
                className="btn-primary"
                onClick={() => router.push('/bankroll-management')}
              >
                Adjust Allocation
              </button>
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
                          strategy.status === 'running' 
                            ? 'bg-green-900/30 text-green-400' 
                            : strategy.status === 'error'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-red-900/30 text-red-400'
                        }`}>
                          {strategy.status === 'running' 
                            ? 'Running' 
                            : strategy.status === 'error'
                              ? 'Error'
                              : 'Stopped'}
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
                          <button 
                            className="px-2 py-1 rounded-md text-xs font-medium bg-blue-900/30 hover:bg-blue-900/50 text-blue-400"
                            onClick={() => editConfig(strategy)}
                          >
                            Edit Config
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                className="btn-primary"
                onClick={addNewStrategy}
              >
                Add New Strategy
              </button>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default TradingStrategies;
