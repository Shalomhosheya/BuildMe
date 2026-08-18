import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, X, RefreshCcw, Play, Volume2, VolumeX, Zap, ChevronLeft } from 'lucide-react';
import { gameApi, LeaderboardEntry, MyScore } from './api/games';

// ─── IELTS vocabulary bank ───────────────────────────────────────────────────
const VOCAB_BANK = [
  { word: 'Ubiquitous',    def: 'Present or found everywhere' },
  { word: 'Meticulous',   def: 'Showing great attention to detail' },
  { word: 'Profound',     def: 'Very great or intense; having insight' },
  { word: 'Elucidate',    def: 'Make something clear; explain it' },
  { word: 'Pragmatic',    def: 'Dealing with things sensibly and realistically' },
  { word: 'Ambiguous',    def: 'Open to more than one interpretation' },
  { word: 'Coherent',     def: 'Logical and consistent; clearly expressed' },
  { word: 'Concise',      def: 'Giving information clearly, using few words' },
  { word: 'Discrepancy',  def: 'A difference or inconsistency between things' },
  { word: 'Elaborate',    def: 'Involving many carefully arranged parts; detailed' },
  { word: 'Exacerbate',   def: 'Make a problem or bad situation worse' },
  { word: 'Hypothesis',   def: 'A supposition made as a starting point for reasoning' },
  { word: 'Imminent',     def: 'About to happen very soon' },
  { word: 'Inherent',     def: 'Existing as a natural part of something' },
  { word: 'Mitigate',     def: 'Make something less severe or serious' },
  { word: 'Obsolete',     def: 'No longer in use; out of date' },
  { word: 'Paradox',      def: 'A statement that seems contradictory but may be true' },
  { word: 'Perpetuate',   def: 'Make something continue indefinitely' },
  { word: 'Scrutinize',   def: 'Examine or inspect closely' },
  { word: 'Substantial',  def: 'Of considerable importance, size, or value' },
  { word: 'Tenacious',    def: 'Holding fast; persistent' },
  { word: 'Unprecedented', def: 'Never done or known before' },
  { word: 'Volatile',     def: 'Liable to change rapidly and unpredictably' },
  { word: 'Wane',         def: 'Decrease in vigour, power, or extent' },
  { word: 'Zeal',         def: 'Great energy or enthusiasm for a cause' },
  { word: 'Alleviate',    def: 'Make suffering or a problem less severe' },
  { word: 'Benevolent',   def: 'Well-meaning and kindly; charitable' },
  { word: 'Circumvent',   def: 'Find a way around an obstacle; evade' },
  { word: 'Deteriorate',  def: 'Become progressively worse' },
  { word: 'Empirical',    def: 'Based on observation or experience rather than theory' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type GameMode = 'menu' | 'word_blitz' | 'vocab_match' | 'leaderboard';
type Difficulty = 'easy' | 'medium' | 'hard';
type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

const DIFF_CONFIG: Record<Difficulty, { speed: number; spawnRate: number; label: string; color: string }> = {
  easy:   { speed: 48, spawnRate: 3200, label: 'Easy',   color: '#10B981' },
  medium: { speed: 70, spawnRate: 2400, label: 'Medium', color: '#F59E0B' },
  hard:   { speed: 100, spawnRate: 1600, label: 'Hard',  color: '#EF4444' },
};

interface FallingWord {
  id: number;
  word: string;
  def: string;
  x: number;   // percent
  y: number;   // px from top
  options: string[]; // 3 wrong + 1 correct shuffled
  correctIndex: number;
  speed: number;
}

let wordIdCounter = 0;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildWord(difficulty: Difficulty): FallingWord {
  const pair = VOCAB_BANK[Math.floor(Math.random() * VOCAB_BANK.length)];
  const wrongs = shuffle(VOCAB_BANK.filter(v => v.word !== pair.word)).slice(0, 3).map(v => v.def);
  const allOpts = shuffle([pair.def, ...wrongs]);
  const correctIndex = allOpts.indexOf(pair.def);
  return {
    id: wordIdCounter++,
    word: pair.word,
    def: pair.def,
    x: 5 + Math.random() * 65, // keep within visible bounds
    y: -120,
    options: allOpts,
    correctIndex,
    speed: DIFF_CONFIG[difficulty].speed + Math.random() * 20,
  };
}

// ─── Word Blitz Game ──────────────────────────────────────────────────────────
function WordBlitz({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState]     = useState<GameState>('idle');
  const [difficulty, setDifficulty]   = useState<Difficulty>('medium');
  const [lives, setLives]             = useState(3);
  const [score, setScore]             = useState(0);
  const [level, setLevel]             = useState(1);
  const [wordsCorrect, setWordsCorrect] = useState(0);
  const [words, setWords]             = useState<FallingWord[]>([]);
  const [soundOn, setSoundOn]         = useState(true);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [flash, setFlash]             = useState<'correct' | 'wrong' | null>(null);
  const [pointsPopups, setPointsPopups] = useState<{ id: number; pts: number; x: number; y: number }[]>([]);
  const [saving, setSaving]           = useState(false);
  const [savedResult, setSavedResult] = useState<{ pts: number } | null>(null);

  const animRef     = useRef<number | null>(null);
  const lastTime    = useRef<number>(0);
  const spawnTimer  = useRef<number>(0);
  const livesRef    = useRef(lives);
  const scoreRef    = useRef(score);
  const levelRef    = useRef(level);
  const wordsRef    = useRef<FallingWord[]>([]);
  const wordsCorrectRef = useRef(wordsCorrect);
  const stateRef    = useRef<GameState>('idle');
  const diffRef     = useRef<Difficulty>(difficulty);

  livesRef.current    = lives;
  scoreRef.current    = score;
  levelRef.current    = level;
  wordsRef.current    = words;
  wordsCorrectRef.current = wordsCorrect;
  stateRef.current    = gameState;
  diffRef.current     = difficulty;

  const areaHeight = 540;

  const playSound = useCallback((type: 'correct' | 'wrong' | 'levelup') => {
    if (!soundOn) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'correct') {
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(); osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
      }
    } catch {}
  }, [soundOn]);

  const endGame = useCallback(async (finalScore: number, finalWords: number, finalLevel: number) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    stateRef.current = 'gameover';
    setGameState('gameover');
    setSaving(true);
    try {
      const res = await gameApi.saveScore(finalScore, finalWords, finalLevel, diffRef.current);
      setSavedResult({ pts: res.pointsEarned });
    } catch {
      setSavedResult({ pts: 0 });
    } finally {
      setSaving(false);
    }
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (stateRef.current !== 'playing') return;
    const dt = (timestamp - lastTime.current) / 1000;
    lastTime.current = timestamp;

    spawnTimer.current += dt * 1000;
    const spawnRate = DIFF_CONFIG[diffRef.current].spawnRate - (levelRef.current - 1) * 200;
    const effectiveSpawnRate = Math.max(900, spawnRate);

    if (spawnTimer.current >= effectiveSpawnRate) {
      spawnTimer.current = 0;
      const newWord = buildWord(diffRef.current);
      wordsRef.current = [...wordsRef.current, newWord];
      setWords([...wordsRef.current]);
    }

    let lostLife = false;
    const updated = wordsRef.current
      .map(w => ({ ...w, y: w.y + w.speed * dt }))
      .filter(w => {
        if (w.y > areaHeight + 10) {
          lostLife = true;
          return false;
        }
        return true;
      });

    wordsRef.current = updated;
    setWords([...updated]);

    if (lostLife) {
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      setFlash('wrong');
      setTimeout(() => setFlash(null), 500);
      if (newLives <= 0) {
        endGame(scoreRef.current, wordsCorrectRef.current, levelRef.current);
        return;
      }
    }

    animRef.current = requestAnimationFrame(gameLoop);
  }, [endGame]);

  const startGame = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    wordIdCounter = 0;
    setLives(3); livesRef.current = 3;
    setScore(0); scoreRef.current = 0;
    setLevel(1); levelRef.current = 1;
    setWordsCorrect(0); wordsCorrectRef.current = 0;
    setWords([]); wordsRef.current = [];
    spawnTimer.current = 0;
    lastTime.current = performance.now();
    stateRef.current = 'playing';
    setGameState('playing');
    setSavedResult(null);
    animRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const handleAnswer = useCallback((wordId: number, optionIndex: number) => {
    if (stateRef.current !== 'playing') return;
    const word = wordsRef.current.find(w => w.id === wordId);
    if (!word) return;

    setSelectedWordId(wordId);
    setTimeout(() => setSelectedWordId(null), 400);

    if (optionIndex === word.correctIndex) {
      playSound('correct');
      const pts = 10 * levelRef.current;
      const newScore = scoreRef.current + pts;
      const newCorrect = wordsCorrectRef.current + 1;
      scoreRef.current = newScore;
      wordsCorrectRef.current = newCorrect;
      setScore(newScore);
      setWordsCorrect(newCorrect);
      setFlash('correct');
      setTimeout(() => setFlash(null), 350);

      // Show floating +pts popup
      const px = Math.min(75, Math.max(5, word.x));
      setPointsPopups(prev => [...prev, { id: word.id, pts, x: px, y: word.y }]);
      setTimeout(() => setPointsPopups(prev => prev.filter(p => p.id !== word.id)), 900);

      // Level up every 8 correct answers
      if (newCorrect % 8 === 0) {
        const newLevel = levelRef.current + 1;
        levelRef.current = newLevel;
        setLevel(newLevel);
        playSound('levelup');
      }

      wordsRef.current = wordsRef.current.filter(w => w.id !== wordId);
      setWords([...wordsRef.current]);
    } else {
      playSound('wrong');
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      setFlash('wrong');
      setTimeout(() => setFlash(null), 500);
      wordsRef.current = wordsRef.current.filter(w => w.id !== wordId);
      setWords([...wordsRef.current]);

      if (newLives <= 0) {
        endGame(scoreRef.current, wordsCorrectRef.current, levelRef.current);
      }
    }
  }, [playSound, endGame]);

  // ── Renders ─────────────────────────────────────────────────────────────
  if (gameState === 'idle') {
    return (
      <div style={styles.fullCenter}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <div style={styles.idleCard}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>⚡</div>
          <h2 style={styles.bigTitle}>Word Blitz</h2>
          <p style={styles.subtitle}>IELTS vocabulary words fall from the sky.<br/>Match each word to its correct definition before it crashes!</p>
          
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Difficulty</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button key={d} onClick={() => setDifficulty(d)} style={{
                  padding: '8px 20px', borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  border: `2px solid ${difficulty === d ? DIFF_CONFIG[d].color : 'var(--border)'}`,
                  background: difficulty === d ? DIFF_CONFIG[d].color + '22' : 'transparent',
                  color: difficulty === d ? DIFF_CONFIG[d].color : 'var(--text-secondary)',
                  transition: 'all 0.18s',
                }}>
                  {DIFF_CONFIG[d].label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={startGame} style={styles.primaryBtn}>
              <Play size={18} /> Play Now
            </button>
            <button onClick={() => setSoundOn(s => !s)} style={styles.iconBtn}>
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          <div style={{ marginTop: 28, padding: 16, background: 'var(--surface-2)', borderRadius: 12, fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
            💡 <strong>How to play:</strong> A word appears at the top and falls down. Pick the correct definition from the 4 options shown below the word. Miss a word or choose wrong and you lose a life. Survive as long as possible!
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div style={styles.fullCenter}>
        <div style={{ ...styles.idleCard, maxWidth: 400 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>💀</div>
          <h2 style={{ ...styles.bigTitle, fontSize: 28, marginBottom: 6 }}>Game Over!</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            <StatBox label="Score" value={score.toString()} icon="⭐" />
            <StatBox label="Words" value={wordsCorrect.toString()} icon="✅" />
            <StatBox label="Level" value={level.toString()} icon="🏆" />
          </div>

          {saving && <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 16 }}>Saving score…</p>}
          {savedResult && (
            <div style={{ background: 'var(--purple-light)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: 'var(--purple-dark)', fontSize: 14 }}>
              🎉 Score saved! You earned <strong>+{savedResult.pts} Reading Points</strong>!
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={startGame} style={styles.primaryBtn}>
              <RefreshCcw size={16} /> Play Again
            </button>
            <button onClick={onBack} style={styles.secondaryBtn}>
              <ChevronLeft size={16} /> Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Game Playing UI ──
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--bg)', userSelect: 'none' }}>
      {/* Flash overlay */}
      {flash && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none',
          background: flash === 'correct' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          transition: 'opacity 0.3s',
        }} />
      )}

      {/* HUD */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 18px', background: 'var(--surface-1)',
        borderBottom: '1px solid var(--border)', backdropFilter: 'blur(6px)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3].map(i => (
            <span key={i} style={{ fontSize: 20, opacity: i <= lives ? 1 : 0.2, transition: 'opacity 0.3s' }}>❤️</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Score</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--purple)', fontFamily: 'monospace' }}>{score}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Level</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{level}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setSoundOn(s => !s)} style={styles.hudBtn}>
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button onClick={() => endGame(score, wordsCorrect, level)} style={{ ...styles.hudBtn, color: '#EF4444' }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Level badge */}
      <div style={{
        position: 'absolute', top: 54, left: '50%', transform: 'translateX(-50%)',
        background: DIFF_CONFIG[difficulty].color + '22', border: `1px solid ${DIFF_CONFIG[difficulty].color}44`,
        borderRadius: 20, padding: '2px 12px', fontSize: 11, fontWeight: 600,
        color: DIFF_CONFIG[difficulty].color, zIndex: 10,
      }}>
        {DIFF_CONFIG[difficulty].label} · {wordsCorrect} correct
      </div>

      {/* Game area */}
      <div style={{
        position: 'absolute', top: 50, left: 0, right: 0, bottom: 0,
        overflow: 'hidden',
      }}>
        {/* Stars decoration */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 30}%`,
            width: 2, height: 2,
            borderRadius: '50%',
            background: 'var(--purple)',
            opacity: 0.3,
          }} />
        ))}

        {/* Falling words */}
        {words.map(w => (
          <FallingWordCard
            key={w.id}
            word={w}
            isSelected={selectedWordId === w.id}
            onAnswer={handleAnswer}
          />
        ))}

        {/* Points popups */}
        {pointsPopups.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: p.y,
            pointerEvents: 'none',
            zIndex: 30,
            fontSize: 18,
            fontWeight: 800,
            color: '#10B981',
            animation: 'float-up 0.9s ease-out forwards',
          }}>
            +{p.pts}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float-up {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-60px); }
        }
        @keyframes fall-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(168,85,247,0.15); }
          50%       { box-shadow: 0 4px 30px rgba(168,85,247,0.35); }
        }
      `}</style>
    </div>
  );
}

// ── Falling Word Card ─────────────────────────────────────────────────────────
function FallingWordCard({
  word, isSelected, onAnswer,
}: {
  word: FallingWord;
  isSelected: boolean;
  onAnswer: (id: number, optIdx: number) => void;
}) {
  return (
    <div style={{
      position: 'absolute',
      left: `${word.x}%`,
      top: word.y,
      width: 240,
      zIndex: 10,
      animation: 'fall-pulse 2s ease-in-out infinite',
    }}>
      {/* Word badge */}
      <div style={{
        background: 'linear-gradient(135deg, var(--purple), #6366F1)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '12px 12px 0 0',
        fontWeight: 700,
        fontSize: 15,
        textAlign: 'center',
        letterSpacing: '0.5px',
      }}>
        {word.word}
      </div>

      {/* Options */}
      <div style={{
        background: 'var(--surface-1)',
        border: '2px solid var(--purple)',
        borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        padding: 6,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 5,
      }}>
        {word.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onAnswer(word.id, i)}
            style={{
              padding: '5px 6px',
              fontSize: 10,
              lineHeight: 1.3,
              borderRadius: 7,
              border: '1.5px solid var(--border)',
              background: isSelected ? 'var(--purple-light)' : 'var(--surface-2)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--purple-light)';
              e.currentTarget.style.borderColor = 'var(--purple)';
              e.currentTarget.style.color = 'var(--purple-dark)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--surface-2)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Box ─────────────────────────────────────────────────────────────────
function StatBox({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div style={{
      background: 'var(--surface-2)', borderRadius: 12, padding: '12px 8px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

// ─── Vocabulary Match Game ─────────────────────────────────────────────────────
const VOCAB_PAIRS = VOCAB_BANK.slice(0, 5);

function VocabMatch({ onBack }: { onBack: () => void }) {
  const [vocabWords, setVocabWords] = useState<{ word: string; id: number }[]>([]);
  const [vocabDefs, setVocabDefs]   = useState<{ def: string; id: number }[]>([]);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [selectedDef, setSelectedDef]   = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [wrongPair, setWrongPair]       = useState<{ w: number; d: number } | null>(null);
  const [score, setScore]               = useState(0);
  const [attempts, setAttempts]         = useState(0);

  const init = () => {
    const pairs = VOCAB_PAIRS.map((p, i) => ({ ...p, id: i }));
    setVocabWords(shuffle(pairs).map(p => ({ word: p.word, id: p.id })));
    setVocabDefs(shuffle(pairs).map(p => ({ def: p.def, id: p.id })));
    setMatchedPairs([]);
    setSelectedWord(null);
    setSelectedDef(null);
    setWrongPair(null);
    setScore(0);
    setAttempts(0);
  };

  useEffect(() => { init(); }, []);

  const checkMatch = (wId: number, dId: number) => {
    setAttempts(a => a + 1);
    if (wId === dId) {
      setMatchedPairs(prev => [...prev, wId]);
      setScore(s => s + 20);
      setSelectedWord(null);
      setSelectedDef(null);
    } else {
      setWrongPair({ w: wId, d: dId });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedWord(null);
        setSelectedDef(null);
      }, 750);
    }
  };

  const handleWordClick = (id: number) => {
    if (matchedPairs.includes(id)) return;
    setSelectedWord(id);
    if (selectedDef !== null) checkMatch(id, selectedDef);
  };

  const handleDefClick = (id: number) => {
    if (matchedPairs.includes(id)) return;
    setSelectedDef(id);
    if (selectedWord !== null) checkMatch(selectedWord, id);
  };

  const isFinished = matchedPairs.length === VOCAB_PAIRS.length;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 860, margin: '0 auto' }}>
      <button onClick={onBack} style={styles.backBtn}>← Back</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10 }}>
        <h2 style={{ fontSize: 22, color: 'var(--text-primary)', fontWeight: 700 }}>🃏 Vocabulary Match</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Score</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--purple)' }}>{score}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Matched</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{matchedPairs.length}/{VOCAB_PAIRS.length}</div>
          </div>
        </div>
      </div>

      {isFinished ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'var(--surface-1)', borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h3 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 8 }}>All Matched!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Score: <strong>{score}</strong> in {attempts} attempts</p>
          <button onClick={init} style={styles.primaryBtn}>
            <RefreshCcw size={16} /> Play Again
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {vocabWords.map(w => {
              const isMatched = matchedPairs.includes(w.id);
              const isSel = selectedWord === w.id;
              const isWrong = wrongPair?.w === w.id;
              return (
                <button key={w.id} onClick={() => handleWordClick(w.id)} disabled={isMatched}
                  style={{
                    padding: '14px 18px', borderRadius: 12,
                    border: `2px solid ${isMatched ? 'var(--green)' : isWrong ? '#EF4444' : isSel ? 'var(--purple)' : 'var(--border)'}`,
                    background: isMatched ? 'var(--green-light)' : isWrong ? '#FCEBEB' : isSel ? 'var(--purple-light)' : 'var(--surface-1)',
                    color: isMatched ? 'var(--green-dark)' : isWrong ? '#791F1F' : isSel ? 'var(--purple-dark)' : 'var(--text-primary)',
                    fontSize: 15, fontWeight: 600, cursor: isMatched ? 'default' : 'pointer',
                    transition: 'all 0.2s', textAlign: 'left', opacity: isMatched ? 0.7 : 1,
                    transform: isWrong ? 'translateX(6px)' : 'none',
                  }}>
                  {w.word}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {vocabDefs.map(d => {
              const isMatched = matchedPairs.includes(d.id);
              const isSel = selectedDef === d.id;
              const isWrong = wrongPair?.d === d.id;
              return (
                <button key={d.id} onClick={() => handleDefClick(d.id)} disabled={isMatched}
                  style={{
                    padding: '14px 18px', borderRadius: 12,
                    border: `2px solid ${isMatched ? 'var(--green)' : isWrong ? '#EF4444' : isSel ? 'var(--purple)' : 'var(--border)'}`,
                    background: isMatched ? 'var(--green-light)' : isWrong ? '#FCEBEB' : isSel ? 'var(--purple-light)' : 'var(--surface-1)',
                    color: isMatched ? 'var(--green-dark)' : isWrong ? '#791F1F' : isSel ? 'var(--purple-dark)' : 'var(--text-secondary)',
                    fontSize: 13, cursor: isMatched ? 'default' : 'pointer',
                    transition: 'all 0.2s', textAlign: 'left', opacity: isMatched ? 0.7 : 1, lineHeight: 1.5,
                    transform: isWrong ? 'translateX(-6px)' : 'none',
                  }}>
                  {d.def}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
function Leaderboard({ onBack }: { onBack: () => void }) {
  const [entries, setEntries]     = useState<LeaderboardEntry[]>([]);
  const [myScores, setMyScores]   = useState<MyScore[]>([]);
  const [tab, setTab]             = useState<'global' | 'mine'>('global');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([gameApi.leaderboard(), gameApi.myScores()])
      .then(([lb, my]) => { setEntries(lb); setMyScores(my); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rankIcon = (i: number) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `#${i + 1}`;
  };

  return (
    <div style={{ padding: '28px 24px', maxWidth: 640, margin: '0 auto' }}>
      <button onClick={onBack} style={styles.backBtn}>← Back</button>
      <h2 style={{ fontSize: 22, color: 'var(--text-primary)', fontWeight: 700, marginBottom: 20, marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Trophy size={22} color="var(--purple)" /> Leaderboard · Word Blitz
      </h2>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['global', 'mine'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: `2px solid ${tab === t ? 'var(--purple)' : 'var(--border)'}`,
            background: tab === t ? 'var(--purple-light)' : 'transparent',
            color: tab === t ? 'var(--purple-dark)' : 'var(--text-secondary)',
            transition: 'all 0.18s',
          }}>
            {t === 'global' ? '🌍 Global Top 10' : '📊 My Scores'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(tab === 'global' ? entries : myScores).length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
              {tab === 'global' ? 'No scores yet. Be the first!' : 'Play a game to see your scores here!'}
            </div>
          )}
          {tab === 'global' && entries.map((e, i) => (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: i < 3 ? 'var(--purple-light)' : 'var(--surface-1)',
              border: `1px solid ${i < 3 ? 'var(--purple)' : 'var(--border)'}`,
              borderRadius: 14, padding: '14px 18px',
            }}>
              <div style={{ fontSize: i < 3 ? 24 : 16, width: 34, textAlign: 'center', fontWeight: 700, color: 'var(--text-tertiary)' }}>{rankIcon(i)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>{e.userName || 'Anonymous'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Level {e.level} · {e.wordsCorrect} words · {e.difficulty}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--purple)', fontFamily: 'monospace' }}>{e.score}</div>
            </div>
          ))}
          {tab === 'mine' && myScores.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 18px',
            }}>
              <div style={{ fontSize: 14, width: 28, textAlign: 'center', color: 'var(--text-tertiary)' }}>#{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>{s.score} points</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Level {s.level} · {s.wordsCorrect} words · {s.difficulty} · {new Date(s.playedAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Games Hub ───────────────────────────────────────────────────────────
export default function Games() {
  const [mode, setMode] = useState<GameMode>('menu');

  if (mode === 'word_blitz')  return <div style={{ height: '100%' }}><WordBlitz onBack={() => setMode('menu')} /></div>;
  if (mode === 'vocab_match') return <div style={{ height: '100%', overflowY: 'auto' }}><VocabMatch onBack={() => setMode('menu')} /></div>;
  if (mode === 'leaderboard') return <div style={{ height: '100%', overflowY: 'auto' }}><Leaderboard onBack={() => setMode('menu')} /></div>;

  return (
    <div style={{ padding: '40px 24px', overflowY: 'auto', height: '100%' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎮</div>
          <h1 style={{ fontSize: 34, color: 'var(--text-primary)', fontWeight: 800, marginBottom: 10 }}>
            Learning Games
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Build your IELTS vocabulary and skills through fun, interactive games.
            Earn points that count toward your real IELTS score!
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
          <GameCard
            icon="⚡"
            title="Word Blitz"
            desc="Arcade-style falling vocabulary game. Match words to definitions before they crash!"
            tag="LIVE SCORES"
            tagColor="#A855F7"
            onClick={() => setMode('word_blitz')}
          />
          <GameCard
            icon="🃏"
            title="Vocabulary Match"
            desc="Match advanced IELTS words to their correct definitions in a card-matching challenge."
            tag="MEMORY"
            tagColor="#06B6D4"
            onClick={() => setMode('vocab_match')}
          />
        </div>

        <button
          onClick={() => setMode('leaderboard')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '16px', borderRadius: 16, border: '2px dashed var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', fontSize: 15,
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--purple)';
            e.currentTarget.style.color = 'var(--purple)';
            e.currentTarget.style.background = 'var(--purple-light)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Trophy size={20} /> View Word Blitz Leaderboard
        </button>
      </div>
    </div>
  );
}

function GameCard({ icon, title, desc, tag, tagColor, onClick }: {
  icon: string; title: string; desc: string; tag: string; tagColor: string; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 20,
        padding: '28px 24px', cursor: 'pointer', transition: 'all 0.22s',
        display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.borderColor = 'var(--purple)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(168, 85, 247, 0.18)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
      }}
    >
      <div style={{ fontSize: 44 }}>{icon}</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h3 style={{ fontSize: 20, color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>{title}</h3>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            background: tagColor + '22', color: tagColor, padding: '2px 8px', borderRadius: 10,
          }}>{tag}</span>
        </div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--purple)', fontSize: 13, fontWeight: 600 }}>
        Play Now <Zap size={14} />
      </div>
    </div>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const styles = {
  fullCenter: {
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
    height: '100%', padding: 24, overflowY: 'auto' as const,
  },
  idleCard: {
    background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 24,
    padding: '40px 36px', maxWidth: 520, width: '100%', textAlign: 'center' as const,
    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  },
  bigTitle: {
    fontSize: 32, color: 'var(--text-primary)', fontWeight: 800, marginBottom: 12,
  },
  subtitle: {
    color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 28,
  },
  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'linear-gradient(135deg, var(--purple), #6366F1)',
    color: 'white', border: 'none', padding: '12px 26px',
    borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(168,85,247,0.35)',
  },
  secondaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'var(--surface-2)', color: 'var(--text-secondary)',
    border: '1px solid var(--border)', padding: '12px 22px',
    borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
  iconBtn: {
    display: 'inline-flex', alignItems: 'center',
    background: 'var(--surface-2)', color: 'var(--text-secondary)',
    border: '1px solid var(--border)', padding: '11px 14px',
    borderRadius: 12, fontSize: 15, cursor: 'pointer',
  },
  hudBtn: {
    display: 'inline-flex', alignItems: 'center',
    background: 'var(--surface-2)', color: 'var(--text-secondary)',
    border: '1px solid var(--border)', padding: '6px 8px',
    borderRadius: 8, cursor: 'pointer',
  },
  backBtn: {
    background: 'transparent', border: 'none',
    color: 'var(--text-tertiary)', cursor: 'pointer',
    fontSize: 13, marginBottom: 4,
  },
};
