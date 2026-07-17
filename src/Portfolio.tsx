import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Circle, Lock, LogOut, Camera, Trash2, Upload } from 'lucide-react';
import { api } from './api/client';
import { clearSession } from './api/auth';
import { profileApi, getAvatarUrl } from './api/profile';

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  Starter:       { bg: '#E1F5EE', color: '#085041' },
  Explorer:      { bg: '#FAEEDA', color: '#633806' },
  Builder:       { bg: '#EEEDFE', color: '#3C3489' },
  Analyst:       { bg: '#F1EFE8', color: '#444441' },
  Certified:     { bg: '#E1F5EE', color: '#085041' },
  'IELTS Ready': { bg: '#EEEDFE', color: '#3C3489' },
};
const ALL_BADGES = ['Starter','Explorer','Builder','Analyst','Certified','IELTS Ready'];
const SKILL_COLORS: Record<string, { color: string; bg: string }> = {
  Writing:   { color: '#534AB7', bg: '#EEEDFE' },
  Reading:   { color: '#1D9E75', bg: '#E1F5EE' },
  Listening: { color: '#BA7517', bg: '#FAEEDA' },
  Speaking:  { color: '#888780', bg: '#F1EFE8' },
};

interface PortfolioData { user: any; skills: any; stats: any; recentActivity: any; }
interface CertStatus    { eligible: boolean; issued: boolean; requirements: Record<string, boolean>; readinessPercent: number; }

