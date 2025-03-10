// Freqtrade API Service
// This service connects to your local Freqtrade instances running in Docker

import axios from 'axios';

// Define the strategy types more precisely
interface StrategyConfig {
  baseUrl: string;
  apiToken: string;
  configFile: string;
}

// Config for each strategy
const strategyConfigs: Record<string, StrategyConfig> = {
  'Hyperliquid Gucky': {
    baseUrl: 'http://localhost:8080', // Change these ports to match your actual setup
    apiToken: process.env.NEXT_PUBLIC_GUCKY_API_TOKEN || 'default_token',
    configFile: 'config-hl-gucky.json'
  },
  'Elliott Wave v5': {
    baseUrl: 'http://localhost:8081',
    apiToken: process.env.NEXT_PUBLIC_ELLIOT_API_TOKEN || 'default_token',
    configFile: 'config-elliotv5.json'
  },
  'MACD Strategy': {
    baseUrl: 'http://localhost:8082',
    apiToken: process.env.NEXT_PUBLIC_MACD_API_TOKEN || 'default_token',
    configFile: 'config-macd.json'
  },
  'VWAP Strategy': {
    baseUrl: 'http://localhost:8083',
    apiToken: process.env.NEXT_PUBLIC_VWAP_API_TOKEN || 'default_token',
    configFile: 'config-vwap.json'
  }
};

// Create axios instances for each strategy
const apiInstances: Record<string, any> = Object.entries(strategyConfigs).reduce((acc, [name, config]) => {
  acc[name] = axios.create({
    baseURL: config.baseUrl,
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json'
    }
  });
  return acc;
}, {} as Record<string, any>);

// Docker management helpers
const dockerApi = {
  // Check Docker status
  getDockerStatus: async () => {
    try {
      // In a production environment, you would have a backend endpoint to interact with Docker
      // For now, we'll simulate this with a mock
      return {
        running: true,
        diskUsage: 65, // percentage
        containers: Object.keys(strategyConfigs).length
      };
    } catch (error) {
      console.error('Error checking Docker status:', error);
      throw error;
    }
  },

  // Clean Docker space
  cleanDockerSpace: async () => {
    try {
      // This would call a backend endpoint to run docker system prune -a
      // For now, we'll simulate this with a mock
      return {
        spaceFreed: '23GB',
        success: true
      };
    } catch (error) {
      console.error('Error cleaning Docker space:', error);
      throw error;
    }
  },

  // Restart Docker service
  restartDocker: async () => {
    try {
      // This would call a backend endpoint to restart the Docker service
      // For now, we'll simulate with a mock
      return {
        success: true,
        message: 'Docker restarted successfully'
      };
    } catch (error) {
      console.error('Error restarting Docker:', error);
      throw error;
    }
  }
};

// Define Strategy type
export interface Strategy {
  name: string;
  configFile: string;
  status: 'running' | 'stopped' | 'error';
  profit: number;
  allocation: number;
  error?: any;
}

