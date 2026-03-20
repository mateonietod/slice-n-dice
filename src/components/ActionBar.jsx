import { OPENING_THRESHOLD } from '../game/constants.js';
import styles from './ActionBar.module.css';

export default function ActionBar({ phase, canSave, needsOpening, openingProgress, onRoll, onSave }) {
  if (phase === 'bust') {
    return (
      <div className={styles.bar}>
        <div className={styles.bustMessage}>No score — turn lost!</div>
      </div>
    );
  }

  return (
    <div className={styles.bar}>
      {needsOpening && (
        <div className={styles.openingLabel}>
          Need {OPENING_THRESHOLD.toLocaleString()} to open ({openingProgress.toLocaleString()} so far)
        </div>
      )}
      {phase === 'ready' && (
        <button className={styles.rollBtn} onClick={onRoll}>
          Roll
        </button>
      )}
      {phase === 'deciding' && (
        <div className={styles.buttons}>
          <button className={styles.rollBtn} onClick={onRoll}>
            Roll Again
          </button>
          {canSave && (
            <button className={styles.saveBtn} onClick={onSave}>
              Save &amp; End Turn
            </button>
          )}
        </div>
      )}
    </div>
  );
}
