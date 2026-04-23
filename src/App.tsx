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

const FULL_HEIGHT: Screen[] = ['chatbot', 'notes', 'essay'];

export default function App() {
  const [authed, setAuthed] = useState<boolean>(isLoggedIn());
  const [screen, setScreen] = useState<Screen>('dashboard');

  function handleLogin()  { setAuthed(true); setScreen('dashboard'); }
  function handleLogout() { clearSession(); setAuthed(false); }

  if (!authed) return <Login onLogin={handleLogin} />;

  const isFullHeight = FULL_HEIGHT.includes(screen);

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':  return <Dashboard onNav={setScreen} />;
      case 'quiz':       return <Quiz />;
      case 'chatbot':    return <IELTSChatbot />;
      case 'essay':      return <EssayEvaluator />;
      case 'notes':      return <Notes />;
      case 'speaking':   return <Speaking />;
      case 'listening':  return <ListeningTrainer />;
      case 'portfolio':  return <Portfolio onLogout={handleLogout} />;
      default:           return <Dashboard onNav={setScreen} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar active={screen} onNav={setScreen} onLogout={handleLogout} />
      <main style={{ flex: 1, overflowY: isFullHeight ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
        {renderScreen()}
      </main>
    </div>
  );
}