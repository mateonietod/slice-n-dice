import styles from './Die.module.css';

const pipLayouts = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export default function Die({ value, rolling, scoring, faded, small, bust }) {
  const pips = pipLayouts[value] || [];
  const className = [
    styles.die,
    rolling && styles.rolling,
    scoring && styles.scoring,
    faded && styles.faded,
    small && styles.small,
    bust && styles.bust,
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <div className={styles.face}>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className={styles.pipSlot}>
            {pips.includes(i) && <div className={styles.pip} />}
          </div>
        ))}
      </div>
    </div>
  );
}
