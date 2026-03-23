import React, { useState } from 'react';
import './index.css';
import { Screen } from './types';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Quiz from './Quiz';
import AiTutor from './AiTutor';
import Notes from './Notes';
import Portfolio from './Portfolio';

const FULL_HEIGHT: Screen[] = ['ai-tutor', 'notes'];

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const isFullHeight = FULL_HEIGHT.includes(screen);

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard': return <Dashboard onNav={setScreen} />;
      case 'quiz':      return <Quiz />;
      case 'ai-tutor':  return <AiTutor />;
      case 'notes':     return <Notes />;
      case 'portfolio': return <Portfolio />;
      default:          return <Dashboard onNav={setScreen} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar active={screen} onNav={setScreen} />
      <main style={{ flex: 1, overflowY: isFullHeight ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
        {renderScreen()}
      </main>
    </div>
  );
}
