import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Lock, LogOut } from 'lucide-react';
import { api } from './api/client';
import { clearSession } from './api/auth';

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  Starter:       { bg: '#E1F5EE', color: '#085041' },
  Explorer:      { bg: '#FAEEDA', color: '#633806' },
  Builder:       { bg: '#EEEDFE', color: '#3C3489' },
  Analyst:       { bg: '#F1EFE8', color: '#444441' },
  Certified:     { bg: '#E1F5EE', color: '#085041' },
  'IELTS Ready': { bg: '#EEEDFE', color: '#3C3489' },
};

const ALL_BADGES = ['Starter', 'Explorer', 'Builder', 'Analyst', 'Certified', 'IELTS Ready'];

const SKILL_COLORS: Record<string, { color: string; bg: string }> = {
  Writing:   { color: '#534AB7', bg: '#EEEDFE' },
  Reading:   { color: '#1D9E75', bg: '#E1F5EE' },
  Listening: { color: '#BA7517', bg: '#FAEEDA' },
  Speaking:  { color: '#888780', bg: '#F1EFE8' },
};

interface PortfolioData { user: any; skills: any; stats: any; recentActivity: any; }
interface CertStatus { eligible: boolean; issued: boolean; requirements: Record<string, boolean>; readinessPercent: number; }

