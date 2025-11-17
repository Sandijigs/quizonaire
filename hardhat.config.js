require('@nomiclabs/hardhat-ethers');

require('dotenv').config();

const key = process.env.DEPLOYER_KEY;
if (!key) {
  console.warn('⚠️ Variable DEPLOYER_KEY not exists in the .env');
}

module.exports = {
  solidity: '0.8.22',
  networks: {
    // Celo Alfajores Testnet
    alfajores: {
      url: 'https://alfajores-forno.celo-testnet.org',
      chainId: 44787,
      accounts: key ? [key] : [],
      timeout: 60000,
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
