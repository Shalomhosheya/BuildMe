import React, { useState } from 'react';
import { SKILLS, BADGES } from './data';
import { CheckCircle, Circle, Lock } from 'lucide-react';

export default function Portfolio() {
  const [showCert, setShowCert] = useState(false);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }} className="animate-fadeUp">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 28, display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, color: 'var(--purple-dark)', flexShrink: 0 }}>AM</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.3px', marginBottom: 4 }}>Ahmad Malik</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Joined March 2026 · 7-day streak · Multistructural learner</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['Builder badge', '#EEEDFE', '#3C3489'], ['Explorer badge', '#FAEEDA', '#633806'], ['7-day streak', '#E1F5EE', '#085041']].map(([label, bg, color]) => (
              <span key={label} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: bg, color }}>{label}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {[['1,240', 'Total pts'], ['34', 'Quizzes'], ['6.5', 'Est. band'], ['12', 'Notes']].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.5px' }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Skills overview</h2>
          {SKILLS.map(skill => (
            <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: skill.bg, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{skill.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{skill.pts} / {skill.maxPts} pts</span>
                </div>
                <div style={{ height: 5, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ height: '100%', width: `${Math.round((skill.pts / skill.maxPts) * 100)}%`, background: skill.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Level {skill.level} — {skill.levelName}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Badges earned</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {BADGES.map(badge => (
              <div key={badge.id} style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center', opacity: badge.earned ? 1 : 0.45 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: badge.earned ? badge.bg : 'var(--gray-200)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badge.earned ? <CheckCircle size={16} color={badge.color} /> : <Lock size={14} color="var(--gray-400)" />}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{badge.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{badge.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Recent activity</h2>
        {[
          { dot: 'var(--purple)', text: 'Writing Task 2 quiz — Multistructural completed', pts: '+90 pts', date: 'Today' },
          { dot: 'var(--purple)', text: 'AI tutor essay evaluation — Band 6.5', pts: '+65 pts', date: 'Today' },
          { dot: 'var(--teal)', text: 'Reading quiz — Skimming & scanning completed', pts: '+80 pts', date: 'Yesterday' },
          { dot: 'var(--amber)', text: 'Note saved — Cohesion tips Task 2', pts: '+5 pts', date: '2 days ago' },
          { dot: 'var(--purple)', text: 'Builder badge earned — Writing Level 3 unlocked', pts: '+50 pts', date: '3 days ago' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.dot, flexShrink: 0 }} />
            <div style={{ fontSize: 13, flex: 1 }}>{a.text}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--teal)' }}>{a.pts}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 70, textAlign: 'right' }}>{a.date}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>IELTS readiness certificate</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Complete all 4 skills at Level 3 to unlock your verifiable certificate</p>
          </div>
          <button onClick={() => setShowCert(v => !v)} style={{ padding: '9px 20px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500 }}>
            {showCert ? 'Hide preview' : 'Preview certificate'}
          </button>
        </div>

        <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--purple)' }}>62%</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Overall readiness</div>
            <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: '62%', background: 'var(--purple)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>38% remaining — complete Reading, Listening & Speaking to Level 3</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          {SKILLS.map(skill => (
            <div key={skill.id} style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{skill.name}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: skill.level === 3 ? 'var(--purple)' : 'var(--text-primary)', marginBottom: 3 }}>Level {skill.level}</div>
              <div style={{ fontSize: 10, color: skill.level === 3 ? 'var(--teal)' : 'var(--text-tertiary)' }}>{skill.level === 3 ? 'Complete' : `${3 - skill.level} level${3 - skill.level > 1 ? 's' : ''} remaining`}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: showCert ? 20 : 0 }}>
          {[
            { done: true,  text: 'Writing — Level 3 Multistructural completed' },
            { done: false, text: 'Reading — Level 3 Multistructural required' },
            { done: false, text: 'Listening — Level 3 Multistructural required' },
            { done: false, text: 'Speaking — Level 3 Multistructural required' },
            { done: false, text: 'Minimum estimated band score of 6.0 across all skills' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', fontSize: 13 }}>
              {r.done ? <CheckCircle size={16} color="var(--teal)" /> : <Circle size={16} color="var(--gray-400)" />}
              <span style={{ color: r.done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{r.text}</span>
            </div>
          ))}
        </div>

        {showCert && (
          <div style={{ marginTop: 20, animation: 'fadeUp 0.4s ease both' }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 16 }}>Certificate preview — complete all requirements to unlock</p>
            <div style={{ border: '2px solid var(--purple)', borderRadius: 'var(--radius-xl)', padding: 40, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 80, fontWeight: 700, color: 'var(--purple)', opacity: 0.04, whiteSpace: 'nowrap', pointerEvents: 'none' }}>BUILD ME</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', letterSpacing: '0.12em', marginBottom: 16 }}>BUILD ME — IELTS PREPARATION PLATFORM</div>
              <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Certificate of IELTS Readiness</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>This certifies that</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--purple)', marginBottom: 20 }}>Ahmad Malik</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 24px' }}>
                has successfully completed the Build Me IELTS preparation programme across all four skill domains — Writing, Reading, Listening, and Speaking — demonstrating multistructural competency in accordance with the SOLO Taxonomy framework, and is assessed to be ready to sit the IELTS examination.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 24 }}>
                {[['6.5', 'Estimated band'], ['1,240', 'Points earned'], ['34', 'Quizzes completed']].map(([val, lbl]) => (
                  <div key={lbl} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--purple)' }}>{val}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>{lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                <span>Issue date: March 2026</span>
                <span>Cert ID: BM-2026-AM-0341</span>
                <span>buildme.app/verify</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
