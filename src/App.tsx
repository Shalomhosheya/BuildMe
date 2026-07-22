import React, { useState, useCallback } from 'react';
import './index.css';
import { Screen } from './types';
import { isLoggedIn, clearSession } from './api/auth';
import Login from './login';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Quiz from './Quiz';
import IELTSChatbot from './IELTSChatbot';
import Notes from './Notes';
import Portfolio from './Portfolio';
import Speaking from './Speaking';
import ListeningTrainer from './ListeningTrainer';
import EssayEvaluator from './EssayEvaluator';
import IELTSVideos from './IELTSVideos';
import MagicRings from './component/ui/MagicRings';
import SuggestionPanel from './component/SuggestionPanel';
import { usePerformance, PerformanceResult } from './hooks/usePerformance';
import DevSuggestionTrigger from './component/DevSuggestionTrigger';
import { Menu } from 'lucide-react';

const FULL_HEIGHT: Screen[] = ['chatbot', 'notes', 'essay'];
const HIDE_ANIMATION_SCREENS: Screen[] = ['notes', 'essay'];

export default function App() {
  const [authed, setAuthed] = useState<boolean>(isLoggedIn());
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<PerformanceResult | null>(null);

  const handleSuggestionNeeded = useCallback((result: PerformanceResult) => {
    setPendingSuggestion(result);
  }, []);

  const { report } = usePerformance(handleSuggestionNeeded);

  function handleLogin()  { setAuthed(true); setScreen('dashboard'); }
  function handleLogout() { clearSession(); setAuthed(false); }

  if (!authed) return <Login onLogin={handleLogin} />;

  const isFullHeight        = FULL_HEIGHT.includes(screen);
  const shouldShowAnimation = !HIDE_ANIMATION_SCREENS.includes(screen);

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard': return <Dashboard onNav={setScreen} />;
      case 'quiz':      return <Quiz      onPerformanceResult={report} />;
      case 'speaking':  return <Speaking  onPerformanceResult={report} />;
      case 'listening': return <ListeningTrainer onPerformanceResult={report} />;
      case 'essay':     return <EssayEvaluator   onPerformanceResult={report} />;
      case 'chatbot':   return <IELTSChatbot />;
      case 'notes':     return <Notes />;
      case 'portfolio': return <Portfolio onLogout={handleLogout} />;
      case 'videos':    return <IELTSVideos />;
      default:          return <Dashboard onNav={setScreen} />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {shouldShowAnimation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
          <MagicRings
            color="#A855F7"
            colorTwo="#6366F1"
            ringCount={6}
            speed={1}
            attenuation={10}
            lineThickness={8}
            baseRadius={0.35}
            radiusStep={0.01}
            scaleRate={0.1}
            opacity={0.3}
            blur={0}
            noiseAmount={0.1}
            rotation={0}
            ringGap={1.5}
            fadeIn={0.7}
            fadeOut={0.5}
            followMouse={true}
            mouseInfluence={0.2}
            hoverScale={1.2}
            parallax={0.05}
            clickBurst={true}
          />
        </div>
      )}

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <Sidebar active={screen} onNav={setScreen} onLogout={handleLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main style={{
        flex: 1,
        height: '100vh',
        overflowY: isFullHeight ? 'hidden' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        background: shouldShowAnimation ? 'transparent' : 'var(--bg)',
      }}>
        {/* Mobile Header Bar */}
        <header className="mobile-header">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <Menu size={22} />
          </button>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--purple)', fontWeight: 500 }}>
            Build Me
          </div>
          <div style={{ width: 22 }} />
        </header>

        {renderScreen()}
      </main>

      {pendingSuggestion && (
        <SuggestionPanel
          result={pendingSuggestion}
          onNavigate={setScreen}
          onDismiss={() => setPendingSuggestion(null)}
        />
      )}

      {/* Dev-only trigger — removed automatically in production builds */}
      {process.env.NODE_ENV === 'development' && (
        <DevSuggestionTrigger onTrigger={report} />
      )}
    </div>
  );
}