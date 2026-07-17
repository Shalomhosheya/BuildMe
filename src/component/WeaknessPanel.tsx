import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ExternalLink, ArrowRight } from 'lucide-react';
import { detectWeaknesses, WeakSkill } from '../api/recommendations';
import { UserProfile } from '../api/auth';
import { Screen } from '../types';

interface WeaknessPanelProps {
  user: UserProfile;
  onNav: (screen: Screen) => void;
}

const SKILL_COLOR: Record<string, { color: string; bg: string; border: string }> = {
  Writing:   { color: '#534AB7', bg: '#EEEDFE', border: '#C4BAF7' },
  Reading:   { color: '#1D9E75', bg: '#E1F5EE', border: '#86D9BA' },
  Listening: { color: '#BA7517', bg: '#FAEEDA', border: '#E8C17A' },
  Speaking:  { color: '#888780', bg: '#F1EFE8', border: '#C8C6BE' },
};

const SEVERITY_CONFIG = {
  critical: {
    label: '🔴 Critical',
    bg: '#FEF2F2',
    border: '#FECACA',
    badgeBg: '#FEE2E2',
    badgeColor: '#991B1B',
  },
  needs_work: {
    label: '🟡 Needs Work',
    bg: '#FFFBEB',
    border: '#FDE68A',
    badgeBg: '#FEF3C7',
    badgeColor: '#92400E',
  },
};

const TYPE_ICONS: Record<string, string> = {
  video: '🎬', article: '📄', book: '📚', practice: '✏️', chatbot: '💬',
};

// ── Individual Skill Weakness Card ────────────────────────────────────────────
function SkillWeaknessCard({
  skill,
  onNav,
  defaultOpen,
}: {
  skill: WeakSkill;
  onNav: (screen: Screen) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const colors = SKILL_COLOR[skill.name] ?? SKILL_COLOR.Writing;
  const sev    = SEVERITY_CONFIG[skill.severity];

  return (
    <div style={{
      border: `1px solid ${sev.border}`,
      borderRadius: 'var(--radius-lg)',
      background: sev.bg,
      overflow: 'hidden',
    }}>
      {/* Collapsed header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: colors.bg, border: `1px solid ${colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: colors.color }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{skill.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
              background: sev.badgeBg, color: sev.badgeColor, letterSpacing: '0.03em',
            }}>
              {sev.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${skill.pct}%`, background: colors.color,
                borderRadius: 3, transition: 'width 0.8s ease',
              }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>
              {skill.pct}% · Lv {skill.level}
            </span>
          </div>
        </div>

        <div style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${sev.border}`, animation: 'fadeUp 0.18s ease both' }}>

          {/* Action steps */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.07em', margin: '14px 0 10px', textTransform: 'uppercase' }}>
            Your improvement steps
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {skill.steps.map((step, i) => {
              const clickable = !!(step.screen || step.url);
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (step.screen) onNav(step.screen as Screen);
                    else if (step.url) window.open(step.url, '_blank', 'noopener,noreferrer');
                  }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', cursor: clickable ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (clickable) {
                      (e.currentTarget as HTMLDivElement).style.borderColor = colors.color;
                      (e.currentTarget as HTMLDivElement).style.background = colors.bg;
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)';
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: colors.bg, border: `1px solid ${colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: colors.color, marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {step.icon} {step.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {step.description}
                    </div>
                  </div>
                  {clickable && (
                    <div style={{ color: colors.color, flexShrink: 0, marginTop: 2 }}>
                      {step.screen ? <ArrowRight size={13} /> : <ExternalLink size={12} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Curated resources */}
          {skill.resources.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.07em', margin: '14px 0 8px', textTransform: 'uppercase' }}>
                Recommended resources
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {skill.resources.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = colors.color; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'; }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{TYPE_ICONS[r.type] ?? '📄'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                        {r.type}{r.duration ? ` · ${r.duration}` : ''}{r.author ? ` · ${r.author}` : ''}
                      </div>
                    </div>
                    <ExternalLink size={11} color={colors.color} style={{ flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main WeaknessPanel ────────────────────────────────────────────────────────
export default function WeaknessPanel({ user, onNav }: WeaknessPanelProps) {
  const report = detectWeaknesses(user);

  // All healthy — compact positive confirmation
  if (report.overallHealthy) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
        background: '#F0FDF4', border: '1px solid #BBF7D0',
        borderRadius: 'var(--radius-lg)', marginBottom: 14,
        animation: 'fadeUp 0.35s ease both',
      }}>
        <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#14532D' }}>You're on track! 🎉</div>
          <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
            All four skills are progressing well. Keep up the daily practice!
          </div>
        </div>
      </div>
    );
  }

  const criticalCount  = report.weakSkills.filter(s => s.severity === 'critical').length;
  const headingEmoji   = criticalCount > 0 ? '🚨' : '⚠️';
  const headingSkills  = report.weakSkills.map(s => s.name).join(' & ');
  const summaryParts: string[] = [];
  if (criticalCount > 0) summaryParts.push(`${criticalCount} critical`);
  const needsWorkCount = report.weakSkills.length - criticalCount;
  if (needsWorkCount > 0) summaryParts.push(`${needsWorkCount} need${needsWorkCount > 1 ? '' : 's'} work`);

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', marginBottom: 14, overflow: 'hidden',
      animation: 'fadeUp 0.35s ease both',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 18px 14px',
        background: criticalCount > 0
          ? 'linear-gradient(135deg, #FEF2F2 0%, #FFFBEB 100%)'
          : 'linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <AlertTriangle size={16} color={criticalCount > 0 ? '#DC2626' : '#D97706'} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: criticalCount > 0 ? '#991B1B' : '#92400E' }}>
            {headingEmoji} Focus needed — {headingSkills}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {summaryParts.join(' and ')} skill{report.weakSkills.length > 1 ? 's' : ''} detected.
          {' '}Follow the steps below to boost your band score.
        </p>
      </div>

      {/* Per-skill cards */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {report.weakSkills.map((skill, i) => (
          <SkillWeaknessCard
            key={skill.name}
            skill={skill}
            onNav={onNav}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