// ── Avatar component ─────────────────────────────────────────────────────────
function Avatar({ initials, avatarUrl, size = 64, onUpload, onDelete, editable = false }:
  { initials: string; avatarUrl?: string | null; size?: number; onUpload?: (f: File) => void; onDelete?: () => void; editable?: boolean }) {

  const [hover, setHover] = useState(false);
  const inputRef          = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Max file size is 5MB'); return; }
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    // ✅ Don't create a blob URL here — let parent handle state after server confirms upload
    onUpload?.(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  const img = avatarUrl;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
      onMouseEnter={() => editable && setHover(true)}
      onMouseLeave={() => editable && setHover(false)}
    >
      {/* Circle */}
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {img
          ? <img src={img} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: size * 0.3, fontWeight: 600, color: 'var(--purple-dark)' }}>{initials}</span>
        }
      </div>

      {/* Hover overlay */}
      {editable && hover && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
          <button onClick={() => inputRef.current?.click()}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Camera size={size * 0.28} color="#fff" />
            <span style={{ fontSize: size * 0.13, color: '#fff', fontWeight: 500 }}>Change</span>
          </button>
        </div>
      )}

      {/* Camera badge (always visible when no image) */}
      {editable && !img && !hover && (
        <div onClick={() => inputRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: size * 0.35, height: size * 0.35, borderRadius: '50%', background: 'var(--purple)', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Camera size={size * 0.18} color="#fff" />
        </div>
      )}

      {/* Delete badge (when image exists) */}
      {editable && img && !hover && (
        <div onClick={onDelete} style={{ position: 'absolute', bottom: 0, right: 0, width: size * 0.35, height: size * 0.35, borderRadius: '50%', background: '#E24B4A', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Trash2 size={size * 0.18} color="#fff" />
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Portfolio({ onLogout }: { onLogout?: () => void }) {
  const [data, setData]           = useState<PortfolioData | null>(null);
  const [cert, setCert]           = useState<CertStatus | null>(null);
  const [certData, setCertData]   = useState<any>(null);
  const [showCert, setShowCert]   = useState(false);
  const [issuing, setIssuing]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]         = useState('');

  useEffect(() => {
    Promise.all([
      api.get<PortfolioData>('/api/portfolio'),
      api.get<CertStatus>('/api/certificates/status'),
    ]).then(async ([p, c]) => {
      setData(p);
      setCert(c);
      // ✅ Load avatar from user profile on every mount — this is what persists across refreshes
      if (p.user?.avatarUrl) setAvatarUrl(getAvatarUrl(p.user.avatarUrl));
      if (c.issued) {
        try { const ex = await api.post<any>('/api/certificates/issue', {}); setCertData(ex); } catch (_) {}
      }
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const res = await profileApi.uploadAvatar(file);
      // ✅ Use the server-returned URL (persists on refresh) not the blob object URL
      setAvatarUrl(getAvatarUrl(res.avatarUrl));
      showToast('Profile photo updated!');
    } catch (e: any) {
      showToast(e.message || 'Upload failed');
    } finally { setUploading(false); }
  }

  async function handleAvatarDelete() {
    try {
      await profileApi.deleteAvatar();
      setAvatarUrl(null);
      showToast('Photo removed');
    } catch (e: any) {
      showToast(e.message || 'Failed to remove');
    }
  }

  async function handleIssueCert() {
    setIssuing(true);
    try {
      const result = await api.post<any>('/api/certificates/issue', {});
      setCertData(result);
      setShowCert(true);
      setCert(prev => prev ? { ...prev, issued: true } : prev);
    } catch (e: any) { setError(e.message); }
    finally { setIssuing(false); }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2800); }
  function handleLogout() { clearSession(); onLogout?.(); }

  if (loading) return <div style={{ padding: '32px 36px', color: 'var(--text-secondary)', fontSize: 14 }}>Loading portfolio...</div>;
  if (error)   return (
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
  const certBtnLabel = issuing ? 'Issuing...' : cert?.issued ? (showCert ? 'Hide certificate' : 'View certificate') : cert?.eligible ? 'Issue certificate' : 'Not yet eligible';

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, position: 'relative' }} className="animate-fadeUp responsive-padding portfolio-page">

      {/* ── Profile card ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 28, display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }} className="portfolio-profile-card">

        {/* Avatar with upload */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar
            initials={initials}
            avatarUrl={avatarUrl}
            size={72}
            editable={true}
            onUpload={handleAvatarUpload}
            onDelete={handleAvatarDelete}
          />
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, border: '2px solid var(--purple)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400 }}>{user.name}</h1>
            {/* Upload hint */}
            <button onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-tertiary)', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 8, padding: '3px 8px', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget.style.color='var(--purple)'); (e.currentTarget.style.borderColor='var(--purple)'); }}
              onMouseLeave={e => { (e.currentTarget.style.color='var(--text-tertiary)'); (e.currentTarget.style.borderColor='var(--border)'); }}
            >
              <Upload size={10} /> {avatarUrl ? 'Change photo' : 'Add photo'}
            </button>
          </div>
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

        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }} className="portfolio-stats-row">
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
          <button onClick={handleLogout}
            style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}
            onMouseEnter={e => { (e.currentTarget.style.background='#FCEBEB'); (e.currentTarget.style.color='#791F1F'); }}
            onMouseLeave={e => { (e.currentTarget.style.background='transparent'); (e.currentTarget.style.color='var(--text-secondary)'); }}
          ><LogOut size={14} /> Sign out</button>
        </div>
      </div>

      {/* ── Skills + Badges ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }} className="responsive-grid-2">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Skills overview</h2>
          {skillList.map((skill: any) => {
            const sc = SKILL_COLORS[skill.name] || SKILL_COLORS.Writing;
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
              const c = BADGE_COLORS[name] || BADGE_COLORS.Builder;
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

      {/* ── Recent activity ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Recent activity</h2>
        {(() => {
          const items = [
            ...(recentActivity.recentQuizzes || []).map((q: any) => ({ dot: 'var(--purple)', text: `${q.skill} quiz — Level ${q.soloLevel} ${q.passed ? 'passed' : 'attempted'}`, pts: `+${q.pointsEarned} pts`, date: new Date(q.completedAt).toLocaleDateString() })),
            ...(recentActivity.recentEssays  || []).map((e: any) => ({ dot: 'var(--teal)',   text: `AI essay evaluation — Band ${e.overallBand}`, pts: `+${e.pointsEarned} pts`, date: new Date(e.evaluatedAt).toLocaleDateString() })),
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

      {/* ── Certificate ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }} className="portfolio-cert-header">
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>IELTS readiness certificate</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Complete all 4 skills at Level 3 to unlock your verifiable certificate</p>
          </div>
          <button
            onClick={cert?.issued ? () => setShowCert(v => !v) : cert?.eligible ? handleIssueCert : undefined}
            disabled={issuing || (!cert?.eligible && !cert?.issued)}
            style={{ padding: '9px 20px', fontSize: 13, fontWeight: 500, border: 'none', borderRadius: 'var(--radius-md)', cursor: cert?.eligible || cert?.issued ? 'pointer' : 'not-allowed', background: cert?.eligible || cert?.issued ? 'var(--purple)' : 'var(--gray-200)', color: cert?.eligible || cert?.issued ? '#fff' : 'var(--text-tertiary)' }}
          >{certBtnLabel}</button>
        </div>

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }} className="responsive-grid-4">
          {skillList.map((skill: any) => (
            <div key={skill.name} style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{skill.name}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: skill.level === 3 ? 'var(--purple)' : 'var(--text-primary)', marginBottom: 3 }}>Level {skill.level}</div>
              <div style={{ fontSize: 10, color: skill.level === 3 ? 'var(--teal)' : 'var(--text-tertiary)' }}>{skill.level === 3 ? 'Complete' : `${3 - skill.level} level${3 - skill.level > 1 ? 's' : ''} remaining`}</div>
            </div>
          ))}
        </div>

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

        {showCert && certData && (
          <div style={{ marginTop: 24 }}>
            <div style={{ border: '2px solid var(--purple)', borderRadius: 'var(--radius-xl)', padding: 40, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 80, fontWeight: 700, color: 'var(--purple)', opacity: 0.04, whiteSpace: 'nowrap', pointerEvents: 'none' }}>BUILD ME</div>

              {/* Avatar on certificate */}
              {avatarUrl && (
                <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '3px solid var(--purple)' }}>
                  <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', letterSpacing: '0.12em', marginBottom: 16 }}>BUILD ME — IELTS PREPARATION PLATFORM</div>
              <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Certificate of IELTS Readiness</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>This certifies that</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--purple)', marginBottom: 20 }}>{certData.userName}</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 24px' }}>
                has successfully completed the Build Me IELTS preparation programme across all four skill domains, demonstrating multistructural competency in accordance with the SOLO Taxonomy framework.
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
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--teal)', color: '#fff', padding: '10px 18px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}