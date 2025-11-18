require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
require('dotenv').config({ path: './contracts/.env' });
require('dotenv').config(); // Also load root .env as fallback

const key = process.env.PRIVATE_KEY || process.env.DEPLOYER_KEY;
if (!key) {
  console.warn('⚠️ Variable PRIVATE_KEY or DEPLOYER_KEY not exists in the .env');
}

module.exports = {
  solidity: {
    version: '0.8.22',
    settings: {
      optimizer: {
        enabled: false,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: process.env.CELOSCAN_API_KEY || '',
    customChains: [
      {
        network: 'celoSepolia',
        chainId: 11142220,
        urls: {
          apiURL: 'https://api.etherscan.io/v2/api?chainid=11142220',
          browserURL: 'https://sepolia.celoscan.io',
        },
      },
    ],
  },
  networks: {
    // Celo Sepolia Testnet
    celoSepolia: {
      url: 'https://forno.celo-sepolia.celo-testnet.org',
      chainId: 11142220,
      accounts: key ? [key] : [],
      timeout: 180000,
      gas: 'auto',
      gasPrice: 'auto',
    },
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
