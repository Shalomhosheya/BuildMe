import React, { useState, useEffect } from 'react';
import { Gamepad2, BookA, SpellCheck, CheckCircle2, XCircle, ArrowRight, RefreshCcw } from 'lucide-react';

type GameMode = 'menu' | 'vocab' | 'grammar';

const VOCAB_PAIRS = [
  { word: 'Ubiquitous', def: 'Present, appearing, or found everywhere' },
  { word: 'Meticulous', def: 'Showing great attention to detail' },
  { word: 'Profound', def: 'Very great or intense' },
  { word: 'Elucidate', def: 'Make (something) clear; explain' },
  { word: 'Pragmatic', def: 'Dealing with things sensibly and realistically' },
];

const GRAMMAR_QUESTIONS = [
  {
    sentence: 'By the time we arrive, the concert ________.',
    options: ['will start', 'will have started', 'starts', 'started'],
    answer: 1,
    explanation: '"Will have started" is correct for future perfect tense, indicating an action completed before a point in the future.'
  },
  {
    sentence: 'If I ________ about the problem, I would have helped you.',
    options: ['knew', 'have known', 'had known', 'know'],
    answer: 2,
    explanation: 'Third conditional requires past perfect ("had known") in the "if" clause.'
  },
  {
    sentence: 'Despite ________ hard, he failed the exam.',
    options: ['to study', 'study', 'studied', 'studying'],
    answer: 3,
    explanation: '"Despite" is followed by a gerund (-ing form) or a noun phrase.'
  }
];

