import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, CheckCircle, XCircle, Volume2, RotateCcw, BookOpen, Mic, TrendingUp } from 'lucide-react';
import { listeningApi, LOCAL_TRACKS, ACCENT_META, Accent, ListeningTrack, ListeningAttempt } from './api/listening';
import { predictListeningPerformance, PerformancePrediction } from './api/recommendations';

type Stage = 'pick' | 'listening' | 'quiz' | 'result';

const ACCENTS: Accent[] = ['british', 'australian', 'american'];

export default function ListeningTrainer() {
  const [accent, setAccent]         = useState<Accent | null>(null);
  const [tracks, setTracks]         = useState<ListeningTrack[]>(LOCAL_TRACKS);
  const [track, setTrack]           = useState<ListeningTrack | null>(null);
  const [stage, setStage]           = useState<Stage>('pick');
  const [answers, setAnswers]       = useState<Record<number, number>>({});
  const [answered, setAnswered]     = useState<Record<number, boolean>>({});
  const [score, setScore]           = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverPts, setServerPts]   = useState<number | null>(null);
  const [history, setHistory]       = useState<ListeningAttempt[]>([]);
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [playing, setPlaying]       = useState(false);
  const [playTime, setPlayTime]     = useState(0);
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const synth    = useRef<SpeechSynthesisUtterance | null>(null);
  const timer    = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    listeningApi.history().then(setHistory).catch(() => {});
    return () => stopAudio();
  }, []);

  // ── Accent selection → load tracks ──────────────────────────────────────
  function selectAccent(a: Accent) {
    setAccent(a);
    // ✅ Always use LOCAL_TRACKS as the source of truth — it has full question data.
    // The backend /api/listening/tracks endpoint only returns metadata (no questions array),
    // so we never let it overwrite the local tracks and break track.questions.length.
    const filtered = LOCAL_TRACKS.filter(t => t.accent === a);
    setTracks(filtered);
  }

  // ── Text-to-Speech playback ──────────────────────────────────────────────
  function playTrack(t: ListeningTrack) {
    stopAudio();
    setPlaying(true);
    setPlayTime(0);

    const utt        = new SpeechSynthesisUtterance(t.transcript);
    utt.rate         = 0.88;
    utt.pitch        = 1.0;
    utt.volume       = 1.0;

    // Pick appropriate voice by accent
    const voices = window.speechSynthesis.getVoices();
    const voiceMap: Record<Accent, string[]> = {
      british:    ['Daniel', 'Kate', 'Serena', 'en-GB'],
      australian: ['Karen', 'Lee', 'en-AU'],
      american:   ['Alex', 'Samantha', 'Zoe', 'en-US'],
    };
    const preferred = voiceMap[t.accent];
    const found = voices.find(v => preferred.some(p => v.name.includes(p) || v.lang.includes(p)));
    if (found) utt.voice = found;

    utt.onend = () => { setPlaying(false); clearInterval(timer.current!); };
    synth.current = utt;
    window.speechSynthesis.speak(utt);

    timer.current = setInterval(() => setPlayTime(s => s + 1), 1000);
  }

  function stopAudio() {
    window.speechSynthesis.cancel();
    setPlaying(false);
    if (timer.current) clearInterval(timer.current);
  }

  function fmt(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // ── Start track ─────────────────────────────────────────────────────────
  function startTrack(t: ListeningTrack) {
    setTrack(t);
    setAnswers({});
    setAnswered({});
    setScore(0);
    setServerPts(null);
    setPrediction(null);
    setShowTranscript(false);
    setStage('listening');
    setPlayTime(0);
    playTrack(t);
  }

  function goToQuiz() {
    stopAudio();
    setStage('quiz');
  }

  // ── Answer question ─────────────────────────────────────────────────────
  function selectAnswer(qId: number, optIdx: number) {
    if (answered[qId]) return;
    const correct = track!.questions.find(q => q.id === qId)!.ans === optIdx;
    setAnswers(a => ({ ...a, [qId]: optIdx }));
    setAnswered(a => ({ ...a, [qId]: true }));
    if (correct) setScore(s => s + 1);
  }

  // ── Submit result ───────────────────────────────────────────────────────
  async function submitResult() {
    if (!track) return;
    setSubmitting(true);
    try {
      const res = await listeningApi.submit(track.id, track.accent, score, track.questions.length);
      setServerPts(res.pointsEarned);
      const updatedHistory = await listeningApi.history().catch(() => history);
      setHistory(updatedHistory);
      const pred = predictListeningPerformance(
        score, track.questions.length, track.accent,
        updatedHistory.filter(h => h.trackId !== track.id).map(h => ({ score: h.score, total: h.total, accent: h.accent }))
      );
      setPrediction(pred);
    } catch {
      setServerPts(Math.round(score * (100 / track.questions.length)));
      const pred = predictListeningPerformance(
        score, track.questions.length, track.accent,
        history.map(h => ({ score: h.score, total: h.total, accent: h.accent }))
      );
      setPrediction(pred);
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

  // ── Filtered tracks ─────────────────────────────────────────────────────
  const filteredTracks = tracks.filter(t =>
    filterLevel === 'all' || String(t.level) === filterLevel
  );

  const completedIds = new Set(history.map(h => h.trackId));

  // ════════════════════════════════════════════════════════════════════════
  // RESULT SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (stage === 'result' && track) {
    const pct   = Math.round((score / track.questions.length) * 100);
    const pts   = serverPts ?? Math.round(score * (100 / track.questions.length));
    const meta  = ACCENT_META[track.accent];
    const passed = pct >= 60;
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
          <div style={{ display: 'inline-block', width: 96, height: 96, borderRadius: '50%', background: passed ? '#E1F5EE' : '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {passed ? <CheckCircle size={40} color="#1D9E75" /> : <XCircle size={40} color="#BA7517" />}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: passed ? '#1D9E75' : '#BA7517', marginBottom: 4 }}>{pct}%</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>{score} of {track.questions.length} correct — {meta.flag} {meta.label}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--purple-light)', color: 'var(--purple-dark)', fontSize: 14, fontWeight: 500, padding: '8px 20px', borderRadius: 20 }}>
            +{pts} pts earned
          </div>
        </div>

        {/* Performance prediction */}
        {prediction && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <TrendingUp size={15} style={{ color: 'var(--purple)' }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Performance prediction</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: prediction.confidence === 'high' ? 'var(--teal-light)' : prediction.confidence === 'medium' ? 'var(--amber-light)' : 'var(--gray-100)', color: prediction.confidence === 'high' ? '#085041' : prediction.confidence === 'medium' ? '#633806' : 'var(--text-tertiary)', marginLeft: 'auto' }}>
                {prediction.confidence} confidence
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {/* Estimated band */}
              <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--purple)' }}>{prediction.estimatedBand}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Estimated listening band</div>
              </div>

              {/* Trend */}
              <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 2 }}>
                  {prediction.trend === 'improving' ? '📈' : prediction.trend === 'declining' ? '📉' : prediction.trend === 'steady' ? '➡️' : '✨'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: prediction.trend === 'improving' ? '#1D9E75' : prediction.trend === 'declining' ? '#E24B4A' : 'var(--text-secondary)' }}>
                  {prediction.trend === 'improving' ? `Improving +${prediction.trendDelta}%` :
                   prediction.trend === 'declining' ? `Declining ${prediction.trendDelta}%` :
                   prediction.trend === 'steady'    ? 'Steady performance' : 'First attempt'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>vs your {meta.label} history</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--purple-light)', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--purple-dark)' }}>{prediction.percentileLabel}</span>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {prediction.nextStepMessage}
            </div>

            {prediction.weakArea && prediction.strengthArea && prediction.weakArea !== prediction.strengthArea && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: 'var(--teal-light)', color: '#085041' }}>
                  Strongest: {ACCENT_META[prediction.strengthArea as Accent]?.flag} {ACCENT_META[prediction.strengthArea as Accent]?.label}
                </span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: '#FAEEDA', color: '#633806' }}>
                  Needs work: {ACCENT_META[prediction.weakArea as Accent]?.flag} {ACCENT_META[prediction.weakArea as Accent]?.label}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Per-question review */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Question review</div>
          {track.questions.map((q, i) => {
            const userAns = answers[q.id];
            const correct = userAns === q.ans;
            return (
              <div key={q.id} style={{ padding: '12px 0', borderBottom: i < track.questions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  {correct ? <CheckCircle size={16} color="#1D9E75" style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={16} color="#E24B4A" style={{ flexShrink: 0, marginTop: 2 }} />}
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{q.q}</span>
                </div>
                {!correct && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 24, lineHeight: 1.6 }}>
                    Your answer: <span style={{ color: '#E24B4A' }}>{q.opts[userAns]}</span> &nbsp;·&nbsp; Correct: <span style={{ color: '#1D9E75' }}>{q.opts[q.ans]}</span>
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', paddingLeft: 24, marginTop: 3, lineHeight: 1.5 }}>{q.exp}</div>
              </div>
            );
          })}
        </div>

        {/* Transcript */}
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
    const allAnswered = track.questions.every(q => answered[q.id]);
    return (
      <div style={{ padding: '32px 36px', maxWidth: 680 }} className="animate-fadeUp">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400 }}>{track.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>{ACCENT_META[track.accent].flag} {ACCENT_META[track.accent].label} — {track.levelName}</p>
          </div>
          <button onClick={() => { setStage('listening'); playTrack(track); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 12, cursor: 'pointer' }}>
            <Volume2 size={13} /> Listen again
          </button>
        </div>

        {track.questions.map((q, qi) => (
          <div key={q.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple)', letterSpacing: '0.05em', marginBottom: 8 }}>QUESTION {qi + 1}</div>
            <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5, marginBottom: 14 }}>{q.q}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {q.opts.map((opt, oi) => {
                let bg = 'transparent', border = 'var(--border)', color = 'var(--text-primary)';
                if (answered[q.id]) {
                  if (oi === q.ans)           { bg = 'var(--teal-light)'; border = 'var(--teal)'; color = '#085041'; }
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
            {submitting ? 'Saving...' : `See results — ${score} / ${track.questions.length} correct`}
          </button>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // LISTENING SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (stage === 'listening' && track) {
    const meta = ACCENT_META[track.accent];
    return (
      <div style={{ padding: '32px 36px', maxWidth: 680 }} className="animate-fadeUp">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400 }}>{track.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>{meta.flag} {meta.label} · {track.topic} · {track.levelName}</p>
          </div>
          <button onClick={reset} style={{ padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 12, cursor: 'pointer' }}>Exit</button>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 36 }}>
            {meta.flag}
          </div>

          {playing ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 500, color: meta.color, marginBottom: 4 }}>Now playing — {meta.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: meta.color, marginBottom: 8 }}>{fmt(playTime)}</div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center', height: 40, marginBottom: 20 }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} style={{ width: 3, borderRadius: 2, background: meta.color, opacity: 0.7, height: `${8 + Math.sin(i * 0.8 + playTime) * 14 + 14}px`, transition: 'height 0.3s ease' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={stopAudio} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 13, cursor: 'pointer' }}>
                  Stop
                </button>
                <button onClick={goToQuiz} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  Go to questions <ChevronRight size={13} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Ready to listen</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Press play to hear the {meta.label} recording. You can replay it as many times as you need.</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={() => playTrack(track)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 28px', background: meta.color, color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                  <Volume2 size={16} /> Play recording
                </button>
                <button onClick={goToQuiz} style={{ padding: '11px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 13, cursor: 'pointer' }}>
                  Skip to questions
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          <strong>IELTS tip:</strong> In the real exam you hear each recording only once. Practise listening without pausing to simulate exam conditions. Focus on key details: names, numbers, dates, and locations.
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
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Train your ear across three English accents — British, Australian, and American</p>
      </div>

      {/* Accent selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
        {ACCENTS.map(a => {
          const meta    = ACCENT_META[a];
          const isActive = accent === a;
          const done    = history.filter(h => h.accent === a).length;
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
            {[['all','All levels'],['1','Level 1'],['2','Level 2'],['3','Level 3']].map(([val,label]) => (
              <button key={val} onClick={() => setFilterLevel(val)} style={{
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
              const meta = ACCENT_META[t.accent];
              const done = completedIds.has(t.id);
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
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 500, background: done ? '#E1F5EE' : 'var(--purple-light)', color: done ? '#085041' : 'var(--purple-dark)' }}>{done ? 'Done' : 'Start'}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>{t.topic} · {t.duration} · {t.questions?.length ?? 0} questions</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                    <Volume2 size={12} /> Click to listen
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
            const meta = ACCENT_META[h.accent];
            const pct  = Math.round((h.score / h.total) * 100);
            return (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < Math.min(history.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{meta.flag}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{h.trackId}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{meta.label} · {h.score}/{h.total} correct · {pct}%</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--teal)' }}>+{h.pointsEarned} pts</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{new Date(h.completedAt).toLocaleDateString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}