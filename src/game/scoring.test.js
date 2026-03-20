import { describe, it, expect } from 'vitest';
import { evaluateThrow } from './scoring.js';

describe('evaluateThrow - individual 1s and 5s', () => {
  it('single 1 scores 100', () => {
    const result = evaluateThrow([1]);
    expect(result.score).toBe(100);
    expect(result.scoringDiceIndices).toEqual([0]);
  });

  it('single 5 scores 50', () => {
    const result = evaluateThrow([5]);
    expect(result.score).toBe(50);
    expect(result.scoringDiceIndices).toEqual([0]);
  });

  it('a 1 and a 5 together scores 150', () => {
    const result = evaluateThrow([1, 5]);
    expect(result.score).toBe(150);
    expect(result.scoringDiceIndices).toEqual([0, 1]);
  });

  it('no scoring dice returns 0 (bust)', () => {
    const result = evaluateThrow([2, 3, 4, 6]);
    expect(result.score).toBe(0);
    expect(result.scoringDiceIndices).toEqual([]);
  });

  it('two 1s = 200', () => {
    const result = evaluateThrow([1, 1]);
    expect(result.score).toBe(200);
    expect(result.scoringDiceIndices).toEqual([0, 1]);
  });

  it('two 1s and a 5 = 250', () => {
    const result = evaluateThrow([1, 1, 5]);
    expect(result.score).toBe(250);
    expect(result.scoringDiceIndices).toEqual([0, 1, 2]);
  });
});

describe('evaluateThrow - 3-of-a-kind', () => {
  it('three 1s = 1000', () => {
    const result = evaluateThrow([1, 1, 1]);
    expect(result.score).toBe(1000);
    expect(result.scoringDiceIndices).toEqual([0, 1, 2]);
  });

  it('three 2s = 200', () => {
    const result = evaluateThrow([2, 2, 2]);
    expect(result.score).toBe(200);
    expect(result.scoringDiceIndices).toEqual([0, 1, 2]);
  });

  it('three 5s = 500', () => {
    const result = evaluateThrow([5, 5, 5]);
    expect(result.score).toBe(500);
    expect(result.scoringDiceIndices).toEqual([0, 1, 2]);
  });

  it('three 6s = 600', () => {
    const result = evaluateThrow([6, 6, 6]);
    expect(result.score).toBe(600);
    expect(result.scoringDiceIndices).toEqual([0, 1, 2]);
  });

  it('5-5-5-1-3 = 600 (triple 5s + individual 1)', () => {
    const result = evaluateThrow([5, 5, 5, 1, 3]);
    expect(result.score).toBe(600);
    expect(result.scoringDiceIndices).toContain(0);
    expect(result.scoringDiceIndices).toContain(1);
    expect(result.scoringDiceIndices).toContain(2);
    expect(result.scoringDiceIndices).toContain(3);
    expect(result.scoringDiceIndices).not.toContain(4);
  });

  it('1-1-1-5-2 = 1050 (triple 1s + individual 5)', () => {
    const result = evaluateThrow([1, 1, 1, 5, 2]);
    expect(result.score).toBe(1050);
    expect(result.scoringDiceIndices).toContain(0);
    expect(result.scoringDiceIndices).toContain(1);
    expect(result.scoringDiceIndices).toContain(2);
    expect(result.scoringDiceIndices).toContain(3);
    expect(result.scoringDiceIndices).not.toContain(4);
  });

  it('3-3-3-5-1 = 450 (triple 3s + individual 5 + individual 1)', () => {
    const result = evaluateThrow([3, 3, 3, 5, 1]);
    expect(result.score).toBe(450);
    expect(result.scoringDiceIndices).toContain(0);
    expect(result.scoringDiceIndices).toContain(1);
    expect(result.scoringDiceIndices).toContain(2);
    expect(result.scoringDiceIndices).toContain(3);
    expect(result.scoringDiceIndices).toContain(4);
  });
});

describe('evaluateThrow - straights', () => {
  it('1-2-3-4-5 = 500 (straight, all 5 dice score)', () => {
    const result = evaluateThrow([1, 2, 3, 4, 5]);
    expect(result.score).toBe(500);
    expect(result.scoringDiceIndices).toEqual([0, 1, 2, 3, 4]);
  });

  it('2-3-4-5-6 = 500 (straight, all 5 dice score)', () => {
    const result = evaluateThrow([2, 3, 4, 5, 6]);
    expect(result.score).toBe(500);
    expect(result.scoringDiceIndices).toEqual([0, 1, 2, 3, 4]);
  });

  it('5-6-1-2-3 is NOT a straight (no modular wrap) → scores 150', () => {
    const result = evaluateThrow([5, 6, 1, 2, 3]);
    expect(result.score).toBe(150);
  });

  it('fewer than 5 dice cannot be a straight (3-dice input)', () => {
    const result = evaluateThrow([1, 2, 3]);
    expect(result.score).toBe(100); // only the 1 scores
    expect(result.scoringDiceIndices).toEqual([0]);
  });
});

