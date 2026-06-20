import { api } from './client';

export interface Resource {
  id: string;
  type: 'video' | 'article' | 'book' | 'practice';
  title: string;
  description: string;
  url: string;
  skill: string;
  soloLevel: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  author?: string;
}

export interface Recommendation {
  triggeredBy: 'quiz' | 'essay' | 'speaking' | 'listening';
  skill: string;
  soloLevel: number;
  score: number;
  totalScore: number;
  message: string;
  resources: Resource[];
}

export const recommendationsApi = {
  getForQuiz: (skill: string, soloLevel: number, score: number, total: number) =>
    api.post<Recommendation>('/api/recommendations/quiz', { skill, soloLevel, score, total }),

  getForEssay: (band: number, taskType: string, weakCriteria: string[]) =>
    api.post<Recommendation>('/api/recommendations/essay', { band, taskType, weakCriteria }),

  getForSpeaking: (band: number, weakCriteria: string[]) =>
    api.post<Recommendation>('/api/recommendations/speaking', { band, weakCriteria }),

  history: () =>
    api.get<Recommendation[]>('/api/recommendations/history'),
};

// ── Fallback local resource bank (used when backend offline) ──────────────
export const RESOURCE_BANK: Record<string, Resource[]> = {

  // ── WRITING ──────────────────────────────────────────────────────────────
  Writing: [
    { id: 'w1', type: 'video', skill: 'Writing', soloLevel: 1, difficulty: 'beginner',
      title: 'IELTS Writing Task 2 — Complete Guide for Beginners',
      description: 'Step-by-step breakdown of Task 2 structure, paragraphing and thesis statements.',
      url: 'https://www.youtube.com/results?search_query=IELTS+writing+task+2+beginners+guide',
      duration: '18 min', author: 'IELTS Liz' },
    { id: 'w2', type: 'video', skill: 'Writing', soloLevel: 2, difficulty: 'intermediate',
      title: 'How to Score Band 7 in IELTS Writing — Vocabulary and Linking',
      description: 'Practical techniques for upgrading vocabulary and improving coherence.',
      url: 'https://www.youtube.com/results?search_query=IELTS+writing+band+7+vocabulary+linking+words',
      duration: '22 min', author: 'E2 IELTS' },
    { id: 'w3', type: 'video', skill: 'Writing', soloLevel: 3, difficulty: 'advanced',
      title: 'Band 8 IELTS Writing — Advanced Grammar and Complex Sentences',
      description: 'How to use conditional sentences, passive voice, and nominalization for Band 8.',
      url: 'https://www.youtube.com/results?search_query=IELTS+writing+band+8+complex+grammar',
      duration: '25 min', author: 'IELTS Simon' },
    { id: 'w4', type: 'article', skill: 'Writing', soloLevel: 1, difficulty: 'beginner',
      title: 'IELTS Writing Band Descriptors Explained',
      description: 'Official explanation of all four IELTS Writing criteria with band-level examples.',
      url: 'https://www.ielts.org/teaching-and-research/score-descriptors',
      author: 'British Council / IDP / Cambridge' },
    { id: 'w5', type: 'book', skill: 'Writing', soloLevel: 2, difficulty: 'intermediate',
      title: 'Cambridge IELTS Academic 18 — Writing Practice Tests',
      description: 'Official Cambridge practice materials with model answers and examiner commentary.',
      url: 'https://www.cambridge.org/gb/cambridgeenglish/catalog/cambridge-english-exams-ielts/cambridge-ielts-18-academic',
      author: 'Cambridge University Press' },
    { id: 'w6', type: 'article', skill: 'Writing', soloLevel: 2, difficulty: 'intermediate',
      title: 'IELTS Writing Task 1 — How to Describe Charts and Graphs',
      description: 'Detailed guide to describing bar charts, line graphs, pie charts and diagrams.',
      url: 'https://www.ielts.org/ielts-for-organisations/ielts-academic/writing',
      author: 'IELTS.org' },
    { id: 'w7', type: 'video', skill: 'Writing', soloLevel: 1, difficulty: 'beginner',
      title: 'IELTS Task Response — How to Fully Answer the Question',
      description: 'Common mistakes candidates make with Task Response and how to avoid them.',
      url: 'https://www.youtube.com/results?search_query=IELTS+task+response+fully+answer+question',
      duration: '15 min', author: 'IELTS Advantage' },
  ],

  // ── READING ──────────────────────────────────────────────────────────────
  Reading: [
    { id: 'r1', type: 'video', skill: 'Reading', soloLevel: 1, difficulty: 'beginner',
      title: 'IELTS Reading Strategies — Skimming and Scanning for Beginners',
      description: 'Learn essential skimming and scanning techniques to find answers faster.',
      url: 'https://www.youtube.com/results?search_query=IELTS+reading+skimming+scanning+strategy',
      duration: '20 min', author: 'British Council' },
    { id: 'r2', type: 'video', skill: 'Reading', soloLevel: 2, difficulty: 'intermediate',
      title: 'IELTS Reading — True False Not Given Questions Explained',
      description: 'Master the most difficult question type with a step-by-step methodology.',
      url: 'https://www.youtube.com/results?search_query=IELTS+reading+true+false+not+given+strategy',
      duration: '17 min', author: 'IELTS Liz' },
    { id: 'r3', type: 'video', skill: 'Reading', soloLevel: 3, difficulty: 'advanced',
      title: 'IELTS Reading Band 8 — Speed Reading and Inference Techniques',
      description: 'Advanced reading comprehension strategies for complex academic texts.',
      url: 'https://www.youtube.com/results?search_query=IELTS+reading+band+8+advanced+strategy',
      duration: '24 min', author: 'E2 IELTS' },
    { id: 'r4', type: 'article', skill: 'Reading', soloLevel: 1, difficulty: 'beginner',
      title: 'IELTS Reading Question Types — Complete Guide',
      description: 'Overview of all 14 question types in IELTS Reading with tips for each.',
      url: 'https://www.britishcouncil.org/exam/ielts/ielts-reading',
      author: 'British Council' },
    { id: 'r5', type: 'book', skill: 'Reading', soloLevel: 2, difficulty: 'intermediate',
      title: 'The Official Cambridge Guide to IELTS',
      description: '8 complete practice tests with audio, online practice and expert guidance.',
      url: 'https://www.cambridge.org/gb/cambridgeenglish/catalog/cambridge-english-exams-ielts/official-cambridge-guide-ielts',
      author: 'Pauline Cullen, Amanda French, Vanessa Jakeman' },
    { id: 'r6', type: 'practice', skill: 'Reading', soloLevel: 1, difficulty: 'beginner',
      title: 'IELTS Reading Practice Tests — British Council',
      description: 'Free online reading practice tests with instant scoring and feedback.',
      url: 'https://www.britishcouncil.org/exam/ielts/preparation',
      author: 'British Council' },
  ],

  // ── LISTENING ────────────────────────────────────────────────────────────
  Listening: [
    { id: 'l1', type: 'video', skill: 'Listening', soloLevel: 1, difficulty: 'beginner',
      title: 'IELTS Listening — How the Test Works and Key Strategies',
      description: 'Complete overview of IELTS Listening format and essential strategies for each section.',
      url: 'https://www.youtube.com/results?search_query=IELTS+listening+test+strategies+beginners',
      duration: '19 min', author: 'IELTS Liz' },
    { id: 'l2', type: 'video', skill: 'Listening', soloLevel: 2, difficulty: 'intermediate',
      title: 'IELTS Listening — British vs Australian vs American Accent Practice',
      description: 'Train your ear to distinguish and understand multiple English accents used in IELTS.',
      url: 'https://www.youtube.com/results?search_query=IELTS+listening+british+australian+american+accent',
      duration: '30 min', author: 'E2 IELTS' },
    { id: 'l3', type: 'video', skill: 'Listening', soloLevel: 3, difficulty: 'advanced',
      title: 'IELTS Listening Section 4 — Monologue Strategies for Band 8',
      description: 'Advanced techniques for the most challenging section of IELTS Listening.',
      url: 'https://www.youtube.com/results?search_query=IELTS+listening+section+4+advanced+strategy',
      duration: '21 min', author: 'IELTS Simon' },
    { id: 'l4', type: 'article', skill: 'Listening', soloLevel: 1, difficulty: 'beginner',
      title: 'IELTS Listening — Understanding the Format',
      description: 'Official guide to IELTS Listening question types, timing, and marking.',
      url: 'https://www.ielts.org/about-ielts/ielts-for-test-takers/ielts-academic/listening',
      author: 'IELTS.org' },
    { id: 'l5', type: 'book', skill: 'Listening', soloLevel: 2, difficulty: 'intermediate',
      title: 'Cambridge IELTS 18 Academic — Listening Practice Tests with Audio',
      description: 'Official practice tests with authentic audio recordings and answer keys.',
      url: 'https://www.cambridge.org/gb/cambridgeenglish/catalog/cambridge-english-exams-ielts/cambridge-ielts-18-academic',
      author: 'Cambridge University Press' },
    { id: 'l6', type: 'practice', skill: 'Listening', soloLevel: 1, difficulty: 'beginner',
      title: 'BBC Learning English — Authentic English Listening Practice',
      description: 'Free listening materials with British, Australian and global English accents.',
      url: 'https://www.bbc.co.uk/learningenglish',
      author: 'BBC Learning English' },
  ],

  // ── SPEAKING ─────────────────────────────────────────────────────────────
  Speaking: [
    { id: 's1', type: 'video', skill: 'Speaking', soloLevel: 1, difficulty: 'beginner',
      title: 'IELTS Speaking Part 1 — Common Topics and Sample Answers',
      description: 'Learn how to answer Part 1 questions naturally with the right level of detail.',
      url: 'https://www.youtube.com/results?search_query=IELTS+speaking+part+1+common+topics+answers',
      duration: '20 min', author: 'IELTS Liz' },
    { id: 's2', type: 'video', skill: 'Speaking', soloLevel: 2, difficulty: 'intermediate',
      title: 'IELTS Speaking Part 2 — Long Turn Strategy and Fluency Tips',
      description: 'How to speak for 2 minutes using the PEEL structure and avoid hesitation.',
      url: 'https://www.youtube.com/results?search_query=IELTS+speaking+part+2+long+turn+strategy',
      duration: '23 min', author: 'E2 IELTS' },
    { id: 's3', type: 'video', skill: 'Speaking', soloLevel: 3, difficulty: 'advanced',
      title: 'IELTS Speaking Band 7 and 8 — Advanced Vocabulary and Grammar',
      description: 'How to use idiomatic language, discourse markers and complex structures.',
      url: 'https://www.youtube.com/results?search_query=IELTS+speaking+band+7+8+vocabulary+grammar',
      duration: '26 min', author: 'IELTS Simon' },
    { id: 's4', type: 'article', skill: 'Speaking', soloLevel: 1, difficulty: 'beginner',
      title: 'IELTS Speaking Band Descriptors — What Examiners Look For',
      description: 'Detailed breakdown of the four speaking criteria with band-level examples.',
      url: 'https://www.ielts.org/teaching-and-research/score-descriptors',
      author: 'British Council / IDP / Cambridge' },
    { id: 's5', type: 'book', skill: 'Speaking', soloLevel: 2, difficulty: 'intermediate',
      title: 'IELTS Speaking — Ace the Speaking Test by Pauline Cullen',
      description: 'In-depth guide to all three parts of IELTS Speaking with model answers.',
      url: 'https://www.cambridge.org/gb/cambridgeenglish/catalog/cambridge-english-exams-ielts',
      author: 'Pauline Cullen' },
    { id: 's6', type: 'practice', skill: 'Speaking', soloLevel: 1, difficulty: 'beginner',
      title: 'IELTS Speaking Practice — Official Sample Videos',
      description: 'Watch real IELTS Speaking examinations with examiner commentary.',
      url: 'https://www.ielts.org/about-ielts/ielts-for-test-takers/ielts-academic/speaking',
      author: 'IELTS.org' },
  ],
};

