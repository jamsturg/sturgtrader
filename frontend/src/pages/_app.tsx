import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { WagmiConfig } from 'wagmi';
import { config } from '../lib/wagmiConfig';

function MyApp({ Component, pageProps }: AppProps) {
  // Make sure we're using client-side navigation for the video intro
  useEffect(() => {
    // Any global initialization can go here
  }, []);

  return (
    <WagmiConfig config={config}>
      <Component {...pageProps} />
    </WagmiConfig>
  );
}

export default MyApp;
