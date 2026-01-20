/**
 * Pattern generator for number sequences
 * Difficulty: easy (10 stars unlock medium), medium (25 stars unlock hard)
 */

// Generate arithmetic patterns (+n sequences)
function generateArithmeticPatterns() {
  const patterns = [];

  // Easy: +1, +2, +5, +10 sequences
  const easySteps = [1, 2, 5, 10];
  easySteps.forEach(step => {
    // Multiple starting points for variety
    for (let start = 0; start <= step * 2; start += step) {
      const sequence = [];
      for (let i = 0; i < 4; i++) {
        sequence.push(start + step * i);
      }
      const next = start + step * 4;
      // Only include if numbers stay reasonable for kids
      if (next <= 60) {
        patterns.push({
          pattern: sequence,
          next,
          rule: `+${step}`,
          difficulty: 'easy',
          hint: `Add ${step} each time`,
        });
      }
    }
  });

  // Medium: +3, +4, +6 sequences
  const mediumSteps = [3, 4, 6];
  mediumSteps.forEach(step => {
    for (let start = 0; start <= step; start++) {
      const sequence = [];
      for (let i = 0; i < 4; i++) {
        sequence.push(start + step * i);
      }
      const next = start + step * 4;
      if (next <= 50) {
        patterns.push({
          pattern: sequence,
          next,
          rule: `+${step}`,
          difficulty: 'medium',
          hint: `Add ${step} each time`,
        });
      }
    }
  });

  // Hard: +7, +8, +9, +11, +12 sequences
  const hardSteps = [7, 8, 9, 11, 12];
  hardSteps.forEach(step => {
    for (let start = 0; start <= 2; start++) {
      const sequence = [];
      for (let i = 0; i < 4; i++) {
        sequence.push(start + step * i);
      }
      const next = start + step * 4;
      if (next <= 60) {
        patterns.push({
          pattern: sequence,
          next,
          rule: `+${step}`,
          difficulty: 'hard',
          hint: `Add ${step} each time`,
        });
      }
    }
  });

  return patterns;
}

// Generate doubling patterns
function generateDoublingPatterns() {
  return [
    { pattern: [1, 2, 4, 8], next: 16, rule: 'x2', difficulty: 'medium', hint: 'Double each time' },
    { pattern: [2, 4, 8, 16], next: 32, rule: 'x2', difficulty: 'hard', hint: 'Double each time' },
    { pattern: [3, 6, 12, 24], next: 48, rule: 'x2', difficulty: 'hard', hint: 'Double each time' },
  ];
}

// Generate square numbers
function generateSquarePatterns() {
  return [
    { pattern: [1, 4, 9, 16], next: 25, rule: 'n²', difficulty: 'hard', hint: '1x1, 2x2, 3x3, 4x4...' },
  ];
}

// Generate odd/even number patterns
function generateOddEvenPatterns() {
  return [
    // Odd numbers
    { pattern: [1, 3, 5, 7], next: 9, rule: 'odd', difficulty: 'easy', hint: 'Odd numbers' },
    { pattern: [3, 5, 7, 9], next: 11, rule: 'odd', difficulty: 'easy', hint: 'Odd numbers' },
    { pattern: [5, 7, 9, 11], next: 13, rule: 'odd', difficulty: 'easy', hint: 'Odd numbers' },
    { pattern: [11, 13, 15, 17], next: 19, rule: 'odd', difficulty: 'medium', hint: 'Odd numbers' },
    // Even numbers
    { pattern: [2, 4, 6, 8], next: 10, rule: 'even', difficulty: 'easy', hint: 'Even numbers' },
    { pattern: [4, 6, 8, 10], next: 12, rule: 'even', difficulty: 'easy', hint: 'Even numbers' },
    { pattern: [10, 12, 14, 16], next: 18, rule: 'even', difficulty: 'medium', hint: 'Even numbers' },
    { pattern: [20, 22, 24, 26], next: 28, rule: 'even', difficulty: 'medium', hint: 'Even numbers' },
  ];
}

// Generate counting patterns (easiest)
function generateCountingPatterns() {
  const patterns = [];
  // Counting by 1s from different starts
  for (let start = 1; start <= 10; start++) {
    patterns.push({
      pattern: [start, start + 1, start + 2, start + 3],
      next: start + 4,
      rule: '+1',
      difficulty: 'easy',
      hint: 'Count up by 1',
    });
  }
  return patterns;
}

// Combine all patterns
const ALL_PATTERNS = [
  ...generateCountingPatterns(),      // ~10 patterns
  ...generateOddEvenPatterns(),        // 8 patterns
  ...generateArithmeticPatterns(),     // ~30+ patterns
  ...generateDoublingPatterns(),       // 3 patterns
  ...generateSquarePatterns(),         // 1 pattern
];

/**
 * Get a random pattern based on difficulty
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} Pattern object with pattern, next, rule, hint
 */
export function getRandomPattern(difficulty = 'easy') {
  let available;

  if (difficulty === 'hard') {
    // Hard mode: all patterns
    available = ALL_PATTERNS;
  } else if (difficulty === 'medium') {
    // Medium mode: easy + medium patterns
    available = ALL_PATTERNS.filter(p => p.difficulty !== 'hard');
  } else {
    // Easy mode: only easy patterns
    available = ALL_PATTERNS.filter(p => p.difficulty === 'easy');
  }

  const selected = available[Math.floor(Math.random() * available.length)];

  // Generate wrong options that are close to the answer
  const wrongOptions = new Set();
  while (wrongOptions.size < 2) {
    const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const wrong = selected.next + offset;
    if (wrong !== selected.next && wrong > 0 && !wrongOptions.has(wrong)) {
      wrongOptions.add(wrong);
    }
  }

  const options = [selected.next, ...Array.from(wrongOptions)].sort(() => Math.random() - 0.5);

  return {
    pattern: selected.pattern,
    answer: selected.next,
    options,
    rule: selected.rule,
    hint: selected.hint,
    difficulty: selected.difficulty,
  };
}

/**
 * Get total count of patterns by difficulty
 */
export function getPatternCounts() {
  return {
    easy: ALL_PATTERNS.filter(p => p.difficulty === 'easy').length,
    medium: ALL_PATTERNS.filter(p => p.difficulty === 'medium').length,
    hard: ALL_PATTERNS.filter(p => p.difficulty === 'hard').length,
    total: ALL_PATTERNS.length,
  };
}
