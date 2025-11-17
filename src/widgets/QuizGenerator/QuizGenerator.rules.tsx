import React, { useState } from 'react';

export const GameRules = ({ stake }: { stake: string | null }) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div>
      <h4
        className="font-fantasy rules-header"
        onClick={() => setShowRules(true)}
      >
        The Game's Rules - Read It.{' '}
        {stake ? `Your stake: ${stake.slice(0, 8)}` : null}
      </h4>
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-fantasy">The Oracle's Pact</h4>

            <ul>
              <li>
                <span className="rule-icon">🔮</span>
                <span className="rule-text">
                  Provide a topic and choose your Base Price to generate a quiz.
                </span>
              </li>
              <li>
                <span className="rule-icon">📜</span>
                <span className="rule-text">
                  The cost of each question is calculated by the ancient
                  formula: <br />
                  <strong>
                    Question Cost = Difficulty (1-100) × Base Price
                  </strong>
                </span>
              </li>
              <li>
                <span className="rule-icon">💰</span>
                <span className="rule-text">
                  The total game stake is the sum of all 10 question costs.
                </span>
              </li>
              {stake && (
                <li>
                  <span className="rule-icon">🛡️</span>
                  <span className="rule-text">
                    The total stake for this game is <strong>{stake}</strong>.
                    This will be locked when you start.
                  </span>
                </li>
              )}
              <li>
                <span className="rule-icon">✍️</span>
                <span className="rule-text">
                  Answer all questions. Your responses are sealed in a
                  commitment.
                </span>
              </li>
              <li>
                <span className="rule-icon">⏳</span>
                <span className="rule-text">
                  After committing, the timed trial begins. Answer correctly to
                  win.
                </span>
              </li>
              <li>
                <span className="rule-icon">🏆</span>
                <span className="rule-text">
                  Your reward depends on your score, with a potential for 1.5x
                  the cost of each correct answer!
                </span>
              </li>
              <li>
                <span className="rule-icon">✅</span>
                <span className="rule-text">
                  You must sign a final transaction to claim your reward!
                </span>
              </li>
            </ul>

            <button onClick={() => setShowRules(false)}>I Understand</button>
          </div>
        </div>
      )}
    </div>
  );
};
