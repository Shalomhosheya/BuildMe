import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import { aiApi, EvaluationResult } from './api/aiTutor';

interface Message {
  role: 'ai' | 'user';
  text: string;
  isHtml?: boolean;
}

const QUICK = [
  { label: 'Task Response tips',  prompt: 'How do I improve my Task Response score?' },
  { label: 'Linking words',       prompt: 'What linking words should I use for Task 2?' },
  { label: 'Band 6 vs 7',         prompt: 'What is the difference between Band 6 and Band 7 writing?' },
  { label: 'Practice question',   prompt: 'Give me a Task 2 practice question to work on.' },
];

export default function AiTutor() {
  const [messages, setMessages]     = useState<Message[]>([
    { role: 'ai', text: 'Hello! I am your IELTS writing tutor. Paste your essay below and I will evaluate it across all four band score criteria.' },
    { role: 'ai', text: 'You can also use the quick prompts below to ask me anything about IELTS.' },
  ]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [lastScores, setLastScores] = useState<EvaluationResult | null>(null);
  const [error, setError]           = useState('');
  const [mode, setMode]             = useState<'essay' | 'chat' | 'speaking'>('essay');
  const endRef                      = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  function addMsg(text: string, role: 'ai' | 'user', isHtml = false) {
    setMessages(m => [...m, { role, text, isHtml }]);
  }

  async function send(text?: string) {
    const txt = (text || input).trim();
    if (!txt || loading) return;
    setInput('');
    setError('');
    addMsg(txt, 'user');
    setLoading(true);

    try {
      const words = txt.split(/\s+/).length;
      const isEssay = mode === 'essay' && words > 40;

      if (isEssay) {
        const result = await aiApi.evaluate(txt);
        setLastScores(result);

        const html = `
          Essay evaluated. <strong>Overall Band: ${result.overallBand}</strong><br/><br/>
          <strong>Task Response (${result.taskResponse}):</strong> ${result.feedback}<br/><br/>
          <strong>Coherence & Cohesion (${result.coherenceCohesion}):</strong> Focus on linking ideas clearly between paragraphs.<br/><br/>
          <strong>Lexical Resource (${result.lexicalResource}):</strong> Try incorporating less common vocabulary and avoid repetition.<br/><br/>
          <strong>Grammatical Range (${result.grammaticalRange}):</strong> Good mix of structures. Watch for minor agreement errors.<br/><br/>
          <em>+${result.pointsEarned} points added to your profile!</em>
        `;
        addMsg(html, 'ai', true);
      } else {
        const result = await aiApi.chat(txt);
        addMsg(result.reply, 'ai');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reach the AI tutor. Please try again.');
      addMsg('Sorry, I could not process that right now. Please try again in a moment.', 'ai');
    } finally {
      setLoading(false);
    }
  }

  const words = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Chat panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400 }}>AI tutor</h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Powered by your fine-tuned IELTS model</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['essay', 'chat', 'speaking'] as const).map((m, i) => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: '6px 14px', fontSize: 12, borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${mode === m ? 'var(--purple)' : 'var(--border)'}`,
                background: mode === m ? 'var(--purple-light)' : 'transparent',
                color: mode === m ? 'var(--purple-dark)' : 'var(--text-secondary)',
                fontWeight: mode === m ? 500 : 400,
              }}>
                {['Essay evaluation', 'General Q&A', 'Speaking tips'][i]}
              </button>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ padding: '10px 24px', background: '#FCEBEB', borderBottom: '1px solid #F09595', fontSize: 13, color: '#791F1F', flexShrink: 0 }}>
            {error}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: m.role === 'ai' ? 'var(--purple-light)' : 'var(--gray-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600,
                color: m.role === 'ai' ? 'var(--purple-dark)' : 'var(--text-secondary)',
              }}>
                {m.role === 'ai' ? 'AI' : 'Me'}
              </div>
              <div style={{ maxWidth: '76%' }}>
                {m.role === 'ai' && (
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>Build Me tutor</div>
                )}
                <div style={{
                  padding: '10px 14px', fontSize: 13, lineHeight: 1.65,
                  borderRadius: m.role === 'ai' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                  background: m.role === 'ai' ? 'var(--surface)' : 'var(--purple-light)',
                  border: m.role === 'ai' ? '1px solid var(--border)' : 'none',
                  color: m.role === 'user' ? 'var(--purple-dark)' : 'var(--text-primary)',
                }}
                  {...(m.isHtml
                    ? { dangerouslySetInnerHTML: { __html: m.text } }
                    : { children: m.text }
                  )}
                />
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--purple-dark)', flexShrink: 0 }}>AI</div>
              <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Loader size={13} style={{ animation: 'spin 1s linear infinite', color: 'var(--purple)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 4 }}>
                  {words > 40 ? 'Evaluating your essay...' : 'Thinking...'}
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {QUICK.map(q => (
              <button key={q.label} onClick={() => send(q.prompt)} disabled={loading}
                style={{ padding: '4px 10px', fontSize: 11, border: '1px solid var(--border)', borderRadius: 12, background: 'transparent', color: 'var(--text-secondary)', cursor: loading ? 'not-allowed' : 'pointer' }}
                onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = 'var(--gray-100)'); }}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--gray-100)' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={mode === 'essay' ? 'Paste your essay here or ask a question...' : 'Ask me anything about IELTS...'}
                rows={2}
                style={{ width: '100%', border: 'none', background: 'transparent', padding: '10px 14px', fontSize: 13, resize: 'none', outline: 'none', color: 'var(--text-primary)', lineHeight: 1.6 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 14px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-tertiary)' }}>
                <span>{words} word{words !== 1 ? 's' : ''}</span>
                <span>
                  {mode === 'essay'
                    ? words > 40 ? 'Ready to evaluate' : 'Essay mode — paste 40+ words to evaluate'
                    : 'Press Enter to send'}
                </span>
              </div>
            </div>
            <button onClick={() => send()} disabled={loading || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: loading || !input.trim() ? 'var(--gray-200)' : 'var(--purple)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
              }}>
              <Send size={15} color={loading || !input.trim() ? 'var(--gray-400)' : '#fff'} />
            </button>
          </div>
        </div>
      </div>

      {/* Score panel */}
      <div style={{ width: 240, borderLeft: '1px solid var(--border)', background: 'var(--surface)', padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Last evaluation</div>

        <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: 16, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--purple)' }}>
            {lastScores ? lastScores.overallBand : '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>Overall band score</div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 500 }}>Criteria breakdown</div>
        {[
          ['Task response',        'taskResponse'],
          ['Coherence & cohesion', 'coherenceCohesion'],
          ['Lexical resource',     'lexicalResource'],
          ['Grammatical range',    'grammaticalRange'],
        ].map(([label, key]) => {
          const val = lastScores ? (lastScores as any)[key] as number : null;
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{val ?? '—'}</span>
              </div>
              <div style={{ height: 4, background: 'var(--gray-200)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: 'var(--purple)', borderRadius: 2,
                  width: val ? `${Math.round((val / 9) * 100)}%` : '0%',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          );
        })}

        {lastScores && (
          <>
            <div style={{ background: 'var(--teal-light)', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#085041' }}>Points earned</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#085041' }}>+{lastScores.pointsEarned} pts</span>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--gray-100)', padding: 12, borderRadius: 'var(--radius-md)' }}>
              {lastScores.feedback}
            </div>
          </>
        )}

        {!lastScores && (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.7, textAlign: 'center', padding: '12px 0' }}>
            Submit an essay to see your band score breakdown here.
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}