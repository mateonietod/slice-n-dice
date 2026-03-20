import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer, resetTurnState, advanceToNextPlayer } from './reducer.js';
import { WINNING_SCORE } from './constants.js';

// ─── createInitialState ──────────────────────────────────────────────────────

describe('createInitialState', () => {
  it('creates state with correct player data for two players', () => {
    const state = createInitialState(['Alice', 'Bob']);
    expect(state.players).toHaveLength(2);
    expect(state.players[0]).toEqual({ name: 'Alice', globalScore: 0, rank: null, finished: false });
    expect(state.players[1]).toEqual({ name: 'Bob', globalScore: 0, rank: null, finished: false });
  });

  it('sets currentPlayerIndex to 0', () => {
    const state = createInitialState(['Alice', 'Bob']);
    expect(state.currentPlayerIndex).toBe(0);
  });

  it('initialises turnState with correct defaults', () => {
    const state = createInitialState(['Alice']);
    expect(state.turnState).toEqual({
      turnScore: 0,
      currentThrow: [],
      setAsideDice: [],
      availableDiceCount: 5,
      phase: 'ready',
      throwResult: null,
    });
  });

  it('sets finishedCount to 0 and gameOver to false', () => {
    const state = createInitialState(['Alice', 'Bob']);
    expect(state.finishedCount).toBe(0);
    expect(state.gameOver).toBe(false);
  });
});

// ─── ROLL_DICE ───────────────────────────────────────────────────────────────

describe('ROLL_DICE', () => {
  it('transitions to deciding phase when throw has value', () => {
    const state = createInitialState(['Alice']);
    const next = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 2, 3, 4, 6] });
    // [1] scores 100, others bust — still has scoring dice
    expect(next.turnState.phase).toBe('deciding');
  });

  it('transitions to bust phase when throw has no scoring value', () => {
    const state = createInitialState(['Alice']);
    const next = gameReducer(state, { type: 'ROLL_DICE', diceValues: [2, 3, 4, 6, 2] });
    expect(next.turnState.phase).toBe('bust');
  });

  it('zeros turn score on bust', () => {
    // Pre-accumulate some score then bust
    const state = createInitialState(['Alice']);
    const after1 = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 2, 3, 4, 6] }); // 100
    const continued = gameReducer(after1, { type: 'CONTINUE_ROLL' });
    const after2 = gameReducer(continued, { type: 'ROLL_DICE', diceValues: [2, 3, 4, 6, 2] }); // bust
    expect(after2.turnState.turnScore).toBe(0);
    expect(after2.turnState.phase).toBe('bust');
  });

  it('reduces available dice by number of scoring dice', () => {
    const state = createInitialState(['Alice']);
    // [1, 2, 3, 4, 6] — 1 scores (1 scoring die)
    const next = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 2, 3, 4, 6] });
    expect(next.turnState.availableDiceCount).toBe(4);
  });

  it('accumulates turn score across throws with CONTINUE_ROLL in between', () => {
    const state = createInitialState(['Alice']);
    // First throw: [1, 2, 3, 4, 6] → score 100
    const after1 = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 2, 3, 4, 6] });
    expect(after1.turnState.turnScore).toBe(100);

    const cont = gameReducer(after1, { type: 'CONTINUE_ROLL' });
    // Second throw with 4 dice: [5, 2, 3, 4] → score 50
    const after2 = gameReducer(cont, { type: 'ROLL_DICE', diceValues: [5, 2, 3, 4] });
    expect(after2.turnState.turnScore).toBe(150);
  });

  it('resets to 5 dice when all available dice are used up', () => {
    const state = createInitialState(['Alice']);
    // [1, 1, 1, 1, 5] — all 5 dice score (triple 1s = 1000, fourth 1 = 100, 5 = 50 → 1150)
    const next = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 1, 1, 1, 5] });
    expect(next.turnState.availableDiceCount).toBe(5);
  });

  it('busts if globalScore + turnScore would exceed 10000', () => {
    // Set up a player near 10000
    const state = createInitialState(['Alice']);
    // Manually craft a state where globalScore is 9900
    const highState = {
      ...state,
      players: [{ name: 'Alice', globalScore: 9900, rank: null, finished: false }],
      turnState: { ...state.turnState, turnScore: 200 },
    };
    // Rolling something that scores (e.g. [1]) — 9900 + 200 + 100 = 10200 > 10000 → bust
    const next = gameReducer(highState, { type: 'ROLL_DICE', diceValues: [1, 2, 3, 4, 6] });
    expect(next.turnState.phase).toBe('bust');
    expect(next.turnState.turnScore).toBe(0);
  });

  it('instant win with 5-of-a-kind marks player finished and ends game for 1 player', () => {
    const state = createInitialState(['Alice']);
    const next = gameReducer(state, { type: 'ROLL_DICE', diceValues: [3, 3, 3, 3, 3] });
    expect(next.players[0].finished).toBe(true);
    expect(next.players[0].rank).toBe(1);
    expect(next.gameOver).toBe(true);
  });

  it('instant win with 5-of-a-kind in a 2-player game advances to next player', () => {
    const state = createInitialState(['Alice', 'Bob']);
    const next = gameReducer(state, { type: 'ROLL_DICE', diceValues: [3, 3, 3, 3, 3] });
    expect(next.players[0].finished).toBe(true);
    expect(next.players[0].rank).toBe(1);
    // Only 1 player left (Bob) so game is over
    expect(next.gameOver).toBe(true);
    expect(next.players[1].rank).toBe(2);
  });

  it('stores throwResult on the turn state', () => {
    const state = createInitialState(['Alice']);
    const next = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 2, 3, 4, 6] });
    expect(next.turnState.throwResult).not.toBeNull();
    expect(next.turnState.throwResult).toHaveProperty('score');
  });

  it('tracks current throw dice values', () => {
    const state = createInitialState(['Alice']);
    const next = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 2, 3, 4, 6] });
    expect(next.turnState.currentThrow).toEqual([1, 2, 3, 4, 6]);
  });
});

