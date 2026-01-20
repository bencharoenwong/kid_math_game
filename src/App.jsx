import React, { useState, useRef, useEffect } from 'react';
import { useStats } from './hooks/useStats';
import { getRandomPattern } from './data/patterns';
import { generateSkipCountProblem } from './data/skipCounting';
import { generateAdditionProblem, generateSubtractionProblem, generateGroupsProblem, generateMultiplicationProblem } from './data/arithmetic';
import { playCorrectSound, playWrongSound, playStarSound, playTapSound } from './utils/sounds';
import Confetti from './components/Confetti';

const CHARACTERS = [
  { id: 'all', name: 'All Turtles', emoji: '🐢', color: 'green' },
  { id: 'raph', name: 'Raphael', emoji: '🔴', color: 'red' },
  { id: 'leo', name: 'Leonardo', emoji: '🔵', color: 'blue' },
  { id: 'donnie', name: 'Donatello', emoji: '🟣', color: 'purple' },
  { id: 'mikey', name: 'Michelangelo', emoji: '🟠', color: 'orange' },
];

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [readAloudEnabled, setReadAloudEnabled] = useState(false);
  const groupEmojiRef = useRef('🍕');
  const sessionStartRef = useRef(null);

  const {
    stats,
    modeStats,
    selectedCharacter,
    setSelectedCharacter,
    recordAttempt,
    updateBestStreak,
    addSessionTime,
    saveSession,
    getDifficulty,
    isReturningPlayer,
    getTimeSinceLastPlay,
    getFormattedTotalTime,
    exportProgress,
  } = useStats();

  const emojis = ['🍕', '⭐', '🐢', '🥷', '🎯', '🍪', '🌟', '⚔️', '🏆'];

  // Track session time
  useEffect(() => {
    if (screen !== 'home' && screen !== 'parent' && screen !== 'character') {
      sessionStartRef.current = Date.now();
    }
    return () => {
      if (sessionStartRef.current) {
        const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        if (elapsed > 0) {
          addSessionTime(elapsed);
        }
        sessionStartRef.current = null;
      }
    };
  }, [screen]);

  // Read aloud function
  const speak = (text) => {
    if (readAloudEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  const generateAddition = () => {
    const difficulty = getDifficulty('addition');
    const prob = generateAdditionProblem(difficulty);
    setProblem(prob);
    setUserAnswer('');
    setFeedback(null);
    speak(`What is ${prob.a} plus ${prob.b}?`);
  };

  const generateSubtraction = () => {
    const difficulty = getDifficulty('subtraction');
    const prob = generateSubtractionProblem(difficulty);
    setProblem(prob);
    setUserAnswer('');
    setFeedback(null);
    speak(`What is ${prob.a} minus ${prob.b}?`);
  };

  const generateSkipCount = () => {
    const difficulty = getDifficulty('skipcount');
    const prob = generateSkipCountProblem(difficulty);
    setSkipCount(prob);
    setUserAnswer('');
    setFeedback(null);
    speak(`Count by ${prob.by}s. What number is missing?`);
  };

  const generatePattern = () => {
    const difficulty = getDifficulty('patterns');
    const data = getRandomPattern(difficulty);
    setPatternData(data);
    setFeedback(null);
    speak(`${data.pattern.join(', ')}. What comes next?`);
  };

  const generateGroups = () => {
    const difficulty = getDifficulty('groups');
    const data = generateGroupsProblem(difficulty);
    setGroupData(data);
    groupEmojiRef.current = emojis[Math.floor(Math.random() * emojis.length)];
    setUserAnswer('');
    setFeedback(null);
    speak(`${data.groups} groups of ${data.perGroup}. How many in all?`);
  };

  const generateMultiplication = () => {
    const difficulty = getDifficulty('multiplication');
    const prob = generateMultiplicationProblem(difficulty);
    setProblem(prob);
    setUserAnswer('');
    setFeedback(null);
    speak(`What is ${prob.a} times ${prob.b}?`);
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
      if (soundEnabled) {
        if (starEarned) {
          playStarSound();
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 100);
        } else {
          playCorrectSound();
        }
      }
      speak('Cowabunga! Great job!');
    } else {
      setFeedback('wrong');
      setStreak(0);
      if (soundEnabled) playWrongSound();
      speak('Try again!');
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

  const handleNumberTap = (n) => {
    if (soundEnabled) playTapSound();
    setUserAnswer(prev => prev + n);
  };

  const DifficultyBadge = ({ mode }) => {
    const difficulty = getDifficulty(mode);
    const badges = { easy: '🥉', medium: '🥈', hard: '🥇' };
    return <span className="text-lg">{badges[difficulty]}</span>;
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

  const DailyStreakDisplay = () => (
    stats.dailyStreak > 0 && (
      <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full">
        <span className="text-sm">📅</span>
        <span className="text-sm font-bold text-purple-700">{stats.dailyStreak}d</span>
      </div>
    )
  );

  const Header = ({ title, color = 'gray' }) => {
    const textColors = {
      red: 'text-red-700',
      blue: 'text-blue-700',
      purple: 'text-purple-700',
      orange: 'text-orange-700',
      green: 'text-green-700',
      yellow: 'text-yellow-700',
      gray: 'text-gray-700',
    };
    return (
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <button
          onClick={goHome}
          className="bg-gray-800/20 hover:bg-gray-800/30 active:bg-gray-800/40 px-4 py-3 rounded-full text-xl font-bold no-select"
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
        className="mt-4 bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white px-8 py-3 rounded-full font-bold text-xl no-select"
      >
        Next →
      </button>
    </div>
  );

  // Larger number pad for better touch targets
  const NumberPad = ({ onNumber, onClear, onSubmit }) => (
    <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mt-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, '🗑️', 0, '✓'].map((n, i) => (
        <button
          key={i}
          onClick={() => {
            if (n === '🗑️') { if (soundEnabled) playTapSound(); onClear(); }
            else if (n === '✓') { if (soundEnabled) playTapSound(); onSubmit(); }
            else onNumber(n);
          }}
          className={`p-5 text-3xl font-bold rounded-2xl shadow-lg active:scale-95 transition no-select ${
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

  // CHARACTER SELECT SCREEN
  if (screen === 'character') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900 p-4 flex flex-col items-center no-select">
        <h1 className="text-3xl font-bold text-green-400 mb-6">Choose Your Hero!</h1>
        <div className="grid grid-cols-2 gap-4 max-w-md w-full">
          {CHARACTERS.map((char) => (
            <button
              key={char.id}
              onClick={() => { setSelectedCharacter(char.id); setScreen('home'); }}
              className={`p-4 rounded-2xl border-4 transition transform hover:scale-105 ${
                selectedCharacter === char.id
                  ? 'border-yellow-400 bg-gray-700'
                  : 'border-gray-600 bg-gray-800'
              }`}
            >
              <div className="text-4xl mb-2">{char.emoji}</div>
              <div className="text-white font-bold">{char.name}</div>
            </button>
          ))}
        </div>
        <button
          onClick={() => setScreen('home')}
          className="mt-6 text-gray-400 underline"
        >
          Back
        </button>
      </div>
    );
  }

  // HOME SCREEN
  if (screen === 'home') {
    const character = CHARACTERS.find(c => c.id === selectedCharacter) || CHARACTERS[0];

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900 p-4 flex flex-col items-center no-select">
        <Confetti active={showConfetti} />

        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-green-400 drop-shadow-lg mb-1">🐢 Math Heroes 🐢</h1>
          <button
            onClick={() => setScreen('character')}
            className="text-gray-400 text-sm hover:text-green-300"
          >
            Playing as: {character.emoji} {character.name}
          </button>
          {isReturningPlayer() && (
            <p className="text-green-300 text-sm mt-1">
              Welcome back! Last played {getTimeSinceLastPlay()}
            </p>
          )}
          <div className="flex justify-center gap-2 mt-2">
            <StarDisplay />
            <ScoreDisplay />
            <DailyStreakDisplay />
          </div>
          {stats.bestStreak > 0 && (
            <p className="text-gray-400 text-xs mt-1">Best streak: {stats.bestStreak} 🔥</p>
          )}
        </div>

        {/* Settings row */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1 rounded-full text-sm ${soundEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            {soundEnabled ? '🔊 Sound' : '🔇 Muted'}
          </button>
          <button
            onClick={() => setReadAloudEnabled(!readAloudEnabled)}
            className={`px-3 py-1 rounded-full text-sm ${readAloudEnabled ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            {readAloudEnabled ? '🗣️ Read' : '🔕 Read'}
          </button>
        </div>

        {/* Game Mode Grid */}
        <div className="grid grid-cols-2 gap-3 max-w-md w-full">
          <button
            onClick={() => { setScreen('addition'); generateAddition(); }}
            className="bg-gradient-to-br from-red-500 to-red-700 p-4 rounded-3xl shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-red-400"
          >
            <div className="flex justify-between items-start">
              <div className="text-3xl mb-1">➕</div>
              <DifficultyBadge mode="addition" />
            </div>
            <div className="text-base font-bold text-white">Addition</div>
          </button>

          <button
            onClick={() => { setScreen('subtraction'); generateSubtraction(); }}
            className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-3xl shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-blue-400"
          >
            <div className="flex justify-between items-start">
              <div className="text-3xl mb-1">➖</div>
              <DifficultyBadge mode="subtraction" />
            </div>
            <div className="text-base font-bold text-white">Subtraction</div>
          </button>

          <button
            onClick={() => { setScreen('skipcount'); generateSkipCount(); }}
            className="bg-gradient-to-br from-purple-500 to-purple-700 p-4 rounded-3xl shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-purple-400"
          >
            <div className="flex justify-between items-start">
              <div className="text-3xl mb-1">🔢</div>
              <DifficultyBadge mode="skipcount" />
            </div>
            <div className="text-base font-bold text-white">Skip Count</div>
          </button>

          <button
            onClick={() => { setScreen('patterns'); generatePattern(); }}
            className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-3xl shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-orange-300"
          >
            <div className="flex justify-between items-start">
              <div className="text-3xl mb-1">🔮</div>
              <DifficultyBadge mode="patterns" />
            </div>
            <div className="text-base font-bold text-white">Patterns</div>
          </button>

          <button
            onClick={() => { setScreen('multiplication'); generateMultiplication(); }}
            className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-4 rounded-3xl shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-yellow-400"
          >
            <div className="flex justify-between items-start">
              <div className="text-3xl mb-1">✖️</div>
              <DifficultyBadge mode="multiplication" />
            </div>
            <div className="text-base font-bold text-white">Multiply</div>
          </button>

          <button
            onClick={() => { setScreen('groups'); generateGroups(); }}
            className="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-3xl shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-green-400"
          >
            <div className="flex justify-between items-start">
              <div className="text-3xl mb-1">🍕</div>
              <DifficultyBadge mode="groups" />
            </div>
            <div className="text-base font-bold text-white">Groups</div>
          </button>
        </div>

        <div className="mt-4 bg-gray-700/80 p-3 rounded-2xl max-w-md text-center border border-green-500/30">
          <p className="text-green-300 text-sm">🔥 Get 5 in a row to earn a star! ⭐</p>
        </div>

        <button
          onClick={() => setScreen('parent')}
          className="mt-3 text-gray-500 text-sm underline hover:text-gray-300"
        >
          Parent Dashboard
        </button>
      </div>
    );
  }

  // ADDITION SCREEN
  if (screen === 'addition' && problem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-600 via-red-500 to-red-700 p-4 flex flex-col items-center no-select">
        <Confetti active={showConfetti} />
        <Header title="Addition" color="red" />
        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
          <div className="text-5xl font-bold text-gray-800 mb-4">
            {problem.a} + {problem.b} = ?
          </div>
          {problem.a + problem.b <= 20 && (
            <div className="flex justify-center gap-1 mb-4 flex-wrap">
              {[...Array(problem.a)].map((_, i) => <span key={i} className="text-xl">🔴</span>)}
              <span className="text-xl mx-1">+</span>
              {[...Array(problem.b)].map((_, i) => <span key={i} className="text-xl">🟡</span>)}
            </div>
          )}
          <div className="text-4xl font-bold text-red-600 bg-red-100 rounded-xl py-3 mb-4">
            {userAnswer || '?'}
          </div>
          {!feedback && (
            <NumberPad
              onNumber={handleNumberTap}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(problem.answer, userAnswer, 'addition')}
            />
          )}
          {feedback && <FeedbackDisplay onNext={generateAddition} />}
        </div>
      </div>
    );
  }

  // SUBTRACTION SCREEN
  if (screen === 'subtraction' && problem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 via-blue-500 to-blue-700 p-4 flex flex-col items-center no-select">
        <Confetti active={showConfetti} />
        <Header title="Subtraction" color="blue" />
        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
          <div className="text-5xl font-bold text-gray-800 mb-4">
            {problem.a} − {problem.b} = ?
          </div>
          {problem.a <= 15 && (
            <>
              <div className="flex justify-center flex-wrap gap-1 mb-2">
                {[...Array(problem.a)].map((_, i) => (
                  <span key={i} className={`text-xl ${i < problem.b ? 'opacity-30 line-through' : ''}`}>🔵</span>
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
              onNumber={handleNumberTap}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(problem.answer, userAnswer, 'subtraction')}
            />
          )}
          {feedback && <FeedbackDisplay onNext={generateSubtraction} />}
        </div>
      </div>
    );
  }

  // MULTIPLICATION SCREEN
  if (screen === 'multiplication' && problem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-500 via-yellow-400 to-yellow-600 p-4 flex flex-col items-center no-select">
        <Confetti active={showConfetti} />
        <Header title="Multiplication" color="yellow" />
        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
          <div className="text-5xl font-bold text-gray-800 mb-4">
            {problem.a} × {problem.b} = ?
          </div>
          {problem.a * problem.b <= 25 && (
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              {[...Array(problem.a)].map((_, row) => (
                <div key={row} className="flex gap-0.5">
                  {[...Array(problem.b)].map((_, col) => (
                    <span key={col} className="text-lg">⭐</span>
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="text-4xl font-bold text-yellow-600 bg-yellow-100 rounded-xl py-3 mb-4">
            {userAnswer || '?'}
          </div>
          {!feedback && (
            <NumberPad
              onNumber={handleNumberTap}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(problem.answer, userAnswer, 'multiplication')}
            />
          )}
          {feedback && <FeedbackDisplay onNext={generateMultiplication} />}
        </div>
      </div>
    );
  }

  // SKIP COUNTING SCREEN
  if (screen === 'skipcount' && skipCount) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-500 to-purple-700 p-4 flex flex-col items-center no-select">
        <Confetti active={showConfetti} />
        <Header title="Skip Counting" color="purple" />
        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
          <div className="text-xl font-bold text-purple-700 mb-4">Count by {skipCount.by}s! 🧠</div>
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {skipCount.sequence.map((num, i) => (
              <div
                key={i}
                className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl font-bold ${
                  i === skipCount.missing ? 'bg-yellow-200 border-4 border-yellow-400' : 'bg-purple-100 text-purple-700'
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
              onNumber={handleNumberTap}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(skipCount.answer, userAnswer, 'skipcount')}
            />
          )}
          {feedback && <FeedbackDisplay onNext={generateSkipCount} />}
        </div>
      </div>
    );
  }

  // PATTERNS SCREEN
  if (screen === 'patterns' && patternData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-500 via-orange-400 to-orange-600 p-4 flex flex-col items-center no-select">
        <Confetti active={showConfetti} />
        <Header title="Patterns" color="orange" />
        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
          <div className="text-xl font-bold text-orange-700 mb-4">What comes next? 🍕</div>
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
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-yellow-200 border-4 border-yellow-400 text-xl font-bold">?</div>
          </div>
          {patternData.hint && <p className="text-gray-500 text-sm mb-4">Hint: {patternData.hint}</p>}
          {!feedback && (
            <div className="flex justify-center gap-4 flex-wrap">
              {patternData.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => { if (soundEnabled) playTapSound(); checkAnswer(patternData.answer, opt, 'patterns'); }}
                  className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-3xl font-bold rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {feedback && <FeedbackDisplay onNext={generatePattern} />}
        </div>
      </div>
    );
  }

  // GROUPS SCREEN
  if (screen === 'groups' && groupData) {
    const emoji = groupEmojiRef.current;
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-600 via-green-500 to-green-700 p-4 flex flex-col items-center no-select">
        <Confetti active={showConfetti} />
        <Header title="Counting Groups" color="green" />
        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md text-center">
          <div className="text-xl font-bold text-green-700 mb-4">
            {groupData.groups} groups of {groupData.perGroup}
          </div>
          <div className="flex justify-center gap-3 mb-4 flex-wrap">
            {[...Array(groupData.groups)].map((_, g) => (
              <div key={g} className="bg-green-50 p-2 rounded-xl border-2 border-green-200">
                <div className="flex gap-0.5 flex-wrap justify-center" style={{ maxWidth: '80px' }}>
                  {[...Array(groupData.perGroup)].map((_, i) => <span key={i} className="text-xl">{emoji}</span>)}
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
              onNumber={handleNumberTap}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(groupData.total, userAnswer, 'groups')}
            />
          )}
          {feedback && <FeedbackDisplay onNext={generateGroups} showMultiplication={true} />}
        </div>
      </div>
    );
  }

  // PARENT DASHBOARD
  if (screen === 'parent') {
    const handleExport = () => {
      const report = exportProgress();
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `math-heroes-progress-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <button onClick={goHome} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full font-bold">
              ← Back
            </button>
            <h2 className="text-xl font-bold text-green-400">Progress</h2>
            <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-full text-sm font-bold">
              📥 Export
            </button>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow p-4 mb-4 border border-gray-700">
            <h3 className="font-bold text-green-400 mb-3">Overall Stats</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-yellow-900/30 p-2 rounded-xl border border-yellow-700/50 text-center">
                <div className="text-xl font-bold text-yellow-400">{stats.totalStars}</div>
                <div className="text-gray-400 text-xs">Stars</div>
              </div>
              <div className="bg-green-900/30 p-2 rounded-xl border border-green-700/50 text-center">
                <div className="text-xl font-bold text-green-400">{stats.totalScore}</div>
                <div className="text-gray-400 text-xs">Score</div>
              </div>
              <div className="bg-purple-900/30 p-2 rounded-xl border border-purple-700/50 text-center">
                <div className="text-xl font-bold text-purple-400">{stats.dailyStreak || 0}</div>
                <div className="text-gray-400 text-xs">Day Streak</div>
              </div>
              <div className="bg-blue-900/30 p-2 rounded-xl border border-blue-700/50 text-center">
                <div className="text-xl font-bold text-blue-400">
                  {stats.totalProblems > 0 ? Math.round((stats.totalCorrect / stats.totalProblems) * 100) : 0}%
                </div>
                <div className="text-gray-400 text-xs">Accuracy</div>
              </div>
              <div className="bg-orange-900/30 p-2 rounded-xl border border-orange-700/50 text-center">
                <div className="text-xl font-bold text-orange-400">{stats.bestStreak}</div>
                <div className="text-gray-400 text-xs">Best Streak</div>
              </div>
              <div className="bg-pink-900/30 p-2 rounded-xl border border-pink-700/50 text-center">
                <div className="text-xl font-bold text-pink-400">{getFormattedTotalTime()}</div>
                <div className="text-gray-400 text-xs">Time</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow p-4 mb-4 border border-gray-700">
            <h3 className="font-bold text-green-400 mb-3">By Game Mode</h3>
            {[
              { mode: 'addition', color: 'text-red-400', label: 'Addition' },
              { mode: 'subtraction', color: 'text-blue-400', label: 'Subtraction' },
              { mode: 'multiplication', color: 'text-yellow-400', label: 'Multiply' },
              { mode: 'skipcount', color: 'text-purple-400', label: 'Skip Count' },
              { mode: 'patterns', color: 'text-orange-400', label: 'Patterns' },
              { mode: 'groups', color: 'text-green-400', label: 'Groups' },
            ].map(({ mode, color, label }) => {
              const modeStat = modeStats[mode] || { attempted: 0, correct: 0, stars: 0 };
              const accuracy = modeStat.attempted > 0 ? Math.round((modeStat.correct / modeStat.attempted) * 100) : 0;
              const difficulty = getDifficulty(mode);
              const badges = { easy: '🥉', medium: '🥈', hard: '🥇' };
              return (
                <div key={mode} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span>{badges[difficulty]}</span>
                    <span className={`font-medium ${color}`}>{label}</span>
                  </div>
                  <div className="text-right text-sm">
                    <span className="text-gray-300">{modeStat.correct}/{modeStat.attempted}</span>
                    <span className="text-gray-500 ml-2">({accuracy}%)</span>
                  </div>
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
