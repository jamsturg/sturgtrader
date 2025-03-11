import React, { useState, useEffect } from 'react';
import AnalyticsMetricsCard from './AnalyticsMetricsCard';

interface MetricData {
  value: number;
  trend: number;
}

interface AnalyticsMetrics {
  profitLoss: MetricData;
  volume: MetricData;
  activeBots: MetricData;
  completedTrades: MetricData;
}

const AnalyticsDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);

  // Fetch metrics data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        // Mock data
        setMetrics({
          profitLoss: { value: 213.75, trend: 5.2 },
          volume: { value: 1243000, trend: 12.8 },
          activeBots: { value: 3, trend: 0 },
          completedTrades: { value: 124, trend: -3.5 }
        });
        setIsLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, [timeframe]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Analytics <span className="bright-green-text">Dashboard</span>
        </h1>
        
        <div className="flex space-x-2">
          {['day', 'week', 'month'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as any)}
              className={`px-4 py-2 rounded-md ${timeframe === tf ? 'bright-green-bg text-black' : 'bg-gray-700'}`}
            >
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-positive)]"></div>
        </div>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <AnalyticsMetricsCard 
              title="Profit/Loss" 
              value={`$${metrics.profitLoss.value.toFixed(2)}`}
              trend={metrics.profitLoss.trend} 
            />
            <AnalyticsMetricsCard 
              title="Trading Volume" 
              value={`$${metrics.volume.value.toLocaleString()}`}
              trend={metrics.volume.trend} 
            />
            <AnalyticsMetricsCard 
              title="Active Bots" 
              value={metrics.activeBots.value}
              trend={metrics.activeBots.trend} 
            />
            <AnalyticsMetricsCard 
              title="Completed Trades" 
              value={metrics.completedTrades.value}
              trend={metrics.completedTrades.trend} 
            />
          </div>
          
          <div className="glass-panel p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Performance Chart</h2>
            <div className="aspect-video bg-gray-800/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chart visualization will be implemented here</p>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-panel p-6 rounded-lg text-center">
          <p>No data available for the selected timeframe.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