// API functions for interacting with Freqtrade instances
const freqtradeApi = {
  // Get summary of all strategies
  getAllStrategies: async (): Promise<Strategy[]> => {
    try {
      const strategies = await Promise.all(
        Object.entries(strategyConfigs).map(async ([name, config]) => {
          try {
            // In a real implementation, you would make API calls to each Freqtrade instance
            // For now, we'll simulate with realistic mock data
            // const response = await apiInstances[name].get('/api/v1/status');
            
            // Mock response
            const mockProfit = (Math.random() * 4) - 1; // Random profit between -1 and 3
            const mockAllocation = parseFloat((Math.random() * 20 + 5).toFixed(2)); // 5-25 USDT allocation
            
            return {
              name,
              configFile: config.configFile,
              status: (Math.random() > 0.2 ? 'running' : 'stopped') as 'running' | 'stopped',
              profit: mockProfit,
              allocation: mockAllocation
            };
          } catch (error) {
            console.error(`Error fetching status for ${name}:`, error);
            return {
              name,
              configFile: config.configFile,
              status: 'error' as const,
              profit: 0,
              allocation: 0,
              error: error
            };
          }
        })
      );
      
      return strategies;
    } catch (error) {
      console.error('Error fetching strategies:', error);
      throw error;
    }
  },

  // Toggle strategy status (start/stop)
  toggleStrategy: async (name: string, action: 'start' | 'stop') => {
    try {
      if (!Object.keys(strategyConfigs).includes(name)) {
        throw new Error(`Strategy ${name} not found`);
      }

      const instance = apiInstances[name];
      
      // In a real implementation:
      // const response = await instance.post(`/api/v1/${action}`);
      
      // Mock response
      return {
        success: true,
        message: `Strategy ${name} ${action === 'start' ? 'started' : 'stopped'} successfully`
      };
    } catch (error) {
      console.error(`Error ${action === 'start' ? 'starting' : 'stopping'} strategy:`, error);
      throw error;
    }
  },

  // Get detailed performance for a specific strategy
  getStrategyPerformance: async (name: string) => {
    try {
      if (!Object.keys(strategyConfigs).includes(name)) {
        throw new Error(`Strategy ${name} not found`);
      }
      
      const instance = apiInstances[name];

      // In a real implementation:
      // const response = await instance.get('/api/v1/performance');
      
      // Mock performance data
      return {
        strategy: name,
        totalProfit: Math.random() * 10 - 2, // -2 to 8 USDT
        tradeCount: Math.floor(Math.random() * 100) + 5,
        winRate: Math.random() * 0.4 + 0.4, // 40-80% win rate
        bestTrade: Math.random() * 5, // 0-5 USDT
        worstTrade: Math.random() * -3, // -3-0 USDT
        averageDuration: Math.floor(Math.random() * 120) + 10, // 10-130 minutes
        pairs: ['BTC/USDT', 'ETH/USDT', 'XMR/BTC'].map(pair => ({
          pair,
          profit: Math.random() * 5 - 1, // -1 to 4 USDT
          tradeCount: Math.floor(Math.random() * 20) + 1
        }))
      };
    } catch (error) {
      console.error(`Error fetching performance for ${name}:`, error);
      throw error;
    }
  },

  // Get open trades for a specific strategy
  getOpenTrades: async (name: string) => {
    try {
      if (!Object.keys(strategyConfigs).includes(name)) {
        throw new Error(`Strategy ${name} not found`);
      }

      const instance = apiInstances[name];
      
      // In a real implementation:
      // const response = await instance.get('/api/v1/status');
      
      // Mock open trades
      const tradeCount = Math.floor(Math.random() * 3); // 0-3 open trades
      return Array.from({ length: tradeCount }).map((_, i) => ({
        id: i + 1,
        pair: ['BTC/USDT', 'ETH/USDT', 'XMR/BTC'][Math.floor(Math.random() * 3)],
        amount: Math.random() * 0.1,
        openRate: Math.random() * 50000,
        currentRate: Math.random() * 50000,
        profit: Math.random() * 2 - 0.5, // -0.5 to 1.5 USDT
        duration: Math.floor(Math.random() * 24) + 1 // 1-24 hours
      }));
    } catch (error) {
      console.error(`Error fetching open trades for ${name}:`, error);
      throw error;
    }
  },

  // Get configuration file for a specific strategy
  getStrategyConfig: async (name: string) => {
    try {
      if (!Object.keys(strategyConfigs).includes(name)) {
        throw new Error(`Strategy ${name} not found`);
      }

      const config = strategyConfigs[name];
      
      // In a real implementation:
      // const response = await apiInstances[name].get('/api/v1/show_config');
      
      // Mock configuration
      return {
        exchange: {
          name: 'binance',
          key: '**********',
          secret: '**********',
          ccxt_config: {
            enableRateLimit: true
          }
        },
        dry_run: false,
        timeframe: '5m',
        stake_currency: 'USDT',
        stake_amount: Math.random() * 20 + 5, // 5-25 USDT
        strategy: name.replace(' ', ''),
        entry_pricing: {
          price_side: 'same',
          use_order_book: true,
          order_book_top: 1
        },
        exit_pricing: {
          price_side: 'same',
          use_order_book: true,
          order_book_top: 1
        },
        max_open_trades: Math.floor(Math.random() * 5) + 1, // 1-5 trades
        pairs: ['BTC/USDT', 'ETH/USDT', 'XMR/BTC', 'SOL/USDT', 'DOGE/USDT']
      };
    } catch (error) {
      console.error(`Error fetching config for ${name}:`, error);
      throw error;
    }
  },

  // Update configuration for a specific strategy
  updateStrategyConfig: async (name: string, configUpdate: any) => {
    try {
      if (!Object.keys(strategyConfigs).includes(name)) {
        throw new Error(`Strategy ${name} not found`);
      }

      const instance = apiInstances[name];
      
      // In a real implementation:
      // const response = await instance.post('/api/v1/reload_config', configUpdate);
      
      // Mock response
      return {
        success: true,
        message: `Configuration for ${name} updated successfully`
      };
    } catch (error) {
      console.error(`Error updating config for ${name}:`, error);
      throw error;
    }
  }
};

export { freqtradeApi, dockerApi, strategyConfigs };
