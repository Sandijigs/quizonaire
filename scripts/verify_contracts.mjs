import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../contracts/.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const CELOSCAN_API_KEY = process.env.CELOSCAN_API_KEY;
const NETWORK = 'celo-sepolia';

const contracts = [
  {
    name: 'GameLifecycleNative',
    address: '0x3B30c61e00E848e9cFc990687b743FD118E9C503',
    args: [],
  },
  {
    name: 'OptimizedQuizGame',
    address: '0x122f95938706f3A973204b37543a7430A8F9121c',
    args: [],
  },
  {
    name: 'NFTStaking',
    address: '0x5E1a8f5E7F480B8976129d5c79C5990daeEC6252',
    args: ['0xD138b32A0f66E2891D6F7f33B576f9917f657C99', '0xF2F773753cEbEFaF9b68b841d80C083b18C69311'],
  },
];

console.log('🔍 Starting contract verification on Celo Sepolia...\n');

for (const contract of contracts) {
  try {
    console.log(`📝 Verifying ${contract.name} at ${contract.address}...`);

    const argsStr = contract.args.length > 0 ? contract.args.join(' ') : '';
    const command = `npx hardhat verify --network ${NETWORK} ${contract.address} ${argsStr}`;

    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    console.log(`✅ ${contract.name} verified successfully!`);
    console.log(result);
    console.log('');
  } catch (error) {
    console.log(`⚠️  ${contract.name} verification status:`);
    console.log(error.stdout || error.message);
    console.log('');
  }
}

console.log('✨ Verification process completed!');
console.log('\n📍 View your contracts on CeloScan:');
contracts.forEach(c => {
  console.log(`   ${c.name}: https://sepolia.celoscan.io/address/${c.address}`);
});
