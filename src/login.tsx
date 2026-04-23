// Login.tsx (updated version)
import React, { useState } from 'react';
import { authApi, saveSession } from './api/auth';
import ImageTrail from './component/ui/ImageTrail'; // Import the trail component

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = mode === 'login'
        ? await authApi.login(email, password)
        : await authApi.register(name, email, password);

      saveSession(data);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', // Dark gradient background
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Image Trail Animation */}
      <ImageTrail
  items={[
    // IELTS Academic Images
    'https://cdn-icons-png.flaticon.com/512/1995/1995574.png', // IELTS logo/book
    'https://cdn-icons-png.flaticon.com/512/2906/2906364.png', // Writing/pen
    'https://cdn-icons-png.flaticon.com/512/3774/3774298.png', // Speaking/microphone
    'https://cdn-icons-png.flaticon.com/512/709/709612.png',  // Listening/headphones
    'https://cdn-icons-png.flaticon.com/512/1791/1791536.png', // Reading/book
    'https://cdn-icons-png.flaticon.com/512/1907/1907566.png', // Checkmark/certificate
    'https://cdn-icons-png.flaticon.com/512/2331/2331966.png', // Target/goal
    'https://cdn-icons-png.flaticon.com/512/3094/3094758.png', // Education/graduation cap
    'https://cdn-icons-png.flaticon.com/512/1077/1077114.png', // Brain/knowledge
    'https://cdn-icons-png.flaticon.com/512/2612/2612349.png', // Clock/time management
    'https://cdn-icons-png.flaticon.com/512/489/489858.png',  // Lightbulb/idea
    'https://cdn-icons-png.flaticon.com/512/1041/1041918.png', // Chat/speaking bubbles
    'https://cdn-icons-png.flaticon.com/512/1436/1436690.png', // Document/essay
    'https://cdn-icons-png.flaticon.com/512/2948/2948076.png', // Trophy/achievement
    'https://cdn-icons-png.flaticon.com/512/2111/2111612.png', // World/global
    'https://cdn-icons-png.flaticon.com/512/1055/1055687.png', // Dictionary/spelling
    'https://cdn-icons-png.flaticon.com/512/2885/2885444.png', // Grammar/correct
    'https://cdn-icons-png.flaticon.com/512/4556/4556613.png', // Vocabulary/words
    'https://cdn-icons-png.flaticon.com/512/3721/3721710.png', // Practice/study
    'https://cdn-icons-png.flaticon.com/512/4213/4213300.png', // Exam/test
  ]}
  variant="1"
  trailLength={15}
  trailDelay={25}
  imageSize={70}
  fadeOutDuration={700}
  randomRotation={true}
  randomScale={true}
  interactionRadius={150}
  gravity={0.005}
  airResistance={0.5}
  bounce={0.4}
/>
  
      
      {/* Login Form Container - with higher z-index */}
      <div style={{ 
        width: '100%', 
        maxWidth: 420, 
        position: 'relative', 
        zIndex: 2,
        animation: 'fadeUp 0.6s ease-out',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 42, 
            background: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
            fontWeight: 600,
          }}>
            Build Me
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
            IELTS AI Preparation Platform
          </div>
        </div>

        {/* Card with glass morphism effect */}
        <div style={{
          background: 'rgba(20, 20, 30, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          padding: '32px 28px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}>
          {/* Tab switcher */}
          <div style={{ 
            display: 'flex', 
            background: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: 'var(--radius-md)', 
            padding: 4, 
            marginBottom: 24 
          }}>
            {(['login', 'register'] as const).map(m => (
              <button 
                key={m} 
                onClick={() => { setMode(m); setError(''); }} 
                style={{
                  flex: 1, 
                  padding: '10px 0', 
                  fontSize: 13, 
                  fontWeight: mode === m ? 600 : 400,
                  background: mode === m ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                  border: mode === m ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
                  borderRadius: 'var(--radius-sm)', 
                  color: mode === m ? '#A855F7' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', 
                  transition: 'all 0.2s',
                }}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label style={{ 
                  fontSize: 12, 
                  fontWeight: 500, 
                  color: 'rgba(255,255,255,0.7)', 
                  display: 'block', 
                  marginBottom: 6 
                }}>
                  Full name
                </label>
                <input
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="Ahmad Malik" 
                  required
                  style={{
                    width: '100%', 
                    padding: '11px 14px', 
                    fontSize: 14,
                    border: '1px solid rgba(168, 85, 247, 0.3)', 
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 0, 0, 0.3)', 
                    color: '#fff',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#A855F7')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(168, 85, 247, 0.3)')}
                />
              </div>
            )}

            <div>
              <label style={{ 
                fontSize: 12, 
                fontWeight: 500, 
                color: 'rgba(255,255,255,0.7)', 
                display: 'block', 
                marginBottom: 6 
              }}>
                Email address
              </label>
              <input
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" 
                required
                style={{
                  width: '100%', 
                  padding: '11px 14px', 
                  fontSize: 14,
                  border: '1px solid rgba(168, 85, 247, 0.3)', 
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 0, 0, 0.3)', 
                  color: '#fff',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#A855F7')}
                onBlur={e => (e.target.style.borderColor = 'rgba(168, 85, 247, 0.3)')}
              />
            </div>

            <div>
              <label style={{ 
                fontSize: 12, 
                fontWeight: 500, 
                color: 'rgba(255,255,255,0.7)', 
                display: 'block', 
                marginBottom: 6 
              }}>
                Password {mode === 'register' && <span style={{ color: 'rgba(255,255,255,0.5)' }}>(min 6 characters)</span>}
              </label>
              <input
                type="password" 
                value={password} 
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••" 
                required 
                minLength={6}
                style={{
                  width: '100%', 
                  padding: '11px 14px', 
                  fontSize: 14,
                  border: '1px solid rgba(168, 85, 247, 0.3)', 
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 0, 0, 0.3)', 
                  color: '#fff',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#A855F7')}
                onBlur={e => (e.target.style.borderColor = 'rgba(168, 85, 247, 0.3)')}
              />
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                padding: '10px 14px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: 'var(--radius-md)',
                fontSize: 13, 
                color: '#ef4444', 
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '12px', 
              background: loading ? 'rgba(168, 85, 247, 0.5)' : 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)',
              color: '#fff', 
              border: 'none', 
              borderRadius: 'var(--radius-md)',
              fontSize: 14, 
              fontWeight: 600, 
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4, 
              transition: 'transform 0.2s',
              transform: loading ? 'none' : 'scale(1)',
            }}
            onMouseEnter={e => {
              if (!loading) e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}>
              {loading
                ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          {/* Footer note */}
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            {mode === 'login'
              ? "Don't have an account? Click 'Create account' above."
              : "Already have an account? Click 'Sign in' above."}
          </p>
        </div>

        {/* Features note */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
          {['AI essay feedback', 'SOLO taxonomy', 'Verifiable cert'].map(f => (
            <span key={f} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A855F7', display: 'inline-block', opacity: 0.6 }} />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Add animation keyframes */}
      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}