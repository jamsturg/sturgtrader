import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  return (
    <aside className="glass-panel w-64 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <nav className="space-y-6">
        <SidebarSection title="Trading">
          <SidebarLink href="/trading/spot" label="Spot Trading" />
          <SidebarLink href="/trading/arbitrage" label="Arbitrage" />
          <SidebarLink href="/hyperliquid-trading" label="Hyperliquid" icon={<HyperliquidIcon />} />
          <SidebarLink href="/trading/liquidity" label="Liquidity Pools" />
        </SidebarSection>
        
        <SidebarSection title="Bot Management">
          <SidebarLink href="/bots/strategies" label="Strategies" />
          <SidebarLink href="/bots/active" label="Active Bots" />
          <SidebarLink href="/bots/create" label="Create Bot" />
          <SidebarLink href="/bots/marketplace" label="Strategy Market" />
        </SidebarSection>
        
        <SidebarSection title="Analysis">
          <SidebarLink href="/analysis/backtesting" label="Backtesting" />
          <SidebarLink href="/analysis/performance" label="Performance" />
          <SidebarLink href="/analysis/ai" label="AI Insights" icon={<AIIcon />} />
        </SidebarSection>
        
        <SidebarSection title="Portfolio">
          <SidebarLink href="/portfolio/assets" label="Assets" />
          <SidebarLink href="/portfolio/history" label="History" />
          <SidebarLink href="/portfolio/taxes" label="Tax Reports" />
        </SidebarSection>
        
        <SidebarSection title="Settings">
          <SidebarLink href="/settings/account" label="Account" />
          <SidebarLink href="/settings/api-keys" label="API Keys" />
          <SidebarLink href="/settings/preferences" label="Preferences" />
          <SidebarLink href="/settings/subscription" label="Subscription" icon={<HyperfluidIcon />} />
        </SidebarSection>
      </nav>
      
      {/* Subscription Status */}
      <div className="mt-auto pt-6">
        <div className="glass-panel p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Subscription</p>
              <p className="text-sm bright-green-text font-medium">Pro Plan</p>
            </div>
            <div className="metal-edge rounded-md px-2 py-1 text-xs bright-green-text glow-effect">
              Active
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <div>
      <h3 className="text-[var(--color-neutral)] uppercase text-xs font-semibold tracking-wider mb-2">{title}</h3>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, label, icon }) => {
  return (
    <li>
      <Link href={href} className="flex items-center text-sm py-1.5 px-2 rounded-md hover:bg-white/10 transition-colors duration-200">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </Link>
    </li>
  );
};

const AIIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 bright-green-text" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
  </svg>
);

const HyperfluidIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
  </svg>
);

const HyperliquidIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
  </svg>
);

export default Sidebar;
