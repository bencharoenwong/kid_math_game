import { useLocalStorage } from './useLocalStorage';

const INITIAL_STATS = {
  totalStars: 0,
  totalScore: 0,
  bestStreak: 0,
  lastPlayed: null,
  totalProblems: 0,
  totalCorrect: 0,
};

const INITIAL_MODE_STATS = {
  addition: { attempted: 0, correct: 0, stars: 0 },
  subtraction: { attempted: 0, correct: 0, stars: 0 },
  skipcount: { attempted: 0, correct: 0, stars: 0 },
  patterns: { attempted: 0, correct: 0, stars: 0 },
  groups: { attempted: 0, correct: 0, stars: 0 },
};

const MAX_SESSIONS = 30;

/**
 * Hook for tracking game statistics with localStorage persistence
 */
export function useStats() {
  const [stats, setStats] = useLocalStorage('mathGame_stats', INITIAL_STATS);
  const [modeStats, setModeStats] = useLocalStorage('mathGame_modeStats', INITIAL_MODE_STATS);
  const [sessions, setSessions] = useLocalStorage('mathGame_sessions', []);

  // Record a problem attempt
  const recordAttempt = (mode, isCorrect, scoreGained, starEarned) => {
    // Update mode-specific stats
    setModeStats(prev => ({
      ...prev,
      [mode]: {
        attempted: prev[mode].attempted + 1,
        correct: prev[mode].correct + (isCorrect ? 1 : 0),
        stars: prev[mode].stars + (starEarned ? 1 : 0),
      },
    }));

    // Update global stats
    setStats(prev => ({
      ...prev,
      totalScore: prev.totalScore + scoreGained,
      totalStars: prev.totalStars + (starEarned ? 1 : 0),
      totalProblems: prev.totalProblems + 1,
      totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
      lastPlayed: new Date().toISOString(),
    }));
  };

  // Update best streak
  const updateBestStreak = (currentStreak) => {
    setStats(prev => ({
      ...prev,
      bestStreak: Math.max(prev.bestStreak, currentStreak),
    }));
  };

  // Save a session summary (called when returning to home)
  const saveSession = (sessionData) => {
    if (sessionData.problems === 0) return;

    const newSession = {
      date: new Date().toISOString(),
      ...sessionData,
    };

    setSessions(prev => {
      const updated = [newSession, ...prev].slice(0, MAX_SESSIONS);
      return updated;
    });
  };

  // Get difficulty level for a mode based on stars earned
  const getDifficulty = (mode) => {
    const modeStars = modeStats[mode]?.stars || 0;
    if (modeStars >= 25) return 'hard';
    if (modeStars >= 10) return 'medium';
    return 'easy';
  };

  // Get accuracy percentage for a mode
  const getModeAccuracy = (mode) => {
    const { attempted, correct } = modeStats[mode] || { attempted: 0, correct: 0 };
    if (attempted === 0) return 0;
    return Math.round((correct / attempted) * 100);
  };

  // Get overall accuracy
  const getOverallAccuracy = () => {
    if (stats.totalProblems === 0) return 0;
    return Math.round((stats.totalCorrect / stats.totalProblems) * 100);
  };

  // Check if returning player
  const isReturningPlayer = () => {
    return stats.lastPlayed !== null;
  };

  // Get time since last play
  const getTimeSinceLastPlay = () => {
    if (!stats.lastPlayed) return null;
    const lastDate = new Date(stats.lastPlayed);
    const now = new Date();
    const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  };

  return {
    stats,
    modeStats,
    sessions,
    recordAttempt,
    updateBestStreak,
    saveSession,
    getDifficulty,
    getModeAccuracy,
    getOverallAccuracy,
    isReturningPlayer,
    getTimeSinceLastPlay,
  };
}
