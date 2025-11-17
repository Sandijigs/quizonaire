import React, { useCallback, useEffect, useState } from 'react';
import {
  getContractBalance,
  requestToOpenRouter,
  useWeb3State,
} from '@/shared';
import { getUniversalQuizPromptEn } from './QuizGenerator.prompt';
import OptimizedQuizGameABI from '../../../artifacts/contracts/OptimizedQuizGame.sol/OptimizedQuizGame.json';
import { useNavigate } from 'react-router';
import { WidgetStyles } from './QuizGenerator.styles';
import { GameRules } from './QuizGenerator.rules';
import { v4 as uuidv4 } from 'uuid';
import { keccak256 } from 'js-sha3';
import { ethers } from 'ethers';
import { AnswerReview, QuizAnswerReview } from './QuizAnswerReview';
import { BASE_PRICE_OPTIONS } from './QuizGenerator.consts';

type LLMGameData = {
  question: string;
  options: string[];
  correctAnswer: string;
};

type UserQuestionData = {
  id: string;
  question: string;
  answerHash: string;
};

type QuestionData = {
  index: number;
  id: string;
  question: string;
  options: string[];
  correctAnswerHash: string;
  difficulty: number;
  cost: number;
};

type GameData = {
  id: number;
  questions: QuestionData[];
  fullCost: number;
};

const CONTRACT_ADDRESS = process.env.CONTRACT_QUIZ_ADDRESS ?? '';

type GameState =
  | 'IDLE'
  | 'CUSTOMIZING'
  | 'GENERATING_QUIZ'
  | 'QUIZ_READY'
  | 'AWAITING_COMMIT'
  | 'GAME_IN_PROGRESS'
  | 'GAME_WAIT_NEXT_QUESTION'
  | 'GAME_FINISHED'
  | 'AWAITING_REVEAL'
  | 'GAME_OVER';

const countTimer = (quizPack: GameData, index: number) => {
  return Math.max(15, Math.floor(quizPack.questions[index].difficulty / 2));
};

const winKoef = 1.5;

