# Slice n' Dice

A fast-paced local multiplayer dice game where 2–6 players race to reach exactly **10,000 points**. Built with React — no backend, no accounts, just pass the device and play.

## How to Play

Players take turns rolling **5 dice** and deciding whether to bank their points or push their luck with another roll.

### Scoring

| Combination | Points |
|---|---|
| Single 1 | 100 |
| Single 5 | 50 |
| Three of a kind (1s) | 1,000 |
| Three of a kind (X) | X &times; 100 |
| Straight (1-2-3-4-5) | 500 |
| Straight (2-3-4-5-6) | 500 |
| Five of a kind | **Instant win** |

### Rules

- **Opening threshold** — Your first scoring turn must total at least **750 points** before you can bank
- **Bust** — If a roll scores zero points, you lose all unbanked points for that turn
- **Exact finish** — You must land on exactly 10,000. Going over is a bust
- **Full ranking** — The game continues after the first player wins until all players finish or bust out

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+

### Installation

```bash
git clone https://github.com/your-username/slice-n-dice.git
cd slice-n-dice
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing

```bash
npm test
```

58 tests covering the scoring engine and game reducer.

### Build

```bash
npm run build
npm run preview
```

## Tech Stack

- **React 19** — UI with `useReducer` for game state management
- **Vite** — Build tool and dev server
- **Vitest** — Unit testing
- **CSS Modules** — Scoped component styles
- **Workbox** (via `vite-plugin-pwa`) — Service worker for offline play

## Features

- Installable as a PWA — works fully offline
- Dice roll animations with staggered timing
- Confetti celebration when a player hits 10,000
- Live scoreboard with progress bars
- Responsive layout (sidebar on desktop, top strip on mobile)
- Auto-save at opening threshold and exact 10K finish

## Deployment

The project is ready to deploy on [Vercel](https://vercel.com). Connect your GitHub repo and it will auto-detect the Vite config — no additional setup needed.

## Project Structure

```
src/
├── game/
│   ├── constants.js        # Game constants (10K, 750 threshold, 5 dice)
│   ├── scoring.js          # Pure scoring engine
│   ├── scoring.test.js     # Scoring tests
│   ├── reducer.js          # Game state reducer
│   └── reducer.test.js     # Reducer tests
├── components/
│   ├── Die.jsx             # Single die with pip layout
│   ├── DiceArea.jsx        # Current throw + set-aside dice
│   ├── Sidebar.jsx         # Scoreboard with rankings
│   ├── ScoreDisplay.jsx    # Global + turn score
│   ├── ThrowBreakdown.jsx  # Point calculation breakdown
│   └── ActionBar.jsx       # Roll / Save buttons
├── screens/
│   ├── SetupScreen.jsx     # Player name entry
│   ├── GameScreen.jsx      # Main game loop
│   └── ResultsScreen.jsx   # Final rankings
└── App.jsx                 # Screen routing
```

## License

ISC
