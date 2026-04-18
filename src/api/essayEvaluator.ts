import { api } from './client';

export interface InlineIssue {
  type: 'grammar' | 'vocabulary' | 'coherence' | 'task';
  original: string;
  suggestion: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
}

export interface CriterionFeedback {
  score: number;
  band: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}

export interface EssayEvaluationFull {
  evaluationId: string;
  overallBand: number;
  taskType: 'Task 1' | 'Task 2';
  wordCount: number;
  taskResponse: CriterionFeedback;
  coherenceCohesion: CriterionFeedback;
  lexicalResource: CriterionFeedback;
  grammaticalRange: CriterionFeedback;
  inlineIssues: InlineIssue[];
  rewrittenEssay?: string;
  pointsEarned: number;
  evaluatedAt: string;
}

export interface RewriteResponse {
  rewrittenEssay: string;
  changesExplained: string[];
}

export const essayApi = {
  evaluate: (essay: string, question: string, taskType: string) =>
    api.post<EssayEvaluationFull>('/api/essay/evaluate', { essay, question, taskType }),

  rewrite: (essay: string, targetBand: number) =>
    api.post<RewriteResponse>('/api/essay/rewrite', { essay, targetBand }),

  history: () =>
    api.get<EssayEvaluationFull[]>('/api/essay/history'),
};

export const BAND_DESCRIPTORS: Record<string, Record<number, string>> = {
  taskResponse: {
    9: 'Fully addresses all parts with well-supported ideas',
    8: 'Sufficiently addresses all parts, well-developed',
    7: 'Addresses all parts, ideas extended and supported',
    6: 'Addresses all parts though some may be more fully covered',
    5: 'Addresses topic only partially',
    4: 'Responds to task only in a minimal way',
  },
  coherenceCohesion: {
    9: 'Seamless and skillful use of cohesion',
    8: 'Sequences information logically with good cohesion',
    7: 'Logically organises with clear progression',
    6: 'Arranges coherently with some effective cohesive devices',
    5: 'Some organisation but inconsistent use of cohesion',
    4: 'Limited use of organisational features',
  },
  lexicalResource: {
    9: 'Full flexibility with sophisticated control',
    8: 'Wide resource, fluent and flexible',
    7: 'Uses a sufficient range with some less common items',
    6: 'Adequate range, some errors but meaning clear',
    5: 'Limited range, errors may cause difficulty',
    4: 'Basic vocabulary, may be inappropriate',
  },
  grammaticalRange: {
    9: 'Wide range with full flexibility and accuracy',
    8: 'Wide range, majority of sentences error-free',
    7: 'Good range, frequently error-free',
    6: 'Mix of simple and complex, some errors',
    5: 'Limited range, errors may cause difficulty',
    4: 'Very limited range, many errors',
  },
};

export const ISSUE_COLORS: Record<InlineIssue['type'], { bg: string; border: string; label: string }> = {
  grammar:    { bg: '#FCEBEB', border: '#E24B4A', label: 'Grammar' },
  vocabulary: { bg: '#FAEEDA', border: '#BA7517', label: 'Vocabulary' },
  coherence:  { bg: '#EBF5FB', border: '#185FA5', label: 'Coherence' },
  task:       { bg: '#FAECE7', border: '#993C1D', label: 'Task' },
};