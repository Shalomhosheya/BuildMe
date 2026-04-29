import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, CheckCircle, XCircle, Volume2, RotateCcw, BookOpen, Play, Pause } from 'lucide-react';
import { listeningApi, LOCAL_TRACKS, ACCENT_META, Accent, ListeningTrack, ListeningAttempt } from './api/listening';
import WaveSurfer from 'wavesurfer.js';
import { speakText } from './tts';

type Stage = 'pick' | 'listening' | 'quiz' | 'result';

const ACCENTS: Accent[] = ['british', 'australian', 'american', 'african', 'indian', 'chinese'];

// ─── WavePlayer ───────────────────────────────────────────────────────────────
function WavePlayer({ audioUrl, accentColor }: { audioUrl: string; accentColor: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef        = useRef<WaveSurfer | null>(null);
  const [playing,  setPlaying]  = useState(false);
  const [current,  setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const ws = WaveSurfer.create({
      container:     containerRef.current,
      waveColor:     'rgba(255,255,255,0.35)',
      progressColor: '#ffffff',
      height:        64,
      barWidth:      2,
      barGap:        1,
      barRadius:     2,
      cursorColor:   '#ffffff',
      cursorWidth:   2,
      normalize:     true,
    });
    ws.load(audioUrl);
    ws.on('ready',        () => { setDuration(ws.getDuration()); setReady(true); });
    ws.on('audioprocess', () => setCurrent(ws.getCurrentTime()));
    ws.on('interaction',  () => setCurrent(ws.getCurrentTime()));
    ws.on('finish',       () => setPlaying(false));
    wsRef.current = ws;
    return () => ws.destroy();
  }, [audioUrl]);

  const toggle = () => {
    if (!wsRef.current || !ready) return;
    wsRef.current.playPause();
    setPlaying(wsRef.current.isPlaying());
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div style={{ background: accentColor, borderRadius: 16, padding: '20px 24px', boxShadow: `0 8px 32px ${accentColor}55` }}>
      <div ref={containerRef} style={{ marginBottom: 14, opacity: ready ? 1 : 0.4, transition: 'opacity 0.3s' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={toggle}
          disabled={!ready}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)',
            border: '2px solid rgba(255,255,255,0.55)',
            color: '#fff', cursor: ready ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.12s, background 0.12s', flexShrink: 0,
          }}
          onMouseEnter={e => ready && ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.35)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)')}
        >
          {playing ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" />}
        </button>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums', minWidth: 80 }}>
          {fmt(current)} / {fmt(duration)}
        </span>
        {!ready && (
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
            <div style={{ width: '30%', height: '100%', background: 'rgba(255,255,255,0.5)', borderRadius: 2, animation: 'pulse 1.4s ease infinite' }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Animated bars (TTS fallback) ────────────────────────────────────────────
function AnimatedBars({ color, tick }: { color: string; tick: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center', height: 48 }}>
      {Array.from({ length: 28 }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: color, opacity: 0.75,
          height: `${10 + Math.abs(Math.sin(i * 0.6 + tick * 0.9)) * 28}px`,
          transition: 'height 0.25s ease',
        }} />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ListeningTrainer() {
  const [accent,      setAccent]      = useState<Accent | null>(null);
  const [tracks,      setTracks]      = useState<ListeningTrack[]>(LOCAL_TRACKS);
  const [track,       setTrack]       = useState<ListeningTrack | null>(null);
  const [stage,       setStage]       = useState<Stage>('pick');
  const [answers,     setAnswers]     = useState<Record<number, number>>({});
  const [answered,    setAnswered]    = useState<Record<number, boolean>>({});
  const [score,       setScore]       = useState(0);
  const [submitting,  setSubmitting]  = useState(false);
  const [serverPts,   setServerPts]   = useState<number | null>(null);
  const [history,     setHistory]     = useState<ListeningAttempt[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [playing,     setPlaying]     = useState(false);
  const [playTime,    setPlayTime]    = useState(0);
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const timer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTTS = useRef<(() => void) | null>(null);

  useEffect(() => {
    listeningApi.history().then(setHistory).catch(() => {});
    return () => stopAudio();
  }, []);

  // ── helpers ──────────────────────────────────────────────────────────────
  const qs = (t: ListeningTrack) => Array.isArray(t?.questions) ? t.questions : [];

  const getTotal = (h: ListeningAttempt): number =>
    (h as any).total ?? (h as any).totalQuestions ?? (h as any).questionCount ?? 1;

  // ── Accent selection ─────────────────────────────────────────────────────
  function selectAccent(a: Accent) {
    setAccent(a);
    setFilterLevel('all'); // reset level filter on accent change

    // Immediately show local tracks so UI is never empty
    const localForAccent = LOCAL_TRACKS.filter(t => t.accent === a);
    setTracks(localForAccent);

    // Try to enrich from backend — but NEVER remove local tracks
    listeningApi.getTracks(a)
      .then(remote => {
        // Build a map of local tracks by id so we can merge
        const localMap = Object.fromEntries(
          LOCAL_TRACKS.filter(t => t.accent === a).map(t => [t.id, t])
        );

        // Merge remote tracks with local data (keep local transcript/questions)
        const mergedFromRemote = remote.map(r => ({
          ...localMap[r.id],            // local base first
          ...r,                         // remote fields override
          // Always prefer local transcript & questions if remote omits them
          transcript: r.transcript || localMap[r.id]?.transcript || '',
          questions:  (r.questions?.length ? r.questions : localMap[r.id]?.questions) ?? [],
        }));

        // Also keep any local tracks the backend didn't return at all
        const remoteIds = new Set(remote.map(r => r.id));
        const localOnly = localForAccent.filter(t => !remoteIds.has(t.id));

        // Combine: merged remote + local-only, sorted by level
        const combined = [...mergedFromRemote, ...localOnly]
          .sort((a, b) => a.level - b.level);

        setTracks(combined);
      })
      .catch(() => {
        // Backend failed — local tracks already set above, nothing to do
      });
  }

  // ── TTS playback ─────────────────────────────────────────────────────────
  async function playTTS(t: ListeningTrack) {
    stopAudio();
    const text = t.transcript?.trim();
    if (!text) return;

    setPlaying(true);
    setPlayTime(0);
    timer.current = setInterval(() => setPlayTime(s => s + 1), 1000);

    const cancel = await speakText(text, t.accent, () => {
      setPlaying(false);
      if (timer.current) clearInterval(timer.current);
    });

    stopTTS.current = cancel;
  }

  function stopAudio() {
    if (stopTTS.current) { stopTTS.current(); stopTTS.current = null; }
    window.speechSynthesis.cancel();
    setPlaying(false);
    if (timer.current) clearInterval(timer.current);
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── Start track ──────────────────────────────────────────────────────────
  function startTrack(t: ListeningTrack) {
    setTrack(t);
    setAnswers({});
    setAnswered({});
    setScore(0);
    setServerPts(null);
    setShowTranscript(false);
    setStage('listening');
    setPlayTime(0);
    if (!t.audioUrl) playTTS(t);
  }

  function goToQuiz() {
    stopAudio();
    setStage('quiz');
  }

  // ── Answer ───────────────────────────────────────────────────────────────
  function selectAnswer(qId: number, optIdx: number) {
    if (answered[qId]) return;
    const correct = qs(track!).find(q => q.id === qId)?.ans === optIdx;
    setAnswers(a => ({ ...a, [qId]: optIdx }));
    setAnswered(a => ({ ...a, [qId]: true }));
    if (correct) setScore(s => s + 1);
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function submitResult() {
    if (!track) return;
    const qCount = qs(track).length;
    setSubmitting(true);
    try {
      const res = await listeningApi.submit(track.id, track.accent, score, qCount);
      setServerPts(res.pointsEarned);
      listeningApi.history().then(setHistory).catch(() => {});
    } catch {
      setServerPts(qCount > 0 ? Math.round(score * (100 / qCount)) : 0);
    } finally {
      setSubmitting(false);
      setStage('result');
    }
  }

  function reset() {
    stopAudio();
    setTrack(null); setStage('pick'); setAnswers({});
    setAnswered({}); setScore(0); setServerPts(null); setShowTranscript(false);
  }

  // ── Derived ──────────────────────────────────────────────────────────────
  const filteredTracks = tracks.filter(t =>
    filterLevel === 'all' || String(t.level) === filterLevel
  );
  const completedIds = new Set(history.map(h => h.trackId));

  // ════════════════════════════════════════════════════════════════════════
  // RESULT SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (stage === 'result' && track) {
    const questions = qs(track);
    const qCount    = questions.length || 1;
    const pct       = Math.round((score / qCount) * 100);
    const pts       = serverPts ?? Math.round(score * (100 / qCount));
    const meta      = ACCENT_META[track.accent];
    const passed    = pct >= 60;

    return (
      <div style={{ padding: '32px 36px', maxWidth: 740 }} className="animate-fadeUp">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400 }}>Results</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => startTrack(track)} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={13} /> Retry
            </button>
            <button onClick={reset} style={{ padding: '8px 16px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Back to tracks
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ display: 'inline-flex', width: 96, height: 96, borderRadius: '50%', background: passed ? '#E1F5EE' : '#FAEEDA', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {passed ? <CheckCircle size={40} color="#1D9E75" /> : <XCircle size={40} color="#BA7517" />}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: passed ? '#1D9E75' : '#BA7517', marginBottom: 4 }}>{pct}%</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>{score} of {qCount} correct — {meta.flag} {meta.label}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--purple-light)', color: 'var(--purple-dark)', fontSize: 14, fontWeight: 500, padding: '8px 20px', borderRadius: 20 }}>
            +{pts} pts earned
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Question review</div>
          {questions.map((q, i) => {
            const userAns = answers[q.id];
            const correct = userAns === q.ans;
            return (
              <div key={q.id} style={{ padding: '12px 0', borderBottom: i < questions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  {correct
                    ? <CheckCircle size={16} color="#1D9E75" style={{ flexShrink: 0, marginTop: 2 }} />
                    : <XCircle    size={16} color="#E24B4A" style={{ flexShrink: 0, marginTop: 2 }} />}
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{q.q}</span>
                </div>
                {!correct && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 24, lineHeight: 1.6 }}>
                    Your answer: <span style={{ color: '#E24B4A' }}>{q.opts?.[userAns] ?? '—'}</span>
                    &nbsp;·&nbsp;
                    Correct: <span style={{ color: '#1D9E75' }}>{q.opts?.[q.ans] ?? '—'}</span>
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', paddingLeft: 24, marginTop: 3, lineHeight: 1.5 }}>{q.exp}</div>
              </div>
            );
          })}
        </div>

        <button onClick={() => setShowTranscript(v => !v)} style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={14} /> {showTranscript ? 'Hide' : 'Show'} full transcript
        </button>
        {showTranscript && (
          <div style={{ marginTop: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.85, fontStyle: 'italic' }}>
            {track.transcript}
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // QUIZ SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (stage === 'quiz' && track) {
    const questions   = qs(track);
    const allAnswered = questions.length > 0 && questions.every(q => answered[q.id]);

    return (
      <div style={{ padding: '32px 36px', maxWidth: 680 }} className="animate-fadeUp">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400 }}>{track.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>
              {ACCENT_META[track.accent].flag} {ACCENT_META[track.accent].label} — {track.levelName}
            </p>
          </div>
          <button
            onClick={() => { setStage('listening'); if (!track.audioUrl) playTTS(track); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 12, cursor: 'pointer' }}
          >
            <Volume2 size={13} /> Listen again
          </button>
        </div>

        {questions.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
            No questions available for this track.
          </div>
        )}

        {questions.map((q, qi) => (
          <div key={q.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple)', letterSpacing: '0.05em', marginBottom: 8 }}>QUESTION {qi + 1}</div>
            <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5, marginBottom: 14 }}>{q.q}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {(q.opts ?? []).map((opt, oi) => {
                let bg = 'transparent', border = 'var(--border)', color = 'var(--text-primary)';
                if (answered[q.id]) {
                  if (oi === q.ans)              { bg = 'var(--teal-light)'; border = 'var(--teal)'; color = '#085041'; }
                  else if (oi === answers[q.id]) { bg = '#FCEBEB'; border = '#E24B4A'; color = '#791F1F'; }
                }
                return (
                  <button key={oi} onClick={() => selectAnswer(q.id, oi)} style={{
                    padding: '10px 14px', border: `1px solid ${border}`, borderRadius: 'var(--radius-md)',
                    background: bg, color, fontSize: 13, textAlign: 'left',
                    cursor: answered[q.id] ? 'default' : 'pointer', transition: 'all 0.15s',
                    fontWeight: answered[q.id] && oi === q.ans ? 500 : 400,
                  }}>{opt}</button>
                );
              })}
            </div>
            {answered[q.id] && (
              <div style={{ marginTop: 10, padding: '9px 12px', background: answers[q.id] === q.ans ? 'var(--teal-light)' : '#FCEBEB', borderLeft: `3px solid ${answers[q.id] === q.ans ? 'var(--teal)' : '#E24B4A'}`, borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontSize: 12, color: answers[q.id] === q.ans ? '#085041' : '#791F1F', lineHeight: 1.5 }}>
                {q.exp}
              </div>
            )}
          </div>
        ))}

        {allAnswered && (
          <button onClick={submitResult} disabled={submitting} style={{ width: '100%', padding: 14, background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', marginTop: 8 }}>
            {submitting ? 'Saving...' : `See results — ${score} / ${questions.length} correct`}
          </button>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // LISTENING SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (stage === 'listening' && track) {
    const meta     = ACCENT_META[track.accent];
    const hasAudio = Boolean(track.audioUrl);

    return (
      <div style={{ padding: '32px 36px', maxWidth: 680 }} className="animate-fadeUp">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400 }}>{track.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>{meta.flag} {meta.label} · {track.topic} · {track.levelName}</p>
          </div>
          <button onClick={reset} style={{ padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 12, cursor: 'pointer' }}>Exit</button>
        </div>

        <div style={{ background: meta.color, borderRadius: 'var(--radius-xl)', padding: 28, marginBottom: 16, boxShadow: `0 8px 32px ${meta.color}44` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
              {meta.flag}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{meta.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{track.topic} · {track.duration}</div>
            </div>
          </div>

          {hasAudio ? (
            <>
              <WavePlayer audioUrl={track.audioUrl!} accentColor={meta.color} />
              <button
                onClick={goToQuiz}
                style={{ marginTop: 16, width: '100%', padding: '11px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backdropFilter: 'blur(4px)' }}
              >
                Go to questions <ChevronRight size={14} />
              </button>
            </>
          ) : (
            <>
              {playing ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 10 }}>
                    Now speaking — {fmt(playTime)}
                  </div>
                  <AnimatedBars color="#fff" tick={playTime} />
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
                    <button onClick={stopAudio} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 'var(--radius-md)', fontSize: 13, cursor: 'pointer' }}>
                      Stop
                    </button>
                    <button onClick={goToQuiz} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#fff', color: meta.color, border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Go to questions <ChevronRight size={13} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 6 }}>Ready to listen</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                      Press play to hear the {meta.label} recording via browser TTS.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button onClick={() => playTTS(track)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 28px', background: '#fff', color: meta.color, border: 'none', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      <Volume2 size={16} /> Play recording
                    </button>
                    <button onClick={goToQuiz} style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 'var(--radius-md)', fontSize: 13, cursor: 'pointer' }}>
                      Skip to questions
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          <strong>IELTS tip:</strong> In the real exam you hear each recording only once. Practise without pausing to simulate exam conditions. Focus on key details: names, numbers, dates, and locations.
        </div>

        <button onClick={() => setShowTranscript(v => !v)} style={{ marginTop: 10, width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <BookOpen size={13} /> {showTranscript ? 'Hide' : 'Show'} transcript (study mode)
        </button>
        {showTranscript && (
          <div style={{ marginTop: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.85, fontStyle: 'italic' }}>
            {track.transcript}
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // PICK SCREEN
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }} className="animate-fadeUp">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.5px' }}>Listening trainer</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Train your ear across six English accents — British, Australian, American, African, Indian and Chinese</p>
      </div>

      {/* Accent selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
        {ACCENTS.map(a => {
          const meta     = ACCENT_META[a];
          const isActive = accent === a;
          const done     = history.filter(h => h.accent === a).length;
          return (
            <div key={a} onClick={() => selectAccent(a)} style={{
              background: isActive ? meta.bg : 'var(--surface)',
              border: `${isActive ? 2 : 1}px solid ${isActive ? meta.color : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)', padding: '20px', cursor: 'pointer',
              transition: 'all 0.15s', textAlign: 'center',
            }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = meta.color; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>{meta.flag}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: isActive ? meta.color : 'var(--text-primary)', marginBottom: 3 }}>{meta.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{meta.desc}</div>
              {done > 0 && <div style={{ fontSize: 11, background: meta.bg, color: meta.color, padding: '2px 8px', borderRadius: 10, display: 'inline-block', fontWeight: 500 }}>{done} completed</div>}
            </div>
          );
        })}
      </div>

      {/* Track list */}
      {accent && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 500, marginRight: 4 }}>{ACCENT_META[accent].flag} Tracks:</span>
            {[['all', 'All levels'], ['1', 'Level 1'], ['2', 'Level 2'], ['3', 'Level 3']].map(([val, label]) => (
              <button key={val} onClick={() => setFilterLevel(val!)} style={{
                padding: '5px 14px', fontSize: 12, borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${filterLevel === val ? ACCENT_META[accent].color : 'var(--border)'}`,
                background: filterLevel === val ? ACCENT_META[accent].bg : 'transparent',
                color: filterLevel === val ? ACCENT_META[accent].color : 'var(--text-secondary)',
                fontWeight: filterLevel === val ? 500 : 400,
              }}>{label}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
            {filteredTracks.map((t, i) => {
              const meta   = ACCENT_META[t.accent];
              const done   = completedIds.has(t.id);
              const qCount = qs(t).length;
              return (
                <div key={t.id} onClick={() => startTrack(t)} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  padding: 18, cursor: 'pointer', transition: 'all 0.15s',
                  animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = meta.color; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: meta.bg, color: meta.color }}>{meta.flag} {t.levelName}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 500, background: done ? '#E1F5EE' : 'var(--purple-light)', color: done ? '#085041' : 'var(--purple-dark)' }}>{done ? 'Done ✓' : t.audioUrl ? '🎵 Audio' : 'TTS'}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    {t.topic} · {t.duration} · {qCount} question{qCount !== 1 ? 's' : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                    <Volume2 size={12} /> Click to {t.audioUrl ? 'listen (real audio)' : 'listen'}
                  </div>
                </div>
              );
            })}
            {filteredTracks.length === 0 && (
              <div style={{ gridColumn: '1/-1', padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
                No tracks at this level yet — more coming soon.
              </div>
            )}
          </div>
        </>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Recent attempts</div>
          {history.slice(0, 5).map((h, i) => {
            const meta  = ACCENT_META[h.accent];
            const total = getTotal(h);
            const pct   = total > 0 ? Math.round(((h.score ?? 0) / total) * 100) : 0;
            return (
              <div key={h.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < Math.min(history.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{meta?.flag ?? '🌐'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{h.trackId ?? '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{meta?.label ?? h.accent} · {h.score ?? 0}/{total} correct · {pct}%</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--teal)' }}>+{h.pointsEarned ?? 0} pts</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{h.completedAt ? new Date(h.completedAt).toLocaleDateString() : ''}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}