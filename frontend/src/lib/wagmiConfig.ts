import { createConfig, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { arbitrum } from 'wagmi/chains'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [arbitrum],
  [publicProvider()]
)

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

export { config }