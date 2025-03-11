import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navigation: React.FC = () => {
  const router = useRouter();
  
  const isActive = (path: string) => {
    return router.pathname === path ? 'text-[var(--color-positive)]' : 'text-gray-300 hover:text-white';
  };
  
  return (
    <nav className="glass-panel py-4 px-6 mb-6 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/dashboard" className="text-xl font-bold bright-green-text mr-10">
          TO THE <span className="text-white">BANK</span>
        </Link>
        
        <div className="flex space-x-6">
          <Link href="/dashboard" className={`${isActive('/dashboard')} transition-colors`}>
            Dashboard
          </Link>
          <Link href="/trading-strategies" className={`${isActive('/trading-strategies')} transition-colors`}>
            Freqtrade Strategies
          </Link>
          <Link href="/hyperliquid-trading" className={`${isActive('/hyperliquid-trading')} transition-colors`}>
            Hyperliquid
          </Link>
          <Link href="/bots" className={`${isActive('/bots')} transition-colors`}>
            Trading Bots
          </Link>
          <Link href="/analytics" className={`${isActive('/analytics')} transition-colors`}>
            Analytics
          </Link>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </button>
        
        <div className="w-px h-6 bg-gray-700"></div>
        
        <button className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            ST
          </div>
          <span className="hidden md:inline">Account</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
