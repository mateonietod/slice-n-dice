import { useState } from 'react';
import SetupScreen from './screens/SetupScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import ResultsScreen from './screens/ResultsScreen.jsx';
import styles from './App.module.css';

export default function App() {
  const [screen, setScreen] = useState('setup');
  const [playerNames, setPlayerNames] = useState([]);
  const [finalPlayers, setFinalPlayers] = useState([]);
  const [gameKey, setGameKey] = useState(0);

  const handleStart = (names) => {
    setPlayerNames(names);
    setGameKey(k => k + 1);
    setScreen('game');
  };

  const handleGameOver = (players) => {
    setFinalPlayers(players);
    setScreen('results');
  };

  const handlePlayAgain = () => {
    setGameKey(k => k + 1);
    setScreen('game');
  };

  const handleNewGame = () => {
    setPlayerNames([]);
    setFinalPlayers([]);
    setScreen('setup');
  };

  return (
    <div className={styles.app}>
      {screen === 'setup' && <SetupScreen onStart={handleStart} />}
      {screen === 'game' && (
        <GameScreen key={gameKey} playerNames={playerNames} onGameOver={handleGameOver} />
      )}
      {screen === 'results' && (
        <ResultsScreen
          players={finalPlayers}
          onPlayAgain={handlePlayAgain}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}
