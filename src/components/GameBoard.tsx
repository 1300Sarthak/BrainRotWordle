import React from 'react';

type Feedback = 'correct' | 'present' | 'absent';

interface GameBoardProps {
  guesses: string[];
  solution: string;
  feedback: Feedback[][];
  currentGuess: string;
  maxGuesses: number;
}

const MAX_GRID_WIDTH = 14; // Set this to the max word length you want to support

export const GameBoard: React.FC<GameBoardProps> = ({ guesses, solution, feedback, currentGuess, maxGuesses }) => {
  const wordLength = solution.length;
  const totalTiles = MAX_GRID_WIDTH;
  const leftSpacers = Math.floor((totalTiles - wordLength) / 2);
  const rightSpacers = totalTiles - wordLength - leftSpacers;

  // Responsive tile size: shrink if word is long
  const minTileSize = 28; // px
  const maxTileSize = 62; // px
  const gap = 4.8; // px (0.3rem)
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 500;
  const availableWidth = Math.min(screenWidth, 600) * 0.95; // 95vw max
  const tileSize = Math.max(
    minTileSize,
    Math.min(maxTileSize, (availableWidth - gap * (wordLength - 1)) / wordLength)
  );

  return (
    <div
      className="game-board"
      style={{
        '--tile-size': tileSize + 'px',
      } as React.CSSProperties}
    >
      {Array.from({ length: maxGuesses }).map((_, i) => {
        const guess = guesses[i] || (i === guesses.length ? currentGuess : '');
        const rowFeedback = feedback[i] || [];
        return (
          <div className="game-row" key={i}>
            {/* Left spacers */}
            {Array.from({ length: leftSpacers }).map((_, idx) => (
              <div className="tile tile-spacer" key={`left-${idx}`}></div>
            ))}
            {/* Actual tiles */}
            {Array.from({ length: wordLength }).map((_, j) => {
              const char = guess[j] || '';
              const status = rowFeedback[j] || '';
              if (solution[j] === ' ') {
                // Render a special tile for spaces
                return (
                  <div className="tile tile-space" key={j}>&nbsp;</div>
                );
              }
              return (
                <div className={`tile ${status}`} key={j}>{char}</div>
              );
            })}
            {/* Right spacers */}
            {Array.from({ length: rightSpacers }).map((_, idx) => (
              <div className="tile tile-spacer" key={`right-${idx}`}></div>
            ))}
          </div>
        );
      })}
    </div>
  );
}; 