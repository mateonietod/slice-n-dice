/**
 * evaluateThrow - pure function that scores a set of dice
 *
 * Priority order:
 * 1. 5-of-a-kind   → instantWin = true (only with exactly 5 dice)
 * 2. Straight 1-2-3-4-5 → 500 (only with exactly 5 dice)
 * 3. Straight 2-3-4-5-6 → 500 (only with exactly 5 dice)
 * 4. 3-of-a-kind of 1s  → 1000
 * 5. 3-of-a-kind of X   → X * 100
 * 6. Individual 1s (not in triple) → 100 each
 * 7. Individual 5s (not in triple) → 50 each
 *
 * @param {number[]} dice - array of die face values
 * @returns {{ score: number, scoringDiceIndices: number[], breakdown: string[], instantWin: boolean }}
 */
export function evaluateThrow(dice) {
  const n = dice.length;
  const used = new Array(n).fill(false);
  const breakdown = [];
  let score = 0;
  let instantWin = false;

  // --- 1. 5-of-a-kind (only with exactly 5 dice) ---
  if (n === 5 && dice.every(d => d === dice[0])) {
    return {
      score: 0,
      scoringDiceIndices: [0, 1, 2, 3, 4],
      breakdown: [`Five ${dice[0]}s – instant win`],
      instantWin: true,
    };
  }

  // --- 2 & 3. Straights (only with exactly 5 dice) ---
  if (n === 5) {
    const sorted = [...dice].sort((a, b) => a - b);
    const isLowStraight =
      sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3 &&
      sorted[3] === 4 && sorted[4] === 5;
    const isHighStraight =
      sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 4 &&
      sorted[3] === 5 && sorted[4] === 6;

    if (isLowStraight || isHighStraight) {
      return {
        score: 500,
        scoringDiceIndices: [0, 1, 2, 3, 4],
        breakdown: [`Straight ${sorted.join('-')} – 500`],
        instantWin: false,
      };
    }
  }

  // Count occurrences per face value, tracking indices
  const faceIndices = {}; // face -> [index, ...]
  for (let i = 0; i < n; i++) {
    const face = dice[i];
    if (!faceIndices[face]) faceIndices[face] = [];
    faceIndices[face].push(i);
  }

  // --- 4 & 5. 3-of-a-kind ---
  for (const [faceStr, indices] of Object.entries(faceIndices)) {
    const face = Number(faceStr);
    if (indices.length >= 3) {
      // Mark the first 3 as used
      used[indices[0]] = true;
      used[indices[1]] = true;
      used[indices[2]] = true;

      const tripleScore = face === 1 ? 1000 : face * 100;
      score += tripleScore;
      breakdown.push(`Three ${face}s – ${tripleScore}`);
    }
  }

  // --- 6 & 7. Individual 1s and 5s (not already used in a triple) ---
  for (let i = 0; i < n; i++) {
    if (!used[i]) {
      if (dice[i] === 1) {
        score += 100;
        used[i] = true;
        breakdown.push(`Single 1 – 100`);
      } else if (dice[i] === 5) {
        score += 50;
        used[i] = true;
        breakdown.push(`Single 5 – 50`);
      }
    }
  }

  const scoringDiceIndices = used
    .map((u, i) => (u ? i : -1))
    .filter(i => i !== -1);

  return { score, scoringDiceIndices, breakdown, instantWin };
}
