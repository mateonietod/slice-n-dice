import { useReducer, useState, useCallback, useEffect, useRef } from 'react';
import { gameReducer, createInitialState } from '../game/reducer.js';
import { OPENING_THRESHOLD, WINNING_SCORE } from '../game/constants.js';
import Sidebar from '../components/Sidebar.jsx';
import DiceArea from '../components/DiceArea.jsx';
import ScoreDisplay from '../components/ScoreDisplay.jsx';
import ThrowBreakdown from '../components/ThrowBreakdown.jsx';
import ActionBar from '../components/ActionBar.jsx';
import styles from './GameScreen.module.css';

function rollDice(count) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
}

const CONFETTI_COLORS = ['#e67e22', '#27ae60', '#3498db', '#e74c3c', '#9b59b6', '#f39c12'];

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 6,
    duration: 2 + Math.random() * 1.5,
  }));

  return (
    <div className={styles.celebration}>
      {pieces.map(p => (
        <div
          key={p.id}
          className={styles.confetti}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function GameScreen({ playerNames, onGameOver }) {
  const [state, dispatch] = useReducer(gameReducer, playerNames, createInitialState);
  const [rolling, setRolling] = useState(false);
  const [animationDice, setAnimationDice] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [openingMessage, setOpeningMessage] = useState(null);
  const gameOverHandled = useRef(false);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const { turnState } = state;

  const needsOpening = currentPlayer.globalScore === 0 && !currentPlayer.finished;
  const canSave = !needsOpening || turnState.turnScore >= OPENING_THRESHOLD;
  const approaching10K = currentPlayer.globalScore + turnState.turnScore > 9000;

  const rollIntervalRef = useRef(null);

  const handleRoll = useCallback(() => {
    if (rolling) return;

    const diceCount = turnState.availableDiceCount;
    const finalValues = rollDice(diceCount);

    setAnimationDice(rollDice(diceCount));
    setRolling(true);

    if (turnState.phase === 'deciding') {
      dispatch({ type: 'CONTINUE_ROLL' });
    }

    // Rapidly randomize dice faces during the animation
    rollIntervalRef.current = setInterval(() => {
      setAnimationDice(rollDice(diceCount));
    }, 80);

    setTimeout(() => {
      clearInterval(rollIntervalRef.current);
      dispatch({ type: 'ROLL_DICE', diceValues: finalValues });
      setRolling(false);
    }, 800);
  }, [rolling, turnState.phase, turnState.availableDiceCount]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  const handleSave = useCallback(() => {
    dispatch({ type: 'SAVE_TURN' });
  }, []);

  // Auto-save when opening threshold is met
  useEffect(() => {
    if (
      needsOpening &&
      turnState.turnScore >= OPENING_THRESHOLD &&
      turnState.phase === 'deciding' &&
      !rolling
    ) {
      setOpeningMessage(`${currentPlayer.name} opened with ${turnState.turnScore.toLocaleString()}!`);
      const timer = setTimeout(() => {
        dispatch({ type: 'SAVE_TURN' });
        setOpeningMessage(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [needsOpening, turnState.turnScore, turnState.phase, rolling, currentPlayer.name]);

  // Auto-save when turn score hits exactly 10K
  useEffect(() => {
    if (
      turnState.phase === 'deciding' &&
      !rolling &&
      currentPlayer.globalScore + turnState.turnScore === WINNING_SCORE
    ) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SAVE_TURN' });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turnState.phase, turnState.turnScore, rolling, currentPlayer.globalScore]);

  // Auto-advance after bust
  useEffect(() => {
    if (turnState.phase === 'bust' && !rolling) {
      const timer = setTimeout(() => {
        dispatch({ type: 'END_BUST_TURN' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [turnState.phase, rolling]);

  // Detect when a player just finished (hit 10K)
  useEffect(() => {
    const justFinished = state.players.find(
      p => p.finished && p.globalScore === WINNING_SCORE && p.rank === state.finishedCount
    );
    if (justFinished && turnState.phase === 'ready') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.finishedCount, turnState.phase, state.players]);

  // Check game over — with delay to show confetti
  useEffect(() => {
    if (state.gameOver && !gameOverHandled.current) {
      gameOverHandled.current = true;
      const timer = setTimeout(() => {
        onGameOver(state.players);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.gameOver, state.players, onGameOver]);

  if (state.gameOver && gameOverHandled.current) {
    return (
      <div className={styles.layout}>
        <Sidebar players={state.players} currentPlayerIndex={state.currentPlayerIndex} />
        <main className={styles.main}>
          <div className={styles.gameOverMessage}>Game Over!</div>
          <Confetti />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar players={state.players} currentPlayerIndex={state.currentPlayerIndex} />
      <main className={styles.main}>
        {showConfetti && <Confetti />}

        <div className={styles.turnLabel}>{currentPlayer.name}&apos;s Turn</div>

        <ScoreDisplay
          globalScore={currentPlayer.globalScore}
          turnScore={turnState.turnScore}
          busted={turnState.phase === 'bust'}
        />

        {openingMessage && (
          <div className={styles.openingSuccess}>{openingMessage}</div>
        )}

        {approaching10K && turnState.phase !== 'bust' && turnState.turnScore > 0 && !openingMessage && (
          <div className={styles.warning}>
            Approaching 10,000 — be careful!
          </div>
        )}

        {(turnState.currentThrow.length > 0 || rolling) && (
          <DiceArea
            currentThrow={rolling ? animationDice : turnState.currentThrow}
            setAsideDice={turnState.setAsideDice}
            scoringDiceIndices={rolling ? [] : (turnState.throwResult?.scoringDiceIndices || [])}
            rolling={rolling}
            phase={turnState.phase}
          />
        )}

        {!rolling && !openingMessage && (
          <ThrowBreakdown throwResult={turnState.throwResult} />
        )}

        {!rolling && !openingMessage && (
          <ActionBar
            phase={turnState.phase}
            canSave={canSave && !needsOpening}
            needsOpening={needsOpening}
            openingProgress={turnState.turnScore}
            onRoll={handleRoll}
            onSave={handleSave}
          />
        )}
      </main>
    </div>
  );
}
