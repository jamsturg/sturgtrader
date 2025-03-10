import React from 'react';
import Head from 'next/head';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'SturgTrader - Next-Gen Trading Platform' }) => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-white">
      <Head>
        <title>{title}</title>
        <meta name="description" content="AR-themed high-frequency trading and arbitrage platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navigation />
      
      <main className="container mx-auto px-4 pb-12">
        {children}
      </main>
    </div>
  );
};

export default Layout;
