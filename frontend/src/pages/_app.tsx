import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { WagmiProvider, createConfig } from 'wagmi';
import { config } from '../lib/wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function MyApp({ Component, pageProps }: AppProps) {
  // Create state for client-side only mounting
  const [mounted, setMounted] = useState(false);
  
  // Make sure we're using client-side navigation
  useEffect(() => {
    setMounted(true);
    // Any global initialization can go here
  }, []);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        retry: 0
      },
    },
  }))

  // Prevent hydration issues by rendering only after client-side hydration
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted ? <Component {...pageProps} /> : null}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
