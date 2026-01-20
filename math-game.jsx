import React, { useState, useEffect } from 'react';

const MathGameApp = () => {
  const [screen, setScreen] = useState('home');
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [problem, setProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [skipCount, setSkipCount] = useState({ by: 2, sequence: [], missing: 0 });
  const [patternData, setPatternData] = useState({ pattern: [], answer: 0, options: [] });
  const [groupData, setGroupData] = useState({ groups: 0, perGroup: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  const generateAddition = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setProblem({ type: 'addition', a, b, answer: a + b, symbol: '+' });
    setUserAnswer('');
    setFeedback(null);
  };

  const generateSubtraction = () => {
    const a = Math.floor(Math.random() * 10) + 5;
    const b = Math.floor(Math.random() * Math.min(a, 10)) + 1;
    setProblem({ type: 'subtraction', a, b, answer: a - b, symbol: '−' });
    setUserAnswer('');
    setFeedback(null);
  };

  const generateSkipCount = () => {
    const options = [2, 5, 10];
    const by = options[Math.floor(Math.random() * options.length)];
    const start = by === 10 ? 0 : Math.floor(Math.random() * 3) * by;
    const sequence = [];
    for (let i = 0; i < 6; i++) {
      sequence.push(start + by * i);
    }
    const missingIndex = Math.floor(Math.random() * 4) + 1;
    setSkipCount({ by, sequence, missing: missingIndex });
    setUserAnswer('');
    setFeedback(null);
  };

  const generatePattern = () => {
    const patternTypes = [
      { pattern: [2, 4, 6, 8], next: 10, rule: '+2' },
      { pattern: [5, 10, 15, 20], next: 25, rule: '+5' },
      { pattern: [10, 20, 30, 40], next: 50, rule: '+10' },
      { pattern: [1, 3, 5, 7], next: 9, rule: '+2' },
      { pattern: [3, 6, 9, 12], next: 15, rule: '+3' },
      { pattern: [4, 8, 12, 16], next: 20, rule: '+4' },
    ];
    const selected = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    const wrongOptions = [
      selected.next + 1,
      selected.next - 1,
      selected.next + 2,
    ].filter(n => n !== selected.next && n > 0);
    const options = [selected.next, ...wrongOptions.slice(0, 2)].sort(() => Math.random() - 0.5);
    setPatternData({ pattern: selected.pattern, answer: selected.next, options });
    setFeedback(null);
  };

  const generateGroups = () => {
    const groups = Math.floor(Math.random() * 4) + 2;
    const perGroup = Math.floor(Math.random() * 5) + 2;
    setGroupData({ groups, perGroup, total: groups * perGroup });
    setUserAnswer('');
    setFeedback(null);
  };

  const checkAnswer = (correct, given) => {
    if (parseInt(given) === correct) {
      setFeedback('correct');
      setScore(s => s + 10);
      setStreak(s => s + 1);
      if ((streak + 1) % 5 === 0) {
        setStars(s => s + 1);
      }
    } else {
      setFeedback('wrong');
      setStreak(0);
    }
  };

  const GameButton = ({ onClick, children, color = 'blue', size = 'normal' }) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
      pink: 'bg-pink-500 hover:bg-pink-600',
      yellow: 'bg-yellow-500 hover:bg-yellow-600',
    };
    const sizes = {
      small: 'px-4 py-2 text-lg',
      normal: 'px-6 py-3 text-xl',
      large: 'px-8 py-4 text-2xl',
    };
    return (
      <button
        onClick={onClick}
        className={`${colors[color]} ${sizes[size]} text-white font-bold rounded-2xl shadow-lg transform transition hover:scale-105 active:scale-95`}
      >
        {children}
      </button>
    );
  };

  const StarDisplay = () => (
    <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
      <span className="text-2xl">⭐</span>
      <span className="text-xl font-bold text-yellow-700">{stars}</span>
    </div>
  );

  const ScoreDisplay = () => (
    <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
      <span className="text-2xl">🎯</span>
      <span className="text-xl font-bold text-blue-700">{score}</span>
    </div>
  );

  const StreakDisplay = () => (
    streak > 0 && (
      <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full">
        <span className="text-2xl">🔥</span>
        <span className="text-xl font-bold text-orange-700">{streak}</span>
      </div>
    )
  );

  const Header = ({ title }) => (
    <div className="w-full flex justify-between items-center mb-6">
      <button
        onClick={() => setScreen('home')}
        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full text-lg font-bold"
      >
        🏠 Home
      </button>
      <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
      <div className="flex gap-2">
        <StreakDisplay />
        <StarDisplay />
        <ScoreDisplay />
      </div>
    </div>
  );

  const FeedbackDisplay = ({ onNext }) => (
    <div className={`mt-6 p-4 rounded-2xl text-center ${feedback === 'correct' ? 'bg-green-100' : 'bg-red-100'}`}>
      {feedback === 'correct' ? (
        <div>
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-2xl font-bold text-green-700">Great Job!</p>
          {streak > 0 && streak % 5 === 0 && <p className="text-lg text-yellow-600 mt-2">⭐ You earned a star!</p>}
        </div>
      ) : (
        <div>
          <p className="text-4xl mb-2">💪</p>
          <p className="text-2xl font-bold text-red-700">Try Again!</p>
        </div>
      )}
      <button
        onClick={onNext}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-bold"
      >
        Next Problem →
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
          className={`p-4 text-2xl font-bold rounded-xl shadow ${
            n === '✓' ? 'bg-green-500 text-white' : n === '🗑️' ? 'bg-red-400 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );

  // HOME SCREEN
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-green-200 p-6 flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2">🌟 Math Adventure 🌟</h1>
          <div className="flex justify-center gap-4 mt-4">
            <StarDisplay />
            <ScoreDisplay />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
          <button
            onClick={() => { setScreen('addition'); generateAddition(); }}
            className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-3xl shadow-xl transform hover:scale-105 transition"
          >
            <div className="text-5xl mb-2">➕</div>
            <div className="text-xl font-bold text-white">Addition</div>
          </button>
          
          <button
            onClick={() => { setScreen('subtraction'); generateSubtraction(); }}
            className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-3xl shadow-xl transform hover:scale-105 transition"
          >
            <div className="text-5xl mb-2">➖</div>
            <div className="text-xl font-bold text-white">Subtraction</div>
          </button>
          
          <button
            onClick={() => { setScreen('skipcount'); generateSkipCount(); }}
            className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 rounded-3xl shadow-xl transform hover:scale-105 transition"
          >
            <div className="text-5xl mb-2">🔢</div>
            <div className="text-xl font-bold text-white">Skip Counting</div>
          </button>
          
          <button
            onClick={() => { setScreen('patterns'); generatePattern(); }}
            className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-3xl shadow-xl transform hover:scale-105 transition"
          >
            <div className="text-5xl mb-2">🔮</div>
            <div className="text-xl font-bold text-white">Patterns</div>
          </button>
          
          <button
            onClick={() => { setScreen('groups'); generateGroups(); }}
            className="bg-gradient-to-br from-pink-400 to-pink-600 p-6 rounded-3xl shadow-xl transform hover:scale-105 transition col-span-2"
          >
            <div className="text-5xl mb-2">🍎🍎🍎</div>
            <div className="text-xl font-bold text-white">Groups (Pre-Multiplication)</div>
          </button>
        </div>
        
        <div className="mt-8 bg-white/80 p-4 rounded-2xl max-w-lg">
          <p className="text-center text-gray-700">
            🔥 Get 5 in a row to earn a star! ⭐
          </p>
        </div>
      </div>
    );
  }

  // ADDITION SCREEN
  if (screen === 'addition' && problem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-300 to-green-100 p-6 flex flex-col items-center">
        <Header title="Addition" />
        
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-6xl font-bold text-gray-800 mb-6">
            {problem.a} + {problem.b} = ?
          </div>
          
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(problem.a)].map((_, i) => (
              <span key={i} className="text-2xl">🟢</span>
            ))}
            <span className="text-2xl mx-2">+</span>
            {[...Array(problem.b)].map((_, i) => (
              <span key={i} className="text-2xl">🔵</span>
            ))}
          </div>
          
          <div className="text-4xl font-bold text-blue-600 bg-blue-100 rounded-xl py-3 mb-4">
            {userAnswer || '?'}
          </div>
          
          {!feedback && (
            <NumberPad
              onNumber={(n) => setUserAnswer(prev => prev + n)}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(problem.answer, userAnswer)}
            />
          )}
          
          {feedback && (
            <FeedbackDisplay onNext={generateAddition} />
          )}
        </div>
      </div>
    );
  }

  // SUBTRACTION SCREEN
  if (screen === 'subtraction' && problem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-300 to-blue-100 p-6 flex flex-col items-center">
        <Header title="Subtraction" />
        
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-6xl font-bold text-gray-800 mb-6">
            {problem.a} − {problem.b} = ?
          </div>
          
          <div className="flex justify-center flex-wrap gap-1 mb-4">
            {[...Array(problem.a)].map((_, i) => (
              <span key={i} className={`text-2xl ${i < problem.b ? 'opacity-30' : ''}`}>
                🍎
              </span>
            ))}
          </div>
          <p className="text-gray-500 mb-4">Cross out {problem.b}... how many are left?</p>
          
          <div className="text-4xl font-bold text-blue-600 bg-blue-100 rounded-xl py-3 mb-4">
            {userAnswer || '?'}
          </div>
          
          {!feedback && (
            <NumberPad
              onNumber={(n) => setUserAnswer(prev => prev + n)}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(problem.answer, userAnswer)}
            />
          )}
          
          {feedback && (
            <FeedbackDisplay onNext={generateSubtraction} />
          )}
        </div>
      </div>
    );
  }

  // SKIP COUNTING SCREEN
  if (screen === 'skipcount') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-300 to-purple-100 p-6 flex flex-col items-center">
        <Header title="Skip Counting" />
        
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-2xl font-bold text-purple-700 mb-4">
            Count by {skipCount.by}s! 🐰
          </div>
          
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {skipCount.sequence.map((num, i) => (
              <div
                key={i}
                className={`w-14 h-14 flex items-center justify-center rounded-xl text-2xl font-bold ${
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
              onSubmit={() => checkAnswer(skipCount.sequence[skipCount.missing], userAnswer)}
            />
          )}
          
          {feedback && (
            <FeedbackDisplay onNext={generateSkipCount} />
          )}
        </div>
      </div>
    );
  }

  // PATTERNS SCREEN
  if (screen === 'patterns') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-300 to-orange-100 p-6 flex flex-col items-center">
        <Header title="Number Patterns" />
        
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-2xl font-bold text-orange-700 mb-4">
            What comes next? 🤔
          </div>
          
          <div className="flex justify-center gap-3 mb-6 items-center">
            {patternData.pattern.map((num, i) => (
              <React.Fragment key={i}>
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-100 text-2xl font-bold text-orange-700">
                  {num}
                </div>
                {i < patternData.pattern.length - 1 && <span className="text-2xl">→</span>}
              </React.Fragment>
            ))}
            <span className="text-2xl">→</span>
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-yellow-200 border-4 border-yellow-400 text-2xl font-bold">
              ?
            </div>
          </div>
          
          {!feedback && (
            <div className="flex justify-center gap-4">
              {patternData.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    checkAnswer(patternData.answer, opt);
                  }}
                  className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-2xl font-bold rounded-xl shadow-lg hover:scale-110 transition"
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

  // GROUPS (PRE-MULTIPLICATION) SCREEN
  if (screen === 'groups') {
    const emojis = ['🍎', '⭐', '🌸', '🐱', '🎈', '🍪'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-300 to-pink-100 p-6 flex flex-col items-center">
        <Header title="Counting Groups" />
        
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-2xl font-bold text-pink-700 mb-4">
            {groupData.groups} groups of {groupData.perGroup}
          </div>
          
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            {[...Array(groupData.groups)].map((_, g) => (
              <div key={g} className="bg-pink-50 p-3 rounded-xl border-2 border-pink-200">
                <div className="flex gap-1 flex-wrap justify-center max-w-24">
                  {[...Array(groupData.perGroup)].map((_, i) => (
                    <span key={i} className="text-2xl">🍎</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-gray-600 mb-4">How many in all?</p>
          
          <div className="text-4xl font-bold text-pink-600 bg-pink-100 rounded-xl py-3 mb-4">
            {userAnswer || '?'}
          </div>
          
          {!feedback && (
            <NumberPad
              onNumber={(n) => setUserAnswer(prev => prev + n)}
              onClear={() => setUserAnswer('')}
              onSubmit={() => checkAnswer(groupData.total, userAnswer)}
            />
          )}
          
          {feedback && (
            <div className={`mt-6 p-4 rounded-2xl text-center ${feedback === 'correct' ? 'bg-green-100' : 'bg-red-100'}`}>
              {feedback === 'correct' ? (
                <div>
                  <p className="text-4xl mb-2">🎉</p>
                  <p className="text-2xl font-bold text-green-700">Great Job!</p>
                  <p className="text-lg text-gray-600 mt-2">
                    {groupData.groups} × {groupData.perGroup} = {groupData.total}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-2">💪</p>
                  <p className="text-2xl font-bold text-red-700">Try counting again!</p>
                </div>
              )}
              <button
                onClick={generateGroups}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-bold"
              >
                Next Problem →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default MathGameApp;
