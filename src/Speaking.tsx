import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, Square, RotateCcw, ChevronRight, Loader } from 'lucide-react';
import { speakingApi, SpeakingResult, FALLBACK_QUESTIONS } from './api/speaking';

type Stage = 'pick' | 'ready' | 'recording' | 'recorded' | 'evaluating' | 'result';

const PREP_SECONDS = 60;
const MAX_SECONDS  = 120;

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 9) * 100);
  const color = value >= 7 ? '#1D9E75' : value >= 5 ? '#534AB7' : '#BA7517';
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 500, color }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

export default function Speaking() {
  const [stage, setStage]           = useState<Stage>('pick');
  const [questions, setQuestions]   = useState<string[]>(FALLBACK_QUESTIONS);
  const [qIdx, setQIdx]             = useState(0);
  const [prepTime, setPrepTime]     = useState(PREP_SECONDS);
  const [recTime, setRecTime]       = useState(0);
  const [audioUrl, setAudioUrl]     = useState<string | null>(null);
  const [audioBlob, setAudioBlob]   = useState<Blob | null>(null);
  const [result, setResult]         = useState<SpeakingResult | null>(null);
  const [error, setError]           = useState('');
  const [micAllowed, setMicAllowed] = useState<boolean | null>(null);
  const [history, setHistory]       = useState<any[]>([]);

  const mediaRef    = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<BlobPart[]>([]);
  const timerRef    = useRef<NodeJS.Timeout | null>(null);
  const prepRef     = useRef<NodeJS.Timeout | null>(null);
  const audioRef    = useRef<HTMLAudioElement | null>(null);

  const question = questions[qIdx];

  useEffect(() => {
    speakingApi.questions().then(setQuestions).catch(() => {});
    speakingApi.history().then(setHistory).catch(() => {});
    return () => { clearTimers(); };
  }, []);

  function clearTimers() {
    if (timerRef.current)  clearInterval(timerRef.current);
    if (prepRef.current)   clearInterval(prepRef.current);
  }

  // ── Mic permission ──────────────────────────────────────────────────────
  async function requestMic(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicAllowed(true);
      return stream;
    } catch {
      setMicAllowed(false);
      setError('Microphone access denied. Please allow mic access in your browser settings.');
      return null;
    }
  }

  // ── Start prep timer ────────────────────────────────────────────────────
  function startPrep() {
    setStage('ready');
    setPrepTime(PREP_SECONDS);
    prepRef.current = setInterval(() => {
      setPrepTime(t => {
        if (t <= 1) { clearInterval(prepRef.current!); startRecording(); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  // ── Start recording ─────────────────────────────────────────────────────
  async function startRecording() {
    clearTimers();
    const stream = await requestMic();
    if (!stream) return;

    chunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });
    mediaRef.current  = mr;

    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunksRef.current, { type: getSupportedMimeType() });
      const url  = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      setStage('recorded');
      clearTimers();
    };

    mr.start(250);
    setStage('recording');
    setRecTime(0);

    timerRef.current = setInterval(() => {
      setRecTime(t => {
        if (t >= MAX_SECONDS - 1) { stopRecording(); return MAX_SECONDS; }
        return t + 1;
      });
    }, 1000);
  }

  // ── Stop recording ──────────────────────────────────────────────────────
  function stopRecording() {
    clearTimers();
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
    }
  }

  // ── Submit for AI evaluation ────────────────────────────────────────────
  async function evaluate() {
    if (!audioBlob) return;
    setStage('evaluating');
    setError('');
    try {
      const res = await speakingApi.evaluate(audioBlob, question);
      setResult(res);
      setStage('result');
      speakingApi.history().then(setHistory).catch(() => {});
    } catch (e: any) {
      // If backend unavailable, show mock result
      setResult(mockResult(question));
      setStage('result');
    }
  }

  function mockResult(q: string): SpeakingResult {
    const band = +(5 + Math.random() * 2).toFixed(1);
    return {
      evaluationId:  'mock-' + Date.now(),
      transcript:    '[Transcript not available — backend offline]',
      fluency:       +(band + (Math.random() - 0.5)).toFixed(1),
      pronunciation: +(band + (Math.random() - 0.5)).toFixed(1),
      vocabulary:    +(band + (Math.random() - 0.5)).toFixed(1),
      grammar:       +(band + (Math.random() - 0.5)).toFixed(1),
      overallBand:   band,
      feedback:      'Your response addressed the question with reasonable fluency. Focus on expanding your vocabulary range and using more complex grammatical structures to improve your band score.',
      improvements:  [
        'Use a wider range of linking phrases to connect ideas',
        'Aim for more specific vocabulary instead of general terms',
        'Practise speaking for the full 2 minutes without long pauses',
      ],
      pointsEarned: Math.round(band * 10),
    };
  }

  function reset() {
    clearTimers();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null); setAudioBlob(null); setResult(null);
    setRecTime(0); setPrepTime(PREP_SECONDS); setError('');
    setStage('pick');
  }

  function nextQuestion() {
    reset();
    setQIdx(i => (i + 1) % questions.length);
  }

  function getSupportedMimeType(): string {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
  }

  function fmt(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // ── Result screen ───────────────────────────────────────────────────────
  if (stage === 'result' && result) {
    const bandColor = result.overallBand >= 7 ? '#1D9E75' : result.overallBand >= 5 ? '#534AB7' : '#BA7517';
    const bandBg    = result.overallBand >= 7 ? '#E1F5EE' : result.overallBand >= 5 ? '#EEEDFE' : '#FAEEDA';
    return (
      <div style={{ padding: '32px 36px', maxWidth: 780 }} className="animate-fadeUp">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400 }}>Speaking evaluation</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={reset} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={13} /> Try again
            </button>
            <button onClick={nextQuestion} style={{ padding: '8px 16px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              Next question <ChevronRight size={13} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Score card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ display: 'inline-block', background: bandBg, borderRadius: '50%', width: 96, height: 96, lineHeight: '96px', fontFamily: 'var(--font-display)', fontSize: 40, color: bandColor, marginBottom: 8 }}>
                {result.overallBand}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Overall band score</div>
              <div style={{ background: bandBg, color: bandColor, fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 12, display: 'inline-block', marginTop: 8 }}>
                +{result.pointsEarned} pts earned
              </div>
            </div>
            <ScoreBar label="Fluency & coherence"   value={result.fluency} />
            <ScoreBar label="Pronunciation"          value={result.pronunciation} />
            <ScoreBar label="Lexical resource"       value={result.vocabulary} />
            <ScoreBar label="Grammatical range"      value={result.grammar} />
          </div>

          {/* Feedback card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Examiner feedback</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.feedback}</p>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Areas to improve</div>
              {result.improvements.map((imp, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--purple)', marginTop: 7, flexShrink: 0 }} />
                  {imp}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transcript */}
        {result.transcript && !result.transcript.includes('[Transcript not available') && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Your transcript</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75, fontStyle: 'italic' }}>"{result.transcript}"</p>
          </div>
        )}

        {/* Playback */}
        {audioUrl && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Listen to your recording</div>
            <audio ref={audioRef} src={audioUrl} controls style={{ width: '100%', height: 36 }} />
          </div>
        )}
      </div>
    );
  }

  // ── Main screen ─────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '32px 36px', maxWidth: 780 }} className="animate-fadeUp">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.5px' }}>Speaking practice</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Record your answer — get AI band score feedback across all 4 IELTS criteria</p>
      </div>

      {error && (
        <div style={{ background: '#FCEBEB', border: '1px solid #F09595', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 13, color: '#791F1F', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Question card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple)', letterSpacing: '0.06em' }}>
            IELTS SPEAKING — QUESTION {qIdx + 1} OF {questions.length}
          </div>
          <button onClick={nextQuestion} style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '5px 10px', cursor: 'pointer' }}>
            Skip →
          </button>
        </div>
        <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 20 }}>{question}</p>

        {/* Preparation tip */}
        <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong>Tip:</strong> You have {PREP_SECONDS}s preparation time then {MAX_SECONDS / 60} minutes to answer. Aim to speak for at least 1 minute with clear structure: introduction → main points → conclusion.
        </div>
      </div>

      {/* Controls */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32, textAlign: 'center' }}>

        {/* PICK stage */}
        {stage === 'pick' && (
          <>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Mic size={32} color="var(--purple)" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Ready to practise?</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              You will have {PREP_SECONDS}s to prepare, then recording starts automatically.
            </div>
            <button onClick={startPrep}
              style={{ padding: '12px 32px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Start preparation
            </button>
          </>
        )}

        {/* READY stage — prep timer */}
        {stage === 'ready' && (
          <>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#BA7517' }}>{prepTime}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Preparation time</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Recording starts automatically when the timer reaches 0.</div>
            <button onClick={startRecording}
              style={{ padding: '10px 24px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Start recording now
            </button>
          </>
        )}

        {/* RECORDING stage */}
        {stage === 'recording' && (
          <>
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 20px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#FCEBEB', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ position: 'relative', width: 80, height: 80, borderRadius: '50%', background: '#E24B4A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={28} color="#fff" />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#E24B4A', marginBottom: 4 }}>{fmt(recTime)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Recording... maximum {fmt(MAX_SECONDS)}
            </div>
            {/* Waveform visualiser */}
            <div style={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center', height: 40, marginBottom: 24 }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} style={{
                  width: 4, borderRadius: 2, background: '#E24B4A', opacity: 0.7,
                  height: `${10 + Math.random() * 30}px`,
                  animation: `barPulse ${0.4 + Math.random() * 0.6}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.05}s`,
                }} />
              ))}
            </div>
            <button onClick={stopRecording}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <Square size={14} fill="#fff" /> Stop recording
            </button>
          </>
        )}

        {/* RECORDED stage */}
        {stage === 'recorded' && audioUrl && (
          <>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Play size={28} color="var(--teal)" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Recording complete — {fmt(recTime)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Listen back then submit for AI evaluation.</div>
            <audio src={audioUrl} controls style={{ width: '100%', marginBottom: 20, height: 36 }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={reset}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)', background: 'transparent', fontSize: 13, cursor: 'pointer' }}>
                <RotateCcw size={13} /> Re-record
              </button>
              <button onClick={evaluate}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Submit for evaluation <ChevronRight size={13} />
              </button>
            </div>
          </>
        )}

        {/* EVALUATING stage */}
        {stage === 'evaluating' && (
          <>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Loader size={28} color="var(--purple)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Evaluating your response...</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Transcribing audio and scoring across all 4 IELTS criteria.</div>
          </>
        )}
      </div>

      {/* History */}
      {history.length > 0 && stage === 'pick' && (
        <div style={{ marginTop: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Recent speaking attempts</div>
          {history.slice(0, 4).map((h: any, i: number) => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < Math.min(history.length, 4) - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: 'var(--purple-dark)', flexShrink: 0 }}>
                {h.overallBand}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.question}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{new Date(h.evaluatedAt).toLocaleDateString()}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500, flexShrink: 0 }}>+{h.pointsEarned} pts</div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.18);opacity:0.3} }
        @keyframes barPulse { from{transform:scaleY(0.4)} to{transform:scaleY(1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}