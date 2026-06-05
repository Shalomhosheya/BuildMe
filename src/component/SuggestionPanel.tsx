// components/SuggestionPanel.tsx
// Drop this in src/components/SuggestionPanel.tsx

import React, { useEffect, useState } from 'react';
import { PerformanceResult } from '../hooks/usePerformance';
import { generateSuggestions, SuggestionResponse, Resource } from '../api/suggestionEngine';
import { Screen } from '../types';

interface Props {
  result: PerformanceResult;
  onNavigate: (screen: Screen) => void;
  onDismiss: () => void;
}

const ICON: Record<Resource['type'], string> = {
  video:    '🎬',
  document: '📄',
  book:     '📚',
  practice: '✏️',
};

const TYPE_LABEL: Record<Resource['type'], string> = {
  video:    'Video',
  document: 'Document',
  book:     'Book',
  practice: 'Practice',
};

export default function SuggestionPanel({ result, onNavigate, onDismiss }: Props) {
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    generateSuggestions(result).then(s => {
      if (!cancelled) { setSuggestions(s); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [result]);

  const scoreDisplay = result.bandScore
    ? `Band ${result.bandScore}`
    : `${result.score}%`;

  return (
    /* Backdrop */
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '28px 28px 0',
          background: 'linear-gradient(135deg, #f3f0ff 0%, #ede9fe 100%)',
          borderRadius: '16px 16px 0 0',
          borderBottom: '1px solid #e5e1f9',
          paddingBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                display: 'inline-block',
                background: '#7c3aed',
                color: 'white',
                fontSize: '12px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '20px',
                marginBottom: '10px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {result.screen} · {scoreDisplay}
              </div>
              {loading ? (
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1a1a2e' }}>
                  Finding your study plan…
                </h2>
              ) : (
                <>
                  <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 600, color: '#1a1a2e' }}>
                    {suggestions?.headline}
                  </h2>
                  <p style={{ margin: 0, fontSize: '14px', color: '#5b5b8a', lineHeight: 1.5 }}>
                    {suggestions?.encouragement}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={onDismiss}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '20px', color: '#888', padding: '4px', lineHeight: 1,
                marginLeft: '12px', flexShrink: 0,
              }}
              aria-label="Dismiss suggestions"
            >✕</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 28px 28px', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: '72px', borderRadius: '10px',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.4s infinite',
                }}/>
              ))}
              <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suggestions?.resources.map((res, i) => (
                <ResourceCard
                  key={i}
                  resource={res}
                  onNavigate={onNavigate}
                  onDismiss={onDismiss}
                />
              ))}
            </div>
          )}

          {/* Weak areas chips */}
          {result.weakAreas.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Focus areas
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.weakAreas.map(area => (
                  <span key={area} style={{
                    fontSize: '12px', padding: '3px 10px',
                    background: '#f3f0ff', color: '#5b21b6',
                    borderRadius: '20px', fontWeight: 500,
                  }}>
                    {area.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceCard({
  resource, onNavigate, onDismiss,
}: {
  resource: Resource;
  onNavigate: (screen: Screen) => void;
  onDismiss: () => void;
}) {
  const handleClick = () => {
    if (resource.internalScreen) {
      onDismiss();
      onNavigate(resource.internalScreen as Screen);
    } else if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const clickable = !!(resource.url || resource.internalScreen);

  return (
    <div
      onClick={clickable ? handleClick : undefined}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        padding: '14px 16px',
        borderRadius: '10px',
        border: '1px solid #e8e8f0',
        background: '#fafafa',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        if (clickable) {
          (e.currentTarget as HTMLDivElement).style.background = '#f3f0ff';
          (e.currentTarget as HTMLDivElement).style.borderColor = '#c4b5fd';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = '#fafafa';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#e8e8f0';
      }}
    >
      <span style={{ fontSize: '24px', flexShrink: 0, lineHeight: 1.2 }}>
        {ICON[resource.type]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 600, color: '#7c3aed',
            background: '#ede9fe', padding: '1px 7px', borderRadius: '10px',
            textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
          }}>
            {TYPE_LABEL[resource.type]}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {resource.title}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#5b5b8a', lineHeight: 1.45 }}>
          {resource.description}
        </p>
      </div>
      {clickable && (
        <span style={{ color: '#a78bfa', fontSize: '18px', flexShrink: 0, marginTop: '2px' }}>
          {resource.internalScreen ? '→' : '↗'}
        </span>
      )}
    </div>
  );
}