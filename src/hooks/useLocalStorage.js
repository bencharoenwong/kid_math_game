import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state in localStorage
 * Works offline - all data stays on device
 */
export function useLocalStorage(key, initialValue) {
  // Initialize state from localStorage or use initial value
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Persist to localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

/**
 * Clear all game data from localStorage
 */
export function clearGameData() {
  const keysToRemove = ['mathGame_stats', 'mathGame_modeStats', 'mathGame_sessions'];
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  });
}
