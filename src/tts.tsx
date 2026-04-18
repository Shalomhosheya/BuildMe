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

export type Accent = 'british' | 'australian' | 'american';

// ── ElevenLabs voice IDs (free-tier voices, no cloning needed) ───────────────
// These are stable public voice IDs from ElevenLabs
const ELEVENLABS_VOICES: Record<Accent, { id: string; name: string }> = {
  british:    { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum'  }, // British male
  australian: { id: 'gAMZphRyrWJnLMDnom6H', name: 'Charlotte' }, // closest to AUS
  american:   { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam'    }, // American male
};

// Swap to female voices if you prefer:
// british:    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' }
// american:   { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' }

const ELEVENLABS_MODEL = 'eleven_turbo_v2'; // fastest + cheapest, still very human

// ── ElevenLabs TTS ───────────────────────────────────────────────────────────
async function elevenLabsSpeak(
  text: string,
  accent: Accent,
  apiKey: string,
  onEnd: () => void,
): Promise<() => void> {
  const voice = ELEVENLABS_VOICES[accent];

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
          stability:        0.45,   // more expressive
          similarity_boost: 0.80,
          style:            0.30,   // slight style variation
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const audio = new Audio(url);

  audio.onended = () => { URL.revokeObjectURL(url); onEnd(); };
  audio.onerror = () => { URL.revokeObjectURL(url); onEnd(); };
  audio.play();

  return () => { audio.pause(); audio.currentTime = 0; URL.revokeObjectURL(url); onEnd(); };
}

// ── Browser Web Speech API (best-voice picker) ───────────────────────────────
// Ranked preference: neural > enhanced > standard, prefer non-"compact" voices
function pickBestVoice(accent: Accent): SpeechSynthesisVoice | null {
  const all = window.speechSynthesis.getVoices();
  if (!all.length) return null;

  const langMap: Record<Accent, string[]> = {
    british:    ['en-GB'],
    australian: ['en-AU'],
    american:   ['en-US'],
  };

  const preferred = langMap[accent];

  // Score voices — higher = better
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0;
    if (preferred.some(p => v.lang.startsWith(p))) s += 100;
    // Neural / premium voices have these keywords in their name
    if (/neural|premium|enhanced|natural|wavenet|studio/i.test(v.name)) s += 50;
    // Avoid compact/low-quality
    if (/compact/i.test(v.name)) s -= 30;
    // Prefer non-local (usually higher quality)
    if (!v.localService) s += 10;
    return s;
  };

  return all.sort((a, b) => score(b) - score(a))[0] ?? null;
}

function webSpeechSpeak(
  text: string,
  accent: Accent,
  onEnd: () => void,
): () => void {
  window.speechSynthesis.cancel();

  const utt   = new SpeechSynthesisUtterance(text);
  const voice = pickBestVoice(accent);
  if (voice) utt.voice = voice;

  // Slightly slower for comprehension practice
  utt.rate  = 0.90;
  utt.pitch = 1.0;
  utt.volume = 1.0;

  utt.onend   = onEnd;
  utt.onerror = onEnd;

  // Chrome bug: speech stops after ~15 s — keep it alive
  const keepAlive = setInterval(() => {
    if (!window.speechSynthesis.speaking) clearInterval(keepAlive);
    else { window.speechSynthesis.pause(); window.speechSynthesis.resume(); }
  }, 10_000);

  utt.onend = () => { clearInterval(keepAlive); onEnd(); };

  window.speechSynthesis.speak(utt);

  return () => { clearInterval(keepAlive); window.speechSynthesis.cancel(); onEnd(); };
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Speak text using the best available engine.
 * Returns a `stop()` function to cancel playback early.
 */
export async function speakText(
  text: string,
  accent: Accent,
  onEnd: () => void,
): Promise<() => void> {
    // const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
    const apiKey = 'sk_51f46b2c97e73e5b79cf11abe012f45beb86777b026ce3f2';
  if (apiKey) {
    try {
      return await elevenLabsSpeak(text, accent, apiKey, onEnd);
    } catch (err) {
      console.warn('[TTS] ElevenLabs failed, falling back to Web Speech:', err);
    }
  }

  // Ensure voices are loaded before picking
  await new Promise<void>(resolve => {
    if (window.speechSynthesis.getVoices().length > 0) return resolve();
    window.speechSynthesis.onvoiceschanged = () => resolve();
    setTimeout(resolve, 1500); // safety timeout
  });

  return webSpeechSpeak(text, accent, onEnd);
}