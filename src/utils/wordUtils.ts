import words from '../../words.json';

export type Feedback = 'correct' | 'present' | 'absent';
export interface WordEntry {
  word: string;
  definition: string;
  length: number;
}

export function normalize(str: string) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase();
}

// Deterministic daily word selection
export function getDailyWord(date: Date, wordList: WordEntry[] = words as WordEntry[]): WordEntry {
  const daySeed = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const idx = daySeed % wordList.length;
  return wordList[idx];
}

// Feedback for a guess
export function getFeedback(guess: string, solution: string): Feedback[] {
  const result: Feedback[] = Array(solution.length).fill('absent');
  const solArr = solution.split('');
  const guessArr = guess.split('');
  const used = Array(solution.length).fill(false);

  // First pass: correct
  for (let i = 0; i < solArr.length; i++) {
    if (guessArr[i] === solArr[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }
  // Second pass: present
  for (let i = 0; i < solArr.length; i++) {
    if (result[i] === 'correct') continue;
    const idx = solArr.findIndex((c, j) => !used[j] && guessArr[i] === c);
    if (idx !== -1) {
      result[i] = 'present';
      used[idx] = true;
    }
  }
  return result;
} 