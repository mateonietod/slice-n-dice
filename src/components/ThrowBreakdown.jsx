import styles from './ThrowBreakdown.module.css';

export default function ThrowBreakdown({ throwResult }) {
  if (!throwResult || throwResult.score === 0) return null;

  return (
    <div className={styles.breakdown}>
      Throw: <strong>{throwResult.breakdown.join(' + ')}</strong> = <strong>{throwResult.score}</strong>
    </div>
  );
}
