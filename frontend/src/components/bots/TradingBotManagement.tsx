import React, { useState, useEffect } from 'react';
import BotCard from './BotCard';
import CreateBotForm from './CreateBotForm';
import BotPerformance from './BotPerformance';

const TradingBotManagement: React.FC = () => {
  const [bots, setBots] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate fetching bots data
  useEffect(() => {
    const fetchBots = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setBots([
          {
            id: 'bot1',
            name: 'Arbitrage Hunter',
            type: 'arbitrage',
            status: 'active',
            profit: 145.32,
            profitPercent: 12.4,
            exchanges: ['Binance', 'Bittrex'],
            tradingPairs: ['BTC/USDT', 'ETH/USDT'],
            createdAt: '2023-10-15T14:30:00Z',
            lastActive: '2023-11-01T09:15:00Z'
          },
          {
            id: 'bot2',
            name: 'Grid Trader',
            type: 'grid',
            status: 'paused',
            profit: -23.45,
            profitPercent: -2.1,
            exchanges: ['Kraken'],
            tradingPairs: ['XMR/BTC'],
            createdAt: '2023-09-22T11:20:00Z',
            lastActive: '2023-10-28T16:40:00Z'
          },
          {
            id: 'bot3',
            name: 'XMR DCA Bot',
            type: 'dca',
            status: 'stopped',
            profit: 67.89,
            profitPercent: 5.3,
            exchanges: ['TradeOgre'],
            tradingPairs: ['XMR/USDT'],
            createdAt: '2023-08-05T08:10:00Z',
            lastActive: '2023-10-15T12:30:00Z'
          }
        ]);
        setIsLoading(false);
      }, 1000);
    };
    
    fetchBots();
  }, []);
  
  // Bot actions
  const handleStartBot = async (id: string) => {
    // In a real app, this would be an API call
    console.log(`Starting bot ${id}`);
    setBots(prevBots => 
      prevBots.map(bot => 
        bot.id === id ? { ...bot, status: 'active' } : bot
      )
    );
  };
  
  const handlePauseBot = async (id: string) => {
    console.log(`Pausing bot ${id}`);
    setBots(prevBots => 
      prevBots.map(bot => 
        bot.id === id ? { ...bot, status: 'paused' } : bot
      )
    );
  };
  
  const handleStopBot = async (id: string) => {
    console.log(`Stopping bot ${id}`);
    setBots(prevBots => 
      prevBots.map(bot => 
        bot.id === id ? { ...bot, status: 'stopped' } : bot
      )
    );
  };
  
  const handleDeleteBot = async (id: string) => {
    console.log(`Deleting bot ${id}`);
    setBots(prevBots => prevBots.filter(bot => bot.id !== id));
  };
  
  const handleCreateBot = (botData: any) => {
    // In a real app, this would be an API call
    const newBot = {
      id: `bot${Date.now()}`,
      ...botData,
      status: 'stopped',
      profit: 0,
      profitPercent: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    
    setBots(prevBots => [...prevBots, newBot]);
    setShowCreateForm(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Trading <span className="bright-green-text">Bot Management</span>
        </h1>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          Create New Bot
        </button>
      </div>
      
      {/* Performance Overview */}
      <BotPerformance bots={bots} />
      
      {/* Create Bot Form */}
      {showCreateForm && (
        <div className="mb-8">
          <CreateBotForm 
            onSubmit={handleCreateBot}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}
      
      {/* Bots Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-positive)]"></div>
        </div>
      ) : bots.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <p className="text-xl mb-4">No trading bots created yet</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create Your First Bot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map(bot => (
            <BotCard
              key={bot.id}
              {...bot}
              onStart={handleStartBot}
              onPause={handlePauseBot}
              onStop={handleStopBot}
              onDelete={handleDeleteBot}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TradingBotManagement;
