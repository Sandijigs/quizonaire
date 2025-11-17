# Deployment Guide for Quizonaire

This guide provides step-by-step instructions for deploying Quizonaire to Celo Sepolia testnet and Vercel.

## Prerequisites Checklist

- ✅ Node.js (v16+) installed
- ✅ npm or yarn installed
- ✅ MetaMask or Web3 wallet installed
- ✅ CELO tokens on Sepolia testnet ([faucet](https://faucet.celo.org/alfajores))
- ✅ WalletConnect Project ID ([get here](https://cloud.walletconnect.com/))
- ✅ Google Gemini API Key ([get here](https://makersuite.google.com/app/apikey))
- ✅ Vercel account ([sign up](https://vercel.com))

## Step 1: Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in your `.env` file with actual values:
```env
DEPLOYER_KEY=your_private_key_without_0x
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_NETWORK=celo-sepolia
VITE_CHAIN_ID=44787
```

**Important**: Your private key should NOT include the `0x` prefix.

## Step 2: Install Dependencies

```bash
npm install
```

This will install all frontend and smart contract dependencies.

## Step 3: Compile Smart Contracts

```bash
npm run compile
```

This compiles all Solidity contracts in the `contracts/` directory.

## Step 4: Deploy Smart Contracts to Celo Sepolia

### Option A: Deploy All Contracts at Once
```bash
npm run deploy:all
```

### Option B: Deploy Individually
```bash
# Deploy Game Lifecycle contract
npm run deploy

# Deploy Quiz contract
npm run deploy:quiz

# Deploy NFT Staking contract
npm run deploy:nft_staking
```

### After Deployment

1. Copy the contract addresses from the console output
2. Update your `.env` file:
```env
VITE_QUIZ_CONTRACT_ADDRESS=0x...
VITE_NFT_STAKING_CONTRACT_ADDRESS=0x...
VITE_GAME_LIFECYCLE_CONTRACT_ADDRESS=0x...
```

3. Verify contracts on [Celo Explorer](https://alfajores.celoscan.io/)

## Step 5: Test Locally

```bash
npm run dev
```

Visit `http://localhost:5173` and test:
- ✅ Wallet connection
- ✅ Network switching to Celo Sepolia
- ✅ Quiz functionality
- ✅ NFT staking features

## Step 6: Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Step 7: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

1. Install Vercel CLI globally:
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

4. Follow the prompts:
   - Select your project scope
   - Link to existing project or create new
   - Confirm settings

5. Set environment variables in Vercel:
```bash
vercel env add VITE_WALLETCONNECT_PROJECT_ID
vercel env add VITE_GEMINI_API_KEY
vercel env add VITE_QUIZ_CONTRACT_ADDRESS
vercel env add VITE_NFT_STAKING_CONTRACT_ADDRESS
vercel env add VITE_GAME_LIFECYCLE_CONTRACT_ADDRESS
```

6. Deploy to production:
```bash
vercel --prod
```

### Method 2: GitHub Integration

1. Push your code to GitHub:
```bash
git add .
git commit -m "Update deployment configuration"
git push origin main
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "New Project"

4. Import your GitHub repository

5. Configure environment variables:
   - Go to Project Settings → Environment Variables
   - Add all `VITE_*` variables from your `.env` file

6. Deploy automatically on every push to main branch

### Method 3: Vercel Dashboard Upload

1. Build locally:
```bash
npm run build
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Drag and drop the `dist/` folder

4. Configure environment variables in project settings

## Step 8: Post-Deployment Verification

1. **Visit your deployed site**: `https://your-project.vercel.app`

2. **Test all features**:
   - [ ] Wallet connection works
   - [ ] Network switches to Celo Sepolia
   - [ ] Quiz loads and displays questions
   - [ ] Infinite Quiz generates AI questions
   - [ ] NFT Staking interface loads
   - [ ] Transactions can be sent

3. **Monitor on Celo Explorer**:
   - View contract interactions: https://alfajores.celoscan.io/
   - Check transaction history
   - Verify contract states

## Troubleshooting

### Issue: "DEPLOYER_KEY not exists in the .env"
**Solution**: Ensure your `.env` file has `DEPLOYER_KEY` set without the `0x` prefix.

### Issue: "Insufficient funds for gas"
**Solution**: Get test CELO from the [faucet](https://faucet.celo.org/alfajores).

### Issue: "Network not found in MetaMask"
**Solution**: The app will automatically add Celo Sepolia to your wallet when you connect.

### Issue: "WalletConnect Project ID is not set"
**Solution**: Add `VITE_WALLETCONNECT_PROJECT_ID` to your `.env` file and rebuild.

### Issue: Vercel build fails
**Solution**:
1. Check that all environment variables are set in Vercel
2. Ensure `vercel.json` is properly configured
3. Check build logs for specific errors

## Updating Smart Contracts

If you need to update and redeploy contracts:

1. Make changes to contracts in `contracts/` directory
2. Recompile: `npm run compile`
3. Deploy with new addresses: `npm run deploy:all`
4. Update `.env` with new contract addresses
5. Update Vercel environment variables
6. Redeploy frontend: `vercel --prod`

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DEPLOYER_KEY` | Private key for deploying contracts (no 0x) | Yes |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | Yes |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Yes |
| `VITE_QUIZ_CONTRACT_ADDRESS` | Address of deployed Quiz contract | After deployment |
| `VITE_NFT_STAKING_CONTRACT_ADDRESS` | Address of NFT Staking contract | After deployment |
| `VITE_GAME_LIFECYCLE_CONTRACT_ADDRESS` | Address of Game Lifecycle contract | After deployment |
| `VITE_NETWORK` | Network name (celo-sepolia) | Yes |
| `VITE_CHAIN_ID` | Chain ID (44787 for Sepolia) | Yes |

## Support

If you encounter issues:
1. Check the [README.md](README.md) for general information
2. Review contract code in `contracts/` directory
3. Check Vercel deployment logs
4. View Celo Explorer for transaction details
5. Open an issue on GitHub

---

**Happy Deploying! 🚀**
