import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  // Make sure we're using client-side navigation for the video intro
  useEffect(() => {
    // Any global initialization can go here
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
