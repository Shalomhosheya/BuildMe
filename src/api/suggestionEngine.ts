// api/suggestionEngine.ts
//
// Suggestion generation using the Anthropic API (claude-sonnet-4-20250514).
// No third-party services — just one POST to api.anthropic.com.
//
// How it works:
//   1. Build a structured prompt from the student's performance data
//   2. Send it to Claude with a SYSTEM prompt that makes it act as an IELTS coach
//   3. Claude returns JSON — headline + encouragement + 3-5 specific resources
//   4. If the call fails or times out, fall back to the curated static library below
//
// The RESOURCE_LIBRARY is also used as few-shot examples in the prompt so Claude
// learns your exact schema and resource style.

import { PerformanceResult, SkillArea } from '../hooks/usePerformance';

export type ResourceType = 'video' | 'document' | 'book' | 'practice' | 'chatbot';

export interface Resource {
  type: ResourceType;
  title: string;
  description: string;  // why this helps for the specific weak area
  url?: string;         // external link (YouTube search, ielts.org, etc.)
  internalScreen?: string; // app screen to navigate to on click
}

export interface SuggestionResponse {
  headline: string;       // ≤ 8 words, encouraging
  encouragement: string;  // 1 sentence, motivational
  resources: Resource[];  // 3–5 items, mixed types
}

// ─── Curated resource library ─────────────────────────────────────────────────
// These are used in two ways:
//   A) As few-shot examples injected into the prompt so Claude knows the schema
//   B) As the offline fallback when the API is unavailable
//
// Add to this freely — the more specific, the better the few-shot guidance.

