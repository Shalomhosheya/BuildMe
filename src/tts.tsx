/**
 * tts.ts — Human-sounding text-to-speech with fallback chain
 *
 * Priority:
 *  1. ElevenLabs (most human-sounding, requires VITE_ELEVENLABS_API_KEY)
 *  2. Web Speech API with the best available neural voice
 *
 * Usage:
 *   const stop = await speakText(transcript, 'british', onEnd);
 *   stop(); // cancel early
 */

// ── ALL 6 accents supported ───────────────────────────────────────────────────
export type Accent = 'british' | 'australian' | 'american' | 'african' | 'indian' | 'russian' | 'chinese';

// ── ElevenLabs voice IDs ──────────────────────────────────────────────────────
const ELEVENLABS_VOICES: Record<Accent, { id: string; name: string }> = {
  british:    { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice'   },   // ✅ genuine British RP female
  australian: { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },   // ✅ verified Australian male
  american:   { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam'     },   // ✅ American male
  african:    { id: 'eRcsJdPMOM0mtGC03ul7', name: 'kevin'     },
  indian:     { id: 'SXuKWBhKoIoAHKlf6Gt3', name: 'Gaurav'   }, 
  russian:    { id: 'XaEUesE01wKIKaa0xI0h', name: 'Nino'   }, 
  chinese:    { id: 'NIkIuJZ8oQMuKZqwKtnm', name: 'Deep Bass'     }, 
};

const ELEVENLABS_MODEL = 'eleven_multilingual_v2';  // ✅ better accent fidelity than turbo

// ── ElevenLabs TTS ────────────────────────────────────────────────────────────
async function elevenLabsSpeak(
  text: string,
  accent: Accent,
  apiKey: string,
  onEnd: () => void,
): Promise<() => void> {
  const voice = ELEVENLABS_VOICES[accent];
  if (!voice) throw new Error(`No ElevenLabs voice configured for accent: ${accent}`);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key':   apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: {
          stability:         0.55,
          similarity_boost:  0.85,
          style:             0.25,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[TTS] ElevenLabs error ${res.status} for voice "${voice.name}" (${voice.id}):`, errText);
    throw new Error(`ElevenLabs ${res.status}: ${errText}`);
  }
  const blob  = await res.blob();
  const url   = URL.createObjectURL(blob);
  const audio = new Audio(url);
  let ended   = false;

  const finish = () => {
    if (ended) return;
    ended = true;
    URL.revokeObjectURL(url);
    onEnd();
  };

  audio.onended = finish;
  audio.onerror = finish;
  audio.play();

  return () => { audio.pause(); audio.currentTime = 0; finish(); };
}

// ── Web Speech locale hints per accent ───────────────────────────────────────
const LANG_HINTS: Record<Accent, string[]> = {
  british:    ['en-GB', 'en_GB'],
  australian: ['en-AU', 'en_AU'],
  american:   ['en-US', 'en_US'],
  african:    ['en-ZA', 'en-NG', 'en-KE', 'en-GB', 'en-US'],
  indian:     ['en-IN', 'en_IN', 'en-GB', 'en-US'],
  russian:    ['ru-RU', 'en-GB', 'en-US'],
  chinese:    ['zh-CN', 'zh-TW', 'en-US'],
};

// ── Safe voice picker ─────────────────────────────────────────────────────────
function pickBestVoice(accent: Accent): SpeechSynthesisVoice | null {
  const all = window.speechSynthesis.getVoices();
  if (!all || all.length === 0) return null;

  const hints = LANG_HINTS[accent] ?? ['en-US'];

  function score(v: SpeechSynthesisVoice): number {
    // Guard every property — some browsers return voices with undefined fields
    const lang = typeof v?.lang === 'string' ? v.lang.toLowerCase() : '';
    const name = typeof v?.name === 'string' ? v.name.toLowerCase() : '';

    for (let i = 0; i < hints.length; i++) {
      if (lang === hints[i].toLowerCase()) return 100 - i;
    }
    for (let i = 0; i < hints.length; i++) {
      if (lang.startsWith(hints[i].toLowerCase().slice(0, 5))) return 80 - i;
    }
    for (let i = 0; i < hints.length; i++) {
      if (name.includes(hints[i].toLowerCase().replace('-', ''))) return 60 - i;
    }
    if (/neural|premium|enhanced|natural|wavenet|studio/i.test(name)) return 30;
    if (/compact/i.test(name)) return 5;
    if (lang.startsWith('en')) return 10;
    return 0;
  }

  const valid = all.filter(v => v != null);
  if (valid.length === 0) return null;

  return [...valid].sort((a, b) => score(b) - score(a))[0] ?? null;
}

// ── Wait for voices to be ready (Chrome lazy-loads them) ─────────────────────
function waitForVoices(): Promise<void> {
  return new Promise(resolve => {
    if (window.speechSynthesis.getVoices().length > 0) {
      resolve();
      return;
    }
    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    setTimeout(resolve, 2000);
  });
}

// ── Web Speech fallback ───────────────────────────────────────────────────────
function webSpeechSpeak(
  text: string,
  accent: Accent,
  onEnd: () => void,
): () => void {
  window.speechSynthesis.cancel();

  const utt   = new SpeechSynthesisUtterance(text);
  const voice = pickBestVoice(accent);
  if (voice) utt.voice = voice;

  utt.rate   = 0.90;
  utt.pitch  = 1.0;
  utt.volume = 1.0;

  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    clearInterval(keepAlive);
    onEnd();
  };

  // Chrome bug: speech silently stops after ~15 s
  const keepAlive = setInterval(() => {
    if (!window.speechSynthesis.speaking) clearInterval(keepAlive);
    else { window.speechSynthesis.pause(); window.speechSynthesis.resume(); }
  }, 10_000);

  utt.onend = finish;
  utt.onerror = (e) => {
    if ((e as SpeechSynthesisErrorEvent).error !== 'interrupted') finish();
  };

  window.speechSynthesis.speak(utt);

  return () => { clearInterval(keepAlive); window.speechSynthesis.cancel(); finish(); };
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function speakText(
  text: string,
  accent: Accent,
  onEnd: () => void,
): Promise<() => void> {
  const apiKey = 'sk_da79d753d069c04beb7331c2ca4355948cda02a5bc37a9b9';

  if (apiKey) {
    try {
      return await elevenLabsSpeak(text, accent, apiKey, onEnd);
    } catch (err) {
      console.warn('[TTS] ElevenLabs failed, falling back to Web Speech:', err);
    }
  }

  await waitForVoices();
  return webSpeechSpeak(text, accent, onEnd);
}