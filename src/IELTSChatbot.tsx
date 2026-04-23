import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, RotateCcw, Lightbulb, Wrench, MessageCircle, BookOpen } from 'lucide-react';
import { chatbotApi, QUICK_PROMPTS, ChatMessage } from './api/chatbot';

const TYPE_META = {
  correction: { color: '#085041', bg: '#E1F5EE', icon: '✓', label: 'Correction' },
  ideas:      { color: '#3C3489', bg: '#EEEDFE', icon: '✦', label: 'Ideas' },
  answer:     { color: '#0C447C', bg: '#E6F1FB', icon: '◆', label: 'Answer' },
  general:    { color: '#444441', bg: '#F1EFE8', icon: '●', label: 'Chat' },
};

const WELCOME: ChatMessage = {
  role: 'assistant',
  type: 'general',
  timestamp: new Date().toISOString(),
  text: `Hi! I'm your IELTS assistant. I can help you with:

**Answer questions** — Ask me anything about IELTS (band scores, criteria, exam tips)
**Fix sentences** — Paste any sentence and I'll correct it and explain why
**Topic ideas** — Ask for vocabulary, arguments and ideas for any IELTS topic

Try one of the quick prompts below or just type your question!`,
};

function formatText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <div key={i} style={{ fontWeight: 500, marginBottom: 4, marginTop: i > 0 ? 8 : 0 }}>{line.slice(2, -2)}</div>;
    }
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, paddingLeft: 4 }}>
          <span style={{ flexShrink: 0, opacity: 0.5 }}>•</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      );
    }
    if (line.match(/^\d+\./)) {
      const num  = line.match(/^(\d+\.)/)![1];
      const rest = line.slice(num.length + 1);
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, paddingLeft: 4 }}>
          <span style={{ flexShrink: 0, fontWeight: 500, minWidth: 18 }}>{num}</span>
          <span>{formatInline(rest)}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
    return <div key={i} style={{ marginBottom: 3, lineHeight: 1.65 }}>{formatInline(line)}</div>;
  });
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`')  && p.endsWith('`'))  return <code key={i} style={{ background: 'rgba(0,0,0,0.07)', padding: '1px 5px', borderRadius: 4, fontSize: '0.92em', fontFamily: 'monospace' }}>{p.slice(1,-1)}</code>;
    return p;
  });
}

