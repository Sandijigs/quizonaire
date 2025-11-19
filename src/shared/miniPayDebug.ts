/**
 * MiniPay Testing Utilities
 * These functions help test MiniPay integration during development
 */

/**
 * Enable MiniPay simulation mode for local testing
 * Call this in browser console: window.enableMiniPaySimulation()
 */
export const enableMiniPaySimulation = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    // @ts-ignore
    window.ethereum.isMiniPay = true;
    console.log('✅ MiniPay simulation enabled! Refresh the page to see changes.');
    console.log('Current window.ethereum.isMiniPay:', window.ethereum.isMiniPay);
  } else {
    console.error('❌ window.ethereum not found. Make sure MetaMask or another wallet is installed.');
  }
};

/**
 * Disable MiniPay simulation mode
 */
export const disableMiniPaySimulation = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    // @ts-ignore
    window.ethereum.isMiniPay = false;
    console.log('✅ MiniPay simulation disabled! Refresh the page to see changes.');
  }
};

/**
 * Check current MiniPay status
 */
export const checkMiniPayStatus = () => {
  if (typeof window === 'undefined') {
    console.log('❌ Not running in browser environment');
    return;
  }

  console.log('=== MiniPay Status ===');
  console.log('window.ethereum exists:', !!window.ethereum);
  console.log('window.ethereum.isMiniPay:', window.ethereum?.isMiniPay);
  console.log('window.ethereum.isMetaMask:', window.ethereum?.isMetaMask);
  console.log('======================');
};

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.enableMiniPaySimulation = enableMiniPaySimulation;
  // @ts-ignore
  window.disableMiniPaySimulation = disableMiniPaySimulation;
  // @ts-ignore
  window.checkMiniPayStatus = checkMiniPayStatus;

  console.log('🔧 MiniPay debug tools loaded!');
  console.log('Available commands:');
  console.log('  - window.enableMiniPaySimulation()  // Simulate MiniPay');
  console.log('  - window.disableMiniPaySimulation() // Disable simulation');
  console.log('  - window.checkMiniPayStatus()       // Check status');
}
