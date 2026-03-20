import styles from './ScoreDisplay.module.css';

export default function ScoreDisplay({ globalScore, turnScore, busted }) {
  return (
    <div className={styles.scores}>
      <div className={styles.scoreBlock}>
        <div className={styles.label}>Global</div>
        <div className={styles.value}>{globalScore.toLocaleString()}</div>
      </div>
      <div className={styles.scoreBlock}>
        <div className={`${styles.label} ${styles.turnLabel}`}>Turn</div>
        <div className={`${styles.value} ${styles.turnValue} ${busted ? styles.draining : ''}`}>
          {turnScore.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
