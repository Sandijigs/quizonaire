export const WidgetStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&family=Lato:wght@400;700&display=swap');

    .game-widget-container {
      font-family: 'Lato', sans-serif;
      color: #EAEAEA;
      width: 100%;
      height: calc(100vh - 190px); /* Учет хедера и футера */
      display: flex;
      gap: 24px;
      padding: 24px;
      /* Улучшенный градиент с добавлением больше цветов для динамичности */
      background: linear-gradient(45deg, #111827, #581c87, #1f2937, #facc15, #111827);
      background-size: 300% 300%;
      animation: gradient 20s ease infinite;
      position: relative;
    }

    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .font-fantasy { 
      font-family: 'MedievalSharp', cursive; 
    }

    .wallet-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .no-copy { 
      user-select: none; 
      -webkit-user-select: none; 
      -moz-user-select: none; 
    }

    .game-panel, .log-panel {
      background: rgba(10, 20, 30, 0.7);
      border: 1px solid #4a2c6e;
      border-radius: 12px;
      padding: 16px;
      z-index: 2;
      backdrop-filter: blur(8px);
      box-shadow: 0 0 40px rgba(76, 29, 149, 0.3);
      transition: all 0.3s ease; /* Добавлен переход */
    }

    .game-panel:hover, .log-panel:hover {
      transform: scale(1.01);
      box-shadow: 0 0 50px rgba(76, 29, 149, 0.5);
    }

    .game-panel { 
      flex: 3; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      text-align: center; 
    }

    .log-panel { 
      flex: 2; 
      display: flex; 
      flex-direction: column; 
      overflow: hidden; 
      margin-right: 48px;
    }

    .wallet-status {
      background-color: #581c87;
      color: #facc15;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .wallet-status span {
      font-weight: bold;
    }

    .wallet-status button {
      background-color: #581c87;
      color: #facc15;
      border: 2px solid #facc15;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-family: 'MedievalSharp', cursive;
      transition: all 0.3s ease;
    }

    .wallet-status button:hover {
      background-color: #facc15;
      color: #1e1b4b;
    }

    .log-rules {
      margin-bottom: 16px;
      flex-shrink: 0;
      background-color: rgba(0, 0, 0, 0.3);
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid rgba(23, 37, 84, 0.5);
      max-height: 150px;
      overflow-y: auto;
    }

    .log-entries-container { 
      flex-grow: 1; 
      overflow-y: auto; 
      padding-right: 10px; 
    }

    .log-entry { 
      margin-bottom: 8px; 
      font-size: 0.9em; 
      line-height: 1.5; 
      padding: 8px;
      background-color: rgba(255, 255, 255, 0.1);
      border-left: 4px solid #facc15;
      border-radius: 4px;
    }

    .log-time { 
      color: #888; 
      margin-right: 10px; 
    }

    .btn {
      font-family: 'MedievalSharp', cursive;
      background-color: #581c87;
      color: #facc15;
      border: 2px solid #facc15;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.2em;
      margin: 10px;
      transition: all 0.3s ease;
    }

    .btn:hover { 
      background-color: #facc15; 
      color: #1e1b4b; 
    }

    .btn:disabled { 
      background-color: #374151; 
      color: #6b7280; 
      border-color: #6b7280; 
      cursor: not-allowed; 
    }

    .btn-green { 
      background-color: #166534; 
      border-color: #86efac; 
      color: #dcfce7; 
    }

    .btn-green:hover { 
      background-color: #86efac; 
      color: #14532d; 
    }

    .verical-game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .input-theme {
      border-radius: 8px;
      border: 2px solid #facc15;
      padding: 16px;
      background-color: rgba(156, 163, 175, 0.5);
      color: #EAEAEA;
      text-align: center;
      font-size: 1.125rem;
      transition: all 0.3s ease;
      margin: 10px;
      width: 100%;
    }

    .input-theme:focus {
      outline: none;
      ring: 2px solid #facc15;
      background-color: rgba(156, 163, 175, 0.7);
    }

    .loader {
      border: 8px solid #f3f3f340;
      border-top: 8px solid #a78bfa;
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
      font-size: 2.5em; 
      color: #facc15; 
      margin: 20px 0; 
      font-weight: bold; 
    }

    .options-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 15px; 
      margin-top: 20px; 
      width: 100%; 
      max-width: 700px; 
    }

    .options-grid .btn { 
      width: 100%; 
      height: 100%; 
      min-height: 60px; 
      font-size: 1em; 
      padding: 16px; 
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100;
    }

    .modal-content {
      background-color: #111827;
      color: #EAEAEA;
      padding: 24px;
      margin: 0px 20px;
      border-radius: 12px;
      border: 2px solid #581c87;
      max-width: 400px;
      max-height: 400px;
      width: 100%;
      position: relative;
      box-shadow: 0 0 60px rgba(88, 28, 135, 0.5);
      overflow-y: auto;
    }

    .modal-content h4 {
      margin-top: 0;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #581c87;
      text-align: center;
      font-size: 1.8em;
    }

    .modal-content ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .modal-content li {
      display: flex;
      align-items: flex-start;
      margin-bottom: 18px;
      line-height: 1.6;
    }

    .rule-icon {
      font-size: 1.5rem;
      margin-right: 16px;
      line-height: 1.6
    }

    .rule-text {
      flex: 1;
    }

    .modal-content strong {
      color: #facc15;
      font-weight: 700;
    }

    .modal-content button {
      display: block;
      margin: 32px auto 0;
      background-color: #581c87;
      color: #facc15;
      border: 2px solid #facc15;
      padding: 10px 30px;
      border-radius: 8px;
      cursor: pointer;
      font-family: 'MedievalSharp', cursive;
      font-size: 1.2em;
      transition: all 0.3s ease;
    }

    .modal-content button:hover {
      background-color: #facc15;
      color: #1e1b4b;
    }

    .rules-header {
      cursor: pointer;
      color: #facc15;
      text-align: center;
      border: 2px solid #342abc;
      border-radius: 8px;
      padding: 10px;
    }

    .answer-review {
      background: rgba(10, 20, 30, 0.7);
      border: 1px solid #4a2c6e;
      border-radius: 12px;
      padding: 16px;
      margin-top: 20px;
      box-shadow: 0 0 40px rgba(76, 29, 149, 0.3);
      max-height: 200px;
      overflow-y: auto;
    }

    .answer-item {
      margin-bottom: 16px;
      padding: 10px;
      background-color: rgba(255, 255, 255, 0.1);
      border-left: 4px solid #facc15;
      border-radius: 4px;
    }

    .question {
      font-weight: bold;
      margin-bottom: 8px;
    }

    .correct-answer {
      color: #86efac;
      margin-bottom: 4px;
    }

    .player-answer {
      margin-bottom: 4px;
    }

    .player-answer.correct {
      color: #86efac;
    }

    .player-answer.incorrect {
      color: #f87171;
    }

    .price-options-container {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 20px 0;
      width: 100%;
    }

    .price-option {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-width: 3px;
      font-size: 1em;
      text-align: center;
      flex: 1;
      max-width: 180px;
      min-height: 100px;
      padding: 16px;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .price-option .price-label {
      font-size: 1.5em; 
      font-weight: bold;
      color: #facc15; 
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .price-option .price-value {
      font-size: 1.1em; /* Тоже сделаем покрупнее */
      font-family: 'Lato', sans-serif; /* Используем более "числовой" шрифт */
      color: #e5e7eb;
    }

    .price-option.active {
      background-color: #facc15;
      color: #1e1b4b;
      transform: translateY(-5px) scale(1.05); /* Более выраженный эффект "приподнятия" */
      box-shadow: 0 10px 20px rgba(250, 204, 21, 0.3);
    }

    .price-option.active .price-label,
    .price-option.active .price-value {
      color: #1e1b4b;
    }
  
  `}</style>
);
