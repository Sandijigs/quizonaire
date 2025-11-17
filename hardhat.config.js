require('@nomiclabs/hardhat-ethers');
require('dotenv').config({ path: './contracts/.env' });
require('dotenv').config(); // Also load root .env as fallback

const key = process.env.PRIVATE_KEY || process.env.DEPLOYER_KEY;
if (!key) {
  console.warn('⚠️ Variable PRIVATE_KEY or DEPLOYER_KEY not exists in the .env');
}

module.exports = {
  solidity: '0.8.22',
  networks: {
    // Celo Sepolia Testnet
    'celo-sepolia': {
      url: 'https://forno.celo-sepolia.celo-testnet.org',
      chainId: 11142220,
      accounts: key ? [key] : [],
      timeout: 180000,
      gas: 'auto',
      gasPrice: 'auto',
    },
    // Celo Alfajores Testnet (backup)
    alfajores: {
      url: 'https://alfajores-forno.celo-testnet.org',
      chainId: 44787,
      accounts: key ? [key] : [],
      timeout: 180000,
    },
    // Celo Mainnet
    celo: {
      url: 'https://forno.celo.org',
      chainId: 42220,
      accounts: key ? [key] : [],
      timeout: 60000,
    },
  },
};