describe('evaluateThrow - 5-of-a-kind', () => {
  it('five 3s = instantWin: true', () => {
    const result = evaluateThrow([3, 3, 3, 3, 3]);
    expect(result.instantWin).toBe(true);
    expect(result.scoringDiceIndices).toEqual([0, 1, 2, 3, 4]);
  });

  it('five 1s = instantWin: true', () => {
    const result = evaluateThrow([1, 1, 1, 1, 1]);
    expect(result.instantWin).toBe(true);
    expect(result.scoringDiceIndices).toEqual([0, 1, 2, 3, 4]);
  });

  it('fewer than 5 dice cannot be 5-of-a-kind', () => {
    const result = evaluateThrow([3, 3, 3, 3]);
    expect(result.instantWin).toBe(false);
  });
});

describe('evaluateThrow - four-of-a-kind (edge cases)', () => {
  it('four 1s (1-1-1-1-2) = 1100 (triple 1s + individual 1)', () => {
    const result = evaluateThrow([1, 1, 1, 1, 2]);
    expect(result.score).toBe(1100);
    expect(result.scoringDiceIndices).toContain(0);
    expect(result.scoringDiceIndices).toContain(1);
    expect(result.scoringDiceIndices).toContain(2);
    expect(result.scoringDiceIndices).toContain(3);
    expect(result.scoringDiceIndices).not.toContain(4);
  });

  it('four 2s (2-2-2-2-6) = 200 (triple 2s, 4th 2 has no individual value)', () => {
    const result = evaluateThrow([2, 2, 2, 2, 6]);
    expect(result.score).toBe(200);
    expect(result.scoringDiceIndices).toContain(0);
    expect(result.scoringDiceIndices).toContain(1);
    expect(result.scoringDiceIndices).toContain(2);
    expect(result.scoringDiceIndices).not.toContain(3);
    expect(result.scoringDiceIndices).not.toContain(4);
  });

  it('four 5s (5-5-5-5-3) = 550 (triple 5s + individual 5)', () => {
    const result = evaluateThrow([5, 5, 5, 5, 3]);
    expect(result.score).toBe(550);
    expect(result.scoringDiceIndices).toContain(0);
    expect(result.scoringDiceIndices).toContain(1);
    expect(result.scoringDiceIndices).toContain(2);
    expect(result.scoringDiceIndices).toContain(3);
    expect(result.scoringDiceIndices).not.toContain(4);
  });
});

describe('evaluateThrow - fewer dice and busts', () => {
  it('1-5-3 = 150', () => {
    const result = evaluateThrow([1, 5, 3]);
    expect(result.score).toBe(150);
  });

  it('3-4 = 0', () => {
    const result = evaluateThrow([3, 4]);
    expect(result.score).toBe(0);
    expect(result.scoringDiceIndices).toEqual([]);
  });

  it('single 5 = 50', () => {
    const result = evaluateThrow([5]);
    expect(result.score).toBe(50);
  });

  it('single 3 = 0', () => {
    const result = evaluateThrow([3]);
    expect(result.score).toBe(0);
    expect(result.scoringDiceIndices).toEqual([]);
  });

  it('4-4-4 = 400 (triple 4s)', () => {
    const result = evaluateThrow([4, 4, 4]);
    expect(result.score).toBe(400);
    expect(result.scoringDiceIndices).toEqual([0, 1, 2]);
  });

  it('full 5-dice bust: 4-3-6-6-2 = 0', () => {
    const result = evaluateThrow([4, 3, 6, 6, 2]);
    expect(result.score).toBe(0);
    expect(result.scoringDiceIndices).toEqual([]);
  });
});

describe('evaluateThrow - return shape', () => {
  it('always returns score, scoringDiceIndices, breakdown, and instantWin', () => {
    const result = evaluateThrow([1]);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('scoringDiceIndices');
    expect(result).toHaveProperty('breakdown');
    expect(result).toHaveProperty('instantWin');
    expect(Array.isArray(result.scoringDiceIndices)).toBe(true);
    expect(Array.isArray(result.breakdown)).toBe(true);
    expect(typeof result.instantWin).toBe('boolean');
  });
});
