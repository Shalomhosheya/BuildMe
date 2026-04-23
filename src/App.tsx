import React, { useState } from 'react';
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
import MagicRings from './component/ui/MagicRings';

const FULL_HEIGHT: Screen[] = ['chatbot', 'notes', 'essay'];

export default function App() {
  const [authed, setAuthed] = useState<boolean>(isLoggedIn());
  const [screen, setScreen] = useState<Screen>('dashboard');

  function handleLogin() { setAuthed(true); setScreen('dashboard'); }
  function handleLogout() { clearSession(); setAuthed(false); }

  if (!authed) return <Login onLogin={handleLogin} />;

  const isFullHeight = FULL_HEIGHT.includes(screen);

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard': return <Dashboard onNav={setScreen} />;
      case 'quiz': return <Quiz />;
      case 'chatbot': return <IELTSChatbot />;
      case 'essay': return <EssayEvaluator />;
      case 'notes': return <Notes />;
      case 'speaking': return <Speaking />;
      case 'listening': return <ListeningTrainer />;
      case 'portfolio': return <Portfolio onLogout={handleLogout} />;
      default: return <Dashboard onNav={setScreen} />;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Animation */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none' // Allows clicks to pass through to content
      }}>
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
          opacity={0.3} // Reduced opacity for background effect
          blur={0}
          noiseAmount={0.1}
          rotation={0}
          ringGap={1.5}
          fadeIn={0.7}
          fadeOut={0.5}
          followMouse={true} // Enable mouse interaction for better effect
          mouseInfluence={0.2}
          hoverScale={1.2}
          parallax={0.05}
          clickBurst={true} // Enable click effect
        />
      </div>
      
      {/* Content */}
      <Sidebar active={screen} onNav={setScreen} onLogout={handleLogout} />
      <main style={{ 
        flex: 1, 
        overflowY: isFullHeight ? 'hidden' : 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        {renderScreen()}
      </main>
    </div>
  );
}