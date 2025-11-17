import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log('Deploying GameLifecycleNative contract...');

  const GameLifecycleNative = await ethers.getContractFactory(
    'GameLifecycleNative'
  );

  const gameContract = await GameLifecycleNative.deploy();

  await gameContract.deployed();

  console.log(
    `GameLifecycleNative contract deployed to: ${gameContract.address}`
  );
}

main().catch(console.error);
