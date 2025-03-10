import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header: React.FC = () => {
  const [isARMode, setIsARMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Will be replaced with actual auth state

  const toggleARMode = () => {
    setIsARMode(prev => !prev);
    // In a real implementation, this would trigger AR mode
  };

  return (
    <header className="glass-panel sticky top-0 z-50 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className="text-xl font-bold bright-green-text mr-2">STURG<span className="text-white">TRADER</span></div>
        <div className="hidden md:flex ml-10 space-x-6">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/trading" label="Trading" />
          <NavLink href="/bots" label="Bots" />
          <NavLink href="/analytics" label="Analytics" />
          <NavLink href="/marketplace" label="Marketplace" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* AR Mode Toggle */}
        <button 
          onClick={toggleARMode}
          className={`flex items-center px-3 py-1.5 rounded-md transition-all duration-300 ${isARMode ? 'bright-green-bg text-black' : 'bg-gray-700 text-white'}`}
        >
          <span className="mr-1">{isARMode ? 'Exit AR' : 'AR Mode'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Wallet Connect Button */}
        <button className="flex items-center px-3 py-1.5 metallic-bg rounded-md hover:shadow-lg transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          Connect Wallet
        </button>

        {/* User Profile/Login */}
        {isLoggedIn ? (
          <div className="relative">
            <button className="flex items-center rounded-full overflow-hidden border-2 border-[var(--color-positive)]">
              <Image src="/placeholder-avatar.jpg" alt="User" width={36} height={36} className="rounded-full" />
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="btn-primary">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label }) => {
  return (
    <Link href={href} className="hover:bright-green-text transition-colors duration-200">
      {label}
    </Link>
  );
};

export default Header;
