import React, { useState, useEffect } from 'react';
import { Screen } from './types';
import { 
  LayoutDashboard, PenLine, Headphones, Mic, MessageCircle,
  Timer, FileText, Award, LogOut, Youtube, Sun, Moon, HelpCircle, Gamepad2
} from 'lucide-react';
import { authApi } from './api/auth';

interface SidebarProps {
  active: Screen;
  onNav: (s: Screen) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV = [
  { screen: 'dashboard' as Screen, label: 'Dashboard',         icon: LayoutDashboard, section: null },
  { screen: null,                   label: 'Learn',             icon: null,            section: true },
  { screen: 'listening' as Screen, label: 'Listening trainer',  icon: Headphones,      section: null },
  { screen: 'chatbot'   as Screen, label: 'IELTS Assistant',    icon: MessageCircle,   section: null },
  { screen: 'speaking'  as Screen, label: 'Speaking trainer',   icon: Mic,             section: null },
  { screen: null,                   label: 'Practice',          icon: null,            section: true },
  { screen: 'quiz'      as Screen, label: 'Quiz',              icon: Timer,           section: null },
  { screen: 'games'     as Screen, label: 'Games',             icon: Gamepad2,        section: null },
  { screen: 'notes'     as Screen, label: 'Notes',             icon: FileText,        section: null },
  { screen: null,                   label: 'Portfolio',         icon: null,            section: true },
  { screen: 'portfolio' as Screen, label: 'My portfolio',      icon: Award,           section: null },
  { screen: 'essay'     as Screen, label: 'Writing evaluator', icon: PenLine,         section: null },
  { screen: null,                   label: 'Resources',         icon: null,            section: true },
  { screen: 'videos'    as Screen, label: 'IELTS Videos',      icon: Youtube,         section: null },
  { screen: 'faq'       as Screen, label: 'FAQ',               icon: HelpCircle,      section: null },
];


export default function Sidebar({ active, onNav, onLogout, isOpen, onClose }: SidebarProps) {
  const [userName,  setUserName]  = useState('');
  const [userLevel, setUserLevel] = useState('');
  const [initials,  setInitials]  = useState('??');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  useEffect(() => {
    authApi.me()
      .then(u => {
        setUserName(u.name ?? '');
        setInitials(
          (u.name ?? '??').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        );
        const top = Math.max(
          u.writing?.level  ?? 1, u.reading?.level   ?? 1,
          u.listening?.level ?? 1, u.speaking?.level  ?? 1
        );
        const names: Record<number, string> = {
          1: 'Prestructural', 2: 'Unistructural', 3: 'Multistructural',
        };
        setUserLevel(`${names[top] ?? 'Prestructural'} · Level ${top}`);
      })
      .catch(() => {});
  }, []);

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--purple)', letterSpacing: '-0.5px' }}>
          Build Me
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.03em' }}>
          IELTS preparation platform
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
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
          const isActive = item.screen === active;
          return (
            <button key={i} onClick={() => { if (item.screen) { onNav(item.screen); onClose?.(); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 20px', fontSize: 13,
                background: isActive ? 'var(--purple-light)' : 'transparent',
                color: isActive ? 'var(--purple-dark)' : 'var(--text-secondary)',
                border: 'none',
                borderLeft: isActive ? '2px solid var(--purple)' : '2px solid transparent',
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

      {/* User info + logout */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'var(--purple-light)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--purple-dark)',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
              {userName || '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userLevel || 'Loading...'}
            </div>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 7, padding: '8px',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            background: 'transparent', color: 'var(--text-secondary)',
            transition: 'all 0.15s',
            marginBottom: 8,
          }}
          onMouseEnter={e => {
            (e.currentTarget.style.background = 'var(--purple-light)');
            (e.currentTarget.style.color = 'var(--purple-dark)');
            (e.currentTarget.style.borderColor = 'var(--purple)');
          }}
          onMouseLeave={e => {
            (e.currentTarget.style.background = 'transparent');
            (e.currentTarget.style.color = 'var(--text-secondary)');
            (e.currentTarget.style.borderColor = 'var(--border)');
          }}
        >
          {theme === 'light' ? (
            <>
              <Moon size={13} /> Dark Mode
            </>
          ) : (
            <>
              <Sun size={13} /> Light Mode
            </>
          )}
        </button>

        <button
          onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 7, padding: '8px',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            background: 'transparent', color: 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget.style.background  = '#FCEBEB');
            (e.currentTarget.style.color       = '#791F1F');
            (e.currentTarget.style.borderColor = '#E24B4A');
          }}
          onMouseLeave={e => {
            (e.currentTarget.style.background  = 'transparent');
            (e.currentTarget.style.color       = 'var(--text-secondary)');
            (e.currentTarget.style.borderColor = 'var(--border)');
          }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  );
}