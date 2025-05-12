import React from 'react';

type Feedback = 'correct' | 'present' | 'absent';

interface KeyboardProps {
  onKey: (key: string) => void;
  usedKeys: { [letter: string]: Feedback };
  disabled?: boolean;
}

const KEYS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

export const Keyboard: React.FC<KeyboardProps> = ({ onKey, usedKeys, disabled }) => (
  <div className="keyboard">
    {KEYS.map((row, i) => (
      <div className="keyboard-row" key={i}>
        {row.map((key) => (
          <button
            className={`key ${usedKeys[key] || ''}`}
            key={key}
            onClick={() => onKey(key)}
            disabled={disabled}
            tabIndex={0}
            style={{
              minWidth: key === 'ENTER' || key === '⌫' ? 'min(4rem, 12vw)' : undefined
            }}
          >
            {key}
          </button>
        ))}
        {i === 2 && (
          <button
            className="key"
            style={{ minWidth: 'min(8rem, 30vw)' }}
            onClick={() => onKey(' ')}
            disabled={disabled}
            tabIndex={0}
          >
            SPACE
          </button>
        )}
      </div>
    ))}
  </div>
); 