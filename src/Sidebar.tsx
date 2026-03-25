import React from 'react';
import { Screen } from './types';
import { LayoutDashboard, PenLine, BookOpen, Headphones, Mic, Timer, MessageSquare, FileText, Award } from 'lucide-react';

interface SidebarProps {
  active: Screen;
  onNav: (s: Screen) => void;
}

const NAV = [
  { screen: 'dashboard' as Screen, label: 'Dashboard', icon: LayoutDashboard, section: null },
  { screen: 'auth' as Screen, label: 'auth', icon: LayoutDashboard, section: null },
  { screen: null, label: 'Learn', icon: null, section: true },
  { screen: 'ai-tutor' as Screen, label: 'Writing', icon: PenLine, section: null },
  { screen: 'ai-tutor' as Screen, label: 'Reading', icon: BookOpen, section: null },
  { screen: 'ai-tutor' as Screen, label: 'Listening', icon: Headphones, section: null },
  { screen: 'ai-tutor' as Screen, label: 'Speaking', icon: Mic, section: null },
  { screen: null, label: 'Practice', icon: null, section: true },
  { screen: 'quiz' as Screen, label: 'Quiz', icon: Timer, section: null },
  { screen: 'ai-tutor' as Screen, label: 'AI tutor', icon: MessageSquare, section: null },
  { screen: 'notes' as Screen, label: 'Notes', icon: FileText, section: null },
  { screen: null, label: 'Portfolio', icon: null, section: true },
  { screen: 'portfolio' as Screen, label: 'My portfolio', icon: Award, section: null },
];

export default function Sidebar({ active, onNav }: SidebarProps) {
  return (
    <aside style={{
      width: 'var(--sidebar-width)', flexShrink: 0,
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0, overflowY: 'auto',
    }}>
      <div style={{ padding: '28px 20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--purple)', letterSpacing: '-0.5px' }}>
          Build Me
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.03em' }}>
          IELTS preparation platform
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} style={{
                fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)',
                padding: '14px 20px 4px', letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {item.label}
              </div>
            );
          }
          const Icon = item.icon!;
          const isActive = item.screen === active && item.label === getActiveLabel(active);
          return (
            <button key={i} onClick={() => item.screen && onNav(item.screen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 20px', fontSize: 13,
                background: isActive ? 'var(--purple-light)' : 'transparent',
                color: isActive ? 'var(--purple-dark)' : 'var(--text-secondary)',
                border: 'none', borderLeft: isActive ? '2px solid var(--purple)' : '2px solid transparent',
                fontWeight: isActive ? 500 : 400, textAlign: 'left',
                transition: 'all 0.15s', cursor: 'pointer',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--gray-100)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <Icon size={15} strokeWidth={1.5} style={{ opacity: isActive ? 1 : 0.55, flexShrink: 0 }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--purple-light)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--purple-dark)',
        }}>AM</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Ahmad M.</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Multistructural · Level 3</div>
        </div>
      </div>
    </aside>
  );
}

function getActiveLabel(screen: Screen): string {
  const map: Record<Screen, string> = {
    authform: 'Auth',
    dashboard: 'Dashboard', quiz: 'Quiz', 'ai-tutor': 'AI tutor', notes: 'Notes', portfolio: 'My portfolio',
  };
  return map[screen];
}
