import React from 'react';
import { SKILLS, BADGES } from './data';
import { Flame, TrendingUp } from 'lucide-react';

interface DashboardProps { onNav: (s: any) => void; }

export default function Dashboard({ onNav }: DashboardProps) {
  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }} className="animate-fadeUp">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            Good morning, Ahmad
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
            Continue where you left off — Writing Task 2
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--amber-light)', color: 'var(--amber)', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20 }}>
            <Flame size={13} /> 7-day streak
          </span>
          <span style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20 }}>
            Builder badge
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total points', value: '1,240', sub: '+80 this week' },
          { label: 'Current level', value: 'Level 3', sub: 'Multistructural' },
          { label: 'Quizzes done', value: '34', sub: '12 this month' },
          { label: 'Est. band score', value: '6.5', sub: 'Based on quizzes' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)', padding: '18px 20px',
            animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.5px' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={15} style={{ color: 'var(--purple)' }} /> Skills progress
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {SKILLS.map((skill, i) => (
            <div key={skill.id} onClick={() => onNav('quiz')}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '18px 20px', cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                animation: `fadeUp 0.4s ease ${0.2 + i * 0.07}s both`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = skill.color; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{skill.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Level {skill.level}</span>
              </div>
              <div style={{ height: 5, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${Math.round((skill.pts / skill.maxPts) * 100)}%`, background: skill.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{skill.levelName}</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{skill.pts} / {skill.maxPts} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Recent activity</h2>
          {[
            { dot: 'var(--purple)', text: 'Writing Task 2 — essay submitted', time: '2h ago', pts: '+90 pts' },
            { dot: 'var(--teal)', text: 'Reading quiz — Level 2 completed', time: 'Yesterday', pts: '+80 pts' },
            { dot: 'var(--amber)', text: 'Note saved — Cohesion tips', time: '2 days ago', pts: '+5 pts' },
            { dot: 'var(--purple)', text: 'AI feedback received — Band 6.5', time: '3 days ago', pts: '+65 pts' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.dot, flexShrink: 0 }} />
              <div style={{ fontSize: 13, flex: 1 }}>{a.text}</div>
              <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500 }}>{a.pts}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 60, textAlign: 'right' }}>{a.time}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500 }}>Certification progress</h2>
          <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Overall readiness</div>
            <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: '62%', background: 'var(--purple)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>62% complete — 38% remaining</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Complete all 4 skill modules at Level 3 to unlock your IELTS readiness certificate.
          </p>
          <button onClick={() => onNav('portfolio')} style={{
            padding: '9px', fontSize: 13, border: '1px solid var(--border-md)',
            borderRadius: 'var(--radius-md)', background: 'transparent',
            color: 'var(--text-primary)', marginTop: 'auto',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-100)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            View portfolio →
          </button>
        </div>
      </div>
    </div>
  );
}
