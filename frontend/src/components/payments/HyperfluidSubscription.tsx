import React, { useState, useEffect } from 'react';
import { Framework } from '@superfluid-finance/sdk-core';
import { ethers } from 'ethers';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  pricePerMonth: number;
  token: string; // Token symbol like 'ETHx', 'USDCx', 'DAIx'
  features: string[];
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Essential trading tools for beginners',
    pricePerMonth: 20,
    token: 'USDCx',
    features: [
      'Basic trading dashboard',
      'Market data access',
      'Single exchange trading',
      'Basic strategy templates',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    description: 'Advanced tools for serious traders',
    pricePerMonth: 50,
    token: 'USDCx',
    features: [
      'Multi-exchange trading',
      'Advanced charting',
      'API access',
      'Strategy builder',
      'Trading bot access',
      'Email alerts',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'Full suite for professional traders',
    pricePerMonth: 100,
    token: 'USDCx',
    features: [
      'All Pro features',
      'Agent Zero AI strategy analysis',
      'Unlimited trading bots',
      'Priority support',
      'Custom strategy development',
      'Arbitrage detection',
      'Advanced portfolio analytics',
    ],
  },
];

interface HyperfluidSubscriptionProps {
  onSubscribe?: (planId: string) => void;
  onCancel?: () => void;
}

