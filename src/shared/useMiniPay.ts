import { useEffect, useState } from 'react';

declare global {
  interface Window {
    ethereum?: {
      isMiniPay?: boolean;
      isMetaMask?: boolean;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

/**
 * Hook to detect if the app is running inside MiniPay
 */
export const useMiniPay = () => {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMiniPay = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const isMiniPayWallet = window.ethereum.isMiniPay === true;
        setIsMiniPay(isMiniPayWallet);

        if (isMiniPayWallet) {
          console.log('✅ MiniPay detected - Auto-connecting wallet');
        }
      }
      setIsLoading(false);
    };

    // Check immediately
    checkMiniPay();

    // Also check after a short delay in case ethereum object loads late
    const timer = setTimeout(checkMiniPay, 100);

    return () => clearTimeout(timer);
  }, []);

  return { isMiniPay, isLoading };
};

/**
 * Utility function to check if running in MiniPay (non-hook version)
 */
export const isMiniPayEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.ethereum?.isMiniPay === true;
};
