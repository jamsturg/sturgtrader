
import React, { useState } from 'react';
import Link from 'next/link';

interface BotCardProps {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'stopped' | 'error';
  profit: number;
  profitPercent: number;
  exchanges: string[];
  tradingPairs: string[];
  createdAt: string;
  lastActive: string;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
}

const BotCard: React.FC<BotCardProps> = ({
  id,
  name,
  type,
  status,
  profit,
  profitPercent,
  exchanges,
  tradingPairs,
  createdAt,
  lastActive,
  onStart,
  onPause,
  onStop,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const statusColors = {
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    stopped: 'bg-gray-500',
    error: 'bg-red-500'
  };
  
  const statusText = {
    active: 'Active',
    paused: 'Paused',
    stopped: 'Stopped',
    error: 'Error'
  };
  
  const isProfitable = profit >= 0;
  
  return (
    <div className="glass-panel p-5 rounded-lg transition-all duration-300 hover:metal-edge">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-400 mr-2">{type}</span>
            <div className={`h-2 w-2 rounded-full ${statusColors[status]} mr-1`}></div>
            <span className="text-xs">{statusText[status]}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${isProfitable ? 'bright-green-text' : 'text-red-500'}`}>
            {isProfitable ? '+' : ''}{profit.toFixed(2)} USDT
          </div>
          <span className={`text-sm ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
            {isProfitable ? '+' : ''}{profitPercent.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-xs text-gray-400 mb-1">Exchanges</h4>
          <div className="flex flex-wrap gap-1">
            {exchanges.map(exchange => (
              <span key={exchange} className="px-2 py-0.5 bg-gray-700 rounded-md text-xs">
                {exchange}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs text-gray-400 mb-1">Trading Pairs</h4>
          <div className="flex flex-wrap gap-1">
            {tradingPairs.map(pair => (
              <span key={pair} className="px-2 py-0.5 bg-gray-700 rounded-md text-xs">
                {pair}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <div>Created: {new Date(createdAt).toLocaleDateString()}</div>
        <div>Last Active: {new Date(lastActive).toLocaleDateString()}</div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {status !== 'active' && (
            <button 
              onClick={() => onStart(id)}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm transition-colors"
            >
              Start
            </button>
          )}
          {status === 'active' && (
            <button 
              onClick={() => onPause(id)}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-md text-sm transition-colors"
            >
              Pause
            </button>
          )}
          {(status === 'active' || status === 'paused') && (
            <button 
              onClick={() => onStop(id)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-sm transition-colors"
            >
              Stop
            </button>
          )}
          {showDeleteConfirm ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-red-400">Confirm?</span>
              <button 
                onClick={() => {
                  onDelete(id);
                  setShowDeleteConfirm(false);
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors"
              >
                Yes
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors"
            >
              Delete
            </button>
          )}
        </div>
        
        <Link 
          href={`/bots/${id}`}
          className="px-3 py-1 metallic-bg rounded-md text-sm hover:shadow-lg transition-all"
        >
          Details
        </Link>
      </div>
    </div>
  );
};

export default BotCard;