const RESOURCE_LIBRARY: Record<SkillArea, Resource[]> = {
  grammar: [
    {
      type: 'video',
      title: 'Top 10 IELTS Grammar Mistakes (E2 IELTS)',
      description: 'Covers the exact grammar errors that examiners deduct marks for, with clear before/after examples.',
      url: 'https://www.youtube.com/results?search_query=E2+IELTS+grammar+mistakes',
    },
    {
      type: 'book',
      title: 'English Grammar in Use – Raymond Murphy',
      description: 'The gold-standard self-study grammar book — clear rules, practice exercises, and an answer key.',
    },
    {
      type: 'document',
      title: 'IELTS Grammar Guide – British Council',
      description: 'Free online reference covering the structures most tested in IELTS Writing and Speaking.',
      url: 'https://learnenglish.britishcouncil.org/grammar',
    },
    {
      type: 'practice',
      title: 'Grammar Quiz',
      description: 'Drill the specific structures you missed with targeted quiz questions.',
      internalScreen: 'quiz',
    },
  ],

  vocabulary: [
    {
      type: 'video',
      title: 'IELTS Vocabulary Band 7–9 (IELTS Liz)',
      description: 'High-frequency academic and topic vocabulary with example sentences for Task 2 and Speaking.',
      url: 'https://www.youtube.com/results?search_query=IELTS+Liz+vocabulary+band+7',
    },
    {
      type: 'book',
      title: 'Vocabulary for IELTS Advanced – Cambridge',
      description: 'Organised by topic (environment, technology, health) with IELTS-style exercises and a word list.',
    },
    {
      type: 'chatbot',
      title: 'Vocabulary Chatbot Practice',
      description: 'Ask the IELTS chatbot to give you vocabulary exercises on the exact topic you struggled with.',
      internalScreen: 'chatbot',
    },
  ],

  reading_comprehension: [
    {
      type: 'video',
      title: 'True / False / Not Given – IELTS Simon',
      description: 'Step-by-step walkthrough of the most confusing IELTS Reading question type.',
      url: 'https://www.youtube.com/results?search_query=IELTS+Simon+true+false+not+given',
    },
    {
      type: 'document',
      title: 'Official IELTS Reading Practice Materials',
      description: 'Free sample reading tests from IELTS.org with answer keys.',
      url: 'https://www.ielts.org/about-ielts/test-preparation',
    },
    {
      type: 'book',
      title: 'Cambridge IELTS 18 Academic',
      description: 'The latest official practice tests — closest to what appears in the real exam.',
    },
  ],

  listening_accuracy: [
    {
      type: 'practice',
      title: 'Listening Trainer',
      description: 'More listening exercises with immediate feedback on your accuracy.',
      internalScreen: 'listening',
    },
    {
      type: 'video',
      title: 'IELTS Listening Strategies (E2 IELTS)',
      description: 'How to predict answers, avoid distractors, and catch spelling in Section 4.',
      url: 'https://www.youtube.com/results?search_query=E2+IELTS+listening+strategies+section+4',
    },
    {
      type: 'document',
      title: 'IELTS Listening Answer Sheet Tips',
      description: 'Common transfer mistakes and how to use the 10-minute transfer time effectively.',
      url: 'https://ieltsliz.com/ielts-listening-tips/',
    },
  ],

  speaking_fluency: [
    {
      type: 'practice',
      title: 'Speaking Practice Session',
      description: 'Record a fresh response on the topic you struggled with and get instant feedback.',
      internalScreen: 'speaking',
    },
    {
      type: 'video',
      title: 'IELTS Speaking Band 7 Full Interview (IELTS Liz)',
      description: 'Watch a scored interview and read the examiner commentary on fluency and coherence.',
      url: 'https://www.youtube.com/results?search_query=IELTS+Liz+speaking+band+7+full+interview',
    },
    {
      type: 'chatbot',
      title: 'Chatbot Speaking Drills',
      description: 'Ask the IELTS chatbot to give you Part 2 cue cards to practise speaking for 2 minutes.',
      internalScreen: 'chatbot',
    },
  ],

  speaking_pronunciation: [
    {
      type: 'video',
      title: 'English Pronunciation for IELTS – Word Stress (BBC)',
      description: 'Covers the stress and intonation patterns that examiners listen for in the Speaking test.',
      url: 'https://www.youtube.com/results?search_query=BBC+English+pronunciation+word+stress+IELTS',
    },
    {
      type: 'book',
      title: 'Ship or Sheep? – Ann Baker',
      description: 'Minimal-pairs pronunciation workbook — targets the specific sounds non-native speakers confuse.',
    },
  ],

  writing_coherence: [
    {
      type: 'document',
      title: 'Cohesive Devices for IELTS Writing – IELTS Liz',
      description: 'Full list of linking words, reference words, and discourse markers with example sentences.',
      url: 'https://ieltsliz.com/linking-words-for-ielts-writing-task-2/',
    },
    {
      type: 'video',
      title: 'IELTS Task 2 Essay Structure (IELTS Simon)',
      description: 'The 4-paragraph structure that consistently earns Band 7+ for coherence and cohesion.',
      url: 'https://www.youtube.com/results?search_query=IELTS+Simon+task+2+essay+structure',
    },
    {
      type: 'practice',
      title: 'Essay Evaluator',
      description: 'Submit another essay draft and get a detailed coherence and cohesion score.',
      internalScreen: 'essay',
    },
  ],

  writing_task_achievement: [
    {
      type: 'video',
      title: 'Task Achievement – What Examiners Look For (E2 IELTS)',
      description: 'Explains exactly how to address both parts of the question and develop your position fully.',
      url: 'https://www.youtube.com/results?search_query=E2+IELTS+task+achievement+writing+task+2',
    },
    {
      type: 'book',
      title: 'The Official Cambridge Guide to IELTS',
      description: 'Eight full practice tests with examiner band descriptors and model answers.',
    },
    {
      type: 'chatbot',
      title: 'Essay Planning with Chatbot',
      description: 'Ask the IELTS chatbot to help you plan and outline your answer before you write.',
      internalScreen: 'chatbot',
    },
  ],

  general_ielts: [
    {
      type: 'video',
      title: 'IELTS Videos Library',
      description: 'Browse all skill-specific video lessons and tips from inside the app.',
      internalScreen: 'videos',
    },
    {
      type: 'book',
      title: 'Cambridge IELTS 18',
      description: 'The most recent official Cambridge practice tests — four complete papers.',
    },
    {
      type: 'document',
      title: 'Official IELTS Preparation Hub',
      description: 'Free practice materials, sample questions, and preparation advice from IELTS.org.',
      url: 'https://www.ielts.org/about-ielts/test-preparation',
    },
  ],
};

// ─── Prompt builder ───────────────────────────────────────────────────────────
// Injects a few-shot example from the curated library so Claude produces output
// that matches the exact schema and resource style you want.