export function getLocalRecommendations(
  skill: string,
  soloLevel: number,
  score: number,
  total: number
): Recommendation {
  const pct = Math.round((score / total) * 100);
  const resources = (RESOURCE_BANK[skill] || [])
    .filter(r => r.soloLevel <= soloLevel + 1)
    .sort((a, b) => a.soloLevel - b.soloLevel)
    .slice(0, 4);

  const message = pct < 40
    ? `You scored ${pct}% — let's build your foundation first. Start with the beginner resources below before retrying this quiz.`
    : pct < 60
    ? `You scored ${pct}% — you are on the right track but need more practice. The resources below will strengthen your understanding.`
    : `You scored ${pct}% — good effort! Review these resources to push yourself to the next level.`;

  return {
    triggeredBy: 'quiz',
    skill,
    soloLevel,
    score,
    totalScore: total,
    message,
    resources,
  };
}

// ── Performance prediction for Listening ────────────────────────────────────

export interface PerformancePrediction {
  estimatedBand: number;
  trend: 'improving' | 'steady' | 'declining' | 'new';
  trendDelta: number;
  percentileLabel: string;
  strengthArea: string | null;
  weakArea: string | null;
  nextStepMessage: string;
  confidence: 'low' | 'medium' | 'high';
}

const BAND_BY_PCT = (pct: number): number => {
  if (pct >= 95) return 9.0;
  if (pct >= 85) return 8.0;
  if (pct >= 75) return 7.0;
  if (pct >= 65) return 6.5;
  if (pct >= 55) return 6.0;
  if (pct >= 45) return 5.5;
  if (pct >= 35) return 5.0;
  if (pct >= 20) return 4.5;
  return 4.0;
};

