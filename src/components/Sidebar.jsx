import { WINNING_SCORE } from '../game/constants.js';
import styles from './Sidebar.module.css';

export default function Sidebar({ players, currentPlayerIndex }) {
  const sorted = [...players]
    .map((p, i) => ({ ...p, originalIndex: i }))
    .sort((a, b) => b.globalScore - a.globalScore);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>Leaderboard</div>
      <div className={styles.playerList}>
        {sorted.map((player) => {
          const isActive = player.originalIndex === currentPlayerIndex;
          const progress = Math.min((player.globalScore / WINNING_SCORE) * 100, 100);

          return (
            <div
              key={player.originalIndex}
              className={`${styles.player} ${isActive ? styles.active : ''} ${player.finished ? styles.finished : ''}`}
            >
              <div className={styles.playerInfo}>
                <span className={styles.playerName}>
                  {isActive && !player.finished && <span className={styles.indicator}>&#9656; </span>}
                  {player.finished && <span className={styles.rankBadge}>#{player.rank}</span>}
                  {player.name}
                </span>
                <span className={styles.playerScore}>
                  {player.globalScore.toLocaleString()}
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