export default function IELTSChatbot() {
  const [messages, setMessages]   = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [activeType, setActiveType] = useState<string | null>(null);
  const endRef                    = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: ChatMessage = { role: 'user', type: 'general', text: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatbotApi.send(msg, messages.filter(m => m.role !== 'assistant' || m !== WELCOME));
      const botMsg: ChatMessage = { role: 'assistant', type: res.type, text: res.reply, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, botMsg]);
      setActiveType(res.type);
    } catch {
      const fallback = buildFallback(msg);
      setMessages(prev => [...prev, { role: 'assistant', type: fallback.type, text: fallback.reply, timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  }

  function buildFallback(msg: string): { reply: string; type: any } {
    const lower = msg.toLowerCase();

    if (/fix|correct|grammar|wrong|mistake/.test(lower) || /\b(he|she|they|i|we)\s+(go|is|are|was|have)\b/.test(lower)) {
      return {
        type: 'correction',
        reply: `Let me analyse that sentence for you.

**Possible issues detected:**
• Check subject-verb agreement (e.g. "he goes" not "he go")
• Check tense consistency throughout
• Check article use (a/an/the)

**General rule:**
Third person singular present tense needs -s: "She **goes**, He **knows**, It **works**"

**Tip:** In IELTS Writing, grammatical errors affect your Grammatical Range & Accuracy score. Aim for a mix of simple and complex structures with minimal errors.`
      };
    }

    if (/idea|topic|argument|vocabulary|vocab|word/.test(lower)) {
      const topic = lower.includes('climate') ? 'climate change'
        : lower.includes('tech') ? 'technology'
        : lower.includes('health') ? 'health'
        : lower.includes('education') ? 'education'
        : lower.includes('environment') ? 'environmental problems'
        : 'this topic';
      return {
        type: 'ideas',
        reply: `Here are ideas for **${topic}**:

**Key arguments (agree side)**
• Economic development depends on addressing this issue
• Government intervention is necessary for systemic change
• Long-term benefits outweigh short-term costs

**Key arguments (disagree/other side)**
• Individual responsibility is more effective than policy
• Developing nations should not face the same restrictions
• Technological innovation will naturally solve the problem

**Useful vocabulary**
• *sustainable development, carbon footprint, renewable energy*
• *exacerbate, mitigate, alleviate, detrimental, beneficial*
• *stringent regulations, raise awareness, address the root cause*

**Essay structure tip:**
Paragraph 1: Introduce + state your position
Paragraph 2: First argument + example
Paragraph 3: Counter-argument + rebuttal
Conclusion: Restate position + broader implication`
      };
    }

    if (/band|score|criteria|criterion|task response|coherence|lexical|grammar/.test(lower)) {
      return {
        type: 'answer',
        reply: `Great question about IELTS scoring!

**The 4 IELTS Writing criteria (25% each):**

1. **Task Response** — Does your essay answer all parts of the question? Is your position clear?
2. **Coherence & Cohesion** — Is your essay logically organised? Do you use linking words effectively?
3. **Lexical Resource** — Do you use a wide range of vocabulary? Do you avoid repetition?
4. **Grammatical Range & Accuracy** — Do you use varied sentence structures with few errors?

**Band score quick guide:**
• Band 5 — Partially addresses task, limited vocabulary, frequent errors
• Band 6 — Addresses task adequately, adequate range, some errors
• Band 7 — Covers all parts well, good range, mostly error-free
• Band 8 — Handles task fully, wide range, rare errors only

**Pro tip:** The most common reason for a low score is **not fully answering all parts of the question** — always read the task twice before writing.`
      };
    }

    return {
      type: 'general',
      reply: `That's a great IELTS question! Here's what I can tell you:

For the best advice, try being more specific — for example:
• "Fix this sentence: [your sentence]"
• "Give me ideas for topic: [topic name]"
• "What does [IELTS term] mean?"

I'm here to help with grammar corrections, topic ideas, vocabulary, band score tips, and anything else IELTS-related!`
    };
  }

  function clear() {
    setMessages([WELCOME]);
    setActiveType(null);
    setInput('');
  }

  const typeFilter = [
    { key: null,          label: 'All',        icon: <MessageCircle size={12} /> },
    { key: 'correction',  label: 'Corrections', icon: <Wrench size={12} /> },
    { key: 'ideas',       label: 'Ideas',       icon: <Lightbulb size={12} /> },
    { key: 'answer',      label: 'Answers',     icon: <BookOpen size={12} /> },
  ];

  const visibleMessages = activeType
    ? messages.filter(m => m.role === 'user' || m.type === activeType || m === WELCOME)
    : messages;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Main chat ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--color-border-tertiary)', background: 'var(--color-background-primary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 2 }}>IELTS Assistant</h1>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Ask questions · Fix sentences · Get topic ideas</p>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {typeFilter.map(f => (
              <button key={String(f.key)} onClick={() => setActiveType(f.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', fontSize: 11, borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${activeType === f.key ? '#534AB7' : 'var(--color-border-tertiary)'}`,
                  background: activeType === f.key ? '#EEEDFE' : 'transparent',
                  color: activeType === f.key ? '#3C3489' : 'var(--color-text-secondary)',
                  fontWeight: activeType === f.key ? 500 : 400,
                }}>
                {f.icon} {f.label}
              </button>
            ))}
            <button onClick={clear} title="Clear chat"
              style={{ padding: '6px', border: '1px solid var(--color-border-tertiary)', borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RotateCcw size={14} style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visibleMessages.map((m, i) => {
            const isUser = m.role === 'user';
            const meta   = TYPE_META[m.type || 'general'];
            return (
              <div key={i} style={{ display: 'flex', gap: 10, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500,
                  background: isUser ? '#EEEDFE' : meta.bg,
                  color: isUser ? '#3C3489' : meta.color,
                }}>
                  {isUser ? 'Me' : meta.icon}
                </div>

                <div style={{ maxWidth: '78%' }}>
                  {/* Type badge for bot */}
                  {!isUser && m.type && m.type !== 'general' && (
                    <div style={{ fontSize: 10, fontWeight: 600, color: meta.color, marginBottom: 4, letterSpacing: '0.05em' }}>
                      {meta.label.toUpperCase()}
                    </div>
                  )}
                  {/* Bubble */}
                  <div style={{
                    padding: '11px 15px', fontSize: 13, lineHeight: 1.6,
                    borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                    background: isUser ? '#EEEDFE' : 'var(--color-background-secondary)',
                    color: isUser ? '#3C3489' : 'var(--color-text-primary)',
                    border: isUser ? 'none' : '1px solid var(--color-border-tertiary)',
                  }}>
                    {isUser ? m.text : formatText(m.text)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 3, textAlign: isUser ? 'right' : 'left' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#F1EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Loader size={13} style={{ animation: 'spin 1s linear infinite', color: '#444441' }} />
              </div>
              <div style={{ padding: '11px 15px', background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-tertiary)', borderRadius: '4px 12px 12px 12px', fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick prompts */}
        <div style={{ padding: '8px 20px 0', flexShrink: 0, borderTop: '1px solid var(--color-border-tertiary)' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 8 }}>
            {QUICK_PROMPTS.map(q => (
              <button key={q.label} onClick={() => send(q.text)} disabled={loading}
                style={{ padding: '4px 11px', fontSize: 11, borderRadius: 14, border: '1px solid var(--color-border-tertiary)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'all 0.12s' }}
                onMouseEnter={e => { if (!loading) { (e.currentTarget.style.background='var(--color-background-secondary)'); (e.currentTarget.style.borderColor='#534AB7'); } }}
                onMouseLeave={e => { (e.currentTarget.style.background='transparent'); (e.currentTarget.style.borderColor='var(--color-border-tertiary)'); }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '10px 20px 16px', background: 'var(--color-background-primary)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', border: '1px solid var(--color-border-secondary)', borderRadius: 12, padding: '8px 10px 8px 14px', background: 'var(--color-background-secondary)' }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about IELTS, paste a sentence to fix, or request topic ideas..."
              rows={2}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, resize: 'none', outline: 'none', color: 'var(--color-text-primary)', lineHeight: 1.6, fontFamily: 'var(--font-sans)' }}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', background: loading || !input.trim() ? 'var(--color-border-tertiary)' : '#534AB7', transition: 'background 0.15s' }}>
              <Send size={14} color={loading || !input.trim() ? 'var(--color-text-tertiary)' : '#fff'} />
            </button>
          </div>
          <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 5, textAlign: 'center' }}>
            Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div style={{ width: 220, borderLeft: '1px solid var(--color-border-tertiary)', background: 'var(--color-background-primary)', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '16px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, color: 'var(--color-text-primary)' }}>What I can do</div>

          {[
            { icon: <BookOpen size={14} />, color: '#0C447C', bg: '#E6F1FB', title: 'Answer questions', examples: ['What is coherence?', 'Explain band descriptors', 'IELTS Speaking tips'] },
            { icon: <Wrench size={14} />, color: '#085041', bg: '#E1F5EE', title: 'Fix sentences', examples: ['He go to school', 'She don\'t knows', 'They was happy'] },
            { icon: <Lightbulb size={14} />, color: '#3C3489', bg: '#EEEDFE', title: 'Topic ideas', examples: ['Climate change', 'Technology & society', 'Urban development'] },
          ].map((cat, i) => (
            <div key={i} style={{ marginBottom: 16, border: '1px solid var(--color-border-tertiary)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: cat.bg }}>
                <span style={{ color: cat.color }}>{cat.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: cat.color }}>{cat.title}</span>
              </div>
              <div style={{ padding: '8px 12px' }}>
                {cat.examples.map((ex, j) => (
                  <button key={j} onClick={() => {
                    const texts: Record<string, string> = {
                      'What is coherence?': 'What is coherence in IELTS writing and how can I improve it?',
                      'Explain band descriptors': 'Can you explain the IELTS band descriptors from 5 to 9?',
                      'IELTS Speaking tips': 'Give me practical tips for improving my IELTS Speaking score',
                      'He go to school': 'Please fix this sentence: "He go to school yesterday"',
                      'She don\'t knows': 'Please fix this sentence: "She don\'t knows the answer"',
                      'They was happy': 'Please fix this sentence: "They was very happy about the result"',
                      'Climate change': 'Give me ideas, vocabulary and arguments for the IELTS topic: climate change',
                      'Technology & society': 'Give me ideas, vocabulary and arguments for IELTS topic: technology and society',
                      'Urban development': 'Give me ideas, vocabulary and arguments for IELTS topic: urban development and housing',
                    };
                    send(texts[ex] || ex);
                  }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 0', fontSize: 11, color: 'var(--color-text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: j < cat.examples.length - 1 ? '1px solid var(--color-border-tertiary)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = cat.color)}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  >
                    → {ex}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', lineHeight: 1.65, marginTop: 8 }}>
            Powered by your fine-tuned Phi model · Falls back to rule-based responses when offline
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}