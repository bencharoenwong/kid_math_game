/**
 * Arithmetic problem configuration with difficulty progression
 * Easy: sums/differences up to 10
 * Medium: sums/differences up to 20
 * Hard: sums/differences up to 50
 */

const ARITHMETIC_CONFIG = {
  addition: {
    easy: { minA: 1, maxA: 10, minB: 1, maxB: 10, maxSum: 10 },
    medium: { minA: 1, maxA: 15, minB: 1, maxB: 15, maxSum: 20 },
    hard: { minA: 5, maxA: 30, minB: 5, maxB: 30, maxSum: 50 },
  },
  subtraction: {
    easy: { minA: 5, maxA: 10, minResult: 0 },
    medium: { minA: 10, maxA: 20, minResult: 0 },
    hard: { minA: 15, maxA: 50, minResult: 0 },
  },
};

/**
 * Generate an addition problem
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} Addition problem
 */
export function generateAdditionProblem(difficulty = 'easy') {
  const config = ARITHMETIC_CONFIG.addition[difficulty] || ARITHMETIC_CONFIG.addition.easy;

  let a, b;
  do {
    a = Math.floor(Math.random() * (config.maxA - config.minA + 1)) + config.minA;
    b = Math.floor(Math.random() * (config.maxB - config.minB + 1)) + config.minB;
  } while (a + b > config.maxSum);

  return {
    type: 'addition',
    a,
    b,
    answer: a + b,
    symbol: '+',
    difficulty,
  };
}

/**
 * Generate a subtraction problem
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} Subtraction problem
 */
export function generateSubtractionProblem(difficulty = 'easy') {
  const config = ARITHMETIC_CONFIG.subtraction[difficulty] || ARITHMETIC_CONFIG.subtraction.easy;

  // Ensure a >= b so result is non-negative
  const a = Math.floor(Math.random() * (config.maxA - config.minA + 1)) + config.minA;
  const maxB = Math.min(a - config.minResult, a); // Ensure result >= minResult
  const b = Math.floor(Math.random() * maxB) + 1;

  return {
    type: 'subtraction',
    a,
    b,
    answer: a - b,
    symbol: '-',
    difficulty,
  };
}

/**
 * Generate a groups (pre-multiplication) problem
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} Groups problem
 */
export function generateGroupsProblem(difficulty = 'easy') {
  let groups, perGroup;

  if (difficulty === 'easy') {
    // 2-3 groups, 2-4 per group (totals up to 12)
    groups = Math.floor(Math.random() * 2) + 2; // 2-3
    perGroup = Math.floor(Math.random() * 3) + 2; // 2-4
  } else if (difficulty === 'medium') {
    // 2-4 groups, 2-5 per group (totals up to 20)
    groups = Math.floor(Math.random() * 3) + 2; // 2-4
    perGroup = Math.floor(Math.random() * 4) + 2; // 2-5
  } else {
    // 2-6 groups, 2-6 per group (totals up to 36)
    groups = Math.floor(Math.random() * 5) + 2; // 2-6
    perGroup = Math.floor(Math.random() * 5) + 2; // 2-6
  }

  return {
    groups,
    perGroup,
    total: groups * perGroup,
    difficulty,
  };
}

/**
 * Generate a multiplication problem
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} Multiplication problem
 */
export function generateMultiplicationProblem(difficulty = 'easy') {
  let a, b;

  if (difficulty === 'easy') {
    // 1-5 × 1-5 (focus on 2s, 5s, 10s)
    const easyNumbers = [1, 2, 2, 5, 5, 10];
    a = easyNumbers[Math.floor(Math.random() * easyNumbers.length)];
    b = Math.floor(Math.random() * 5) + 1;
  } else if (difficulty === 'medium') {
    // 2-6 × 2-6
    a = Math.floor(Math.random() * 5) + 2;
    b = Math.floor(Math.random() * 5) + 2;
  } else {
    // 2-12 × 2-12 (full times tables)
    a = Math.floor(Math.random() * 11) + 2;
    b = Math.floor(Math.random() * 11) + 2;
  }

  return {
    type: 'multiplication',
    a,
    b,
    answer: a * b,
    symbol: '×',
    difficulty,
  };
}
