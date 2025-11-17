import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log('Deploying NFTStaking contract...');

  const NFTStaking = await ethers.getContractFactory('NFTStaking');

  const rewardTokenAddress = '0xF2F773753cEbEFaF9b68b841d80C083b18C69311';
  const nftCollectionAddress = '0xD138b32A0f66E2891D6F7f33B576f9917f657C99';

  const nftStaking = await NFTStaking.deploy(
    nftCollectionAddress,
    rewardTokenAddress
  );

  await nftStaking.deployed();

  console.log(`NFTStaking contract deployed to: ${nftStaking.address}`);
}

main().catch(console.error);
