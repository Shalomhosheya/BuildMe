// hooks/usePerformance.ts
// Drop this in src/hooks/usePerformance.ts

import { useCallback } from 'react';

export type SkillArea =
  | 'grammar'
  | 'vocabulary'
  | 'reading_comprehension'
  | 'listening_accuracy'
  | 'speaking_fluency'
  | 'speaking_pronunciation'
  | 'writing_coherence'
  | 'writing_task_achievement'
  | 'general_ielts';

export interface PerformanceResult {
  screen: 'quiz' | 'speaking' | 'listening' | 'essay';
  score: number;          // 0–100 (or IELTS band * 11.1 for band scores)
  bandScore?: number;     // 0–9 for IELTS band
  weakAreas: SkillArea[];
  details?: string;       // e.g. "Missed: passive voice, conditionals"
}

// Thresholds — tune these to your app
const SCORE_THRESHOLD = 60;      // percentage
const BAND_THRESHOLD  = 5.5;     // IELTS band

export function usePerformance(
  onSuggestionNeeded: (result: PerformanceResult) => void
) {
  const report = useCallback(
    (result: PerformanceResult) => {
      const belowScore = result.score < SCORE_THRESHOLD;
      const belowBand  = result.bandScore !== undefined && result.bandScore < BAND_THRESHOLD;

      if (belowScore || belowBand) {
        onSuggestionNeeded(result);
      }
    },
    [onSuggestionNeeded]
  );

  return { report };
}