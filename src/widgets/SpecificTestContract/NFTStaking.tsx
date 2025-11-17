import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import nftStakingAbi from '../../../artifacts/contracts/NFTStaking.sol/NFTStaking.json';
import { useWeb3State } from '@/shared';

const CONTRACT_NFT_STAKING = process.env.CONTRACT_NFT_STAKING ?? '';
const REWARD_TOKEN_DECIMALS = 18;

export const NFTStaking = () => {
  const {
    log,
    connect,
    contract,
    account,
    isOwner,
    logs,
    disconnect,
    isConnecting,
  } = useWeb3State(CONTRACT_NFT_STAKING, nftStakingAbi.abi);

  const [tokenIdToStake, setTokenIdToStake] = useState<string>('');
  const [tokenIdToUnstake, setTokenIdToUnstake] = useState<string>('');
  const [fundAmount, setFundAmount] = useState<string>('');

  const [stakedBalance, setStakedBalance] = useState<string | null>(null);
  const [stakedTokens, setStakedTokens] = useState<string[] | null>(null);
  const [earnedRewards, setEarnedRewards] = useState<string | null>(null);
  const [totalStaked, setTotalStaked] = useState<string | null>(null);
  const [rewardsRate, setRewardsRate] = useState<string | null>(null);
  const [contractBalance, setContractBalance] = useState<string | null>(null); // Баланс reward
  const [contractRewardTokenBalance, setContractRewardTokenBalance] = useState<
    string | null
  >(null);
  const [rewardTokenSymbol, setRewardTokenSymbol] = useState<string | null>(
    null
  );

  const fetchData = async () => {
    if (!contract || !account) {
      console.log('fetchData: Contract or account not ready yet.');
      return;
    }

    console.log('fetchData: Starting data fetch...');
    try {
      console.log('fetchData: Fetching user data...');
      const balance = await contract.stakedBalance(account);
      setStakedBalance(balance.toString());
      console.log('fetchData: Staked Balance:', balance.toString());

      const tokens = await contract.stakedTokens(account);
      const tokenIds = tokens.map((id: ethers.BigNumber) => id.toString());
      setStakedTokens(tokenIds);
      console.log('fetchData: Staked Tokens:', tokenIds);

      const earned = await contract.earned(account);
      const formattedEarned = ethers.utils.formatUnits(
        earned,
        REWARD_TOKEN_DECIMALS
      );
      setEarnedRewards(formattedEarned);
      console.log('fetchData: Earned Rewards:', formattedEarned);

      console.log('fetchData: Fetching global data...');
      const total = await contract.totalStaked();
      setTotalStaked(total.toString());
      console.log('fetchData: Total Staked:', total.toString());

      const rate = await contract.rewardsRate();
      const formattedRate = ethers.utils.formatUnits(
        rate,
        REWARD_TOKEN_DECIMALS
      );
      setRewardsRate(formattedRate);
      console.log('fetchData: Rewards Rate:', formattedRate);

      console.log('fetchData: Fetching reward token info...');
      const rewardTokenAddress = await contract.rewardToken();
      console.log('fetchData: Reward Token Address:', rewardTokenAddress);

      const rewardTokenContract = new ethers.Contract(
        rewardTokenAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function symbol() view returns (string)',
        ],
        contract.provider
      );

      console.log('fetchData: Fetching contract balance...');
      const bal = await rewardTokenContract.balanceOf(CONTRACT_NFT_STAKING);
      const formattedBal = ethers.utils.formatUnits(bal, REWARD_TOKEN_DECIMALS);
      setContractRewardTokenBalance(formattedBal);
      console.log('fetchData: Contract Reward Token Balance:', formattedBal);

      console.log('fetchData: Fetching token symbol...');
      const symbol = await rewardTokenContract.symbol();
      setRewardTokenSymbol(symbol);
      console.log('fetchData: Reward Token Symbol:', symbol);

      console.log('fetchData: All data fetched successfully.');

      const contractBal =
        await rewardTokenContract.balanceOf(CONTRACT_NFT_STAKING);
      setContractBalance(
        ethers.utils.formatUnits(contractBal, REWARD_TOKEN_DECIMALS)
      );
    } catch (err: any) {
      console.error('fetchData: Error occurred:', err);
      log(`Error fetching data: ${err.message || err}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contract, account]);

  const handleStake = async () => {
    if (!contract || !tokenIdToStake) {
      log('Contract not connected or Token ID not provided.');
      return;
    }
    try {
      log(`Initiating stake for Token ID: ${tokenIdToStake}`);
      const nftCollectionAddress = await contract.nftCollection();
      const nftContract = new ethers.Contract(
        nftCollectionAddress,
        ['function approve(address to, uint256 tokenId) public returns (bool)'],
        contract.signer
      );

      log(
        `Approving NFT ${tokenIdToStake} for contract ${CONTRACT_NFT_STAKING}...`
      );
      const approveTx = await nftContract.approve(
        CONTRACT_NFT_STAKING,
        tokenIdToStake
      );
      log(`Approval transaction sent: ${approveTx.hash}`);
      await approveTx.wait();
      log(`Approval confirmed for Token ID: ${tokenIdToStake}`);

      const tx = await contract.stake(tokenIdToStake);
      log(`Staking transaction sent: ${tx.hash}`);
      await tx.wait();
      log(`Successfully staked Token ID: ${tokenIdToStake}`);
      setTokenIdToStake('');
      fetchData();
    } catch (err: any) {
      log(`Staking failed: ${err.message}`);
    }
  };

  const handleUnstake = async () => {
    if (!contract || !tokenIdToUnstake) {
      log('Contract not connected or Token ID not provided.');
      return;
    }
    try {
      log(`Initiating unstake for Token ID: ${tokenIdToUnstake}`);
      const tx = await contract.unstake(tokenIdToUnstake);
      log(`Unstaking transaction sent: ${tx.hash}`);
      await tx.wait();
      log(`Successfully unstaked Token ID: ${tokenIdToUnstake}`);
      setTokenIdToUnstake('');
      fetchData();
    } catch (err: any) {
      log(`Unstaking failed: ${err.message}`);
    }
  };

  const handleClaimRewards = async () => {
    if (!contract) {
      log('Contract not connected.');
      return;
    }
    try {
      log(`Initiating reward claim...`);
      const tx = await contract.claimRewards();
      log(`Claim transaction sent: ${tx.hash}`);
      await tx.wait();
      log(`Rewards successfully claimed!`);
      fetchData();
    } catch (err: any) {
      log(`Claiming rewards failed: ${err.message}`);
    }
  };

  const handleFundRewards = async () => {
    if (!contract || !isOwner || !fundAmount) {
      log('Contract not connected, not owner, or amount not provided.');
      return;
    }
    try {
      log(`Initiating funding of rewards with ${fundAmount} tokens...`);
      const rewardTokenAddress = await contract.rewardToken();
      const rewardTokenContract = new ethers.Contract(
        rewardTokenAddress,
        [
          'function approve(address spender, uint256 amount) public returns (bool)',
          'function transferFrom(address from, address to, uint256 amount) public returns (bool)',
        ],
        contract.signer
      );

      const amountInWei = ethers.utils.parseUnits(
        fundAmount,
        REWARD_TOKEN_DECIMALS
      );
      log(
        `Approving ${fundAmount} reward tokens for contract ${CONTRACT_NFT_STAKING}...`
      );
      const approveTx = await rewardTokenContract.approve(
        CONTRACT_NFT_STAKING,
        amountInWei
      );
      log(`Approval transaction sent: ${approveTx.hash}`);
      await approveTx.wait();
      log(`Approval confirmed for ${fundAmount} tokens.`);

      const tx = await contract.fundRewards(amountInWei);
      log(`Funding transaction sent: ${tx.hash}`);
      await tx.wait();
      log(`Successfully funded rewards with ${fundAmount} tokens.`);
      setFundAmount('');
      fetchData();
    } catch (err: any) {
      log(`Funding rewards failed: ${err.message}`);
    }
  };

  if (!isOwner)
    return (
      <div
        style={{
          height: 'calc(100vh - 190px)',
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        You are not Owner!!!
      </div>
    );

  return (
    <div
      style={{
        height: 'calc(100vh - 190px)',
        maxHeight: 'calc(100vh - 190px);',
        overflowY: 'auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>NFT Staking DApp</h1>

      {!account ? (
        <div>
          <button onClick={connect} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          <p>Please connect your wallet to interact.</p>
        </div>
      ) : (
        <div>
          <p>
            <strong>Connected Account:</strong> {account}
          </p>
          <button onClick={disconnect}>Disconnect Wallet</button>

          <h2>User Information</h2>
          <p>
            Staked NFT Balance:{' '}
            {stakedBalance !== null ? stakedBalance : 'Loading...'}
          </p>
          <p>
            Earned Rewards:{' '}
            {earnedRewards !== null
              ? `${earnedRewards} Reward Tokens`
              : 'Loading...'}
          </p>

          <h3>Staked NFTs:</h3>
          {stakedTokens !== null ? (
            stakedTokens.length > 0 ? (
              <ul>
                {stakedTokens.map((id) => (
                  <li key={id}>Token ID: {id}</li>
                ))}
              </ul>
            ) : (
              <p>No NFTs currently staked.</p>
            )
          ) : (
            <p>Loading staked NFTs...</p>
          )}

          <h2>Global Information</h2>
          <p>
            Total Staked NFTs:{' '}
            {totalStaked !== null ? totalStaked : 'Loading...'}
          </p>
          <p>
            Rewards Rate:{' '}
            {rewardsRate !== null
              ? `${rewardsRate} Tokens per 10s`
              : 'Loading...'}
          </p>
          <p>
            Reward Token Pool (on Staking Contract):
            {contractRewardTokenBalance !== null && rewardTokenSymbol !== null
              ? ` ${contractRewardTokenBalance} ${rewardTokenSymbol}`
              : ' Loading...'}
          </p>
          <p>
            Reward Token Pool (on Contract):{' '}
            {contractBalance !== null
              ? `${contractBalance} Tokens`
              : 'Loading...'}
          </p>

          <h2>Actions</h2>

          <div style={{ marginBottom: '15px' }}>
            <h3>Stake NFT</h3>
            <input
              type="number"
              placeholder="Token ID"
              value={tokenIdToStake}
              onChange={(e) => setTokenIdToStake(e.target.value)}
              style={{ marginRight: '10px', padding: '5px' }}
            />
            <button onClick={handleStake} disabled={!contract}>
              Stake
            </button>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3>Unstake NFT</h3>
            <input
              type="number"
              placeholder="Token ID"
              value={tokenIdToUnstake}
              onChange={(e) => setTokenIdToUnstake(e.target.value)}
              style={{ marginRight: '10px', padding: '5px' }}
            />
            <button onClick={handleUnstake} disabled={!contract}>
              Unstake
            </button>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3>Claim Rewards</h3>
            <button onClick={handleClaimRewards} disabled={!contract}>
              Claim Rewards
            </button>
          </div>

          {isOwner && (
            <div
              style={{
                marginBottom: '15px',
                border: '1px solid orange',
                padding: '10px',
                borderRadius: '5px',
              }}
            >
              <h3>👑 Owner: Fund Rewards</h3>
              <input
                type="text"
                placeholder="Amount of Reward Tokens"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                style={{ marginRight: '10px', padding: '5px' }}
              />
              <button
                onClick={handleFundRewards}
                disabled={!contract || !fundAmount}
              >
                Fund Rewards
              </button>
            </div>
          )}

          <h2>Logs</h2>
          <div
            style={{
              border: '1px solid #ccc',
              height: '200px',
              overflowY: 'scroll',
              padding: '10px',
              backgroundColor: '#f9f9f9',
            }}
          >
            {logs.map((entry, index) => (
              <div
                key={index}
                style={{ marginBottom: '5px', fontSize: '14px' }}
              >
                <strong>{entry.time}</strong>: {entry.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
