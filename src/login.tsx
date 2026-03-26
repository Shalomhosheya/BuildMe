import React, { useState } from 'react';
import { authApi, saveSession } from './api/auth';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode]       = useState<'login' | 'register'>('login');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
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
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="animate-fadeUp">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--purple)', letterSpacing: '-0.5px' }}>
            Build Me
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
            IELTS AI Preparation Platform
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)', padding: '32px 28px',
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 24 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                flex: 1, padding: '8px 0', fontSize: 13, fontWeight: mode === m ? 500 : 400,
                background: mode === m ? 'var(--surface)' : 'transparent',
                border: mode === m ? '1px solid var(--border)' : '1px solid transparent',
                borderRadius: 'var(--radius-sm)', color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Full name
                </label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ahmad Malik" required
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 14,
                    border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)',
                    background: 'var(--gray-50)', color: 'var(--text-primary)', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--purple)')}
                  onBlur={e  => (e.target.style.borderColor = 'var(--border-md)')}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14,
                  border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)',
                  background: 'var(--gray-50)', color: 'var(--text-primary)', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--purple)')}
                onBlur={e  => (e.target.style.borderColor = 'var(--border-md)')}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Password {mode === 'register' && <span style={{ color: 'var(--text-tertiary)' }}>(min 6 characters)</span>}
              </label>
              <input
                type="password" value={password} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" required minLength={6}
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14,
                  border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)',
                  background: 'var(--gray-50)', color: 'var(--text-primary)', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--purple)')}
                onBlur={e  => (e.target.style.borderColor = 'var(--border-md)')}
              />
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                padding: '10px 14px', background: '#FCEBEB', borderRadius: 'var(--radius-md)',
                fontSize: 13, color: '#791F1F', border: '1px solid #F09595',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '11px', background: loading ? 'var(--gray-400)' : 'var(--purple)',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4, transition: 'background 0.15s',
            }}>
              {loading
                ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          {/* Footer note */}
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            {mode === 'login'
              ? "Don't have an account? Click 'Create account' above."
              : "Already have an account? Click 'Sign in' above."}
          </p>
        </div>

        {/* Features note */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
          {['AI essay feedback', 'SOLO taxonomy', 'Verifiable cert'].map(f => (
            <span key={f} style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)', display: 'inline-block', opacity: 0.6 }} />
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}