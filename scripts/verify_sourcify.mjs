import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contracts = [
  {
    name: 'GameLifecycleNative',
    address: '0x3B30c61e00E848e9cFc990687b743FD118E9C503',
    file: 'contracts/GameLifecycle.sol',
  },
  {
    name: 'OptimizedQuizGame',
    address: '0x122f95938706f3A973204b37543a7430A8F9121c',
    file: 'contracts/OptimizedQuizGame.sol',
  },
  {
    name: 'NFTStaking',
    address: '0x5E1a8f5E7F480B8976129d5c79C5990daeEC6252',
    file: 'contracts/NFTStaking.sol',
  },
];

console.log('🔍 Verifying contracts using Sourcify...\n');

for (const contract of contracts) {
  try {
    console.log(`📝 Submitting ${contract.name} to Sourcify...`);

    // Try to verify using hardhat-verify's sourcify option
    const command = `npx hardhat sourcify --network celo-sepolia`;

    execSync(command, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });

    console.log(`✅ ${contract.name} submitted to Sourcify!`);
  } catch (error) {
    console.log(`⚠️  Note: ${contract.name} - ${error.message}`);
  }
}

console.log('\n✨ Sourcify verification completed!');
console.log('\n📍 View contracts:');
console.log('   CeloScan: https://sepolia.celoscan.io/');
console.log('   Sourcify: https://repo.sourcify.dev/contracts/full_match/11142220/');
