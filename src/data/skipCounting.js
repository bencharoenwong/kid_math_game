/**
 * Skip counting configuration with difficulty progression
 * Easy: 2, 5, 10 (most common, easiest to visualize)
 * Medium: 3, 4, 6 (still manageable)
 * Hard: 7, 8, 9, 11, 12 (multiplication table prep)
 */

const SKIP_COUNT_CONFIG = {
  easy: {
    options: [2, 5, 10],
    maxValue: 50,
    sequenceLength: 6,
  },
  medium: {
    options: [3, 4, 6],
    maxValue: 60,
    sequenceLength: 6,
  },
  hard: {
    options: [7, 8, 9, 11, 12],
    maxValue: 72,
    sequenceLength: 6,
  },
};

/**
 * Generate a skip counting problem
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} Skip count problem with sequence and missing index
 */
export function generateSkipCountProblem(difficulty = 'easy') {
  const config = SKIP_COUNT_CONFIG[difficulty] || SKIP_COUNT_CONFIG.easy;
  const by = config.options[Math.floor(Math.random() * config.options.length)];

  // Determine starting point
  // Easy: start at 0 or a small multiple
  // Harder: can start at any reasonable point
  let start;
  if (difficulty === 'easy') {
    start = Math.floor(Math.random() * 3) * by; // 0, by, or 2*by
  } else {
    start = Math.floor(Math.random() * 4) * by; // 0 to 3*by
  }

  // Generate the sequence
  const sequence = [];
  for (let i = 0; i < config.sequenceLength; i++) {
    sequence.push(start + by * i);
  }

  // Pick which number to hide (not the first one - that's the start)
  // For easier difficulty, hide positions 1-3; for harder, can be 1-4
  const maxHideIndex = difficulty === 'hard' ? 4 : 3;
  const missingIndex = Math.floor(Math.random() * maxHideIndex) + 1;

  return {
    by,
    sequence,
    missing: missingIndex,
    answer: sequence[missingIndex],
    difficulty,
    hint: `Counting by ${by}s`,
  };
}

/**
 * Get skip counting options by difficulty
 */
export function getSkipCountOptions(difficulty = 'easy') {
  return SKIP_COUNT_CONFIG[difficulty]?.options || SKIP_COUNT_CONFIG.easy.options;
}
