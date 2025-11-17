// GameRules.tsx
import React from 'react';

const rulesStyles = `
  .rules-container {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid #4a4a4a;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 20px;
    font-family: 'Arial', sans-serif;
    font-size: 0.95em;
    color: #ccc;
  }
  .rules-container h4 {
    font-family: 'MedievalSharp', cursive;
    color: #ffc107;
    margin-top: 0;
    margin-bottom: 10px;
    text-align: center;
  }
  .rules-list {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
  }
  .rules-list li {
    margin-bottom: 8px;
    padding-left: 8px;
  }
  .rules-list li::before {
    content: "•";
    color: #ffc107;
    font-weight: bold;
    display: inline-block; 
    width: 1em;
    margin-left: -1em;
  }
`;

export const QuizRules = () => (
  <>
    <style>{rulesStyles}</style>
    <div className="rules-container">
      <h4>The Rules of the Fellowship</h4>
      <ul className="rules-list">
        <li>Generate a quiz of 10 questions.</li>
        <li>Your stake depends on the question's difficulty.</li>
        <li>Answer correctly to win double your stake (x2).</li>
        <li>An incorrect answer or timeout means your stake is lost.</li>
        <li>Each transaction must be confirmed in your wallet.</li>
      </ul>
    </div>
  </>
);
