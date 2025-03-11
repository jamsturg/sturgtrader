import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import TradingDashboard from '../components/dashboard/TradingDashboard';
import HyperfluidSubscription from '../components/payments/HyperfluidSubscription';
import { ethers } from 'ethers';
import { Framework } from '@superfluid-finance/sdk-core';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trading');
  const [hyperfluidConnected, setHyperfluidConnected] = useState(false);
  const [streamData, setStreamData] = useState<any>(null);
  
  // Initialize Hyperfluid when wallet is connected
  const connectHyperfluid = async (provider: ethers.providers.Web3Provider) => {
    try {
      // @ts-ignore - ignore type checking for the Framework.create call
      const sf = await Framework.create({
        chainId: provider.network.chainId,
        provider: provider
      });
      
      const signer = sf.createSigner({ web3Provider: provider });
      setHyperfluidConnected(true);
      return { sf, signer };
    } catch (error) {
      console.error('Error connecting to Hyperfluid:', error);
      return null;
    }
  };
  
  // Mock function to get account subscription data
  const getAccountSubscription = async () => {
    // In a real app, this would query Hyperfluid for active streams
    const mockData = {
      isActive: true,
      plan: 'pro',
      flowRate: '19290123456790',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    };
    
    setStreamData(mockData);
  };
  
  // Check for subscription status on component mount
  useEffect(() => {
    getAccountSubscription();
  }, []);
  
  useEffect(() => {
    const audio = new Audio('path/to/your/audio/file.mp3');
    audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
    });
  }, []);
  
  // Handle tab changes
  const renderTabContent = () => {
    switch (activeTab) {
      case 'trading':
        return <TradingDashboard />;
      case 'bots':
        return (
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Trading Bot Management</h2>
            </div>
            <p className="text-gray-400 mb-4">Automated trading strategies and bot management coming soon.</p>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-sm">The Trading Bot Management interface will allow you to:</p>
              <ul className="list-disc text-sm text-gray-400 ml-5 mt-2 space-y-1">
                <li>Create and customize trading bots</li>
                <li>Monitor bot performance</li>
                <li>Set up alerts and notifications</li>
                <li>Deploy strategies across multiple exchanges</li>
              </ul>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-600/20 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            </div>
            <p className="text-gray-400 mb-4">Comprehensive trading analytics and performance metrics coming soon.</p>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-sm">The Analytics Dashboard will provide:</p>
              <ul className="list-disc text-sm text-gray-400 ml-5 mt-2 space-y-1">
                <li>Real-time trading performance metrics</li>
                <li>Historical data analysis</li>
                <li>Risk assessment tools</li>
                <li>Market correlation insights</li>
                <li>Custom reporting features</li>
              </ul>
            </div>
          </div>
        );
      case 'subscription':
        return <HyperfluidSubscription />;
      default:
        return <TradingDashboard />;
    }
  };
  
  const handleAudioPlay = () => {
    const audio = new Audio('path/to/your/audio/file.mp3');
    audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
    });
  };
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          Dashboard <span className="bright-blue-text ml-2">Overview</span>
        </h1>
        <p className="text-[var(--color-neutral)] mt-1">Welcome to The Bank, your advanced crypto trading platform.</p>
      </div>
      
      {/* Subscription Alert Banner - Show if not subscribed */}
      {!streamData?.isActive && (
        <div className="glass-panel p-4 mb-8 rounded-lg border border-yellow-600/30 bg-yellow-900/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-yellow-600/20 p-2 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">You're using the free plan with limited features</p>
                <p className="text-sm text-gray-400 mt-1">Upgrade to access real-time arbitrage detection and advanced AI strategy analysis.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('subscription')}
              className="btn-primary whitespace-nowrap ml-4"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex space-x-2 p-1 bg-gray-800/50 rounded-lg">
          <NavTab
            label="Trading"
            isActive={activeTab === 'trading'}
            onClick={() => setActiveTab('trading')}
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            )}
          />
          <NavTab
            label="Trading Bots"
            isActive={activeTab === 'bots'}
            onClick={() => setActiveTab('bots')}
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            )}
          />
          <NavTab
            label="Analytics"
            isActive={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            )}
          />
          <NavTab
            label="Subscription"
            isActive={activeTab === 'subscription'}
            onClick={() => setActiveTab('subscription')}
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
            )}
          />
        </div>
      </div>
      
      {/* Render active tab content */}
      {renderTabContent()}
      
      <button onClick={handleAudioPlay}>Play Audio</button>
    </Layout>
  );
};

interface NavTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

const NavTab: React.FC<NavTabProps> = ({ label, isActive, onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-gray-900 text-white shadow-md border border-[var(--color-positive)]/20'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {icon && <span className={`mr-2 ${isActive ? 'bright-blue-text' : ''}`}>{icon}</span>}
      {label}
    </button>
  );
};

export default Dashboard;
