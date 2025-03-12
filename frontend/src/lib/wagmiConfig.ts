import { http, createConfig } from 'wagmi'
import { arbitrum } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Create wagmi config for v2
export const config = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
  },
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    }),
  ],
})