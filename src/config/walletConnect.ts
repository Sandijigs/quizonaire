import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiConfig } from 'wagmi';
import { celo } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Define Celo Sepolia Testnet (Chain ID: 11142220)
const celoSepolia: Chain = {
  id: 11142220,
  name: 'Celo Sepolia Testnet',
  network: 'celo-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: [
        'https://forno.celo-sepolia.celo-testnet.org',
        'https://celo-sepolia-rpc.publicnode.com',
        'https://1rpc.io/celo/sepolia'
      ],
    },
    public: {
      http: [
        'https://forno.celo-sepolia.celo-testnet.org',
        'https://celo-sepolia-rpc.publicnode.com',
        'https://1rpc.io/celo/sepolia'
      ],
    },
  },
  blockExplorers: {
    default: { name: 'CeloScan', url: 'https://sepolia.celoscan.io' },
  },
  testnet: true,
};

// Get projectId from environment variable
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('⚠️ WalletConnect Project ID is not set. Please add VITE_WALLETCONNECT_PROJECT_ID to your .env file');
}

// Define metadata for your app
const metadata = {
  name: 'Quizonaire',
  description: 'Blockchain Quiz Game on Celo',
  url: 'https://quizonaire.vercel.app',
  icons: ['https://quizonaire.vercel.app/icon.png']
};

// Configure chains for Celo (Sepolia Testnet and Mainnet)
const chains = [celoSepolia, celo] as const;

// Create wagmi config
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

// Create query client for React Query
export const queryClient = new QueryClient();

// Create Web3Modal instance
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
});

export { WagmiConfig as WagmiProvider, QueryClientProvider };
