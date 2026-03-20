import Die from './Die.jsx';
import styles from './DiceArea.module.css';

export default function DiceArea({ currentThrow, setAsideDice, scoringDiceIndices, rolling, phase }) {
  return (
    <div className={styles.area}>
      <div className={styles.throwDice}>
        {currentThrow.map((value, i) => {
          const isScoring = scoringDiceIndices.includes(i);
          const isBust = phase === 'bust';
          return (
            <Die
              key={`throw-${i}`}
              value={value}
              rolling={rolling}
              scoring={isScoring && !isBust}
              faded={!isScoring && phase === 'deciding'}
              bust={isBust}
            />
          );
        })}
      </div>

      {setAsideDice.length > 0 && (
        <>
          <div className={styles.setAsideLabel}>Set aside</div>
          <div className={styles.setAsideDice}>
            {setAsideDice.map((group, gi) => (
              <div key={`group-${gi}`} className={styles.diceGroup}>
                {gi > 0 && <div className={styles.groupSeparator} />}
                {group.map((value, di) => (
                  <Die key={`aside-${gi}-${di}`} value={value} small />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