function buildMessages(result: PerformanceResult) {
  const scoreText = result.bandScore
    ? `band score ${result.bandScore}/9`
    : `${result.score}% (below 60% target)`;

  // Pick one relevant example from the library to show Claude the expected style
  const exampleArea = result.weakAreas[0] ?? 'general_ielts';
  const exampleResources = RESOURCE_LIBRARY[exampleArea].slice(0, 2);
  const fewShotExample = JSON.stringify(
    {
      headline: 'Let\'s sharpen your ' + exampleArea.replace(/_/g, ' '),
      encouragement: 'You\'re making real progress — focused practice on this area will lift your band score quickly.',
      resources: exampleResources,
    },
    null,
    2
  );

  const systemPrompt = `You are an expert IELTS tutor AI built into a study app. Your job is to generate personalised, actionable study suggestions when a student scores below their target.

You always respond with ONLY valid JSON — no markdown fences, no explanation, no preamble. The JSON must exactly match this TypeScript interface:

interface SuggestionResponse {
  headline: string;       // ≤ 8 words, encouraging, names the weak area
  encouragement: string;  // 1 sentence, warm and specific to their situation
  resources: Array<{
    type: "video" | "document" | "book" | "practice" | "chatbot";
    title: string;
    description: string;  // 1 sentence: why THIS resource helps for THEIR specific weak area
    url?: string;         // real URL only — YouTube search URLs are fine; never invent domain paths
    internalScreen?: "quiz" | "speaking" | "listening" | "essay" | "videos" | "chatbot";
  }>;
}

Rules:
- Return 3–5 resources, mixing types (not all videos, not all books)
- Descriptions must be specific to the student's weak area — no generic filler
- For videos: use YouTube search URLs like https://www.youtube.com/results?search_query=... (never invent video IDs)
- For documents: use real domains — ielts.org, ieltsliz.com, britishcouncil.org, cambridge.org
- For books: leave url empty; give the author and a specific reason the book helps
- For practice/chatbot: use internalScreen instead of url
- Tone: warm coach, not robotic. Acknowledge their specific result.`;

  const userPrompt = `Student performance report:
- Section: ${result.screen}
- Score: ${scoreText}
- Weak areas: ${result.weakAreas.join(', ')}
${result.details ? `- Details: ${result.details}` : ''}

Here is an example of the JSON format I expect (for the area "${exampleArea}"):
${fewShotExample}

Now generate a fresh SuggestionResponse for this student's actual weak areas. Do not copy the example — generate new, specific resources for: ${result.weakAreas.join(', ')}.`;

  return { systemPrompt, userPrompt };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateSuggestions(
  result: PerformanceResult
): Promise<SuggestionResponse> {
  const { systemPrompt, userPrompt } = buildMessages(result);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API ${response.status}: ${err}`);
    }

    const data = await response.json();

    // Extract text blocks (ignore tool_use, images, etc.)
    const text: string = data.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('');

    // Strip any accidental markdown fences before parsing
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed: SuggestionResponse = JSON.parse(clean);

    // Basic shape validation
    if (!parsed.headline || !Array.isArray(parsed.resources)) {
      throw new Error('Response missing required fields');
    }

    return parsed;

  } catch (err) {
    console.warn('[SuggestionEngine] Falling back to curated library:', err);
    return buildFallback(result);
  }
}

// ─── Offline / error fallback ─────────────────────────────────────────────────
// Returns a deterministic, high-quality response from the curated library.
// Deduplicates by title so the same resource doesn't appear twice.

function buildFallback(result: PerformanceResult): SuggestionResponse {
  const seen = new Set<string>();
  const resources: Resource[] = [];

  for (const area of result.weakAreas) {
    for (const r of RESOURCE_LIBRARY[area] ?? []) {
      if (!seen.has(r.title) && resources.length < 5) {
        seen.add(r.title);
        resources.push(r);
      }
    }
  }

  if (resources.length === 0) {
    resources.push(...RESOURCE_LIBRARY.general_ielts);
  }

  const areaLabel = result.weakAreas[0]?.replace(/_/g, ' ') ?? 'IELTS skills';

  return {
    headline: `Let's strengthen your ${areaLabel}`,
    encouragement:
      'Every practice session counts — these resources will target exactly what you need to improve.',
    resources,
  };
}