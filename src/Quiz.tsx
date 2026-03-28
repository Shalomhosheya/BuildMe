import React, { useState, useEffect } from 'react';
import { QUIZ_SETS } from './data';
import { QuizSet, QuizQuestion } from './types';
import { CheckCircle, XCircle, ChevronRight, BookOpen } from 'lucide-react';
import { quizApi, QuizAttempt } from './api/quiz';

const SKILL_COLORS: Record<string, { color: string; bg: string }> = {
  Writing:   { color: '#3C3489', bg: '#EEEDFE' },
  Reading:   { color: '#085041', bg: '#E1F5EE' },
  Listening: { color: '#633806', bg: '#FAEEDA' },
  Speaking:  { color: '#712B13', bg: '#FAECE7' },
};

export default function Quiz() {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [activeQuiz, setActiveQuiz]   = useState<QuizSet | null>(null);
  const [qIdx, setQIdx]               = useState(0);
  const [selected, setSelected]       = useState<number | null>(null);
  const [answered, setAnswered]       = useState(false);
  const [score, setScore]             = useState(0);
  const [finished, setFinished]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [serverResult, setServerResult] = useState<{ pointsEarned: number; passed: boolean } | null>(null);
  const [attempts, setAttempts]       = useState<QuizAttempt[]>([]);

  // Load past attempts
  useEffect(() => {
    quizApi.attempts()
      .then(setAttempts)
      .catch(() => {});
  }, []);

  const completedQuizIds = new Set(
    attempts.filter(a => a.passed).map(a => a.quizId)
  );

  const filtered = QUIZ_SETS.filter(q =>
    filterLevel === 'all' || String(q.level) === filterLevel
  );

  function startQuiz(quiz: QuizSet) {
    setActiveQuiz(quiz); 
    setQIdx(0); 
    setSelected(null);
    setAnswered(false); 
    setScore(0); 
    setFinished(false);
    setServerResult(null); 
    setSubmitError('');
  }

  function selectOpt(i: number) {
    if (answered || !activeQuiz) return;
    setSelected(i);
    setAnswered(true);
    if (i === activeQuiz.questions[qIdx].ans) {
      setScore(s => s + 1);
    }
  }

  function next() {
    if (!activeQuiz) return;
    if (qIdx + 1 >= activeQuiz.questions.length) {
      finishQuiz();
      return;
    }
    setQIdx(q => q + 1);
    setSelected(null);
    setAnswered(false);
  }

  async function finishQuiz() {
    if (!activeQuiz) return;
    setFinished(true);
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await quizApi.submit(
        activeQuiz.id,
        activeQuiz.skill,
        activeQuiz.level,
        score,
        activeQuiz.questions.length
      );
      setServerResult({ pointsEarned: result.pointsEarned, passed: result.passed });
      quizApi.attempts().then(setAttempts).catch(() => {});
    } catch (e: any) {
      setSubmitError(e.message || 'Could not save result — but your score is shown below.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setActiveQuiz(null);
    setFinished(false);
    setServerResult(null);
  }

  const q: QuizQuestion | undefined = activeQuiz?.questions[qIdx];
  const pct = activeQuiz ? Math.round((qIdx / activeQuiz.questions.length) * 100) : 0;
  const isReading = activeQuiz?.skill === 'Reading';

  // ── Results screen ────────────────────────────────────────────────────────
  if (activeQuiz && finished) {
    const pctScore  = Math.round((score / activeQuiz.questions.length) * 100);
    const localPts  = score * Math.round(activeQuiz.pts / activeQuiz.questions.length);
    const ptsEarned = serverResult?.pointsEarned ?? localPts;
    const passed    = serverResult?.passed ?? pctScore >= 60;

    return (
      <div style={{ padding: '32px 36px', maxWidth: 600 }} className="animate-fadeUp">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 40, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: passed ? 'var(--teal-light)' : 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            {passed ? <CheckCircle size={36} color="var(--teal)" /> : <XCircle size={36} color="var(--amber)" />}
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--purple)', marginBottom: 4 }}>
            {pctScore}%
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
            {score} of {activeQuiz.questions.length} correct
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--purple-light)', color: 'var(--purple-dark)', fontSize: 14, fontWeight: 500, padding: '8px 20px', borderRadius: 20, marginBottom: 20 }}>
            +{ptsEarned} pts earned
          </div>

          {submitError && (
            <div style={{ fontSize: 12, color: '#791F1F', background: '#FCEBEB', padding: '8px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
              {submitError}
            </div>
          )}

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
            {passed
              ? 'Well done — you demonstrated strong understanding at this SOLO level.'
              : 'Keep practising — review the explanations and try again to improve.'}
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button 
              onClick={() => { 
                setQIdx(0); 
                setSelected(null); 
                setAnswered(false); 
                setScore(0); 
                setFinished(false); 
                setServerResult(null); 
              }}
              style={{ padding: '9px 20px', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 13, cursor: 'pointer' }}>
              Retry
            </button>
            <button onClick={reset}
              style={{ padding: '9px 20px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Back to quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active quiz screen with Passage Support ───────────────────────────────
  if (activeQuiz && q) {
    return (
      <div style={{ padding: '32px 36px', maxWidth: 820 }} className="animate-fadeUp">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400 }}>{activeQuiz.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>
              {activeQuiz.levelName} — SOLO Level {activeQuiz.level}
            </p>
          </div>
          <button onClick={reset} style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '7px 14px', cursor: 'pointer' }}>
            Exit
          </button>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {/* Passage Area - Only for Reading */}
          {isReading && activeQuiz.passage && (
            <div style={{ 
              flex: '1', 
              background: '#F8F9FA', 
              border: '1px solid #E5E7EB', 
              borderRadius: 'var(--radius-xl)', 
              padding: 24,
              maxHeight: 'calc(100vh - 180px)',
              overflowY: 'auto',
              position: 'sticky',
              top: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <BookOpen size={18} color="#085041" />
                <span style={{ fontWeight: 600, color: '#085041', fontSize: 14 }}>Reading Passage</span>
              </div>
              <div style={{ 
                fontSize: 15, 
                lineHeight: 1.75, 
                color: '#1F2937',
                whiteSpace: 'pre-wrap'
              }}>
                {activeQuiz.passage}
              </div>
            </div>
          )}

          {/* Questions Area */}
          <div style={{ flex: isReading && activeQuiz.passage ? '1' : '1.4', minWidth: 0 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Question {qIdx + 1} of {activeQuiz.questions.length}
                </span>
                <span style={{ background: 'var(--amber-light)', color: 'var(--amber)', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 12 }}>
                  +{Math.round(activeQuiz.pts / activeQuiz.questions.length)} pts
                </span>
              </div>

              <div style={{ height: 4, background: 'var(--gray-100)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--purple)', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>

              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple)', letterSpacing: '0.06em', marginBottom: 10 }}>
                SOLO LEVEL {activeQuiz.level} — {activeQuiz.levelName.toUpperCase()}
              </div>

              <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6, marginBottom: 22 }}>
                {q.q}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {q.opts.map((opt, i) => {
                  let bg = 'transparent', border = 'var(--border)', color = 'var(--text-primary)';
                  if (answered) {
                    if (i === q.ans)      { bg = 'var(--teal-light)'; border = 'var(--teal)'; color = '#085041'; }
                    else if (i === selected) { bg = '#FCEBEB'; border = '#E24B4A'; color = '#791F1F'; }
                  } else if (selected === i) {
                    bg = 'var(--purple-light)'; border = 'var(--purple)'; color = 'var(--purple-dark)';
                  }
                  return (
                    <button 
                      key={i} 
                      onClick={() => selectOpt(i)} 
                      disabled={answered}
                      style={{
                        padding: '13px 18px', 
                        border: `1px solid ${border}`, 
                        borderRadius: 'var(--radius-md)',
                        background: bg, 
                        color, 
                        fontSize: 14, 
                        textAlign: 'left', 
                        transition: 'all 0.15s',
                        fontWeight: answered && i === q.ans ? 500 : 400,
                        cursor: answered ? 'default' : 'pointer',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div style={{
                  padding: '14px 18px', 
                  marginBottom: 20, 
                  fontSize: 14, 
                  lineHeight: 1.7,
                  background: selected === q.ans ? 'var(--teal-light)' : '#FCEBEB',
                  borderLeft: `4px solid ${selected === q.ans ? 'var(--teal)' : '#E24B4A'}`,
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  color: selected === q.ans ? '#085041' : '#791F1F',
                }}>
                  {q.exp}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                  Score: {score} / {qIdx + (answered ? 1 : 0)}
                </span>
                <button 
                  onClick={next} 
                  disabled={!answered} 
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    padding: '10px 24px',
                    background: answered ? 'var(--purple)' : 'var(--gray-200)',
                    color: answered ? '#fff' : 'var(--text-tertiary)',
                    border: 'none', 
                    borderRadius: 'var(--radius-md)',
                    fontSize: 14, 
                    fontWeight: 500,
                    cursor: answered ? 'pointer' : 'not-allowed',
                  }}
                >
                  {qIdx + 1 >= activeQuiz.questions.length ? 'Finish Quiz' : 'Next Question'} 
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz list screen ─────────────────────────────────────────────────────
  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }} className="animate-fadeUp">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.5px' }}>Quiz centre</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
          Practice by skill and SOLO level — earn points for every quiz
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['all','All levels'],['1','Level 1 — Prestructural'],['2','Level 2 — Unistructural'],['3','Level 3 — Multistructural']].map(([val, label]) => (
          <button 
            key={val} 
            onClick={() => setFilterLevel(val)} 
            style={{
              padding: '7px 16px', 
              fontSize: 12,
              border: `1px solid ${filterLevel === val ? 'var(--purple)' : 'var(--border)'}`,
              borderRadius: 20,
              background: filterLevel === val ? 'var(--purple-light)' : 'transparent',
              color: filterLevel === val ? 'var(--purple-dark)' : 'var(--text-secondary)',
              fontWeight: filterLevel === val ? 500 : 400, 
              cursor: 'pointer'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map((quiz, i) => {
          const sc   = SKILL_COLORS[quiz.skill] || SKILL_COLORS.Writing;
          const done = completedQuizIds.has(quiz.id);
          return (
            <div 
              key={quiz.id} 
              onClick={() => startQuiz(quiz)} 
              style={{
                background: 'var(--surface)', 
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', 
                padding: 20, 
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--purple)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 10, marginBottom: 12 }}>
                {quiz.skill}
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{quiz.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>{quiz.desc}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>+{quiz.pts} pts</span>
                <span style={{
                  fontSize: 12, 
                  padding: '4px 12px', 
                  borderRadius: 20, 
                  fontWeight: 500,
                  background: done ? 'var(--teal-light)' : 'var(--purple-light)',
                  color: done ? '#085041' : 'var(--purple-dark)',
                }}>
                  {done ? '✓ Completed' : 'Start'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}