// ─── CONTINUE_ROLL ────────────────────────────────────────────────────────────

describe('CONTINUE_ROLL', () => {
  it('sets phase back to ready', () => {
    const state = createInitialState(['Alice']);
    const after1 = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 2, 3, 4, 6] });
    expect(after1.turnState.phase).toBe('deciding');
    const cont = gameReducer(after1, { type: 'CONTINUE_ROLL' });
    expect(cont.turnState.phase).toBe('ready');
  });

  it('preserves turn score and available dice count', () => {
    const state = createInitialState(['Alice']);
    const after1 = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 2, 3, 4, 6] });
    const cont = gameReducer(after1, { type: 'CONTINUE_ROLL' });
    expect(cont.turnState.turnScore).toBe(100);
    expect(cont.turnState.availableDiceCount).toBe(4);
  });
});

// ─── SAVE_TURN ────────────────────────────────────────────────────────────────

describe('SAVE_TURN', () => {
  it('adds turn score to global score', () => {
    const state = createInitialState(['Alice', 'Bob']);
    const afterRoll = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 1, 1, 2, 3] }); // 1000
    const afterSave = gameReducer(afterRoll, { type: 'SAVE_TURN' });
    expect(afterSave.players[0].globalScore).toBe(1000);
  });

  it('advances to next player after saving', () => {
    const state = createInitialState(['Alice', 'Bob']);
    const afterRoll = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 2, 3, 4, 6] }); // 100
    const afterSave = gameReducer(afterRoll, { type: 'SAVE_TURN' });
    expect(afterSave.currentPlayerIndex).toBe(1);
  });

  it('resets turn state after saving', () => {
    const state = createInitialState(['Alice', 'Bob']);
    const afterRoll = gameReducer(state, { type: 'ROLL_DICE', diceValues: [1, 2, 3, 4, 6] }); // 100
    const afterSave = gameReducer(afterRoll, { type: 'SAVE_TURN' });
    expect(afterSave.turnState.turnScore).toBe(0);
    expect(afterSave.turnState.phase).toBe('ready');
    expect(afterSave.turnState.availableDiceCount).toBe(5);
  });

  it('marks player as finished at exactly 10000', () => {
    const state = createInitialState(['Alice', 'Bob', 'Carol']);
    const nearWin = {
      ...state,
      players: [
        { name: 'Alice', globalScore: 9000, rank: null, finished: false },
        { name: 'Bob', globalScore: 3000, rank: null, finished: false },
        { name: 'Carol', globalScore: 2000, rank: null, finished: false },
      ],
      turnState: { ...state.turnState, turnScore: 1000 },
    };
    const afterSave = gameReducer(nearWin, { type: 'SAVE_TURN' });
    expect(afterSave.players[0].globalScore).toBe(10000);
    expect(afterSave.players[0].finished).toBe(true);
    expect(afterSave.players[0].rank).toBe(1);
    expect(afterSave.finishedCount).toBe(1);
    expect(afterSave.gameOver).toBe(false);
  });

  it('ends game when second-to-last player finishes (auto-ranks last player)', () => {
    const state = createInitialState(['Alice', 'Bob']);
    // Bob is already finished
    const bobDone = {
      ...state,
      players: [
        { name: 'Alice', globalScore: 9000, rank: null, finished: false },
        { name: 'Bob', globalScore: 8000, rank: 1, finished: true },
      ],
      finishedCount: 1,
      turnState: { ...state.turnState, turnScore: 1000 },
    };
    const afterSave = gameReducer(bobDone, { type: 'SAVE_TURN' });
    expect(afterSave.players[0].finished).toBe(true);
    expect(afterSave.players[0].rank).toBe(2);
    expect(afterSave.gameOver).toBe(true);
  });

  it('ends game in 3-player scenario when 1 player remains (auto-ranks last)', () => {
    const state = createInitialState(['Alice', 'Bob', 'Carol']);
    // Bob already finished (rank 1). Alice is about to finish. Carol is still playing.
    const setup = {
      ...state,
      players: [
        { name: 'Alice', globalScore: 9000, rank: null, finished: false },
        { name: 'Bob', globalScore: 10000, rank: 1, finished: true },
        { name: 'Carol', globalScore: 5000, rank: null, finished: false },
      ],
      currentPlayerIndex: 0,
      finishedCount: 1,
      turnState: { ...state.turnState, turnScore: 1000 },
    };
    const afterSave = gameReducer(setup, { type: 'SAVE_TURN' });
    // Alice finishes (rank 2), Carol auto-ranked last (rank 3), game over
    expect(afterSave.players[0].finished).toBe(true);
    expect(afterSave.players[0].rank).toBe(2);
    expect(afterSave.players[2].finished).toBe(true);
    expect(afterSave.players[2].rank).toBe(3);
    expect(afterSave.gameOver).toBe(true);
  });

  it('skips finished players in turn rotation', () => {
    const state = createInitialState(['Alice', 'Bob', 'Carol']);
    // Bob (index 1) is finished
    const bobDone = {
      ...state,
      players: [
        { name: 'Alice', globalScore: 0, rank: null, finished: false },
        { name: 'Bob', globalScore: 8000, rank: 1, finished: true },
        { name: 'Carol', globalScore: 0, rank: null, finished: false },
      ],
      currentPlayerIndex: 0,
      finishedCount: 1,
      turnState: { ...state.turnState, turnScore: 500 },
    };
    const afterSave = gameReducer(bobDone, { type: 'SAVE_TURN' });
    // Should skip Bob (finished) and go to Carol (index 2)
    expect(afterSave.currentPlayerIndex).toBe(2);
  });
});