export function predictListeningPerformance(
  currentScore: number,
  currentTotal: number,
  accent: string,
  pastAttempts: { score: number; total: number; accent: string }[]
): PerformancePrediction {
  const pct = Math.round((currentScore / currentTotal) * 100);
  const estimatedBand = BAND_BY_PCT(pct);

  // Compare to past attempts on the same accent
  const sameAccent = pastAttempts.filter(a => a.accent === accent);
  let trend: PerformancePrediction['trend'] = 'new';
  let trendDelta = 0;

  if (sameAccent.length > 0) {
    const avgPastPct = Math.round(
      sameAccent.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / sameAccent.length
    );
    trendDelta = pct - avgPastPct;
    trend = trendDelta > 5 ? 'improving' : trendDelta < -5 ? 'declining' : 'steady';
  }

  // Accent-specific strength/weakness across all attempts
  const accentGroups: Record<string, { correct: number; total: number }> = {};
  [...pastAttempts, { score: currentScore, total: currentTotal, accent }].forEach(a => {
    if (!accentGroups[a.accent]) accentGroups[a.accent] = { correct: 0, total: 0 };
    accentGroups[a.accent].correct += a.score;
    accentGroups[a.accent].total += a.total;
  });

  const accentPcts = Object.entries(accentGroups).map(([acc, v]) => ({
    accent: acc, pct: Math.round((v.correct / v.total) * 100),
  }));
  const best = accentPcts.length > 1 ? accentPcts.reduce((a, b) => a.pct > b.pct ? a : b) : null;
  const worst = accentPcts.length > 1 ? accentPcts.reduce((a, b) => a.pct < b.pct ? a : b) : null;

  const confidence: PerformancePrediction['confidence'] =
    pastAttempts.length >= 5 ? 'high' : pastAttempts.length >= 2 ? 'medium' : 'low';

  const percentileLabel =
    pct >= 85 ? 'Top performer — exam ready' :
    pct >= 65 ? 'Above average — on track' :
    pct >= 45 ? 'Developing — needs consistent practice' :
    'Needs focused improvement';

  let nextStepMessage: string;
  if (pct < 45) {
    nextStepMessage = `Focus on basic listening comprehension — try slowing down practice audio and reviewing transcripts after each attempt before moving to harder tracks.`;
  } else if (pct < 65) {
    nextStepMessage = `You understand main ideas but miss specific details. Practice note-taking for names, numbers and dates while listening.`;
  } else if (pct < 85) {
    nextStepMessage = `Solid performance. Push toward Band 7+ by practising Section 4 academic monologues and reducing reliance on transcripts.`;
  } else {
    nextStepMessage = `Excellent! Maintain this level with one practice session per accent per week, focusing on unfamiliar topics.`;
  }
  if (worst && worst.pct < (best?.pct ?? 100) - 15) {
    nextStepMessage += ` Your ${worst.accent} accent comprehension (${worst.pct}%) is notably weaker than your ${best!.accent} (${best!.pct}%) — prioritise ${worst.accent} practice tracks next.`;
  }

  return {
    estimatedBand,
    trend,
    trendDelta,
    percentileLabel,
    strengthArea: best?.accent ?? null,
    weakArea: worst?.accent ?? null,
    nextStepMessage,
    confidence,
  };
}