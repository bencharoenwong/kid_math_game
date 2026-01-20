import React, { useState, useRef } from 'react';
import { useStats } from './hooks/useStats';
import { getRandomPattern } from './data/patterns';
import { generateSkipCountProblem } from './data/skipCounting';
import { generateAdditionProblem, generateSubtractionProblem, generateGroupsProblem } from './data/arithmetic';

const MathGameApp = () => {
  const [screen, setScreen] = useState('home');
  const [problem, setProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [skipCount, setSkipCount] = useState(null);
  const [patternData, setPatternData] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [streak, setStreak] = useState(0);
  const [sessionProblems, setSessionProblems] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionModes, setSessionModes] = useState(new Set());
  const groupEmojiRef = useRef('🍕');

  const {
    stats,
    modeStats,
    recordAttempt,
    updateBestStreak,
    saveSession,
    getDifficulty,
    isReturningPlayer,
    getTimeSinceLastPlay,
  } = useStats();

  const emojis = ['🍕', '⭐', '🐢', '🥷', '🎯', '🍪', '🌟', '⚔️', '🏆'];

  const generateAddition = () => {
    const difficulty = getDifficulty('addition');
    const prob = generateAdditionProblem(difficulty);
    setProblem(prob);
    setUserAnswer('');
    setFeedback(null);
  };

  const generateSubtraction = () => {
    const difficulty = getDifficulty('subtraction');
    const prob = generateSubtractionProblem(difficulty);
    setProblem(prob);
    setUserAnswer('');
    setFeedback(null);
  };

  const generateSkipCount = () => {
    const difficulty = getDifficulty('skipcount');
    const prob = generateSkipCountProblem(difficulty);
    setSkipCount(prob);
    setUserAnswer('');
    setFeedback(null);
  };

  const generatePattern = () => {
    const difficulty = getDifficulty('patterns');
    const data = getRandomPattern(difficulty);
    setPatternData(data);
    setFeedback(null);
  };

  const generateGroups = () => {
    const difficulty = getDifficulty('groups');
    const data = generateGroupsProblem(difficulty);
    setGroupData(data);
    groupEmojiRef.current = emojis[Math.floor(Math.random() * emojis.length)];
    setUserAnswer('');
    setFeedback(null);
  };

  const checkAnswer = (correct, given, mode) => {
    const isCorrect = parseInt(given) === correct;
    const newStreak = isCorrect ? streak + 1 : 0;
    const starEarned = isCorrect && newStreak > 0 && newStreak % 5 === 0;
    const scoreGained = isCorrect ? 10 : 0;

    setSessionProblems(p => p + 1);
    if (isCorrect) setSessionCorrect(c => c + 1);
    setSessionModes(prev => new Set([...prev, mode]));

    recordAttempt(mode, isCorrect, scoreGained, starEarned);

    if (isCorrect) {
      setFeedback('correct');
      setStreak(newStreak);
      updateBestStreak(newStreak);
    } else {
      setFeedback('wrong');
      setStreak(0);
    }
  };

  const goHome = () => {
    if (sessionProblems > 0) {
      saveSession({
        problems: sessionProblems,
        correct: sessionCorrect,
        modes: Array.from(sessionModes),
      });
    }
    setScreen('home');
    setSessionProblems(0);
    setSessionCorrect(0);
    setSessionModes(new Set());
  };

  const DifficultyBadge = ({ mode }) => {
    const difficulty = getDifficulty(mode);
    const badges = {
      easy: '🥉',
      medium: '🥈',
      hard: '🥇',
    };
    return (
      <span className="text-lg" title={`${difficulty} mode`}>
        {badges[difficulty]}
      </span>
    );
  };

  const StarDisplay = () => (
    <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full">
      <span className="text-xl">⭐</span>
      <span className="text-lg font-bold text-yellow-700">{stats.totalStars}</span>
    </div>
  );

  const ScoreDisplay = () => (
    <div className="flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-full">
      <span className="text-xl">🎯</span>
      <span className="text-lg font-bold text-green-700">{stats.totalScore}</span>
    </div>
  );

  const StreakDisplay = () => (
    streak > 0 && (
      <div className="flex items-center gap-1 bg-orange-100 px-3 py-1.5 rounded-full animate-pulse">
        <span className="text-xl">🔥</span>
        <span className="text-lg font-bold text-orange-700">{streak}</span>
      </div>
    )
  );

  const Header = ({ title, color = 'gray' }) => {
    const textColors = {
      red: 'text-red-700',
      blue: 'text-blue-700',
      purple: 'text-purple-700',
      orange: 'text-orange-700',
      gray: 'text-gray-700',
    };
    return (
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <button
          onClick={goHome}
          className="bg-gray-800/20 hover:bg-gray-800/30 active:bg-gray-800/40 px-3 py-2 rounded-full text-base font-bold no-select"
        >
          🏠
        </button>
        <h2 className={`text-xl font-bold ${textColors[color]}`}>{title}</h2>
        <div className="flex gap-1.5">
          <StreakDisplay />
          <StarDisplay />
        </div>
      </div>
    );
  };

  const FeedbackDisplay = ({ onNext, showMultiplication }) => (
    <div className={`mt-4 p-4 rounded-2xl text-center ${feedback === 'correct' ? 'bg-green-100' : 'bg-red-100'}`}>
      {feedback === 'correct' ? (
        <div>
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-2xl font-bold text-green-700">Cowabunga!</p>
          {streak > 0 && streak % 5 === 0 && <p className="text-lg text-yellow-600 mt-2">⭐ You earned a star!</p>}
          {showMultiplication && groupData && (
            <p className="text-lg text-gray-600 mt-2">
              {groupData.groups} × {groupData.perGroup} = {groupData.total}
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="text-4xl mb-2">💪</p>
          <p className="text-2xl font-bold text-red-700">Try Again!</p>
        </div>
      )}
      <button
        onClick={onNext}
        className="mt-4 bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white px-6 py-2 rounded-full font-bold text-lg no-select"
      >
        Next →
      </button>
    </div>
  );

  const NumberPad = ({ onNumber, onClear, onSubmit }) => (
    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mt-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, '🗑️', 0, '✓'].map((n, i) => (
        <button
          key={i}
          onClick={() => {
            if (n === '🗑️') onClear();
            else if (n === '✓') onSubmit();
            else onNumber(n);
          }}
          className={`p-4 text-2xl font-bold rounded-xl shadow active:scale-95 transition no-select ${
            n === '✓' ? 'bg-green-600 text-white active:bg-green-700' :
            n === '🗑️' ? 'bg-red-500 text-white active:bg-red-600' :
            'bg-white hover:bg-gray-100 active:bg-gray-200'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );

  // HOME SCREEN - TMNT Sewer Theme
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900 p-4 flex flex-col items-center no-select">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-400 drop-shadow-lg mb-1">🐢 Math Heroes 🐢</h1>
          <p className="text-gray-400 text-sm">Heroes in a half shell - Math Power!</p>
          {isReturningPlayer() && (
            <p className="text-green-300 text-base mt-2">
              Welcome back! Last played {getTimeSinceLastPlay()}
            </p>
          )}
          <div className="flex justify-center gap-3 mt-3">
            <StarDisplay />
            <ScoreDisplay />
          </div>
          {stats.bestStreak > 0 && (
            <p className="text-gray-400 text-sm mt-2">Best streak: {stats.bestStreak} 🔥</p>
          )}
        </div>

        {/* Game Mode Grid - TMNT Colors */}
        <div className="grid grid-cols-2 gap-3 max-w-md w-full">
          {/* Red - Raphael - Addition */}
          <button
            onClick={() => { setScreen('addition'); generateAddition(); }}
            className="bg-gradient-to-br from-red-500 to-red-700 p-5 rounded-3xl shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-red-400"
          >
            <div className="flex justify-between items-start">
              <div className="text-4xl mb-1">➕</div>
              <DifficultyBadge mode="addition" />
            </div>
            <div className="text-lg font-bold text-white">Addition</div>
            <div className="text-red-200 text-xs mt-1">🔴 Raph Style</div>
          </button>

          {/* Blue - Leonardo - Subtraction */}
          <button
            onClick={() => { setScreen('subtraction'); generateSubtraction(); }}
            className="bg-gradient-to-br from-blue-500 to-blue-700 p-5 rounded-3xl shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-blue-400"
          >
            <div className="flex justify-between items-start">
              <div className="text-4xl mb-1">➖</div>
              <DifficultyBadge mode="subtraction" />
            </div>
            <div className="text-lg font-bold text-white">Subtraction</div>
            <div className="text-blue-200 text-xs mt-1">🔵 Leo Style</div>
          </button>

          {/* Purple - Donatello - Skip Count */}
          <button
            onClick={() => { setScreen('skipcount'); generateSkipCount(); }}
            className="bg-gradient-to-br from-purple-500 to-purple-700 p-5 rounded-3xl shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-purple-400"
          >
            <div className="flex justify-between items-start">
              <div className="text-4xl mb-1">🔢</div>
              <DifficultyBadge mode="skipcount" />
            </div>
            <div className="text-lg font-bold text-white">Skip Count</div>
            <div className="text-purple-200 text-xs mt-1">🟣 Donnie Style</div>
          </button>

          {/* Orange - Michelangelo - Patterns */}
          <button
            onClick={() => { setScreen('patterns'); generatePattern(); }}
            className="bg-gradient-to-br from-orange-400 to-orange-600 p-5 rounded-3xl shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-orange-300"
          >
            <div className="flex justify-between items-start">
              <div className="text-4xl mb-1">🔮</div>
              <DifficultyBadge mode="patterns" />
            </div>
            <div className="text-lg font-bold text-white">Patterns</div>
            <div className="text-orange-100 text-xs mt-1">🟠 Mikey Style</div>
          </button>

          {/* Groups - Team effort - Green */}
          <button
            onClick={() => { setScreen('groups'); generateGroups(); }}
            className="bg-gradient-to-br from-green-500 to-green-700 p-5 rounded-3xl shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-green-400 col-span-2"
          >
            <div className="flex justify-between items-start">
              <div className="text-4xl mb-1">🍕🍕🍕</div>
              <DifficultyBadge mode="groups" />
            </div>
            <div className="text-lg font-bold text-white">Counting Groups</div>
            <div className="text-green-200 text-xs mt-1">🐢 Team Power!</div>
          </button>
        </div>

        <div className="mt-6 bg-gray-700/80 p-3 rounded-2xl max-w-md text-center border border-green-500/30">
          <p className="text-green-300 text-sm">
            🔥 Get 5 in a row to earn a star! ⭐
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Earn 10 stars to unlock Medium, 25 for Hard
          </p>
        </div>

        <button
          onClick={() => setScreen('parent')}
          className="mt-4 text-gray-500 text-sm underline hover:text-gray-300"
        >
          Parent Dashboard
        </button>
      </div>
    );
  }

  // ADDITION SCREEN - Red Theme (Raphael)
  if (screen === 'addition' && problem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-600 via-red-500 to-red-700 p-4 flex flex-col items-center no-select">
        <Header title="Addition" color="red" />

        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
          <div className="text-5xl font-bold text-gray-800 mb-4">
            {problem.a} + {problem.b} = ?
          </div>

          {problem.a + problem.b <= 20 && (
            <div className="flex justify-center gap-1 mb-4 flex-wrap">
              {[...Array(problem.a)].map((_, i) => (
                <span key={i} className="text-xl">🔴</span>
              ))}
              <span className="text-xl mx-1">+</span>
              {[...Array(problem.b)].map((_, i) => (
                <span key={i} className="text-xl">🟡</span>
              ))}
            </div>
          )}

          <div className="text-4xl font-bold text-red-600 bg-red-100 rounded-xl py-3 mb-4">
            {userAnswer || '?'}
          </div>

          {!feedback && (
            <NumberPad
              onNumber={(n) => setUserAnswer(prev => prev + n)}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(problem.answer, userAnswer, 'addition')}
            />
          )}

          {feedback && (
            <FeedbackDisplay onNext={generateAddition} />
          )}
        </div>
      </div>
    );
  }

  // SUBTRACTION SCREEN - Blue Theme (Leonardo)
  if (screen === 'subtraction' && problem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 via-blue-500 to-blue-700 p-4 flex flex-col items-center no-select">
        <Header title="Subtraction" color="blue" />

        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
          <div className="text-5xl font-bold text-gray-800 mb-4">
            {problem.a} − {problem.b} = ?
          </div>

          {problem.a <= 15 && (
            <>
              <div className="flex justify-center flex-wrap gap-1 mb-2">
                {[...Array(problem.a)].map((_, i) => (
                  <span key={i} className={`text-xl ${i < problem.b ? 'opacity-30 line-through' : ''}`}>
                    🔵
                  </span>
                ))}
              </div>
              <p className="text-gray-500 text-sm mb-4">Take away {problem.b}... how many left?</p>
            </>
          )}

          <div className="text-4xl font-bold text-blue-600 bg-blue-100 rounded-xl py-3 mb-4">
            {userAnswer || '?'}
          </div>

          {!feedback && (
            <NumberPad
              onNumber={(n) => setUserAnswer(prev => prev + n)}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(problem.answer, userAnswer, 'subtraction')}
            />
          )}

          {feedback && (
            <FeedbackDisplay onNext={generateSubtraction} />
          )}
        </div>
      </div>
    );
  }

  // SKIP COUNTING SCREEN - Purple Theme (Donatello)
  if (screen === 'skipcount' && skipCount) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-500 to-purple-700 p-4 flex flex-col items-center no-select">
        <Header title="Skip Counting" color="purple" />

        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
          <div className="text-xl font-bold text-purple-700 mb-4">
            Count by {skipCount.by}s! 🧠
          </div>

          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {skipCount.sequence.map((num, i) => (
              <div
                key={i}
                className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl font-bold ${
                  i === skipCount.missing
                    ? 'bg-yellow-200 border-4 border-yellow-400'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {i === skipCount.missing ? '?' : num}
              </div>
            ))}
          </div>

          <div className="text-4xl font-bold text-purple-600 bg-purple-100 rounded-xl py-3 mb-4">
            {userAnswer || '?'}
          </div>

          {!feedback && (
            <NumberPad
              onNumber={(n) => setUserAnswer(prev => prev + n)}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(skipCount.answer, userAnswer, 'skipcount')}
            />
          )}

          {feedback && (
            <FeedbackDisplay onNext={generateSkipCount} />
          )}
        </div>
      </div>
    );
  }

  // PATTERNS SCREEN - Orange Theme (Michelangelo)
  if (screen === 'patterns' && patternData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-500 via-orange-400 to-orange-600 p-4 flex flex-col items-center no-select">
        <Header title="Patterns" color="orange" />

        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
          <div className="text-xl font-bold text-orange-700 mb-4">
            What comes next? 🍕
          </div>

          <div className="flex justify-center gap-2 mb-6 items-center flex-wrap">
            {patternData.pattern.map((num, i) => (
              <React.Fragment key={i}>
                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-orange-100 text-xl font-bold text-orange-700">
                  {num}
                </div>
                {i < patternData.pattern.length - 1 && <span className="text-lg text-orange-400">→</span>}
              </React.Fragment>
            ))}
            <span className="text-lg text-orange-400">→</span>
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-yellow-200 border-4 border-yellow-400 text-xl font-bold">
              ?
            </div>
          </div>

          {patternData.hint && (
            <p className="text-gray-500 text-sm mb-4">Hint: {patternData.hint}</p>
          )}

          {!feedback && (
            <div className="flex justify-center gap-3 flex-wrap">
              {patternData.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => checkAnswer(patternData.answer, opt, 'patterns')}
                  className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-2xl font-bold rounded-xl shadow-lg hover:scale-110 active:scale-95 transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {feedback && (
            <FeedbackDisplay onNext={generatePattern} />
          )}
        </div>
      </div>
    );
  }

  // GROUPS SCREEN - Green Theme (Team)
  if (screen === 'groups' && groupData) {
    const emoji = groupEmojiRef.current;

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-600 via-green-500 to-green-700 p-4 flex flex-col items-center no-select">
        <Header title="Counting Groups" color="gray" />

        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
          <div className="text-xl font-bold text-green-700 mb-4">
            {groupData.groups} groups of {groupData.perGroup}
          </div>

          <div className="flex justify-center gap-3 mb-4 flex-wrap">
            {[...Array(groupData.groups)].map((_, g) => (
              <div key={g} className="bg-green-50 p-2 rounded-xl border-2 border-green-200">
                <div className="flex gap-0.5 flex-wrap justify-center" style={{ maxWidth: '80px' }}>
                  {[...Array(groupData.perGroup)].map((_, i) => (
                    <span key={i} className="text-xl">{emoji}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-sm mb-4">How many in all?</p>

          <div className="text-4xl font-bold text-green-600 bg-green-100 rounded-xl py-3 mb-4">
            {userAnswer || '?'}
          </div>

          {!feedback && (
            <NumberPad
              onNumber={(n) => setUserAnswer(prev => prev + n)}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(groupData.total, userAnswer, 'groups')}
            />
          )}

          {feedback && (
            <FeedbackDisplay onNext={generateGroups} showMultiplication={true} />
          )}
        </div>
      </div>
    );
  }

  // PARENT DASHBOARD
  if (screen === 'parent') {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={goHome}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full font-bold"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold text-green-400">Progress</h2>
            <div></div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow p-4 mb-4 border border-gray-700">
            <h3 className="font-bold text-green-400 mb-3">Overall Stats</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-yellow-900/30 p-3 rounded-xl border border-yellow-700/50">
                <div className="text-2xl font-bold text-yellow-400">{stats.totalStars}</div>
                <div className="text-gray-400">Stars Earned</div>
              </div>
              <div className="bg-green-900/30 p-3 rounded-xl border border-green-700/50">
                <div className="text-2xl font-bold text-green-400">{stats.totalScore}</div>
                <div className="text-gray-400">Total Score</div>
              </div>
              <div className="bg-blue-900/30 p-3 rounded-xl border border-blue-700/50">
                <div className="text-2xl font-bold text-blue-400">
                  {stats.totalProblems > 0 ? Math.round((stats.totalCorrect / stats.totalProblems) * 100) : 0}%
                </div>
                <div className="text-gray-400">Accuracy</div>
              </div>
              <div className="bg-orange-900/30 p-3 rounded-xl border border-orange-700/50">
                <div className="text-2xl font-bold text-orange-400">{stats.bestStreak}</div>
                <div className="text-gray-400">Best Streak</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow p-4 mb-4 border border-gray-700">
            <h3 className="font-bold text-green-400 mb-3">By Game Mode</h3>
            {[
              { mode: 'addition', color: 'red', label: 'Addition' },
              { mode: 'subtraction', color: 'blue', label: 'Subtraction' },
              { mode: 'skipcount', color: 'purple', label: 'Skip Count' },
              { mode: 'patterns', color: 'orange', label: 'Patterns' },
              { mode: 'groups', color: 'green', label: 'Groups' },
            ].map(({ mode, color, label }) => {
              const modeStat = modeStats[mode];
              const accuracy = modeStat.attempted > 0
                ? Math.round((modeStat.correct / modeStat.attempted) * 100)
                : 0;
              const difficulty = getDifficulty(mode);
              const badges = { easy: '🥉', medium: '🥈', hard: '🥇' };

              return (
                <div key={mode} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span>{badges[difficulty]}</span>
                    <span className={`font-medium text-${color}-400`}>{label}</span>
                  </div>
                  <div className="text-right text-sm">
                    <span className="text-gray-300">{modeStat.correct}/{modeStat.attempted}</span>
                    <span className="text-gray-500 ml-2">({accuracy}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-800 rounded-2xl shadow p-4 border border-gray-700">
            <h3 className="font-bold text-green-400 mb-3">Difficulty Unlock Progress</h3>
            {[
              { mode: 'addition', color: 'red', label: 'Addition' },
              { mode: 'subtraction', color: 'blue', label: 'Subtraction' },
              { mode: 'skipcount', color: 'purple', label: 'Skip Count' },
              { mode: 'patterns', color: 'orange', label: 'Patterns' },
              { mode: 'groups', color: 'green', label: 'Groups' },
            ].map(({ mode, color, label }) => {
              const stars = modeStats[mode]?.stars || 0;
              const nextThreshold = stars < 10 ? 10 : stars < 25 ? 25 : null;
              const bgColors = {
                red: 'bg-red-500',
                blue: 'bg-blue-500',
                purple: 'bg-purple-500',
                orange: 'bg-orange-500',
                green: 'bg-green-500',
              };

              return (
                <div key={mode} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{label}</span>
                    <span className="text-gray-500">{stars} ⭐</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${bgColors[color]}`}
                      style={{ width: `${Math.min(100, (stars / 25) * 100)}%` }}
                    />
                  </div>
                  {nextThreshold && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {nextThreshold - stars} more to unlock {nextThreshold === 10 ? 'Medium' : 'Hard'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MathGameApp;
