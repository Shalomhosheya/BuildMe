import React, { useState } from 'react';
import { QUIZ_SETS } from './data';
import { QuizSet, QuizQuestion } from './types';
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const SKILL_COLORS: Record<string, { color: string; bg: string }> = {
  Writing:   { color: '#3C3489', bg: '#EEEDFE' },
  Reading:   { color: '#085041', bg: '#E1F5EE' },
  Listening: { color: '#633806', bg: '#FAEEDA' },
  Speaking:  { color: '#712B13', bg: '#FAECE7' },
};

const LEVEL_LABELS: Record<number, string> = { 1: 'Prestructural', 2: 'Unistructural', 3: 'Multistructural' };

export default function Quiz() {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [activeQuiz, setActiveQuiz] = useState<QuizSet | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const filtered = QUIZ_SETS.filter(q => filterLevel === 'all' || String(q.level) === filterLevel);

  function startQuiz(quiz: QuizSet) {
    setActiveQuiz(quiz); setQIdx(0); setSelected(null);
    setAnswered(false); setScore(0); setFinished(false);
  }

  function selectOpt(i: number) {
    if (answered || !activeQuiz) return;
    setSelected(i); setAnswered(true);
    if (i === activeQuiz.questions[qIdx].ans) setScore(s => s + 1);
  }

  function next() {
    if (!activeQuiz) return;
    if (qIdx + 1 >= activeQuiz.questions.length) { setFinished(true); return; }
    setQIdx(q => q + 1); setSelected(null); setAnswered(false);
  }

  function reset() { setActiveQuiz(null); setFinished(false); }

  const q: QuizQuestion | undefined = activeQuiz?.questions[qIdx];
  const pct = activeQuiz ? Math.round(((qIdx) / activeQuiz.questions.length) * 100) : 0;

  if (activeQuiz && finished) {
    const pctScore = Math.round((score / activeQuiz.questions.length) * 100);
    const ptsEarned = score * Math.round(activeQuiz.pts / activeQuiz.questions.length);
    return (
      <div style={{ padding: '32px 36px', maxWidth: 600 }} className="animate-fadeUp">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 40, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: pctScore >= 75 ? 'var(--teal-light)' : 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            {pctScore >= 75 ? <CheckCircle size={36} color="var(--teal)" /> : <XCircle size={36} color="var(--amber)" />}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--purple)', marginBottom: 4 }}>{pctScore}%</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>{score} of {activeQuiz.questions.length} correct</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--purple-light)', color: 'var(--purple-dark)', fontSize: 14, fontWeight: 500, padding: '8px 20px', borderRadius: 20, marginBottom: 20 }}>
            +{ptsEarned} pts earned
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
            {pctScore >= 75 ? 'Well done — you demonstrated strong understanding at this SOLO level.' : 'Keep practising — review the explanations and try again to improve.'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => { setQIdx(0); setSelected(null); setAnswered(false); setScore(0); setFinished(false); }} style={{ padding: '9px 20px', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 13 }}>Retry</button>
            <button onClick={reset} style={{ padding: '9px 20px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500 }}>Back to quizzes</button>
          </div>
        </div>
      </div>
    );
  }

  if (activeQuiz && q) {
    return (
      <div style={{ padding: '32px 36px', maxWidth: 680 }} className="animate-fadeUp">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400 }}>{activeQuiz.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>{activeQuiz.levelName} — SOLO Level {activeQuiz.level}</p>
          </div>
          <button onClick={reset} style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '7px 14px' }}>Exit</button>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Question {qIdx + 1} of {activeQuiz.questions.length}</span>
            <span style={{ background: 'var(--amber-light)', color: 'var(--amber)', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 12 }}>+{Math.round(activeQuiz.pts / activeQuiz.questions.length)} pts</span>
          </div>
          <div style={{ height: 4, background: 'var(--gray-100)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--purple)', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple)', letterSpacing: '0.06em', marginBottom: 10 }}>SOLO LEVEL {activeQuiz.level} — {activeQuiz.levelName.toUpperCase()}</div>
          <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6, marginBottom: 22 }}>{q.q}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {q.opts.map((opt, i) => {
              let bg = 'transparent', border = 'var(--border)', color = 'var(--text-primary)';
              if (answered) {
                if (i === q.ans) { bg = 'var(--teal-light)'; border = 'var(--teal)'; color = '#085041'; }
                else if (i === selected) { bg = '#FCEBEB'; border = '#E24B4A'; color = '#791F1F'; }
              } else if (selected === i) { bg = 'var(--purple-light)'; border = 'var(--purple)'; color = 'var(--purple-dark)'; }
              return (
                <button key={i} onClick={() => selectOpt(i)} style={{
                  padding: '12px 16px', border: `1px solid ${border}`, borderRadius: 'var(--radius-md)',
                  background: bg, color, fontSize: 13, textAlign: 'left', transition: 'all 0.15s',
                  fontWeight: answered && i === q.ans ? 500 : 400, cursor: answered ? 'default' : 'pointer',
                }}>
                  {opt}
                </button>
              );
            })}
          </div>

          {answered && (
            <div style={{ padding: '12px 16px', background: selected === q.ans ? 'var(--teal-light)' : '#FCEBEB', borderLeft: `3px solid ${selected === q.ans ? 'var(--teal)' : '#E24B4A'}`, borderRadius: '0 var(--radius-md) var(--radius-md) 0', fontSize: 13, lineHeight: 1.6, color: selected === q.ans ? '#085041' : '#791F1F', marginBottom: 16 }}>
              {q.exp}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Score: {score} / {qIdx + (answered ? 1 : 0)}</span>
            <button onClick={next} disabled={!answered} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 20px', background: answered ? 'var(--purple)' : 'var(--gray-200)',
              color: answered ? '#fff' : 'var(--text-tertiary)', border: 'none',
              borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500,
              cursor: answered ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
            }}>
              {qIdx + 1 >= activeQuiz.questions.length ? 'Finish' : 'Next'} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }} className="animate-fadeUp">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.5px' }}>Quiz centre</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Practice by skill and SOLO level — earn points for every quiz</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['all', 'All levels'], ['1', 'Level 1 — Prestructural'], ['2', 'Level 2 — Unistructural'], ['3', 'Level 3 — Multistructural']].map(([val, label]) => (
          <button key={val} onClick={() => setFilterLevel(val)} style={{
            padding: '7px 16px', fontSize: 12, border: `1px solid ${filterLevel === val ? 'var(--purple)' : 'var(--border)'}`,
            borderRadius: 20, background: filterLevel === val ? 'var(--purple-light)' : 'transparent',
            color: filterLevel === val ? 'var(--purple-dark)' : 'var(--text-secondary)',
            fontWeight: filterLevel === val ? 500 : 400, transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {filtered.map((quiz, i) => {
          const sc = SKILL_COLORS[quiz.skill] || SKILL_COLORS.Writing;
          return (
            <div key={quiz.id} onClick={() => startQuiz(quiz)} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              padding: 18, cursor: 'pointer', transition: 'all 0.15s',
              animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--purple)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 10, marginBottom: 10, letterSpacing: '0.02em' }}>{quiz.skill}</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 5 }}>{quiz.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>{quiz.desc}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>+{quiz.pts} pts</span>
                <span style={{
                  fontSize: 11, padding: '3px 9px', borderRadius: 10, fontWeight: 500,
                  background: quiz.done ? 'var(--teal-light)' : 'var(--purple-light)',
                  color: quiz.done ? '#085041' : 'var(--purple-dark)',
                }}>
                  {quiz.done ? 'Completed' : 'Start'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
