import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import TradingDashboard from '../components/dashboard/TradingDashboard';
import MarketOverview from '../components/dashboard/MarketOverview';
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
  
  // Handle tab changes
  const renderTabContent = () => {
    switch (activeTab) {
      case 'trading':
        return <TradingDashboard />;
      case 'bots':
        return (
          <div className="p-4 glass-panel">
            <h2 className="text-2xl font-bold mb-4">Trading Bot Management</h2>
            <p className="text-gray-400">Bot management interface coming soon.</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-4 glass-panel">
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            <p className="text-gray-400">Advanced analytics dashboard coming soon.</p>
          </div>
        );
      case 'subscription':
        return <HyperfluidSubscription />;
      default:
        return <TradingDashboard />;
    }
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Dashboard <span className="bright-green-text">Overview</span>
        </h1>
        <p className="text-[var(--color-neutral)]">Welcome to SturgTrader, your advanced crypto trading platform.</p>
      </div>
      
      {/* Subscription Alert Banner - Show if not subscribed */}
      {!streamData?.isActive && (
        <div className="glass-panel p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium">You're using the free plan with limited features.</p>
              <p className="text-sm text-gray-400">Upgrade to access real-time arbitrage detection and advanced AI strategy analysis.</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('subscription')} 
            className="btn-primary whitespace-nowrap ml-4"
          >
            Upgrade Now
          </button>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
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
      
      {/* Render active tab content */}
      {renderTabContent()}
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
      className={`flex items-center px-4 py-3 border-b-2 font-medium ${isActive ? 'border-[var(--color-positive)] bright-green-text' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
};

export default Dashboard;
