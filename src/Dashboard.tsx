import React, { useState, useEffect, useRef } from 'react';
import { Flame, BookOpen, Headphones, Mic, PenLine, X, ChevronRight, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { api } from './api/client';
import { UserProfile } from './api/auth';
import WeaknessPanel from './component/WeaknessPanel';

interface DashboardProps { onNav: (s: any) => void; }

const SKILL_META: Record<string, { color: string; bg: string; pill: string; icon: React.ReactNode }> = {
  Writing:   { color: '#534AB7', bg: '#EEEDFE', pill: '#3C3489', icon: <PenLine size={14} /> },
  Reading:   { color: '#1D9E75', bg: '#E1F5EE', pill: '#085041', icon: <BookOpen size={14} /> },
  Listening: { color: '#BA7517', bg: '#FAEEDA', pill: '#412402', icon: <Headphones size={14} /> },
  Speaking:  { color: '#888780', bg: '#F1EFE8', pill: '#444441', icon: <Mic size={14} /> },
};

const STUDY_TIPS = [
  'Review vocabulary in context — reading 15 mins daily builds band score faster than isolated word lists.',
  'For Writing Task 2, spend 5 mins planning your essay structure before you start.',
  'Listen to BBC World Service podcasts to naturally improve your listening comprehension.',
  'Paraphrase the question in your introduction — never copy the exact wording.',
  'Mix simple, compound, and complex sentences to demonstrate range in writing.',
];

const DAILY_TASKS = [
  { id: 1, text: 'Complete a Writing Task 2 essay', xp: 50, skill: 'Writing' },
  { id: 2, text: 'Reading passage — Academic section', xp: 30, skill: 'Reading' },
  { id: 3, text: 'Listening quiz — Level 2', xp: 25, skill: 'Listening' },
  { id: 4, text: 'Speaking self-assessment', xp: 20, skill: 'Speaking' },
  { id: 5, text: 'Vocabulary flashcard review', xp: 15, skill: 'Writing' },
];

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

// ─── Skill Detail Modal ───────────────────────────────────────────────────────
interface SkillModalProps {
  skill: any;
  onClose: () => void;
  onNav: (s: any) => void;
}

function SkillModal({ skill, onClose, onNav }: SkillModalProps) {
  const meta = SKILL_META[skill.name] ?? SKILL_META.Writing;
  const pct  = Math.round((skill.points / skill.maxPoints) * 100);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: 24, width: 340,
          animation: 'fadeUp 0.2s ease both',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color }}>
              {meta.icon}
            </div>
            <span style={{ fontSize: 18, fontWeight: 500 }}>{skill.name}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', lineHeight: 1 }}>
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Level {skill.level} — {skill.levelName}</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{skill.points} / {skill.maxPoints} pts</span>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          {[
            { label: 'Next level', value: `${skill.maxPoints - skill.points} pts away` },
            { label: 'Progress', value: `${pct}%` },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => { onClose(); onNav('quiz'); }}
          style={{
            width: '100%', padding: '10px', fontSize: 13, fontWeight: 500,
            background: meta.color, color: 'white', border: 'none',
            borderRadius: 'var(--radius-md)', cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Practice {skill.name} →
        </button>
      </div>
    </div>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBarChart({ values, color, todayIdx }: { values: number[]; color: string; todayIdx: number }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52 }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{v}</div>
          <div style={{
            width: '100%', height: `${Math.round((v / max) * 36) + 4}px`,
            background: i === todayIdx ? color : 'var(--gray-100)',
            borderRadius: '3px 3px 0 0', minHeight: 4,
            transition: 'height 0.6s ease',
          }} />
        </div>
      ))}
    </div>
  );
}

