import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message { role: 'ai' | 'user'; text: string; scores?: any; }

const QUICK = [
  { label: 'Task Response tips', prompt: 'How do I improve my Task Response score?' },
  { label: 'Linking words', prompt: 'What linking words should I use for Task 2?' },
  { label: 'Band 6 vs 7', prompt: 'What is the difference between Band 6 and Band 7 writing?' },
  { label: 'Practice question', prompt: 'Give me a Task 2 practice question to work on.' },
];

const RESPONSES: Record<string, string> = {
  task: 'To improve your Task Response score: fully address all parts of the question, present a clear position throughout, and support every main idea with specific examples. Avoid going off-topic even in your conclusion.',
  link: 'Useful linking phrases for Task 2:<br/><br/><b>Adding:</b> Furthermore, Moreover, In addition<br/><b>Contrasting:</b> Nevertheless, However, On the other hand<br/><b>Cause/effect:</b> Consequently, As a result, Therefore<br/><b>Exemplifying:</b> For instance, To illustrate, In particular',
  band: 'The key difference between Band 6 and 7:<br/><br/><b>Band 6:</b> Addresses the task with some irrelevance. Vocabulary is adequate but repetitive. Some errors in grammar.<br/><br/><b>Band 7:</b> Clear position throughout, well-developed ideas. Varied vocabulary with less common items. Flexible and accurate grammar with only occasional errors.',
  practice: 'Here is a Task 2 practice question:<br/><br/><i>"Some people believe universities should focus on providing academic knowledge, while others think they should prepare students for the working world. Discuss both views and give your opinion."</i><br/><br/>Aim for 250+ words. Paste your essay here when ready and I will evaluate it.',
  default: 'Great question about IELTS preparation. I recommend focusing on the four band score criteria: Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range. Would you like me to explain any of these in detail?',
};

function getResponse(txt: string): { text: string; scores?: any } {
  const t = txt.toLowerCase();
  if (t.split(/\s+/).length > 40) {
    const tr = +(5 + Math.random() * 2).toFixed(1);
    const cc = +(5 + Math.random() * 2).toFixed(1);
    const lr = +(5 + Math.random() * 2).toFixed(1);
    const gr = +(5.5 + Math.random() * 1.5).toFixed(1);
    const overall = +((tr + cc + lr + gr) / 4).toFixed(1);
    return { text: `Essay evaluated. Overall Band: <b>${overall}</b><br/><br/><b>Task Response (${tr}):</b> Your essay addresses the question but could develop arguments more fully with specific examples.<br/><br/><b>Coherence & Cohesion (${cc}):</b> The structure is clear. Consider using a wider variety of cohesive devices.<br/><br/><b>Lexical Resource (${lr}):</b> Good range of vocabulary. Incorporate less common phrases and avoid repetition.<br/><br/><b>Grammatical Range (${gr}):</b> A good mix of sentence structures. Watch for minor agreement errors.`, scores: { overall, tr, cc, lr, gr } };
  }
  if (t.includes('task response')) return { text: RESPONSES.task };
  if (t.includes('linking') || t.includes('cohesion')) return { text: RESPONSES.link };
  if (t.includes('band 6') || t.includes('band 7')) return { text: RESPONSES.band };
  if (t.includes('practice') || t.includes('question')) return { text: RESPONSES.practice };
  return { text: RESPONSES.default };
}

export default function AiTutor() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello Ahmad! I am your IELTS writing tutor. Paste your essay below and I will evaluate it across all four band score criteria — Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.' },
    { role: 'ai', text: 'You can also ask me questions about IELTS strategies or use the quick prompts below.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [lastScores, setLastScores] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  function send(txt?: string) {
    const text = (txt || input).trim();
    if (!text) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setTyping(true);
    const delay = text.split(/\s+/).length > 40 ? 2000 : 1000;
    setTimeout(() => {
      const res = getResponse(text);
      setTyping(false);
      setMessages(m => [...m, { role: 'ai', text: res.text, scores: res.scores }]);
      if (res.scores) setLastScores(res.scores);
    }, delay);
  }

  const words = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400 }}>AI tutor</h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Powered by your fine-tuned IELTS model</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Essay evaluation', 'General Q&A', 'Speaking tips'].map((m, i) => (
              <button key={i} style={{ padding: '6px 14px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 20, background: i === 0 ? 'var(--purple-light)' : 'transparent', color: i === 0 ? 'var(--purple-dark)' : 'var(--text-secondary)', fontWeight: i === 0 ? 500 : 400 }}>{m}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.role === 'ai' ? 'var(--purple-light)' : 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: m.role === 'ai' ? 'var(--purple-dark)' : 'var(--text-secondary)', flexShrink: 0 }}>
                {m.role === 'ai' ? 'AI' : 'AM'}
              </div>
              <div style={{ maxWidth: '75%' }}>
                {m.role === 'ai' && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>Build Me tutor</div>}
                <div style={{
                  padding: '10px 14px', borderRadius: m.role === 'ai' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                  background: m.role === 'ai' ? 'var(--surface)' : 'var(--purple-light)',
                  border: m.role === 'ai' ? '1px solid var(--border)' : 'none',
                  color: m.role === 'user' ? 'var(--purple-dark)' : 'var(--text-primary)',
                  fontSize: 13, lineHeight: 1.65,
                }} dangerouslySetInnerHTML={{ __html: m.text }} />
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--purple-dark)' }}>AI</div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px' }}>
                {[0, 0.2, 0.4].map((d, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', animation: `bounce 1.2s ${d}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {QUICK.map(q => (
              <button key={q.label} onClick={() => send(q.prompt)} style={{ padding: '4px 10px', fontSize: 11, border: '1px solid var(--border)', borderRadius: 12, background: 'transparent', color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-100)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >{q.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, border: '1px solid var(--border-md)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--gray-100)' }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Paste your essay here or ask a question..." rows={2}
                style={{ width: '100%', border: 'none', background: 'transparent', padding: '10px 14px', fontSize: 13, resize: 'none', outline: 'none', color: 'var(--text-primary)', lineHeight: 1.6 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 14px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-tertiary)' }}>
                <span>{words} words</span>
                <span>Essay mode — min 150 words for Task 1, 250 for Task 2</span>
              </div>
            </div>
            <button onClick={() => send()} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--purple)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Send size={15} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: 240, borderLeft: '1px solid var(--border)', background: 'var(--surface)', padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Last evaluation</div>
        <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: 16, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--purple)' }}>{lastScores ? lastScores.overall : '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>Overall band score</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Criteria breakdown</div>
        {[['Task response', 'tr'], ['Coherence & cohesion', 'cc'], ['Lexical resource', 'lr'], ['Grammatical range', 'gr']].map(([label, key]) => (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{lastScores ? lastScores[key] : '—'}</span>
            </div>
            <div style={{ height: 4, background: 'var(--gray-200)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: lastScores ? `${Math.round((lastScores[key] / 9) * 100)}%` : '0%', background: 'var(--purple)', borderRadius: 2, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
        {lastScores && (
          <div style={{ background: 'var(--teal-light)', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: '#085041' }}>Points earned</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#085041' }}>+{Math.round(lastScores.overall * 10)} pts</span>
          </div>
        )}
      </div>
    </div>
  );
}