const HyperfluidSubscription: React.FC<HyperfluidSubscriptionProps> = ({ onSubscribe, onCancel }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string>('');
  const [streamData, setStreamData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Connect wallet function
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Get current subscription data if any
        await getSubscriptionData(accounts[0]);
      } else {
        alert('Please install MetaMask to use this feature');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get current subscription data
  const getSubscriptionData = async (address: string) => {
    try {
      // In a real implementation, this would query the Superfluid SDK
      // to get current streams and subscription data
      
      // For demo purposes, we'll just set mock data
      const mockStreamData = {
        flowRate: '19290123456790',  // Flow rate in wei per second
        token: 'USDCx',
        startedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        remainingBalance: 42.5,
      };
      
      setStreamData(mockStreamData);
    } catch (error) {
      console.error('Error getting subscription data:', error);
    }
  };
  
  // Create a new subscription stream
  const startSubscription = async () => {
    try {
      setIsLoading(true);
      
      if (!isConnected) {
        await connectWallet();
        return;
      }
      
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
      if (!plan) return;
      
      // In a real implementation, this would create a Superfluid stream
      // For demo purposes, we'll just log the details and set mock data
      console.log('Creating subscription for plan:', plan.name);
      console.log('Price per month:', plan.pricePerMonth, plan.token);
      console.log('User account:', account);
      
      /* 
      // Actual implementation would be something like this:
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Initialize Superfluid SDK
      const sf = await Framework.create({
        networkName: "polygon",
        provider: provider
      });
      
      // Load the token
      const tokenSymbol = plan.token;
      const token = await sf.loadSuperToken(tokenSymbol);
      
      // Calculate flow rate (tokens per second)
      const flowRate = ethers.utils.parseEther(plan.pricePerMonth.toString())
        .div(ethers.BigNumber.from(30 * 24 * 60 * 60));
        
      // Create a new flow
      const createFlowOperation = token.createFlow({
        sender: account,
        receiver: "PLATFORM_WALLET_ADDRESS", // Your platform's wallet
        flowRate: flowRate.toString(),
      });
      
      await createFlowOperation.exec(signer);
      */
      
      // Mock successful creation
      const mockStreamData = {
        flowRate: ethers.utils.parseEther(plan.pricePerMonth.toString())
          .div(ethers.BigNumber.from(30 * 24 * 60 * 60)).toString(),
        token: plan.token,
        startedAt: new Date(),
        remainingBalance: 100,
      };
      
      setStreamData(mockStreamData);
      
      if (onSubscribe) {
        onSubscribe(selectedPlan);
      }
      
      alert(`Successfully subscribed to ${plan.name}!`);
    } catch (error) {
      console.error('Error starting subscription:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel an existing subscription
  const cancelSubscription = async () => {
    try {
      setIsLoading(true);
      
      if (!streamData) return;
      
      // In a real implementation, this would delete the Superfluid stream
      // For demo purposes, we'll just log the details
      console.log('Cancelling subscription');
      
      /*
      // Actual implementation would be something like this:
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Initialize Superfluid SDK
      const sf = await Framework.create({
        networkName: "polygon",
        provider: provider
      });
      
      // Load the token
      const token = await sf.loadSuperToken(streamData.token);
      
      // Delete the flow
      const deleteFlowOperation = token.deleteFlow({
        sender: account,
        receiver: "PLATFORM_WALLET_ADDRESS", // Your platform's wallet
      });
      
      await deleteFlowOperation.exec(signer);
      */
      
      setStreamData(null);
      
      if (onCancel) {
        onCancel();
      }
      
      alert('Successfully cancelled subscription');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format the flow rate to a human-readable amount
  const formatFlowRate = (flowRate: string) => {
    if (!flowRate) return '$0.00/month';
    
    // Convert wei per second to tokens per month
    const flowRatePerSecond = ethers.BigNumber.from(flowRate);
    const tokensPerMonth = ethers.utils.formatEther(
      flowRatePerSecond.mul(ethers.BigNumber.from(30 * 24 * 60 * 60))
    );
    
    return `$${parseFloat(tokensPerMonth).toFixed(2)}/month`;
  };
  
  return (
    <div className="glass-panel p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>
      
      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div 
            key={plan.id} 
            className={`glass-panel p-5 rounded-lg transition-all duration-300 ${selectedPlan === plan.id ? 'metal-edge' : 'hover:border-gray-400'}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="flex items-center">
                <span className="text-2xl font-bold bright-green-text">${plan.pricePerMonth}</span>
                <span className="text-sm text-gray-400 ml-1">/mo</span>
              </div>
            </div>
            
            <p className="text-gray-400 mb-4 text-sm">{plan.description}</p>
            
            <ul className="space-y-2 mb-5">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <svg className="h-5 w-5 bright-green-text mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex justify-center">
              <button 
                type="button"
                className={`px-4 py-2 rounded-md ${selectedPlan === plan.id ? 'bright-green-bg text-black' : 'metallic-bg text-white'}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Current Subscription Status */}
      {streamData ? (
        <div className="glass-panel p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Current Subscription</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Plan</p>
              <p>{SUBSCRIPTION_PLANS.find(p => 
                p.pricePerMonth.toString() === 
                ethers.utils.formatEther(ethers.BigNumber.from(streamData.flowRate).mul(30 * 24 * 60 * 60)))?.name || 'Custom Plan'}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Price</p>
              <p className="bright-green-text">{formatFlowRate(streamData.flowRate)}</p>
            </div>
            <div>
              <p className="text-gray-400">Started</p>
              <p>{streamData.startedAt.toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              onClick={cancelSubscription}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              {isLoading ? 'Processing...' : 'Cancel Subscription'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mb-6">
          <button 
            onClick={startSubscription}
            disabled={isLoading}
            className="btn-primary px-6 py-3 text-lg"
          >
            {isLoading ? 'Processing...' : isConnected ? 'Subscribe Now' : 'Connect Wallet to Subscribe'}
          </button>
        </div>
      )}
      
      {/* Hyperfluid Info */}
      <div className="text-center text-sm text-gray-400 mt-4">
        <p>Powered by Superfluid</p>
        <p className="mt-1">Subscriptions are processed as real-time token streams using the Superfluid protocol.</p>
        <p className="mt-1">You can cancel your subscription at any time.</p>
      </div>
    </div>
  );
};

// Add Window Ethereum interface
declare global {
  interface Window {
    ethereum: any;
  }
}

export default HyperfluidSubscription;
