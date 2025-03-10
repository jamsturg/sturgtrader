import React from 'react';

interface AnalyticsMetricsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
}

const AnalyticsMetricsCard: React.FC<AnalyticsMetricsCardProps> = ({ 
  title, 
  value, 
  trend, 
  icon 
}) => {
  const isTrendPositive = trend && trend > 0;
  const isTrendNegative = trend && trend < 0;
  
  return (
    <div className="glass-panel p-5 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-gray-400">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="text-2xl font-bold mb-2">{value}</div>
      {trend !== undefined && (
        <div className={`text-sm flex items-center ${isTrendPositive ? 'bright-green-text' : isTrendNegative ? 'text-red-500' : 'text-gray-400'}`}>
          <span>
            {isTrendPositive ? '↑' : isTrendNegative ? '↓' : '•'} {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="ml-1">
            {isTrendPositive ? 'increase' : isTrendNegative ? 'decrease' : 'no change'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnalyticsMetricsCard;
