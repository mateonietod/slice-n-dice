import { useState } from 'react';
import styles from './SetupScreen.module.css';

const MAX_PLAYERS = 6;
const MIN_PLAYERS = 2;

export default function SetupScreen({ onStart }) {
  const [names, setNames] = useState(['', '']);

  const handleNameChange = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const handleAddPlayer = () => {
    if (names.length < MAX_PLAYERS) {
      setNames([...names, '']);
    }
  };

  const handleRemovePlayer = (index) => {
    if (names.length > MIN_PLAYERS) {
      setNames(names.filter((_, i) => i !== index));
    }
  };

  const handleStart = () => {
    const trimmed = names.map((n) => n.trim());
    if (trimmed.every((n) => n.length > 0)) {
      onStart(trimmed);
    }
  };

  const allFilled = names.every((n) => n.trim().length > 0);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Slice n&apos; Dice</h1>
        <p className={styles.subtitle}>First to 10,000 wins</p>

        <div className={styles.playerList}>
          {names.map((name, i) => (
            <div key={i} className={styles.playerRow}>
              <span className={styles.playerNumber}>{i + 1}</span>
              <input
                className={styles.input}
                type="text"
                value={name}
                placeholder={`Player ${i + 1}`}
                maxLength={20}
                onChange={(e) => handleNameChange(i, e.target.value)}
              />
              {names.length > MIN_PLAYERS && (
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemovePlayer(i)}
                  aria-label={`Remove player ${i + 1}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {names.length < MAX_PLAYERS && (
          <button className={styles.addButton} onClick={handleAddPlayer}>
            + Add Player
          </button>
        )}

        <button
          className={styles.startButton}
          onClick={handleStart}
          disabled={!allFilled}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
