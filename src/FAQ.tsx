import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, HelpCircle, BookOpen, PenLine, Headphones, Mic, Award, MessageCircle } from 'lucide-react';
import { Screen } from './types';

interface FAQProps {
  onNav?: (s: Screen) => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  // General
  {
    category: 'General',
    question: 'What is BuildMe?',
    answer: 'BuildMe is an AI-powered IELTS preparation platform designed to help you achieve your target band score. It offers personalised practice across all four IELTS skills — Reading, Writing, Listening, and Speaking — with intelligent feedback driven by fine-tuned language models.',
  },
  {
    category: 'General',
    question: 'Is BuildMe free to use?',
    answer: 'Yes! BuildMe is completely free for all learners. Every feature — including the AI chatbot, essay evaluator, and speaking trainer — is available at no cost.',
  },
  {
    category: 'General',
    question: 'How does the SOLO taxonomy levelling system work?',
    answer: 'BuildMe uses the Structure of the Observed Learning Outcome (SOLO) taxonomy to categorise your skill level into three stages: Prestructural (Level 1), Unistructural (Level 2), and Multistructural (Level 3). As you complete quizzes, essays, and practice sessions, your points and level progress automatically.',
  },
  {
    category: 'General',
    question: 'What devices and browsers are supported?',
    answer: 'BuildMe is a responsive web application that works on desktop, tablet, and mobile devices. It supports modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari.',
  },

  // Writing
  {
    category: 'Writing',
    question: 'How does the Writing Evaluator work?',
    answer: 'Submit your IELTS Task 1 or Task 2 essay and our AI model evaluates it across the four IELTS criteria: Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy. You receive a detailed band score breakdown with actionable suggestions for improvement.',
  },
  {
    category: 'Writing',
    question: 'Is the essay feedback comparable to a real IELTS examiner?',
    answer: 'Our AI evaluator was fine-tuned on real IELTS examiner feedback and scoring rubrics. While no automated tool is a perfect substitute for a certified examiner, BuildMe provides reliable estimates and pinpoints specific areas for improvement to guide your study.',
  },
  {
    category: 'Writing',
    question: 'Can I save and review past essays?',
    answer: 'Yes. Every essay you submit is saved to your profile. You can revisit past submissions, compare scores over time, and track your writing progress from your Portfolio page.',
  },

  // Listening
  {
    category: 'Listening',
    question: 'What does the Listening Trainer include?',
    answer: 'The Listening Trainer provides IELTS-style audio exercises with waveform visualisation, playback controls, and timed comprehension questions. It covers all four sections of the IELTS Listening test and adjusts difficulty based on your performance level.',
  },
  {
    category: 'Listening',
    question: 'Can I replay the audio during practice?',
    answer: 'Yes, you can replay audio clips as many times as you need during practice. However, note that in the actual IELTS test, you hear each recording only once — so try to reduce replays as you improve.',
  },

  // Speaking
  {
    category: 'Speaking',
    question: 'How does the Speaking Trainer work?',
    answer: 'The Speaking Trainer uses speech recognition to record your responses to IELTS-style Part 1, 2, and 3 questions. Your response is then analysed by our AI for fluency, pronunciation, vocabulary range, and grammar, giving you an estimated band score and feedback.',
  },
  {
    category: 'Speaking',
    question: 'Do I need a microphone?',
    answer: 'Yes — you need a working microphone to use the Speaking Trainer. Most laptops have a built-in mic, or you can use a headset. Make sure to grant browser microphone permissions when prompted.',
  },

  // Quiz & Progress
  {
    category: 'Quiz & Progress',
    question: 'How are quiz questions structured?',
    answer: 'Quizzes are organised by skill (Reading, Writing, Listening, Speaking) and SOLO level. Each quiz contains multiple-choice questions with explanations. Completing quizzes earns you XP points and contributes to your level progression.',
  },
  {
    category: 'Quiz & Progress',
    question: 'How is my overall progress tracked?',
    answer: 'Your Dashboard displays a comprehensive overview — skill levels, XP progress bars, streak counts, daily tasks, and recent activity. The Portfolio page provides deeper insights including historical score trends and earned badges.',
  },

  // AI Chatbot
  {
    category: 'AI Chatbot',
    question: 'What can the IELTS Assistant chatbot help with?',
    answer: 'The IELTS Assistant is an AI-powered chatbot that answers IELTS-related questions, explains grammar concepts, provides vocabulary suggestions, helps you plan your study schedule, and gives tips on exam strategies. It\'s available 24/7 and responds instantly.',
  },
  {
    category: 'AI Chatbot',
    question: 'Is the chatbot connected to my progress data?',
    answer: 'The chatbot operates as a standalone IELTS knowledge assistant. It provides expert guidance and study advice but does not directly access your quiz scores or essay history.',
  },

