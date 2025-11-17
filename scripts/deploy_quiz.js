import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log('Deploying OptimizedQuizGame contract...');

  const OptimizedQuizGame =
    await ethers.getContractFactory('OptimizedQuizGame');

  const gameContract = await OptimizedQuizGame.deploy();

  await gameContract.deployed();

  console.log(
    `OptimizedQuizGame contract deployed to: ${gameContract.address}`
  );
}

main().catch(console.error);
