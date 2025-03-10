import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { enhancedHyperliquidService } from '../../../services/enhancedHyperliquidService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface HyperliquidPriceChartProps {
  symbol: string;
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  height?: number;
}

const HyperliquidPriceChart: React.FC<HyperliquidPriceChartProps> = ({
  symbol,
  timeframe = '1h',
  height = 400
}) => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<{ value: number; percent: number }>({ value: 0, percent: 0 });
  
  // Refs for WebSocket cleanup
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load historical price data and subscribe to real-time updates
  useEffect(() => {
    let isMounted = true;
    
    const loadPriceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch historical price data
        const historicalData = await enhancedHyperliquidService.getPriceHistory(symbol, timeframe);
        
        if (!isMounted) return;
        
        if (historicalData && historicalData.length > 0) {
          // Reverse to ensure chronological order
          const sortedData = [...historicalData].sort((a, b) => a.timestamp - b.timestamp);
          setPriceData(sortedData);
          
          // Set current price and calculate change
          const latestCandle = sortedData[sortedData.length - 1];
          if (latestCandle) {
            setCurrentPrice(latestCandle.close);
            
            // Calculate daily change
            if (sortedData.length > 1) {
              const firstCandle = sortedData[0];
              const changeValue = latestCandle.close - firstCandle.open;
              const changePercent = (changeValue / firstCandle.open) * 100;
              
              setPriceChange({
                value: changeValue,
                percent: changePercent
              });
            }
          }
        }
        
        // Subscribe to market updates
        const marketListener = enhancedHyperliquidService.subscribeToMarketUpdates(symbol, (update) => {
          if (!update || !update.data) return;
          
          // Update current price if available
          if (update.data.mids && update.data.mids[symbol]) {
            const newPrice = parseFloat(update.data.mids[symbol]);
            setCurrentPrice(newPrice);
            
            // Update price change
            if (priceData.length > 0) {
              const firstCandle = priceData[0];
              const changeValue = newPrice - firstCandle.open;
              const changePercent = (changeValue / firstCandle.open) * 100;
              
              setPriceChange({
                value: changeValue,
                percent: changePercent
              });
            }
          }
        });
        
        // Poll for new candles every minute
        updateIntervalRef.current = setInterval(async () => {
          try {
            const endTime = Date.now();
            const startTime = endTime - 24 * 60 * 60 * 1000; // Last 24 hours
            
            const newData = await enhancedHyperliquidService.getPriceHistory(
              symbol,
              timeframe,
              startTime,
              endTime
            );
            
            if (isMounted && newData && newData.length > 0) {
              setPriceData(newData.sort((a, b) => a.timestamp - b.timestamp));
            }
          } catch (err) {
            console.error('Error updating price data:', err);
          }
        }, 60000); // Update every minute
        
        unsubscribeRef.current = marketListener;
        
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load price data');
          console.error('Error loading price data:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadPriceData();
    
    // Cleanup
    return () => {
      isMounted = false;
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [symbol, timeframe]);
  
  // Chart configuration
  const chartData = {
    labels: priceData.map(data => new Date(data.timestamp)),
    datasets: [
      {
        label: `${symbol} Price`,
        data: priceData.map(data => data.close),
        borderColor: priceChange.percent >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
        backgroundColor: priceChange.percent >= 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.1,
        fill: true
      }
    ]
  };
  
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeframe.includes('m') ? 'minute' : timeframe.includes('h') ? 'hour' : 'day',
          displayFormats: {
            minute: 'HH:mm',
            hour: 'MM/dd HH:mm',
            day: 'MM/dd'
          }
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          color: 'rgba(150, 150, 150, 0.8)'
        },
        grid: {
          display: true,
          color: 'rgba(200, 200, 200, 0.1)'
        }
      },
      y: {
        position: 'right',
        ticks: {
          color: 'rgba(150, 150, 150, 0.8)',
          callback: (value) => `$${value}`
        },
        grid: {
          display: true,
          color: 'rgba(200, 200, 200, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `Price: $${context.raw}`
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };
  
  const timeframeOptions = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' }
  ];
  
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe as '1m' | '5m' | '15m' | '1h' | '4h' | '1d');
  };
  
  if (loading && priceData.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm h-[400px] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }
  
  if (error && priceData.length === 0) {
    return (
      <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm h-[400px] flex justify-center items-center">
        <div className="text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            {symbol}-USD
            {currentPrice && (
              <span className={`ml-2 text-base ${priceChange.percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${currentPrice.toFixed(2)}
                <span className="text-sm ml-2">
                  {priceChange.percent >= 0 ? '+' : ''}{priceChange.percent.toFixed(2)}%
                </span>
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex space-x-1">
          {timeframeOptions.map(option => (
            <button
              key={option.value}
              className={`px-2 py-1 text-xs rounded ${
                timeframe === option.value
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-card-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card-bg)]'
              }`}
              onClick={() => handleTimeframeChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ height: `${height}px` }}>
        {priceData.length > 0 && (
          <Line data={chartData} options={chartOptions} />
        )}
        
        {loading && priceData.length > 0 && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HyperliquidPriceChart;