  // Account & Data
  {
    category: 'Account & Data',
    question: 'How do I create an account?',
    answer: 'Click "Sign Up" on the login page, enter your name, email, and a password. Your account is created instantly and you can start practising right away. No email verification is required.',
  },
  {
    category: 'Account & Data',
    question: 'Is my data safe and private?',
    answer: 'Yes. Your personal data, essays, and progress are stored securely and are never shared with third parties. We follow best practices for data security and encryption.',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(FAQ_DATA.map(f => f.category)))];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'All':              <HelpCircle size={14} />,
  'General':          <BookOpen size={14} />,
  'Writing':          <PenLine size={14} />,
  'Listening':        <Headphones size={14} />,
  'Speaking':         <Mic size={14} />,
  'Quiz & Progress':  <Award size={14} />,
  'AI Chatbot':       <MessageCircle size={14} />,
  'Account & Data':   <HelpCircle size={14} />,
};

export default function FAQ({ onNav }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        !search.trim() ||
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const toggle = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="responsive-padding" style={{
      flex: 1,
      overflowY: 'auto',
      maxWidth: 820,
      margin: '0 auto',
      width: '100%',
      paddingBottom: 80,
    }}>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'var(--purple-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <HelpCircle size={20} style={{ color: 'var(--purple)' }} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 26,
              color: 'var(--text-primary)', lineHeight: 1.2,
            }}>
              Frequently Asked Questions
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>
              Everything you need to know about BuildMe
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="animate-fadeUp" style={{
        position: 'relative', marginBottom: 20,
        animationDelay: '0.05s',
      }}>
        <Search size={16} style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
          pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search questions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px 11px 40px',
            fontSize: 14, borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-md)',
            background: 'var(--surface)', color: 'var(--text-primary)',
            outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--purple)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(83,74,183,0.12)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border-md)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Category Pills */}
      <div className="animate-fadeUp" style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28,
        animationDelay: '0.1s',
      }}>
        {CATEGORIES.map(cat => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', fontSize: 12, fontWeight: 500,
                borderRadius: 'var(--radius-xl)',
                border: `1px solid ${isActive ? 'var(--purple)' : 'var(--border-md)'}`,
                background: isActive ? 'var(--purple)' : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--purple)';
                  e.currentTarget.style.color = 'var(--purple)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border-md)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {CATEGORY_ICONS[cat] || <HelpCircle size={14} />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredFAQs.length === 0 && (
          <div className="animate-fadeIn" style={{
            textAlign: 'center', padding: '48px 20px',
            color: 'var(--text-tertiary)', fontSize: 14,
          }}>
            <HelpCircle size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>No matching questions found.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your search or category filter.</div>
          </div>
        )}

        {filteredFAQs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={`${item.category}-${idx}`}
              className="animate-fadeUp"
              style={{
                background: 'var(--surface)',
                border: `1px solid ${isOpen ? 'var(--purple)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                transition: 'border-color 0.25s, box-shadow 0.25s',
                boxShadow: isOpen ? '0 0 0 3px rgba(83,74,183,0.08)' : 'var(--shadow-sm)',
                animationDelay: `${Math.min(idx * 0.04, 0.4)}s`,
              }}
            >
              {/* Question Header */}
              <button
                onClick={() => toggle(idx)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 12,
                  padding: '16px 18px', textAlign: 'left',
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', color: 'var(--text-primary)',
                  fontSize: 14, fontWeight: 500, lineHeight: 1.5,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isOpen) e.currentTarget.style.background = 'var(--gray-50)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                    color: 'var(--purple)', background: 'var(--purple-light)',
                    padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    textTransform: 'uppercase',
                  }}>
                    {item.category}
                  </span>
                  <span>{item.question}</span>
                </div>
                <ChevronDown
                  size={16}
                  style={{
                    flexShrink: 0,
                    color: 'var(--text-tertiary)',
                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* Answer Body */}
              <div style={{
                maxHeight: isOpen ? 300 : 0,
                opacity: isOpen ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
              }}>
                <div style={{
                  padding: '0 18px 18px 18px',
                  fontSize: 13, lineHeight: 1.75,
                  color: 'var(--text-secondary)',
                  borderTop: '1px solid var(--border)',
                  paddingTop: 14,
                  marginTop: 0,
                }}>
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Footer */}
      <div className="animate-fadeUp" style={{
        marginTop: 48, textAlign: 'center',
        padding: '32px 24px',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        animationDelay: '0.3s',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--purple-light), var(--teal-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <MessageCircle size={22} style={{ color: 'var(--purple)' }} />
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 18,
          color: 'var(--text-primary)', marginBottom: 6,
        }}>
          Still have questions?
        </div>
        <p style={{
          fontSize: 13, color: 'var(--text-tertiary)',
          marginBottom: 18, maxWidth: 380, margin: '0 auto 18px',
        }}>
          Our IELTS Assistant chatbot is available 24/7 to answer any question about IELTS or how to use BuildMe.
        </p>
        <button
          onClick={() => onNav?.('chatbot')}
          style={{
            padding: '10px 28px', fontSize: 13, fontWeight: 600,
            background: 'var(--purple)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-xl)',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
            boxShadow: '0 2px 8px rgba(83,74,183,0.25)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(83,74,183,0.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(83,74,183,0.25)';
          }}
        >
          Chat with IELTS Assistant →
        </button>
      </div>
    </div>
  );
}
