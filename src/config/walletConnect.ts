import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { celoAlfajores, celo } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

// Configure chains for Celo
const chains = [celoAlfajores, celo] as const;

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
  enableOnramp: true,
});

export { WagmiProvider, QueryClientProvider };
