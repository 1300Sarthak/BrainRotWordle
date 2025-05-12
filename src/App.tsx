import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { GameBoard } from './components/GameBoard';
import { Keyboard } from './components/Keyboard';
import { Toast } from './components/Toast';
import { WordList } from './components/WordList';
import { getFeedback, normalize, type WordEntry, type Feedback } from './utils/wordUtils';
import { getHistory, addHistory } from './utils/storage';
import words from '../words.json';

const MAX_GUESSES = 6;
const TOASTS = [
  'Not quite!',
  'Try again!',
  'Keep going!',
  'You got this!',
  'Almost there!',
];

function getTodayDateStr() {
  return new Date().toISOString().slice(0, 10);
}
function getWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1)/7);
}

type Streaks = {
  daily: number;
  weekly: number;
  allTime: number;
  lastDay: string;
  lastWeek: number;
};

function getStreaks(): Streaks {
  const streaks = JSON.parse(localStorage.getItem('streaks') || '{}');
  return {
    daily: streaks.daily || 0,
    weekly: streaks.weekly || 0,
    allTime: streaks.allTime || 0,
    lastDay: streaks.lastDay || '',
    lastWeek: streaks.lastWeek || 0,
  };
}
function setStreaks(streaks: Streaks) {
  localStorage.setItem('streaks', JSON.stringify(streaks));
}

