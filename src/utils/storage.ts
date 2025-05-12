export function getStreak(): number {
  return Number(localStorage.getItem('streak') || 0);
}

export function setStreak(streak: number) {
  localStorage.setItem('streak', String(streak));
}

export function getHistory(): { date: string; word: string }[] {
  try {
    return JSON.parse(localStorage.getItem('history') || '[]');
  } catch {
    return [];
  }
}

export function addHistory(date: string, word: string) {
  const history = getHistory();
  history.push({ date, word });
  localStorage.setItem('history', JSON.stringify(history));
} 