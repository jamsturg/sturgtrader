import React from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';

const ConnectWallet: React.FC = () => {
  const { connectors, connect } = useConnect();
  const metaMaskConnector = connectors.find(c => c.id === 'metaMask');
  const walletConnectConnector = connectors.find(c => c.id === 'walletConnect');

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const truncatedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  if (!isConnected) {
    return (
      <div className="flex space-x-2">
        {metaMaskConnector && (
          <button
            onClick={() => connect({ connector: metaMaskConnector })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            Connect MetaMask
          </button>
        )}
        {walletConnectConnector && (
          <button
            onClick={() => connect({ connector: walletConnectConnector })}
            className="px-4 py-2 bg-[#3b99fc] hover:bg-[#2b8aeb] rounded-lg text-sm font-medium transition-colors"
          >
            WalletConnect
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="px-3 py-2 bg-gray-800 rounded-lg text-sm">
        {truncatedAddress}
      </div>
      <button
        onClick={() => disconnect()}
        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
};

export default ConnectWallet;