// components/DevSuggestionTrigger.tsx
// DEVELOPMENT ONLY — delete this file before production.
//
// Paste <DevSuggestionTrigger onTrigger={report} /> anywhere in your app
// (Dashboard is easiest) to fire the suggestion system without needing
// to actually fail a quiz or essay.
//
// Usage in Dashboard.tsx (or any screen):
//   import DevSuggestionTrigger from './components/DevSuggestionTrigger';
//   ...
//   {process.env.NODE_ENV === 'development' && (
//     <DevSuggestionTrigger onTrigger={report} />
//   )}

import React, { useState } from 'react';
import { PerformanceResult } from '../hooks/usePerformance';

interface Props {
  onTrigger: (result: PerformanceResult) => void;
}

const PRESETS: { label: string; result: PerformanceResult }[] = [
  {
    label: 'Quiz · grammar fail',
    result: {
      screen: 'quiz',
      score: 42,
      weakAreas: ['grammar', 'vocabulary'],
      details: 'Missed: conditionals, passive voice, article usage',
    },
  },
  {
    label: 'Speaking · low band',
    result: {
      screen: 'speaking',
      score: 44,
      bandScore: 4.0,
      weakAreas: ['speaking_fluency', 'speaking_pronunciation'],
      details: 'Long pauses, unclear word stress on multi-syllable words',
    },
  },
  {
    label: 'Essay · coherence',
    result: {
      screen: 'essay',
      score: 51,
      weakAreas: ['writing_coherence', 'writing_task_achievement'],
      details: 'Ideas not connected, question only partially addressed',
    },
  },
  {
    label: 'Listening · accuracy',
    result: {
      screen: 'listening',
      score: 38,
      weakAreas: ['listening_accuracy'],
      details: 'Section 3 and 4 — missed key numbers and proper nouns',
    },
  },
  {
    label: 'Single weak area',
    result: {
      screen: 'quiz',
      score: 55,
      weakAreas: ['reading_comprehension'],
      details: 'True/False/Not Given questions consistently wrong',
    },
  },
];

export default function DevSuggestionTrigger({ onTrigger }: Props) {
  const [open, setOpen] = useState(false);
  const [lastFired, setLastFired] = useState<string | null>(null);

  function fire(preset: typeof PRESETS[0]) {
    onTrigger(preset.result);
    setLastFired(preset.label);
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    }}>
      {open && (
        <div style={{
          marginBottom: 8,
          background: '#1e1e2e',
          border: '1px solid #3a3a5c',
          borderRadius: 10,
          padding: '12px',
          width: 230,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 600, color: '#7c7ca8',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8,
          }}>
            Dev · fire suggestion
          </div>

          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => fire(p)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 10px', marginBottom: 4,
                fontSize: 12, cursor: 'pointer',
                background: lastFired === p.label ? '#2d2b55' : 'transparent',
                color: lastFired === p.label ? '#a78bfa' : '#c4c4d4',
                border: '1px solid',
                borderColor: lastFired === p.label ? '#6d5fca' : '#2e2e4a',
                borderRadius: 6,
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => {
                if (lastFired !== p.label)
                  (e.currentTarget as HTMLButtonElement).style.background = '#252540';
              }}
              onMouseLeave={e => {
                if (lastFired !== p.label)
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              {lastFired === p.label ? '✓ ' : ''}{p.label}
            </button>
          ))}

          {lastFired && (
            <div style={{
              marginTop: 8, fontSize: 11, color: '#7c7ca8',
              borderTop: '1px solid #2e2e4a', paddingTop: 8,
            }}>
              Fired: {lastFired}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 42, height: 42, borderRadius: '50%',
          background: open ? '#5b21b6' : '#7c3aed',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
          transition: 'all 0.15s',
          marginLeft: 'auto',
        }}
        title="Dev: test suggestion panel"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      </button>
    </div>
  );
}