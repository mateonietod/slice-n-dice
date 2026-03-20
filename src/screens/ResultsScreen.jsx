import styles from './ResultsScreen.module.css';

export default function ResultsScreen({ players, onPlayAgain, onNewGame }) {
  const ranked = [...players].sort((a, b) => a.rank - b.rank);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Game Over</h1>

        <div className={styles.rankings}>
          {ranked.map((player, i) => (
            <div
              key={i}
              className={`${styles.rank} ${i === 0 ? styles.first : ''}`}
            >
              <span className={styles.rankNumber}>
                {i === 0 ? '\u{1F3C6}' : `#${player.rank}`}
              </span>
              <span className={styles.rankName}>{player.name}</span>
              <span className={styles.rankScore}>
                {player.globalScore.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={onPlayAgain}>
            Play Again
          </button>
          <button className={styles.secondaryBtn} onClick={onNewGame}>
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
