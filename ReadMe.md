# Quizonaire 🎮

> A blockchain-powered quiz game built on Celo with AI-generated questions and NFT staking rewards.

![Celo](https://img.shields.io/badge/Celo-Sepolia-35d07f)
![License](https://img.shields.io/badge/license-ISC-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.22-purple)
![WalletConnect](https://img.shields.io/badge/WalletConnect-Integrated-blue)

## 📖 Overview

Quizonaire is a decentralized quiz game platform where players can:
- Play quizzes powered by AI (Google Gemini)
- Earn rewards for correct answers
- Stake NFTs to earn additional rewards
- Compete on the Celo blockchain

## ✨ Features

- **🧠 AI-Powered Quiz Generation**: Dynamic quiz questions generated using Google Gemini AI
- **💰 Blockchain Rewards**: Smart contract-based reward system on Celo
- **🎨 NFT Staking**: Stake your NFTs to earn additional rewards
- **🔐 WalletConnect Integration**: Seamlessly connect with any Web3 wallet using WalletConnect v3
- **📱 Mobile-First Design**: Fully responsive interface for all devices
- **⚡ Fast & Cheap**: Built on Celo Sepolia testnet for low transaction fees
- **✅ Deployed & Live**: Smart contracts deployed and verified on Celo Sepolia

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Wagmi & Viem** - Web3 React hooks
- **Web3Modal** - Wallet connection
- **React Router** - Routing

### Blockchain
- **Solidity 0.8.22** - Smart contracts
- **Hardhat** - Development environment
- **OpenZeppelin** - Smart contract libraries
- **Celo Sepolia** - Testnet deployment

### AI
- **Google Gemini AI** - Quiz question generation

## 📝 Deployed Smart Contracts (Celo Sepolia Testnet)

All contracts are deployed and live on Celo Sepolia testnet:

| Contract | Address | Explorer |
|----------|---------|----------|
| **GameLifecycleNative** | `0x3B30c61e00E848e9cFc990687b743FD118E9C503` | [View on Explorer](https://sepolia.celoscan.io/address/0x3B30c61e00E848e9cFc990687b743FD118E9C503) |
| **OptimizedQuizGame** | `0x122f95938706f3A973204b37543a7430A8F9121c` | [View on Explorer](https://sepolia.celoscan.io/address/0x122f95938706f3A973204b37543a7430A8F9121c) |
| **NFTStaking** | `0x5E1a8f5E7F480B8976129d5c79C5990daeEC6252` | [View on Explorer](https://sepolia.celoscan.io/address/0x5E1a8f5E7F480B8976129d5c79C5990daeEC6252) |

**Network Details:**
- Network Name: Celo Sepolia Testnet
- Chain ID: 11142220
- RPC URL: `https://forno.celo-sepolia.celo-testnet.org`
- Block Explorer: https://sepolia.celoscan.io/

## 📋 Prerequisites

Before you begin, ensure you have:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MetaMask](https://metamask.io/) or another Web3 wallet
- Celo Sepolia testnet CELO tokens ([Get from faucet](https://faucet.celo.org/alfajores))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/quizonaire.git
cd quizonaire
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your values:

```env
# Deployer private key (without 0x prefix)
DEPLOYER_KEY=your_private_key_here

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Google Gemini API Key (get from https://makersuite.google.com/app/apikey)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Contract addresses (filled after deployment)
VITE_QUIZ_CONTRACT_ADDRESS=
VITE_NFT_STAKING_CONTRACT_ADDRESS=
VITE_GAME_LIFECYCLE_CONTRACT_ADDRESS=
```

### 4. Compile Smart Contracts

```bash
npm run compile
```

### 5. Deploy Smart Contracts to Celo Sepolia

Deploy all contracts:
```bash
npm run deploy:all
```

Or deploy individually:
```bash
# Deploy Game Lifecycle contract
npm run deploy

# Deploy Quiz contract
npm run deploy:quiz

# Deploy NFT Staking contract
npm run deploy:nft_staking
```

**Important**: After deployment, copy the contract addresses to your `.env` file.

### 6. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 7. Build for Production

```bash
npm run build
```

## 🌐 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all `VITE_*` variables from your `.env` file

5. Redeploy:
```bash
vercel --prod
```

### Alternative: Deploy via GitHub

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push

## 📜 Smart Contracts

### OptimizedQuizGame
Manages quiz gameplay and rewards.

- **Location**: `contracts/OptimizedQuizGame.sol`
- **Network**: Celo Sepolia Testnet
- **Features**: Quiz state management, reward distribution

### NFTStaking
Allows users to stake NFTs and earn rewards.

- **Location**: `contracts/NFTStaking.sol`
- **Network**: Celo Sepolia Testnet
- **Features**: NFT staking, reward calculation

### GameLifecycleNative
Manages game lifecycle and native token rewards.

- **Location**: `contracts/GameLifecycle.sol`
- **Network**: Celo Sepolia Testnet
- **Features**: Game state, native CELO rewards

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and select your Web3 wallet
2. **Switch to Celo**: The app will prompt you to switch to Celo Sepolia testnet
3. **Choose Game Mode**:
   - **Play Quiz**: Pre-defined quiz questions
   - **Infinite Quiz**: AI-generated questions using Google Gemini
   - **NFT Staking**: Stake your NFTs to earn rewards
4. **Start Playing**: Answer questions and earn rewards!

## 🔧 Development

### Project Structure

```
quizonaire/
├── contracts/              # Solidity smart contracts
│   ├── OptimizedQuizGame.sol
│   ├── NFTStaking.sol
│   └── GameLifecycle.sol
├── scripts/                # Deployment scripts
│   ├── deploy.js
│   ├── deploy_quiz.js
│   └── deploy_nft_staking.js
├── src/
│   ├── app/                # App routing
│   ├── config/             # Configuration files
│   ├── widgets/            # UI components
│   │   ├── Quiz/
│   │   ├── QuizGenerator/
│   │   └── SpecificTestContract/
│   └── shared/             # Shared utilities
├── hardhat.config.js       # Hardhat configuration
├── vite.config.js          # Vite configuration
├── vercel.json             # Vercel deployment config
└── package.json
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run compile` - Compile smart contracts
- `npm run deploy` - Deploy GameLifecycle contract
- `npm run deploy:quiz` - Deploy Quiz contract
- `npm run deploy:nft_staking` - Deploy NFT Staking contract
- `npm run deploy:all` - Deploy all contracts

## 🔗 Useful Links

- **Celo Documentation**: https://docs.celo.org/
- **Celo Alfajores Faucet**: https://faucet.celo.org/alfajores
- **Celo Explorer**: https://alfajores.celoscan.io/
- **WalletConnect**: https://cloud.walletconnect.com/
- **Google Gemini**: https://makersuite.google.com/

## 🧪 Testing

```bash
# Run tests (when available)
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Celo](https://celo.org/) - Blockchain platform
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract libraries
- [WalletConnect](https://walletconnect.com/) - Wallet connection
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI technology

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact the team

---

**Built with ❤️ on Celo**
