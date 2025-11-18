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

      const tx = await contract.startGame(gameIdBytes, dataHash, {
        value: stakeAmount,
      });
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
      console.error('Error reason:', error.reason);
      console.error('Error data:', error.data);
      log(`❗ Error on the question begin: ${error.reason || error.message}`);
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
        const tx = await contract.endGame(
          gameIdBytes,
          currentGame.question,
          currentGame.correctAnswer,
          playerWasCorrect
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
      const tx = await contract.withdrawStakes(account);
      await tx.wait();
      log('✅ Tokens succesfully move to onwer address.');
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