export default function Games() {
  const [mode, setMode] = useState<GameMode>('menu');

  // Vocab State
  const [vocabWords, setVocabWords] = useState<{word: string, id: number}[]>([]);
  const [vocabDefs, setVocabDefs] = useState<{def: string, id: number}[]>([]);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [selectedDef, setSelectedDef] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [wrongPair, setWrongPair] = useState<{w: number, d: number} | null>(null);

  // Grammar State
  const [grammarIndex, setGrammarIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [grammarScore, setGrammarScore] = useState(0);
  const [grammarFinished, setGrammarFinished] = useState(false);

  useEffect(() => {
    if (mode === 'vocab') {
      initVocab();
    } else if (mode === 'grammar') {
      initGrammar();
    }
  }, [mode]);

  const initVocab = () => {
    const pairs = [...VOCAB_PAIRS].map((p, i) => ({ ...p, id: i }));
    setVocabWords([...pairs].sort(() => Math.random() - 0.5).map(p => ({ word: p.word, id: p.id })));
    setVocabDefs([...pairs].sort(() => Math.random() - 0.5).map(p => ({ def: p.def, id: p.id })));
    setMatchedPairs([]);
    setSelectedWord(null);
    setSelectedDef(null);
    setWrongPair(null);
  };

  const initGrammar = () => {
    setGrammarIndex(0);
    setSelectedOption(null);
    setGrammarScore(0);
    setGrammarFinished(false);
  };

  const handleVocabClick = (type: 'word' | 'def', id: number) => {
    if (matchedPairs.includes(id)) return;
    
    if (type === 'word') {
      setSelectedWord(id);
      if (selectedDef !== null) {
        checkVocabMatch(id, selectedDef);
      }
    } else {
      setSelectedDef(id);
      if (selectedWord !== null) {
        checkVocabMatch(selectedWord, id);
      }
    }
  };

  const checkVocabMatch = (wId: number, dId: number) => {
    if (wId === dId) {
      setMatchedPairs(prev => [...prev, wId]);
      setSelectedWord(null);
      setSelectedDef(null);
    } else {
      setWrongPair({ w: wId, d: dId });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedWord(null);
        setSelectedDef(null);
      }, 800);
    }
  };

  const handleGrammarOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (index === GRAMMAR_QUESTIONS[grammarIndex].answer) {
      setGrammarScore(s => s + 1);
    }
  };

  const nextGrammarQuestion = () => {
    if (grammarIndex < GRAMMAR_QUESTIONS.length - 1) {
      setGrammarIndex(i => i + 1);
      setSelectedOption(null);
    } else {
      setGrammarFinished(true);
    }
  };

  const renderMenu = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 30 }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Gamepad2 size={36} color="var(--purple)" />
          Learning Games
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Take a break and learn with interactive challenges.</p>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div 
          onClick={() => setMode('vocab')}
          style={{
            background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            padding: 30, width: 280, cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.borderColor = 'var(--purple)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(168, 85, 247, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
          }}
        >
          <div style={{ background: 'var(--purple-light)', padding: 15, borderRadius: '50%', marginBottom: 20 }}>
            <BookA size={32} color="var(--purple)" />
          </div>
          <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 10 }}>Vocabulary Match</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Match advanced IELTS vocabulary words to their definitions.</p>
        </div>

        <div 
          onClick={() => setMode('grammar')}
          style={{
            background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            padding: 30, width: 280, cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.borderColor = 'var(--purple)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(168, 85, 247, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
          }}
        >
          <div style={{ background: 'var(--blue-light)', padding: 15, borderRadius: '50%', marginBottom: 20 }}>
            <SpellCheck size={32} color="var(--blue)" />
          </div>
          <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 10 }}>Grammar Fill-in</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Test your knowledge of complex grammar structures.</p>
        </div>
      </div>
    </div>
  );

  const renderVocab = () => {
    const isFinished = matchedPairs.length === VOCAB_PAIRS.length;

    return (
      <div style={{ padding: '40px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <button 
          onClick={() => setMode('menu')}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', marginBottom: 20, fontSize: 14 }}
        >
          ← Back to Menu
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h2 style={{ fontSize: 24, color: 'var(--text-primary)' }}>Vocabulary Match</h2>
          <div style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 500 }}>
            Matched: {matchedPairs.length} / {VOCAB_PAIRS.length}
          </div>
        </div>

        {isFinished ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--green)', marginBottom: 20 }}>
              <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 10 }}>Great Job!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>You matched all the words correctly.</p>
            <button 
              onClick={initVocab}
              style={{
                background: 'var(--purple)', color: 'white', border: 'none', padding: '12px 24px',
                borderRadius: 'var(--radius-md)', fontSize: 16, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto'
              }}
            >
              <RefreshCcw size={18} /> Play Again
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {vocabWords.map((w) => {
                const isMatched = matchedPairs.includes(w.id);
                const isSelected = selectedWord === w.id;
                const isWrong = wrongPair?.w === w.id;
                
                let bg = 'var(--surface-1)';
                let borderColor = 'var(--border)';
                let color = 'var(--text-primary)';

                if (isMatched) { bg = 'var(--green-light)'; borderColor = 'var(--green)'; color = 'var(--green-dark)'; }
                else if (isWrong) { bg = '#FCEBEB'; borderColor = '#E24B4A'; color = '#791F1F'; }
                else if (isSelected) { bg = 'var(--purple-light)'; borderColor = 'var(--purple)'; color = 'var(--purple-dark)'; }

                return (
                  <button
                    key={`w-${w.id}`}
                    onClick={() => handleVocabClick('word', w.id)}
                    disabled={isMatched}
                    style={{
                      padding: '16px 20px', borderRadius: 'var(--radius-md)', border: `2px solid ${borderColor}`,
                      background: bg, color: color, fontSize: 16, fontWeight: 500, cursor: isMatched ? 'default' : 'pointer',
                      transition: 'all 0.2s', textAlign: 'left', opacity: isMatched ? 0.6 : 1,
                      transform: isWrong ? 'translateX(5px)' : 'none'
                    }}
                  >
                    {w.word}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {vocabDefs.map((d) => {
                const isMatched = matchedPairs.includes(d.id);
                const isSelected = selectedDef === d.id;
                const isWrong = wrongPair?.d === d.id;
                
                let bg = 'var(--surface-1)';
                let borderColor = 'var(--border)';
                let color = 'var(--text-secondary)';

                if (isMatched) { bg = 'var(--green-light)'; borderColor = 'var(--green)'; color = 'var(--green-dark)'; }
                else if (isWrong) { bg = '#FCEBEB'; borderColor = '#E24B4A'; color = '#791F1F'; }
                else if (isSelected) { bg = 'var(--purple-light)'; borderColor = 'var(--purple)'; color = 'var(--purple-dark)'; }

                return (
                  <button
                    key={`d-${d.id}`}
                    onClick={() => handleVocabClick('def', d.id)}
                    disabled={isMatched}
                    style={{
                      padding: '16px 20px', borderRadius: 'var(--radius-md)', border: `2px solid ${borderColor}`,
                      background: bg, color: color, fontSize: 15, cursor: isMatched ? 'default' : 'pointer',
                      transition: 'all 0.2s', textAlign: 'left', opacity: isMatched ? 0.6 : 1, lineHeight: 1.5,
                      transform: isWrong ? 'translateX(-5px)' : 'none'
                    }}
                  >
                    {d.def}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGrammar = () => {
    const q = GRAMMAR_QUESTIONS[grammarIndex];
    const isAnswered = selectedOption !== null;

    return (
      <div style={{ padding: '40px', maxWidth: 700, margin: '0 auto', width: '100%' }}>
        <button 
          onClick={() => setMode('menu')}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', marginBottom: 20, fontSize: 14 }}
        >
          ← Back to Menu
        </button>

        {grammarFinished ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
             <div style={{ color: grammarScore === GRAMMAR_QUESTIONS.length ? 'var(--green)' : 'var(--blue)', marginBottom: 20 }}>
              <AwardIcon size={64} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 10 }}>Quiz Completed!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 30 }}>You scored {grammarScore} out of {GRAMMAR_QUESTIONS.length}</p>
            <button 
              onClick={initGrammar}
              style={{
                background: 'var(--purple)', color: 'white', border: 'none', padding: '12px 24px',
                borderRadius: 'var(--radius-md)', fontSize: 16, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto'
              }}
            >
              <RefreshCcw size={18} /> Play Again
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <h2 style={{ fontSize: 20, color: 'var(--text-primary)' }}>Grammar Fill-in</h2>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '6px 12px', borderRadius: 20 }}>
                Question {grammarIndex + 1} of {GRAMMAR_QUESTIONS.length}
              </div>
            </div>

            <div style={{ background: 'var(--surface-1)', padding: 40, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <p style={{ fontSize: 22, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 40, fontWeight: 500 }}>
                {q.sentence}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {q.options.map((opt, i) => {
                  let bg = 'var(--surface-2)';
                  let borderColor = 'transparent';
                  let icon = null;

                  if (isAnswered) {
                    if (i === q.answer) {
                      bg = 'var(--green-light)';
                      borderColor = 'var(--green)';
                      icon = <CheckCircle2 size={18} color="var(--green-dark)" />;
                    } else if (i === selectedOption) {
                      bg = '#FCEBEB';
                      borderColor = '#E24B4A';
                      icon = <XCircle size={18} color="#791F1F" />;
                    }
                  } else if (selectedOption === i) {
                     bg = 'var(--purple-light)';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleGrammarOptionClick(i)}
                      disabled={isAnswered}
                      style={{
                        padding: '16px 20px', borderRadius: 'var(--radius-md)', border: `2px solid ${borderColor}`,
                        background: bg, color: 'var(--text-primary)', fontSize: 16, textAlign: 'left',
                        cursor: isAnswered ? 'default' : 'pointer', transition: 'all 0.2s',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                      onMouseEnter={e => { if (!isAnswered) e.currentTarget.style.background = 'var(--purple-light)'; }}
                      onMouseLeave={e => { if (!isAnswered) e.currentTarget.style.background = 'var(--surface-2)'; }}
                    >
                      {opt}
                      {icon}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div style={{ marginTop: 30, padding: 20, background: 'var(--blue-light)', borderRadius: 'var(--radius-md)', color: 'var(--blue-dark)' }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                </div>
              )}

              {isAnswered && (
                <button
                  onClick={nextGrammarQuestion}
                  style={{
                    marginTop: 30, width: '100%', background: 'var(--purple)', color: 'white', border: 'none',
                    padding: '16px', borderRadius: 'var(--radius-md)', fontSize: 16, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {grammarIndex < GRAMMAR_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {mode === 'menu' && renderMenu()}
      {mode === 'vocab' && renderVocab()}
      {mode === 'grammar' && renderGrammar()}
    </div>
  );
}

function AwardIcon({ size, style }: { size: number, style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}
