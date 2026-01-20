import { useLocalStorage } from './useLocalStorage';

const INITIAL_STATS = {
  totalStars: 0,
  totalScore: 0,
  bestStreak: 0,
  lastPlayed: null,
  totalProblems: 0,
  totalCorrect: 0,
  totalTimeSeconds: 0,
  dailyStreak: 0,
  lastPlayDate: null,
};

const INITIAL_MODE_STATS = {
  addition: { attempted: 0, correct: 0, stars: 0 },
  subtraction: { attempted: 0, correct: 0, stars: 0 },
  skipcount: { attempted: 0, correct: 0, stars: 0 },
  patterns: { attempted: 0, correct: 0, stars: 0 },
  groups: { attempted: 0, correct: 0, stars: 0 },
  multiplication: { attempted: 0, correct: 0, stars: 0 },
};

const MAX_SESSIONS = 30;

function getDateString(date = new Date()) {
  return date.toISOString().split('T')[0];
}

function getDaysDiff(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Hook for tracking game statistics with localStorage persistence
 */
export function useStats() {
  const [stats, setStats] = useLocalStorage('mathGame_stats', INITIAL_STATS);
  const [modeStats, setModeStats] = useLocalStorage('mathGame_modeStats', INITIAL_MODE_STATS);
  const [sessions, setSessions] = useLocalStorage('mathGame_sessions', []);
  const [selectedCharacter, setSelectedCharacter] = useLocalStorage('mathGame_character', 'all');

  // Record a problem attempt
  const recordAttempt = (mode, isCorrect, scoreGained, starEarned) => {
    // Update mode-specific stats
    setModeStats(prev => ({
      ...prev,
      [mode]: {
        attempted: (prev[mode]?.attempted || 0) + 1,
        correct: (prev[mode]?.correct || 0) + (isCorrect ? 1 : 0),
        stars: (prev[mode]?.stars || 0) + (starEarned ? 1 : 0),
      },
    }));

    // Update global stats and daily streak
    setStats(prev => {
      const today = getDateString();
      const lastDate = prev.lastPlayDate;
      let newDailyStreak = prev.dailyStreak || 0;

      if (lastDate !== today) {
        if (lastDate && getDaysDiff(lastDate, today) === 1) {
          // Consecutive day - increment streak
          newDailyStreak = newDailyStreak + 1;
        } else if (!lastDate || getDaysDiff(lastDate, today) > 1) {
          // First time or missed a day - reset to 1
          newDailyStreak = 1;
        }
      }

      return {
        ...prev,
        totalScore: prev.totalScore + scoreGained,
        totalStars: prev.totalStars + (starEarned ? 1 : 0),
        totalProblems: prev.totalProblems + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        lastPlayed: new Date().toISOString(),
        lastPlayDate: today,
        dailyStreak: newDailyStreak,
      };
    });
  };

  // Update best streak
  const updateBestStreak = (currentStreak) => {
    setStats(prev => ({
      ...prev,
      bestStreak: Math.max(prev.bestStreak, currentStreak),
    }));
  };

  // Add session time
  const addSessionTime = (seconds) => {
    setStats(prev => ({
      ...prev,
      totalTimeSeconds: (prev.totalTimeSeconds || 0) + seconds,
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

  // Format total time played
  const getFormattedTotalTime = () => {
    const totalSeconds = stats.totalTimeSeconds || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Export progress as text
  const exportProgress = () => {
    const report = `
Math Heroes Progress Report
Generated: ${new Date().toLocaleDateString()}

OVERALL STATS
-------------
Total Stars: ${stats.totalStars}
Total Score: ${stats.totalScore}
Best Streak: ${stats.bestStreak}
Daily Streak: ${stats.dailyStreak || 0} days
Total Time Played: ${getFormattedTotalTime()}
Overall Accuracy: ${getOverallAccuracy()}%

BY GAME MODE
------------
${Object.entries(modeStats).map(([mode, data]) => {
  const accuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
  return `${mode.charAt(0).toUpperCase() + mode.slice(1)}: ${data.correct}/${data.attempted} (${accuracy}%) - ${data.stars} stars`;
}).join('\n')}

RECENT SESSIONS
---------------
${sessions.slice(0, 10).map(s => {
  const date = new Date(s.date).toLocaleDateString();
  const accuracy = s.problems > 0 ? Math.round((s.correct / s.problems) * 100) : 0;
  return `${date}: ${s.correct}/${s.problems} (${accuracy}%)`;
}).join('\n')}
    `.trim();

    return report;
  };

  return {
    stats,
    modeStats,
    sessions,
    selectedCharacter,
    setSelectedCharacter,
    recordAttempt,
    updateBestStreak,
    addSessionTime,
    saveSession,
    getDifficulty,
    getModeAccuracy,
    getOverallAccuracy,
    isReturningPlayer,
    getTimeSinceLastPlay,
    getFormattedTotalTime,
    exportProgress,
  };
}