function App() {
  const [currentWord, setCurrentWord] = useState<WordEntry>(() => {
    const wordList = words as WordEntry[];
    return wordList[Math.floor(Math.random() * wordList.length)];
  });
  const [guesses, setGuesses] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [usedKeys, setUsedKeys] = useState<{ [k: string]: Feedback }>({});
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [showWordList, setShowWordList] = useState(false);
  const [streaks, setStreaksState] = useState(() => getStreaks());
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [history, setHistory] = useState<{ word: string; definition: string }[]>([]);

  const resetGame = useCallback(() => {
    const randomWord = words[Math.floor(Math.random() * words.length)] as WordEntry;
    setCurrentWord(randomWord);
    setGuesses([]);
    setFeedback([]);
    setCurrentGuess('');
    setUsedKeys({});
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    // Load history for word list modal
    setHistory(
      getHistory().map(h => {
        const entry = (words as WordEntry[]).find(w => normalize(w.word) === normalize(h.word));
        return entry ? { word: entry.word, definition: entry.definition } : { word: h.word, definition: '' };
      })
    );
  }, [showWordList]);

  const updateStreaks = useCallback((won: boolean) => {
    const today = getTodayDateStr();
    const thisWeek = getWeekNumber();
    let { daily, weekly, allTime, lastDay, lastWeek } = getStreaks();
    // Daily streak
    if (won) {
      if (lastDay === today) {
        // Already played today
      } else if (lastDay && new Date(today) > new Date(lastDay)) {
        const prev = new Date(lastDay);
        prev.setDate(prev.getDate() + 1);
        if (prev.toISOString().slice(0, 10) === today) {
          daily += 1;
        } else {
          daily = 1;
        }
      } else {
        daily = 1;
      }
      lastDay = today;
      // Weekly streak
      if (lastWeek === thisWeek - 1) {
        weekly += 1;
      } else if (lastWeek === thisWeek) {
        // Already played this week
      } else {
        weekly = 1;
      }
      lastWeek = thisWeek;
      // All time streak
      allTime += 1;
    } else {
      daily = 0;
      weekly = 0;
    }
    const newStreaks = { daily, weekly, allTime, lastDay, lastWeek };
    setStreaks(newStreaks);
    setStreaksState(newStreaks);
  }, []);

  const handleKey = useCallback((key: string) => {
    if (gameOver) return;
    if (key === 'ENTER') {
      if (currentGuess.length !== currentWord.word.length) {
        setToast({ message: `Guess must be ${currentWord.word.length} chars`, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 1200);
        return;
      }
      const guessNorm = normalize(currentGuess);
      const solutionNorm = normalize(currentWord.word);
      const fb = getFeedback(guessNorm, solutionNorm);
      setGuesses(g => [...g, currentGuess]);
      setFeedback(f => [...f, fb]);
      setUsedKeys(prev => {
        const next = { ...prev };
        for (let i = 0; i < guessNorm.length; i++) {
          const letter = guessNorm[i];
          if (fb[i] === 'correct') next[letter] = 'correct';
          else if (fb[i] === 'present' && next[letter] !== 'correct') next[letter] = 'present';
          else if (fb[i] === 'absent' && !next[letter]) next[letter] = 'absent';
        }
        return next;
      });
      if (guessNorm === solutionNorm) {
        setGameOver(true);
        setWon(true);
        setToast({ message: 'You won!', visible: true });
        updateStreaks(true);
        addHistory(new Date().toISOString().slice(0, 10), currentWord.word);
        return;
      }
      if (guesses.length + 1 >= MAX_GUESSES) {
        setGameOver(true);
        setWon(false);
        setToast({ message: `The word was: ${currentWord.word}`, visible: true });
        updateStreaks(false);
        addHistory(new Date().toISOString().slice(0, 10), currentWord.word);
        return;
      }
      setToast({ message: TOASTS[Math.floor(Math.random() * TOASTS.length)], visible: true });
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 1200);
      setCurrentGuess('');
    } else if (key === '⌫') {
      setCurrentGuess(g => g.slice(0, -1));
    } else if ((/^[A-Z]$/.test(key) || key === ' ') && currentGuess.length < currentWord.word.length) {
      setCurrentGuess(g => g + key);
    }
  }, [currentGuess, currentWord.word, gameOver, guesses.length, updateStreaks]);

  // Keyboard/typing support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z ]$/.test(key)) {
        handleKey(key === 'BACKSPACE' ? '⌫' : e.key === ' ' ? ' ' : key);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  // Share feature
  const handleShare = () => {
    const emojiMap = { correct: '🟩', present: '🟨', absent: '⬛' };
    const rows = feedback.map(row => row.map(cell => emojiMap[cell as keyof typeof emojiMap]).join('')).join('\n');
    const shareText = `Brainrotted Wordle\n${rows}\n${won ? 'Streak: ' + streaks.allTime : 'Try again!'}`;
    navigator.clipboard.writeText(shareText);
    setToast({ message: 'Copied to clipboard!', visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 1200);
  };

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      <h1>Brainrotted Wordle</h1>
      <div className="streaks" style={{ marginBottom: 12 }}>
        <span style={{ marginRight: 16 }}>Daily Streak: <span style={{ color: 'var(--correct)', fontWeight: 700 }}>{streaks.daily}</span></span>
        <span style={{ marginRight: 16 }}>Weekly Streak: <span style={{ color: 'var(--present)', fontWeight: 700 }}>{streaks.weekly}</span></span>
        <span>All-Time Streak: <span style={{ color: 'var(--absent)', fontWeight: 700 }}>{streaks.allTime}</span></span>
      </div>
      <GameBoard
        guesses={guesses}
        solution={currentWord.word}
        feedback={feedback}
        currentGuess={currentGuess}
        maxGuesses={MAX_GUESSES}
      />
      <div className="keyboard-container">
        <Keyboard onKey={handleKey} usedKeys={usedKeys} disabled={gameOver} />
      </div>
      <div className="button-container">
        <button onClick={handleShare} className="share-btn">Share</button>
        <button onClick={() => setShowWordList(true)} className="wordlist-btn">Word List</button>
        <button onClick={resetGame} className="next-word-btn">Diff Word</button>
        {gameOver && (
          <button onClick={resetGame} className="next-word-btn">Next Word</button>
        )}
      </div>
      <div className="hint">
        <b>Hint:</b> {currentWord.definition}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
      <WordList words={history} open={showWordList} onClose={() => setShowWordList(false)} />
      <footer className="footer">
        <a href="https://github.com/1300Sarthak" target="_blank" rel="noopener noreferrer">
          <svg height="20" viewBox="0 0 16 16" width="20" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub
        </a>
        <a href="https://forms.gle/vrbmJm7RQWUz7F1a8" target="_blank" rel="noopener noreferrer"> Click Here to Suggest New Words</a>
        <span>•</span>
        <span>© {new Date().getFullYear()} Brainrotted Wordle - Sarthak Sethi</span>
      </footer>
    </div>
  );
}

export default App;
