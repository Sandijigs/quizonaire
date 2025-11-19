import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

import { requestToOpenRouter, useWeb3State } from '@/shared';
import { getQuizPackPromptEn } from './Quiz.prompt';
import { quizStyles } from './Quiz.styles';
import { QuizRules } from './QuizRules';
import { useNavigate } from 'react-router';
import GameLifecycleABI from '../../../artifacts/contracts/GameLifecycle.sol/GameLifecycleNative.json';

const getStakeAmount = (questionRange: number) => {
  const calculatedStake = Math.max(0.01, questionRange / 100);
  return calculatedStake.toFixed(4);
};

type QuestionData = {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
};
type GameData = QuestionData & {
  gameId: string;
  dataHash: string;
};

type QuestionLifecycleState =
  | 'IDLE'
  | 'GENERATING_QUIZ'
  | 'QUIZ_READY'
  | 'AWAITING_ANSWER'
  | 'AWAITING_TX_CONFIRMATION'
  | 'GAME_OVER';

const CONTRACT_ADDRESS = import.meta.env.VITE_GAME_LIFECYCLE_CONTRACT_ADDRESS ?? '';

export const Quiz = () => {
  const [questionState, setQuestionState] =
    useState<QuestionLifecycleState>('IDLE');
  const [quizPack, setQuizPack] = useState<QuestionData[] | null>(null);
  const [currentGame, setCurrentGame] = useState<GameData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);

  const { log, connect, contract, account, isOwner, logs } = useWeb3State(
    CONTRACT_ADDRESS,
    GameLifecycleABI.abi
  );
  const navigate = useNavigate();

  const handleGenerateQuiz = useCallback(async () => {
    setQuestionState('GENERATING_QUIZ');
    log('🔮 Generate options with 10 questions...');
    try {
      let questionRanges = [];
      for (let i = 0; i < 10; i++) {
        questionRanges.push(Math.round(Math.random() * 100));
      }
      const prompt = getQuizPackPromptEn(questionRanges);
      const content = await requestToOpenRouter(prompt);
      if (!content)
        throw new Error('LLM can`t create content and return nothing!');

      const pack = JSON.parse(
        content
          .replace(/```json\n?/, '')
          .replace(/```\n?/, '')
          .trim()
      );
      if (!Array.isArray(pack) || pack.length === 0)
        throw new Error('LLM return incorrect data');

      questionRanges.forEach((it, index) => {
        (pack[index] as QuestionData).difficulty = it;
      });

      setQuizPack(pack);
      setCurrentQuestionIndex(0);
      setQuestionState('QUIZ_READY');
      log(`✅ Options from ${pack.length} questions ready to start!`);
    } catch (error: any) {
      log(`❗ Error quiz generated: ${error.message}`);
      setQuestionState('IDLE');
    }
  }, [log]);

  const handleStartOrNext = useCallback(async () => {
    if (!quizPack || !contract) return;

    setQuestionState('AWAITING_TX_CONFIRMATION');
    const questionData = quizPack[currentQuestionIndex];
    const stakeString = getStakeAmount(questionData.difficulty);
    const stakeAmount = ethers.utils.parseEther(stakeString);

    try {
      // Verify network before transaction
      const network = await contract.provider.getNetwork();
      if (network.chainId !== 11142220) {
        log(`❗ Wrong network detected. Expected Celo Sepolia (11142220), got ${network.chainId}`);
        // Try to switch network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xAA044C' }], // Correct hex for 11142220
        });
        // Wait for network switch
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      log(
        `🎲 Question ${currentQuestionIndex + 1}/${quizPack.length}. Fixing stake...`
      );
      log(`💰 Your stake: ${stakeString} CELO. Sign transaction.`);

      const gameId = uuidv4();
      const gameIdBytes = ethers.utils.id(gameId);
      const dataHash = ethers.utils.solidityKeccak256(
        ['bytes32', 'string', 'string'],
        [
          gameIdBytes,
          questionData.question,
          questionData.correctAnswer,
        ]
      );
      
      // Debug logging
      console.log('Transaction Debug Info:', {
        gameId,
        gameIdBytes,
        dataHash,
        question: questionData.question,
        answer: questionData.correctAnswer,
        stakeAmount: ethers.utils.formatEther(stakeAmount),
        contractAddress: contract.address,
        userAddress: account,
      });

      // Skip gas estimation and use a safe default for Celo
      const gasLimit = ethers.BigNumber.from('300000');
      
      // Get current gas price from provider and add buffer
      let gasPrice;
      try {
        const currentGasPrice = await contract.provider.getGasPrice();
        // Add 20% buffer to current gas price
        gasPrice = currentGasPrice.mul(120).div(100);
        log(`⛽ Gas: Limit=${gasLimit.toString()}, Price=${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
      } catch {
        // Fallback to safe default (30 gwei for Celo)
        gasPrice = ethers.utils.parseUnits('30', 'gwei');
        log(`⛽ Using default gas: Limit=${gasLimit.toString()}, Price=30 gwei`);
      }
      
      // Retry logic for JSON-RPC errors
      let tx;
      let retries = 0;
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        try {
          tx = await contract.startGame(gameIdBytes, dataHash, {
            value: stakeAmount,
            gasLimit: gasLimit,
            gasPrice: gasPrice,
          });
          break; // Success, exit loop
        } catch (err: any) {
          if (err.code === -32603 && retries < maxRetries) {
            retries++;
            log(`⚠️ JSON-RPC error, retrying (${retries}/${maxRetries})...`);
            // Wait a bit before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Refresh gas price
            try {
              const currentGasPrice = await contract.provider.getGasPrice();
              gasPrice = currentGasPrice.mul(130).div(100); // Increase buffer
            } catch {
              gasPrice = ethers.utils.parseUnits('35', 'gwei'); // Higher fallback
            }
          } else {
            throw err; // Re-throw if not JSON-RPC error or max retries reached
          }
        }
      }
      
      if (!tx) {
        throw new Error('Failed to send transaction after retries');
      }
      
      await tx.wait();

      const newGameData: GameData = { ...questionData, gameId, dataHash };
      setCurrentGame(newGameData);

      const gameDuration = Math.max(10, Math.floor(newGameData.difficulty / 2));
      setTimer(gameDuration);
      setQuestionState('AWAITING_ANSWER');
      log(
        `✅ Game ${gameId.slice(0, 8)}... is going on. You have ${gameDuration} seconds.`
      );
    } catch (error: any) {
      console.error('Full error details:', error);
      console.error('Error code:', error.code);
      console.error('Error reason:', error.reason);
      console.error('Error data:', error.data);
      
      // More detailed error messages
      let errorMessage = 'Unknown error';
      if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.code === -32603) {
        errorMessage = 'Internal JSON-RPC error. Please check your wallet network settings';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      log(`❗ Error on the question begin: ${errorMessage}`);
      setQuestionState('QUIZ_READY');
    }
  }, [contract, currentQuestionIndex, log, quizPack]);

  const handleAnswer = useCallback(
    async (selectedAnswer: string) => {
      if (questionState !== 'AWAITING_ANSWER') return;
      if (!contract || !currentGame || !quizPack) return;

      setTimer(0);
      setQuestionState('AWAITING_TX_CONFIRMATION');
      log(`You selected: "${selectedAnswer}". Waiting approve...`);

      try {
        const playerWasCorrect = selectedAnswer === currentGame.correctAnswer;
        const stakeString = getStakeAmount(currentGame.difficulty);
        const stakeAmount = ethers.utils.parseEther(stakeString);

        const gameIdBytes = ethers.utils.id(currentGame.gameId);
        
        // Use fixed gas limit and dynamic gas price for Celo
        const gasLimit = ethers.BigNumber.from('400000');
        let gasPrice;
        try {
          const currentGasPrice = await contract.provider.getGasPrice();
          gasPrice = currentGasPrice.mul(120).div(100); // Add 20% buffer
        } catch {
          gasPrice = ethers.utils.parseUnits('30', 'gwei'); // Safe default
        }
        
        const tx = await contract.endGame(
          gameIdBytes,
          currentGame.question,
          currentGame.correctAnswer,
          playerWasCorrect,
          { gasLimit, gasPrice }
        );
        await tx.wait();

        if (playerWasCorrect) {
          const rewardString = ethers.utils.formatEther(stakeAmount.mul(2));
          log(`⚔️ Correct! You won ${rewardString} CELO.`);
        } else {
          log(`🌑 Sorry! It is not correct(( You lose ${stakeString} CELO.`);
        }

        setCurrentGame(null);
        if (currentQuestionIndex >= quizPack.length - 1) {
          log('🏁 Quiz complete! Thanks for game.');
          setQuestionState('GAME_OVER');
        } else {
          setCurrentQuestionIndex((prev) => prev + 1);
          setQuestionState('QUIZ_READY');
        }
      } catch (error: any) {
        if (error.code === 4001) {
          log(
            '❌ You are canceled transaction. Game over. Your state stay in the contract bank.'
          );
          setQuestionState('GAME_OVER');
        } else {
          log(`❗ Error in the game ended: ${error.message}`);
          setQuestionState('QUIZ_READY');
        }
      }
    },
    [contract, currentGame, log, questionState, quizPack, currentQuestionIndex]
  );

  const handleWithdraw = useCallback(async () => {
    if (!contract || !isOwner) {
      log('This is only for owner.');
      return;
    }
    log('💰 Owner take all rewards...');
    try {
      // Get dynamic gas price for withdrawal
      let gasPrice;
      try {
        const currentGasPrice = await contract.provider.getGasPrice();
        gasPrice = currentGasPrice.mul(120).div(100);
      } catch {
        gasPrice = ethers.utils.parseUnits('30', 'gwei');
      }
      
      const tx = await contract.withdrawStakes(account, {
        gasLimit: 200000,
        gasPrice: gasPrice
      });
      await tx.wait();
      log('✅ Tokens successfully moved to owner address.');
    } catch (error: any) {
      log(`❗ Error of tokens moving: ${error.message}`);
    }
  }, [contract, isOwner, account]);

  const handleExitToMain = useCallback(() => {
    log('↩️ Return to main scene.');
    setQuestionState('IDLE');
    setQuizPack(null);
    setCurrentGame(null);
    setCurrentQuestionIndex(0);
    navigate('/');
  }, [log]);

  useEffect(() => {
    if (timer > 0 && questionState === 'AWAITING_ANSWER') {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }

    if (timer === 0 && questionState === 'AWAITING_ANSWER') {
      log('⏳ Time is over. Answer written as incorrect, sorry.');
      handleAnswer('TIMEOUT_INCORRECT_ANSWER_AUTO');
    }
  }, [timer, questionState, handleAnswer]);

  const renderGameContent = () => {
    if (!account) return <button onClick={connect}>Connect Wallet</button>;

    switch (questionState) {
      case 'GENERATING_QUIZ':
        return (
          <div>
            <div className="loader"></div>
            <p>The spirits of the Ainur are forging questions for you...</p>
          </div>
        );

      case 'QUIZ_READY':
        const isFirstQuestion = currentQuestionIndex === 0;
        const buttonText = isFirstQuestion
          ? `Start Quiz (${quizPack?.length} questions)`
          : 'Next';
        return <button onClick={handleStartOrNext}>{buttonText}</button>;

      case 'AWAITING_ANSWER':
      case 'AWAITING_TX_CONFIRMATION':
        const isWaitingForTx = questionState === 'AWAITING_TX_CONFIRMATION';
        return (
          <div>
            <h2>
              Question {currentQuestionIndex + 1}: {currentGame?.question}
            </h2>
            {isWaitingForTx ? (
              <div>
                <div className="loader"></div>
                <p>Awaiting confirmation in your wallet...</p>
              </div>
            ) : (
              <p className="timer">{timer}s</p>
            )}
            <div className="options-grid">
              {currentGame?.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={isWaitingForTx}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      case 'GAME_OVER':
        return (
          <div>
            <h3>Game Over!</h3>
            <button onClick={handleGenerateQuiz}>Play Again</button>
            <button onClick={handleExitToMain}>Exit to Main Page</button>
          </div>
        );
      case 'IDLE':
      default:
        return <button onClick={handleGenerateQuiz}>Generate New Quiz</button>;
    }
  };

  return (
    <>
      <style>{quizStyles}</style>
      <div className="quiz-container">
        <div className="main-content">
          <div className="game-panel">
            <h1>The Chronicles of Middle-earth</h1>
            <p>
              Test your knowledge in a quiz about the Lord of the Rings
              universe!
            </p>
            {renderGameContent()}
            {isOwner && (
              <button onClick={handleWithdraw}>Withdraw Treasures</button>
            )}
          </div>
          <div className="log-panel">
            <QuizRules />
            <h3>Scroll of Events:</h3>
            <div className="log-entries-container">
              {logs.map((l, i) => (
                <div key={i} className="log-entry">
                  <span className="log-time">[{l.time}]</span>
                  <span>{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