export default function Portfolio({ onLogout }: { onLogout?: () => void }) {
  const [data, setData]         = useState<PortfolioData | null>(null);
  const [cert, setCert]         = useState<CertStatus | null>(null);
  const [certData, setCertData] = useState<any>(null);
  const [showCert, setShowCert] = useState(false);
  const [issuing, setIssuing]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    Promise.all([
      api.get<PortfolioData>('/api/portfolio'),
      api.get<CertStatus>('/api/certificates/status'),
    ]).then(async ([p, c]) => {
      setData(p);
      setCert(c);
      // Auto-load existing certificate so it's ready to display
      if (c.issued) {
        try {
          const existing = await api.post<any>('/api/certificates/issue', {});
          setCertData(existing);
        } catch (_) {}
      }
    })
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
  }, []);

  async function handleIssueCert() {
    setIssuing(true);
    try {
      const result = await api.post<any>('/api/certificates/issue', {});
      setCertData(result);
      setShowCert(true);
      setCert(prev => prev ? { ...prev, issued: true } : prev);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIssuing(false);
    }
  }

  function handleLogout() { clearSession(); onLogout?.(); }

  if (loading) return (
    <div style={{ padding: '32px 36px', color: 'var(--text-secondary)', fontSize: 14 }}>Loading portfolio...</div>
  );

  if (error) return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ color: '#791F1F', background: '#FCEBEB', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
        <span>{error}</span>
        <button onClick={() => setError('')} style={{ background: 'transparent', border: 'none', color: '#791F1F', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>Dismiss</button>
      </div>
    </div>
  );

  const { user, skills, stats, recentActivity } = data!;
  const skillList = [skills.writing, skills.reading, skills.listening, skills.speaking];
  const initials  = user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const pct       = cert?.readinessPercent ?? 0;

  const certBtnLabel = issuing ? 'Issuing...'
    : cert?.issued   ? (showCert ? 'Hide certificate' : 'View certificate')
    : cert?.eligible ? 'Issue certificate'
    : 'Not yet eligible';

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }} className="animate-fadeUp">

      {/* Profile */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 28, display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, color: 'var(--purple-dark)', flexShrink: 0 }}>{initials}</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, marginBottom: 4 }}>{user.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            {user.streakDays > 0 ? `${user.streakDays}-day streak · ` : ''}{skillList.find((s: any) => s.level >= 3)?.levelName ?? 'Prestructural'} learner
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {user.earnedBadges?.map((b: string) => {
              const c = BADGE_COLORS[b] || BADGE_COLORS.Builder;
              return <span key={b} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: c.bg, color: c.color }}>{b}</span>;
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {([
            [user.totalPoints?.toLocaleString(), 'Total pts'],
            [stats.quizzesCompleted, 'Quizzes'],
            [user.estimatedBandScore > 0 ? user.estimatedBandScore.toFixed(1) : '—', 'Est. band'],
            [stats.notesCreated, 'Notes'],
          ] as [string, string][]).map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500 }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills + Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Skills overview</h2>
          {skillList.map((skill: any) => {
            const sc     = SKILL_COLORS[skill.name] || SKILL_COLORS.Writing;
            const pctBar = Math.round((skill.points / skill.maxPoints) * 100);
            return (
              <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: sc.bg, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{skill.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{skill.points} / {skill.maxPoints} pts</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ height: '100%', width: `${pctBar}%`, background: sc.color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Level {skill.level} — {skill.levelName}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Badges earned</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {ALL_BADGES.map(name => {
              const earned = user.earnedBadges?.includes(name);
              const c      = BADGE_COLORS[name] || BADGE_COLORS.Builder;
              return (
                <div key={name} style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center', opacity: earned ? 1 : 0.45 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: earned ? c.bg : 'var(--gray-200)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {earned ? <CheckCircle size={16} color={c.color} /> : <Lock size={14} color="var(--gray-400)" />}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Recent activity</h2>
        {(() => {
          const items = [
            ...(recentActivity.recentQuizzes || []).map((q: any) => ({
              dot: 'var(--purple)', text: `${q.skill} quiz — Level ${q.soloLevel} ${q.passed ? 'passed' : 'attempted'}`,
              pts: `+${q.pointsEarned} pts`, date: new Date(q.completedAt).toLocaleDateString(),
            })),
            ...(recentActivity.recentEssays || []).map((e: any) => ({
              dot: 'var(--teal)', text: `AI essay evaluation — Band ${e.overallBand}`,
              pts: `+${e.pointsEarned} pts`, date: new Date(e.evaluatedAt).toLocaleDateString(),
            })),
          ].slice(0, 5);
          return items.length > 0
            ? items.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.dot, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, flex: 1 }}>{a.text}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--teal)' }}>{a.pts}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 70, textAlign: 'right' }}>{a.date}</div>
                </div>
              ))
            : <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No activity yet — complete a quiz or submit an essay!</p>;
        })()}
      </div>

      {/* Certificate */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>IELTS readiness certificate</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Complete all 4 skills at Level 3 to unlock your verifiable certificate</p>
          </div>
          <button
            onClick={cert?.issued ? () => setShowCert(v => !v) : cert?.eligible ? handleIssueCert : undefined}
            disabled={issuing || (!cert?.eligible && !cert?.issued)}
            style={{
              padding: '9px 20px', fontSize: 13, fontWeight: 500, border: 'none',
              borderRadius: 'var(--radius-md)', cursor: cert?.eligible || cert?.issued ? 'pointer' : 'not-allowed',
              background: cert?.eligible || cert?.issued ? 'var(--purple)' : 'var(--gray-200)',
              color: cert?.eligible || cert?.issued ? '#fff' : 'var(--text-tertiary)',
            }}
          >{certBtnLabel}</button>
        </div>

        {/* Readiness bar */}
        <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--purple)' }}>{pct}%</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Overall readiness</div>
            <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--purple)', borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{100 - pct}% remaining</div>
          </div>
        </div>

        {/* Skill grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          {skillList.map((skill: any) => (
            <div key={skill.name} style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{skill.name}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: skill.level === 3 ? 'var(--purple)' : 'var(--text-primary)', marginBottom: 3 }}>Level {skill.level}</div>
              <div style={{ fontSize: 10, color: skill.level === 3 ? 'var(--teal)' : 'var(--text-tertiary)' }}>
                {skill.level === 3 ? 'Complete' : `${3 - skill.level} level${3 - skill.level > 1 ? 's' : ''} remaining`}
              </div>
            </div>
          ))}
        </div>

        {/* Checklist */}
        {cert && [
          { done: cert.requirements.writingLevel3,   text: 'Writing — Level 3 Multistructural' },
          { done: cert.requirements.readingLevel3,   text: 'Reading — Level 3 Multistructural' },
          { done: cert.requirements.listeningLevel3, text: 'Listening — Level 3 Multistructural' },
          { done: cert.requirements.speakingLevel3,  text: 'Speaking — Level 3 Multistructural' },
          { done: cert.requirements.bandScore6,      text: 'Estimated band score ≥ 6.0' },
        ].map((r, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13 }}>
            {r.done ? <CheckCircle size={16} color="var(--teal)" /> : <Circle size={16} color="var(--gray-400)" />}
            <span style={{ color: r.done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{r.text}</span>
          </div>
        ))}

        {/* Certificate card — real data from backend */}
        {showCert && certData && (
          <div style={{ marginTop: 24, animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ border: '2px solid var(--purple)', borderRadius: 'var(--radius-xl)', padding: 40, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 80, fontWeight: 700, color: 'var(--purple)', opacity: 0.04, whiteSpace: 'nowrap', pointerEvents: 'none' }}>BUILD ME</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', letterSpacing: '0.12em', marginBottom: 16 }}>BUILD ME — IELTS PREPARATION PLATFORM</div>
              <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Certificate of IELTS Readiness</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>This certifies that</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--purple)', marginBottom: 20 }}>{certData.userName}</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 24px' }}>
                has successfully completed the Build Me IELTS preparation programme across all four skill domains, demonstrating multistructural competency in accordance with the SOLO Taxonomy framework, and is assessed to be ready to sit the IELTS examination.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 24 }}>
                {([
                  [certData.estimatedBand?.toFixed(1), 'Estimated band'],
                  [certData.totalPoints?.toLocaleString(), 'Points earned'],
                  [String(certData.quizzesCompleted), 'Quizzes completed'],
                ] as [string, string][]).map(([val, lbl]) => (
                  <div key={lbl} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--purple)' }}>{val}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>{lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                <span>Issue date: {certData.issuedAt ? new Date(certData.issuedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                <span>Cert ID: {certData.certId}</span>
                <span>buildme.app/verify/{certData.certId}</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                Verify at: <a href={`/verify/${certData.certId}`} target="_blank" rel="noreferrer" style={{ color: 'var(--purple)' }}>buildme.app/verify/{certData.certId}</a>
              </span>
            </div>
          </div>
        )}

        {/* Not yet eligible preview message */}
        {showCert && !certData && (
          <div style={{ marginTop: 16, padding: 14, background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
            Complete all the requirements above to issue your real verifiable certificate.
          </div>
        )}
      </div>
    </div>
  );
}