// ─── END_BUST_TURN ───────────────────────────────────────────────────────────

describe('END_BUST_TURN', () => {
  it('advances to next player after bust', () => {
    const state = createInitialState(['Alice', 'Bob']);
    const afterRoll = gameReducer(state, { type: 'ROLL_DICE', diceValues: [2, 3, 4, 6, 2] }); // bust
    expect(afterRoll.turnState.phase).toBe('bust');
    const afterBust = gameReducer(afterRoll, { type: 'END_BUST_TURN' });
    expect(afterBust.currentPlayerIndex).toBe(1);
  });

  it('resets turn state after bust', () => {
    const state = createInitialState(['Alice', 'Bob']);
    const afterRoll = gameReducer(state, { type: 'ROLL_DICE', diceValues: [2, 3, 4, 6, 2] }); // bust
    const afterBust = gameReducer(afterRoll, { type: 'END_BUST_TURN' });
    expect(afterBust.turnState.phase).toBe('ready');
    expect(afterBust.turnState.turnScore).toBe(0);
    expect(afterBust.turnState.availableDiceCount).toBe(5);
  });

  it('wraps around to player 0 from last player', () => {
    const state = createInitialState(['Alice', 'Bob']);
    const atBob = { ...state, currentPlayerIndex: 1 };
    const afterRoll = gameReducer(atBob, { type: 'ROLL_DICE', diceValues: [2, 3, 4, 6, 2] }); // bust
    const afterBust = gameReducer(afterRoll, { type: 'END_BUST_TURN' });
    expect(afterBust.currentPlayerIndex).toBe(0);
  });
});

// ─── resetTurnState helper ────────────────────────────────────────────────────

describe('resetTurnState', () => {
  it('returns fresh default turn state', () => {
    const fresh = resetTurnState();
    expect(fresh).toEqual({
      turnScore: 0,
      currentThrow: [],
      setAsideDice: [],
      availableDiceCount: 5,
      phase: 'ready',
      throwResult: null,
    });
  });
});
