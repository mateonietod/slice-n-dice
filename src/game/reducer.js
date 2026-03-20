import { evaluateThrow } from './scoring.js';
import { WINNING_SCORE, TOTAL_DICE } from './constants.js';

/**
 * Returns a fresh turn state with all defaults.
 */
export function resetTurnState() {
  return {
    turnScore: 0,
    currentThrow: [],
    setAsideDice: [],
    availableDiceCount: TOTAL_DICE,
    phase: 'ready',
    throwResult: null,
  };
}

/**
 * Creates the initial game state given an array of player name strings.
 */
export function createInitialState(playerNames) {
  return {
    players: playerNames.map(name => ({
      name,
      globalScore: 0,
      rank: null,
      finished: false,
    })),
    currentPlayerIndex: 0,
    turnState: resetTurnState(),
    finishedCount: 0,
    gameOver: false,
  };
}

/**
 * Finds the next non-finished player index, wrapping around.
 * Resets turn state on the returned state.
 */
export function advanceToNextPlayer(state) {
  const { players, currentPlayerIndex } = state;
  const n = players.length;
  let nextIndex = (currentPlayerIndex + 1) % n;

  // Skip finished players
  let attempts = 0;
  while (players[nextIndex].finished && attempts < n) {
    nextIndex = (nextIndex + 1) % n;
    attempts++;
  }

  return {
    ...state,
    currentPlayerIndex: nextIndex,
    turnState: resetTurnState(),
  };
}

/**
 * Main game reducer. Handles all game actions.
 */
export function gameReducer(state, action) {
  switch (action.type) {
    case 'ROLL_DICE': {
      const { diceValues } = action;
      const throwResult = evaluateThrow(diceValues);

      // --- Instant win: 5-of-a-kind ---
      if (throwResult.instantWin) {
        let newFinishedCount = state.finishedCount + 1;
        const newRank = newFinishedCount;
        const updatedPlayers = state.players.map((p, i) =>
          i === state.currentPlayerIndex
            ? { ...p, finished: true, rank: newRank }
            : p
        );

        // Count unfinished players after this finish
        const unfinishedCount = updatedPlayers.filter(p => !p.finished).length;

        let finalPlayers = updatedPlayers;
        let gameOver = false;

        if (unfinishedCount <= 1) {
          // Auto-rank remaining unfinished player(s)
          newFinishedCount += unfinishedCount;
          finalPlayers = updatedPlayers.map(p =>
            !p.finished
              ? { ...p, finished: true, rank: newFinishedCount }
              : p
          );
          gameOver = true;
        }

        const nextState = advanceToNextPlayer({
          ...state,
          players: finalPlayers,
          finishedCount: newFinishedCount,
          gameOver,
        });

        return nextState;
      }

      // --- Bust: score is 0 ---
      if (throwResult.score === 0) {
        return {
          ...state,
          turnState: {
            ...state.turnState,
            turnScore: 0,
            currentThrow: diceValues,
            throwResult,
            phase: 'bust',
          },
        };
      }

      // --- Check if global + turn + new score would exceed 10000 ---
      const currentPlayer = state.players[state.currentPlayerIndex];
      const newTurnScore = state.turnState.turnScore + throwResult.score;
      if (currentPlayer.globalScore + newTurnScore > WINNING_SCORE) {
        return {
          ...state,
          turnState: {
            ...state.turnState,
            turnScore: 0,
            currentThrow: diceValues,
            throwResult,
            phase: 'bust',
          },
        };
      }

      // --- Normal scoring throw ---
      const scoringDiceCount = throwResult.scoringDiceIndices.length;
      const prevAvailable = state.turnState.availableDiceCount;
      let newAvailable = prevAvailable - scoringDiceCount;

      // Reset dice count when all dice have been used
      if (newAvailable <= 0) {
        newAvailable = TOTAL_DICE;
      }

      return {
        ...state,
        turnState: {
          ...state.turnState,
          turnScore: newTurnScore,
          currentThrow: diceValues,
          setAsideDice: [
            ...state.turnState.setAsideDice,
            throwResult.scoringDiceIndices.map(i => diceValues[i]),
          ],
          availableDiceCount: newAvailable,
          phase: 'deciding',
          throwResult,
        },
      };
    }

    case 'CONTINUE_ROLL': {
      return {
        ...state,
        turnState: {
          ...state.turnState,
          phase: 'ready',
        },
      };
    }

    case 'SAVE_TURN': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const newGlobalScore = currentPlayer.globalScore + state.turnState.turnScore;

      let updatedPlayer = { ...currentPlayer, globalScore: newGlobalScore };
      let newFinishedCount = state.finishedCount;
      let gameOver = state.gameOver;

      // Check if player reached exactly WINNING_SCORE
      if (newGlobalScore === WINNING_SCORE) {
        newFinishedCount += 1;
        updatedPlayer = { ...updatedPlayer, finished: true, rank: newFinishedCount };
      }

      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? updatedPlayer : p
      );

      // Check if game should end (1 or 0 unfinished players remain)
      const unfinishedCount = updatedPlayers.filter(p => !p.finished).length;
      let finalPlayers = updatedPlayers;

      if (unfinishedCount <= 1) {
        // Auto-rank remaining unfinished player(s)
        if (unfinishedCount === 1) {
          newFinishedCount += 1;
          finalPlayers = updatedPlayers.map(p =>
            !p.finished
              ? { ...p, finished: true, rank: newFinishedCount }
              : p
          );
        }
        gameOver = true;
      }

      const nextState = advanceToNextPlayer({
        ...state,
        players: finalPlayers,
        finishedCount: newFinishedCount,
        gameOver,
      });

      return nextState;
    }

    case 'END_BUST_TURN': {
      return advanceToNextPlayer(state);
    }

    default:
      return state;
  }
}