// ─── Mini Video Player ────────────────────────────────────────────────────────
function MiniVideoPlayer() {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setPlaying(!playing);
    }
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.6px' }}>INTRO VIDEO</span>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Trailer</span>
      </div>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
        <video
          ref={videoRef}
          src="/Video_trailer_IELTS.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Controls Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          display: 'flex',
          gap: 6,
          zIndex: 10,
        }}>
          <button
            onClick={toggleMute}
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              transition: 'background 0.2s',
            }}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <button
            onClick={togglePlay}
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              transition: 'background 0.2s',
            }}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ onNav }: DashboardProps) {
  const [user, setUser]           = useState<UserProfile | null>(null);
  const [portfolio, setPort]      = useState<any>(null);
  const [certPct, setCertPct]     = useState(0);
  const [loading, setLoading]     = useState(true);
  const [selectedSkill, setSkill] = useState<any>(null);
  const [leaderTab, setLeaderTab] = useState<'week' | 'all'>('week');
  const [tipIdx, setTipIdx]       = useState(0);
  const [doneTasks, setDoneTasks] = useState<Set<number>>(new Set([1, 2]));

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

  const skills    = [user.writing, user.reading, user.listening, user.speaking].filter(Boolean);
  const topBadge  = user.earnedBadges?.slice(-1)[0] ?? null;
  const firstName = user.name?.split(' ')[0] ?? 'there';
  const topLevel  = Math.max(...skills.map(s => s?.level ?? 1));

  const activity = [
    ...(portfolio?.recentActivity?.recentQuizzes ?? []).map((q: any) => ({
      dot: SKILL_META[q.skill]?.color ?? '#534AB7',
      text: `${q.skill} quiz — Level ${q.soloLevel} ${q.passed ? 'passed' : 'attempted'}`,
      pts: `+${q.pointsEarned} pts`,
      time: timeAgo(q.completedAt),
    })),
    ...(portfolio?.recentActivity?.recentEssays ?? []).map((e: any) => ({
      dot: '#1D9E75',
      text: `AI essay evaluation — Band ${e.overallBand}`,
      pts: `+${e.pointsEarned} pts`,
      time: timeAgo(e.evaluatedAt),
    })),
  ].sort(() => -1).slice(0, 4);

  // Week XP — replace with real data when available
  const weekXP = [80, 120, 60, 95, 110, 45, 0];
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  // Leaderboard mock — wire to real endpoint when available
  const leaderboardData = {
    week: [
      { rank: 1, name: 'Priya K.',  pts: 840,   you: false, bg: '#EEEDFE', tc: '#3C3489' },
      { rank: 2, name: 'You',       pts: user.totalPoints ?? 760, you: true,  bg: '#E1F5EE', tc: '#085041' },
      { rank: 3, name: 'James M.',  pts: 720,   you: false, bg: '#FAEEDA', tc: '#412402' },
      { rank: 4, name: 'Sara L.',   pts: 690,   you: false, bg: '#F1EFE8', tc: '#444441' },
    ],
    all: [
      { rank: 1,  name: 'Priya K.', pts: 12400, you: false, bg: '#EEEDFE', tc: '#3C3489' },
      { rank: 2,  name: 'James M.', pts: 11200, you: false, bg: '#FAEEDA', tc: '#412402' },
      { rank: 8,  name: 'You',      pts: user.totalPoints ?? 4820, you: true,  bg: '#E1F5EE', tc: '#085041' },
      { rank: 9,  name: 'Sara L.',  pts: 4100,  you: false, bg: '#F1EFE8', tc: '#444441' },
    ],
  };

  const donePct = Math.round((doneTasks.size / DAILY_TASKS.length) * 100);

  const toggleTask = (id: number) => {
    setDoneTasks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ maxWidth: 940 }} className="animate-fadeUp responsive-padding">

      {/* ── Header ── */}
      <div className="responsive-flex-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.3px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            {getGreeting()}, {firstName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 5 }}>
            {topLevel >= 3
              ? <>You're at <strong style={{ color: '#534AB7', fontWeight: 500 }}>Multistructural</strong> level — keep going!</>
              : 'Keep practising to reach Multistructural level.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginTop: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {user.streakDays > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--amber-light)', color: 'var(--amber)', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20 }}>
              <Flame size={12} /> {user.streakDays}-day streak
            </span>
          )}
          {user.estimatedBandScore > 0 && (
            <span style={{ background: '#EEEDFE', color: '#3C3489', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20 }}>
              Band {user.estimatedBandScore.toFixed(1)} est.
            </span>
          )}
          {topBadge && (
            <span style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20 }}>
              {topBadge}
            </span>
          )}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="responsive-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 }}>
        {[
          { label: 'Total XP',       value: user.totalPoints?.toLocaleString() ?? '0',                    sub: 'Lifetime earned' },
          { label: 'Current level',  value: `Level ${topLevel}`,                                           sub: skills.find(s => s?.level === topLevel)?.levelName ?? '' },
          { label: 'Quizzes done',   value: String(portfolio?.stats?.quizzesCompleted ?? 0),               sub: 'All time' },
          { label: 'Est. band score',value: user.estimatedBandScore > 0 ? user.estimatedBandScore.toFixed(1) : '—', sub: 'Based on evaluations' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)', padding: '16px 18px',
            animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.5px' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="responsive-layout-main" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14, marginBottom: 14 }}>

        {/* Left column */}
        <div>
          {/* Skill progress title */}
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.6px', marginBottom: 12 }}>
            SKILL PROGRESS
          </div>
          <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {skills.map((skill, i) => {
              if (!skill) return null;
              const meta = SKILL_META[skill.name] ?? SKILL_META.Writing;
              const pct  = Math.round((skill.points / skill.maxPoints) * 100);
              return (
                <div
                  key={skill.name}
                  onClick={() => setSkill(skill)}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '16px 18px', cursor: 'pointer',
                    transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                    animation: `fadeUp 0.4s ease ${0.15 + i * 0.07}s both`,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = meta.color;
                    el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
                    el.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = 'var(--border)';
                    el.style.boxShadow = 'none';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color }}>
                        {meta.icon}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{skill.name}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 10, background: meta.bg, color: meta.pill }}>
                      Lv {skill.level}
                    </span>
                  </div>
                  <div style={{ height: 5, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden', marginBottom: 7 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{skill.levelName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{skill.points} / {skill.maxPoints} pts</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weakness Detection Panel */}
          <WeaknessPanel user={user} onNav={onNav} />

          {/* Daily tasks */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Today's challenges</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{doneTasks.size} / {DAILY_TASKS.length} done</span>
            </div>
            <div style={{ height: 4, background: 'var(--gray-100)', borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ height: '100%', width: `${donePct}%`, background: '#534AB7', borderRadius: 2, transition: 'width 0.5s ease' }} />
            </div>
            {DAILY_TASKS.map((task, i) => {
              const done   = doneTasks.has(task.id);
              const meta   = SKILL_META[task.skill] ?? SKILL_META.Writing;
              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 8px', cursor: 'pointer',
                    borderBottom: i < DAILY_TASKS.length - 1 ? '1px solid var(--border)' : 'none',
                    borderRadius: 6, transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-50)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    border: done ? 'none' : '1.5px solid var(--border-md)',
                    background: done ? '#1D9E75' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {done && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: done ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', transition: 'color 0.2s' }}>
                    {task.text}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: meta.color, background: meta.bg, padding: '3px 8px', borderRadius: 10 }}>
                    +{task.xp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Intro Video */}
          <MiniVideoPlayer />

          {/* Weekly XP chart */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.6px', marginBottom: 12 }}>XP THIS WEEK</div>
            <MiniBarChart values={weekXP} color="#534AB7" todayIdx={todayIdx} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              {WEEK_LABELS.map(l => (
                <span key={l} style={{ fontSize: 10, color: 'var(--text-tertiary)', flex: 1, textAlign: 'center' }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Top learners</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {(['week', 'all'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setLeaderTab(t)}
                    style={{
                      padding: '4px 10px', fontSize: 12, border: 'none', cursor: 'pointer',
                      borderRadius: 'var(--radius-md)', transition: 'all 0.15s',
                      background: leaderTab === t ? 'var(--gray-100)' : 'transparent',
                      color: leaderTab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: leaderTab === t ? 500 : 400,
                    }}
                  >
                    {t === 'week' ? 'Week' : 'All time'}
                  </button>
                ))}
              </div>
            </div>
            {leaderboardData[leaderTab].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < leaderboardData[leaderTab].length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ width: 18, fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', textAlign: 'center' }}>{row.rank}</span>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: row.tc, flexShrink: 0 }}>
                  {row.name.split(' ').map(w => w[0]).join('')}
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: row.you ? 500 : 400, color: row.you ? '#534AB7' : 'var(--text-primary)' }}>
                  {row.name}{row.you ? ' (you)' : ''}
                </span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{row.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Study tip */}
          <div style={{ background: '#EEEDFE', border: '1px solid #AFA9EC', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#3C3489', letterSpacing: '0.4px', marginBottom: 6 }}>STUDY TIP</div>
            <p style={{ fontSize: 13, color: '#26215C', lineHeight: 1.65, transition: 'opacity 0.2s' }}>
              {STUDY_TIPS[tipIdx]}
            </p>
            <button
              onClick={() => setTipIdx(i => (i + 1) % STUDY_TIPS.length)}
              style={{ marginTop: 10, padding: '7px 12px', fontSize: 12, border: '1px solid #AFA9EC', borderRadius: 'var(--radius-md)', background: 'transparent', color: '#3C3489', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#CECBF6')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Next tip
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="responsive-layout-main" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>

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

        {/* Certification */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500 }}>Certification readiness</h2>
          <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Overall readiness</span>
              <span style={{ fontSize: 22, fontWeight: 500, color: '#534AB7' }}>{certPct}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${certPct}%`, background: '#534AB7', borderRadius: 3, transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{100 - certPct}% remaining</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ textAlign: 'center', padding: 10, background: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#1D9E75' }}>
                {skills.filter(s => (s?.level ?? 0) >= 3).length}/4
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Skills at Lv 3+</div>
            </div>
            <div style={{ textAlign: 'center', padding: 10, background: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#BA7517' }}>
                {user.earnedBadges?.length ?? 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Badges earned</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Complete all 4 skill modules at Level 3 to unlock your IELTS readiness certificate.
          </p>
          <button
            onClick={() => onNav('portfolio')}
            style={{ padding: 9, fontSize: 13, border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-primary)', marginTop: 'auto', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-100)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            View portfolio <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* ── Skill Modal ── */}
      {selectedSkill && (
        <SkillModal skill={selectedSkill} onClose={() => setSkill(null)} onNav={onNav} />
      )}
    </div>
  );
}