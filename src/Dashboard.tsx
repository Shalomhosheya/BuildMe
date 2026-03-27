import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { api } from './api/client';
import { UserProfile } from './api/auth';

interface DashboardProps { onNav: (s: any) => void; }

const SKILL_COLORS: Record<string, { color: string; bg: string }> = {
  Writing:   { color: '#534AB7', bg: '#EEEDFE' },
  Reading:   { color: '#1D9E75', bg: '#E1F5EE' },
  Listening: { color: '#BA7517', bg: '#FAEEDA' },
  Speaking:  { color: '#888780', bg: '#F1EFE8' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Dashboard({ onNav }: DashboardProps) {
  const [user, setUser]       = useState<UserProfile | null>(null);
  const [portfolio, setPort]  = useState<any>(null);
  const [certPct, setCertPct] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<UserProfile>('/api/auth/me'),
      api.get<any>('/api/portfolio'),
      api.get<any>('/api/certificates/status'),
    ]).then(([u, p, c]) => {
      setUser(u);
      setPort(p);
      setCertPct(c.readinessPercent ?? 0);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: '32px 36px', color: 'var(--text-secondary)', fontSize: 14 }}>
      Loading dashboard...
    </div>
  );

  if (!user) return null;

  const skills     = [user.writing, user.reading, user.listening, user.speaking];
  const topBadge   = user.earnedBadges?.slice(-1)[0] ?? null;
  const firstName  = user.name?.split(' ')[0] ?? 'there';
  const topLevel   = Math.max(...skills.map(s => s?.level ?? 1));

  const activity = [
    ...(portfolio?.recentActivity?.recentQuizzes ?? []).map((q: any) => ({
      dot: 'var(--purple)',
      text: `${q.skill} quiz — Level ${q.soloLevel} ${q.passed ? 'passed' : 'attempted'}`,
      pts: `+${q.pointsEarned} pts`,
      time: timeAgo(q.completedAt),
    })),
    ...(portfolio?.recentActivity?.recentEssays ?? []).map((e: any) => ({
      dot: 'var(--teal)',
      text: `AI essay evaluation — Band ${e.overallBand}`,
      pts: `+${e.pointsEarned} pts`,
      time: timeAgo(e.evaluatedAt),
    })),
  ].sort(() => -1).slice(0, 4);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }} className="animate-fadeUp">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            {getGreeting()}, {firstName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
            {topLevel >= 3 ? 'You are at Multistructural level — keep going!' : 'Keep practising to reach Multistructural level.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
          {user.streakDays > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--amber-light)', color: 'var(--amber)', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20 }}>
              <Flame size={13} /> {user.streakDays}-day streak
            </span>
          )}
          {topBadge && (
            <span style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20 }}>
              {topBadge}
            </span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total points',    value: user.totalPoints?.toLocaleString() ?? '0',   sub: 'Lifetime earned' },
          { label: 'Current level',   value: `Level ${topLevel}`,                          sub: skills.find(s => s?.level === topLevel)?.levelName ?? '' },
          { label: 'Quizzes done',    value: String(portfolio?.stats?.quizzesCompleted ?? 0), sub: 'All time' },
          { label: 'Est. band score', value: user.estimatedBandScore > 0 ? user.estimatedBandScore.toFixed(1) : '—', sub: 'Based on evaluations' },
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

      {/* Skills */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={15} style={{ color: 'var(--purple)' }} /> Skills progress
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {skills.map((skill, i) => {
            if (!skill) return null;
            const sc  = SKILL_COLORS[skill.name] ?? SKILL_COLORS.Writing;
            const pct = Math.round((skill.points / skill.maxPoints) * 100);
            return (
              <div key={skill.name} onClick={() => onNav('quiz')}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '18px 20px', cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  animation: `fadeUp 0.4s ease ${0.2 + i * 0.07}s both`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = sc.color; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{skill.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Level {skill.level}</span>
                </div>
                <div style={{ height: 5, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: sc.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{skill.levelName}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{skill.points} / {skill.maxPoints} pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>

        {/* Recent activity */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Recent activity</h2>
          {activity.length > 0 ? activity.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < activity.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.dot, flexShrink: 0 }} />
              <div style={{ fontSize: 13, flex: 1 }}>{a.text}</div>
              <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500 }}>{a.pts}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 60, textAlign: 'right' }}>{a.time}</div>
            </div>
          )) : (
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
              No activity yet — complete a quiz or submit an essay to get started!
            </p>
          )}
        </div>

        {/* Certification progress */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500 }}>Certification progress</h2>
          <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Overall readiness</div>
            <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${certPct}%`, background: 'var(--purple)', borderRadius: 3, transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{certPct}% complete — {100 - certPct}% remaining</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Complete all 4 skill modules at Level 3 to unlock your IELTS readiness certificate.
          </p>
          <button onClick={() => onNav('portfolio')}
            style={{ padding: '9px', fontSize: 13, border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-primary)', marginTop: 'auto', cursor: 'pointer' }}
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