export const GameWidget = () => {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [quizPack, setQuizPack] = useState<GameData | null>();
  const [userQuestionData, setUserQuestionData] = useState<UserQuestionData[]>(
    []
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);
  const [topic, setTopic] = useState('The Witcher 3 Wild Hunt');
  const [timer, setTimer] = useState<number>(0);
  const [answersForReview, setAnswersForReview] = useState<AnswerReview[]>([]);
  const [basePrice, setBasePrice] = useState<number>(
    BASE_PRICE_OPTIONS[0].value
  );

  const navigate = useNavigate();

  const {
    log,
    connect,
    contract,
    account,
    isOwner,
    logs,
    disconnect,
    provider,
  } = useWeb3State(CONTRACT_ADDRESS, OptimizedQuizGameABI.abi);

  const handleGenerateQuiz = useCallback(async () => {
    setGameState('GENERATING_QUIZ');
    log(
      '🔮 Generating 10 questions based on your topic..., P.S. It can be not super fast, because LLM generate quiz right now!) Be patient!)'
    );
    try {
      const levels = Array.from({ length: 10 }, () =>
        Math.round(Math.random() * 100)
      );
      const prompt = getUniversalQuizPromptEn(topic, 'human', levels);
      const content = await requestToOpenRouter(prompt);

      if (!content) {
        throw new Error(
          'Quiz is empty! You should announced about it to author!'
        );
      }

      const pack: LLMGameData[] = JSON.parse(content);
      const questions: QuestionData[] = pack.map(
        (question: LLMGameData, index: number) => ({
          index,
          id: uuidv4(),
          question: question.question,
          correctAnswerHash: keccak256(question.correctAnswer),
          options: question.options,
          difficulty: levels[index],
          cost: levels[index] * basePrice,
        })
      );

      const game: GameData = {
        id: Date.now(),
        questions: questions,
        fullCost: questions.reduce((prev, curr) => prev + curr.cost, 0),
      };

      setQuizPack(game);
      setGameState('QUIZ_READY');
      log(
        `✅ Quiz ready! Please answer the questions to form your commitment.`
      );
    } catch (error: any) {
      log(`❗ Error generating quiz: ${error.message}`);
      setGameState('CUSTOMIZING');
    }
  }, [log, topic, basePrice]);

  const handleStartGame = useCallback(async () => {
    if (!contract || !quizPack) return log('Contract or quiz not ready.');

    setGameState('AWAITING_COMMIT');
    log(`Calculating your commitment...`);

    try {
      log(`Your Game ID: ${quizPack.id}...`);
      log(
        `Total stake: ${quizPack.fullCost.toFixed(6)} STT. Please confirm transaction.`
      );

      const fullCostWei = ethers.utils.parseEther(quizPack.fullCost.toString());
      const tx = await contract.startGame(
        ethers.BigNumber.from(quizPack.id),
        fullCostWei,
        { value: fullCostWei }
      );

      await tx.wait();

      log('✅ Commitment successful! The timed trial begins NOW!');

      setTimer(countTimer(quizPack, 0));
      setCurrentQuestionIndex(0);
      setGameState('GAME_IN_PROGRESS');
    } catch (error: any) {
      log(`❗ Error committing to game: ${error.message}`);
      setGameState('QUIZ_READY');
    }
  }, [contract, log, quizPack, countTimer]);

  const handleNextQuestion = useCallback(() => {
    if (!quizPack || currentQuestionIndex === null) {
      throw 'No quiz pack or game not started';
    }

    setTimer(countTimer(quizPack, currentQuestionIndex + 1));
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setGameState('GAME_IN_PROGRESS');
  }, [quizPack, currentQuestionIndex, log, countTimer]);

  const handleAnswerSelect = useCallback(
    (answer: string) => {
      if (!quizPack || currentQuestionIndex === null) {
        throw 'No quiz pack or game not started';
      }

      const answerHash = keccak256(answer);

      const userAnswer: UserQuestionData = {
        answerHash,
        id: quizPack.questions[currentQuestionIndex].id,
        question: quizPack.questions[currentQuestionIndex].question,
      };
      setUserQuestionData((prev) => [...prev, userAnswer]);
      setGameState('GAME_WAIT_NEXT_QUESTION');
      setTimer(0);

      log(`You selected: "${answer}"`);

      if (currentQuestionIndex >= quizPack.questions.length - 1) {
        setGameState('GAME_FINISHED');
        log(
          "🏁 You have answered all questions! Press 'Finish Game' to claim your result."
        );
      }
    },
    [currentQuestionIndex, quizPack]
  );

  const handleEndGame = useCallback(async () => {
    if (!contract || !quizPack?.id) return log('No active game found.');

    setGameState('AWAITING_REVEAL');
    log('Revealing your answers to the Oracle... Please confirm transaction.');

    try {
      let finalPrize = 0;
      const quizAnswerReiew: AnswerReview[] = [];
      userQuestionData.forEach((it, index) => {
        const question = quizPack.questions[index];
        const correctAnswer = question.options.find(
          (option) => keccak256(option) === question.correctAnswerHash
        );
        const answerFromUser = question.options.find(
          (option) => keccak256(option) === it.answerHash
        );
        quizAnswerReiew.push({
          question: question.question,
          correctAnswer: correctAnswer ?? 'Answer not exist',
          playerAnswer: answerFromUser ?? 'Answer not exist',
        });
        if (
          it.id === question.id &&
          it.answerHash === question.correctAnswerHash
        ) {
          finalPrize += question.cost * winKoef;
        }
      });
      setAnswersForReview(quizAnswerReiew);
      const finalPrizeWei = ethers.utils.parseEther(finalPrize.toString());
      log(`You will get your final result: ${finalPrize.toFixed(6)} STT`);
      const tx = await contract.endGame(
        ethers.BigNumber.from(quizPack.id),
        finalPrizeWei
      );
      await tx.wait();

      log(`⚔️ Your trial is complete! The Oracle has judged your performance.`);
      setGameState('GAME_OVER');
    } catch (error: any) {
      log(`❗ Error revealing answers: ${error.message}`);
      setGameState('GAME_FINISHED');
    }
  }, [contract, log, quizPack, userQuestionData]);

  useEffect(() => {
    if (timer > 0 && gameState === 'GAME_IN_PROGRESS') {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }

    if (timer === 0 && gameState === 'GAME_IN_PROGRESS') {
      log('⏳ Time is over. Answer written as incorrect, sorry.');
      handleAnswerSelect('Player answer incorrect');
    }
  }, [timer, handleAnswerSelect]);

  const resetGame = useCallback(() => {
    setGameState('CUSTOMIZING');
    setQuizPack(null);
    setCurrentQuestionIndex(null);
    setUserQuestionData([]);
    setTimer(0);
    setAnswersForReview([]);
    log('A new trial awaits...');
  }, [log]);

  const handleWithdraw = useCallback(async () => {
    if (!contract || !isOwner) {
      log('This is only for owner.');
      return;
    }
    log('💰 Owner take all rewards...');
    try {
      const address = process.env.CONTRACT_QUIZ_ADDRESS ?? '';
      const balance = await getContractBalance(address);
      const needToWithdraw = ethers.utils.parseEther(balance);
      const tx = await contract.withdraw(needToWithdraw);
      await tx.wait();
      log('✅ Tokens succesfully move to onwer address.');
    } catch (error: any) {
      log(`❗ Error of tokens moving: ${error.message}`);
    }
  }, [contract, isOwner]);

  const finalizeInactiveGames = useCallback(async () => {
    if (!contract || !isOwner) {
      log('This is only for owner.');
      return;
    }
    log('💰 Owner finalize expired games and send all loans to contrsct...');
    try {
      const tx = await contract.endExpiredGames();
      await tx.wait();
      log('✅ Tokens succesfully move to onwer address.');
    } catch (error: any) {
      log(`❗ Error of tokens moving: ${error.message}`);
    }
  }, [contract, isOwner]);

  const renderGameContent = () => {
    if (!account)
      return (
        <button className="btn" onClick={connect}>
          Connect Wallet
        </button>
      );

    switch (gameState) {
      case 'CUSTOMIZING':
        return (
          <div className="verical-game-container">
            <h2 className="font-fantasy">Challenge the Oracle</h2>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-theme"
            />

            <div className="price-options-container">
              {BASE_PRICE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`btn price-option ${basePrice === option.value ? 'active' : ''}`}
                  onClick={() => setBasePrice(option.value)}
                >
                  <div className="price-label">{option.label}</div>
                  <div className="price-value">{option.value} STT</div>
                </button>
              ))}
            </div>

            <button className="btn" onClick={handleGenerateQuiz}>
              Forge My Destiny
            </button>
          </div>
        );
      case 'GENERATING_QUIZ':
        return (
          <div className="verical-game-container">
            <div className="loader"></div>
            <p>
              The great spirits of quizzes are preparing incredible questions
              for you...
            </p>
          </div>
        );
      case 'QUIZ_READY':
        return (
          <div className="verical-game-container">
            <h2 className="font-fantasy">Prepare Your Answers</h2>
            <p>Answer these to form your commitment. No timer yet.</p>
            <button className="btn btn-green" onClick={handleStartGame}>
              Lock Answers & Start Game
            </button>
          </div>
        );
      case 'AWAITING_COMMIT':
      case 'AWAITING_REVEAL':
        return (
          <div className="verical-game-container">
            <div className="loader"></div>
            <p>Awaiting confirmation in your wallet...</p>
          </div>
        );
      case 'GAME_IN_PROGRESS':
        const q = quizPack?.questions[currentQuestionIndex ?? 0];
        return (
          <div
            className="no-copy verical-game-container"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="timer">{timer}s</div>
            <div
              className="font-fantasy"
              style={{ fontSize: '32px', textAlign: 'center' }}
            >
              {q?.question}
            </div>
            <div className="options-grid">
              {q?.options.map((opt) => (
                <button
                  key={opt}
                  className="btn"
                  onClick={() => handleAnswerSelect(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      case 'GAME_WAIT_NEXT_QUESTION':
        return (
          <div className="verical-game-container">
            <button className="btn" onClick={handleNextQuestion}>
              Next question
            </button>
          </div>
        );
      case 'GAME_FINISHED':
        return (
          <div className="verical-game-container">
            <h3>Your Quiz Complete!</h3>
            <p>
              Your answers have been recorded. Reveal them now to receive
              judgment from the Oracle.
            </p>
            <button className="btn btn-green" onClick={handleEndGame}>
              Finish Game & Claim Result
            </button>
          </div>
        );
      case 'GAME_OVER':
        return (
          <div className="verical-game-container">
            <h3 className="font-fantasy">The Trial is Over!</h3>
            <div className="verical-game-container">
              <button className="btn" onClick={resetGame}>
                Play Again
              </button>
              <button className="btn" onClick={() => navigate('/')}>
                Exit to Main Page
              </button>
              {answersForReview.length !== 0 ? (
                <QuizAnswerReview answers={answersForReview} />
              ) : null}
            </div>
          </div>
        );
      case 'IDLE':
      default:
        return (
          <button className="btn" onClick={() => setGameState('CUSTOMIZING')}>
            Start
          </button>
        );
    }
  };

  return (
    <>
      <WidgetStyles />
      <div className="game-widget-container">
        <div className="game-panel">
          {isOwner ? (
            <div className="verical-game-container">
              <button className="btn" onClick={handleWithdraw}>
                Withdraw contract treasures
              </button>
              <button className="btn" onClick={finalizeInactiveGames}>
                Finalize all inactive games
              </button>
            </div>
          ) : null}
          {renderGameContent()}
        </div>
        <div className="log-panel">
          {account ? (
            <div className="wallet-status">
              <div className="wallet-container">
                <span>
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <button onClick={disconnect}>Disconnect</button>
              </div>
            </div>
          ) : null}
          <GameRules
            stake={quizPack?.fullCost ? `${quizPack.fullCost} STT` : null}
          />
          <h3 className="font-fantasy">Scroll of Events</h3>
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
    </>
  );
};
