export const quizStyles = `
  @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

  .quiz-container {
    font-family: 'MedievalSharp', cursive;
    background-image: url('/textures/lotr-bg.jpg');
    background-size: cover;
    background-position: center;
    min-height: calc(100vh - 220px);
    color: #EAEAEA;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    position: relative;
  }
  .quiz-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7); /* Затемняющий слой */
    z-index: 1;
  }
  .main-content {
    display: flex;
    gap: 20px;
    width: 100%;
    max-width: 1200px;
    z-index: 2;
  }
  .game-panel {
    flex: 3;
    background: rgba(10, 20, 30, 0.85);
    border: 2px solid #4a4a4a;
    border-radius: 10px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
  }
  .log-panel {
    flex: 2;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid #333;
    border-radius: 5px;
    padding: 20px;
    height: calc(100vh - 220px);
    overflow-y: hidden; 
    display: flex;
    flex-direction: column;
  }
  .log-entries-container {
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 10px;
  }
  .log-entry {
    margin-bottom: 5px;
    border-bottom: 1px solid #2a2a2a;
    padding-bottom: 5px;
  }
  .log-time {
    color: #888;
    margin-right: 10px;
  }
  button {
    font-family: 'MedievalSharp', cursive;
    background-color: #3d3d3d;
    color: #ffc107;
    border: 2px solid #ffc107;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.2em;
    margin: 10px;
    transition: all 0.3s ease;
  }
  button:hover {
    background-color: #ffc107;
    color: #1a1a1a;
  }
  button:disabled {
    background-color: #222;
    color: #555;
    border-color: #555;
    cursor: not-allowed;
  }
  .loader {
    border: 8px solid #f3f3f340;
    border-top: 8px solid #ffc107;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .timer {
    font-size: 2em;
    color: #ffc107;
    margin: 20px 0;
  }
  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 20px;
  }
`;
