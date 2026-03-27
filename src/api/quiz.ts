import { api } from './client';

export interface QuizAttempt {
  id: string;
  quizId: string;
  skill: string;
  soloLevel: number;
  score: number;
  totalQuestions: number;
  pointsEarned: number;
  passed: boolean;
  completedAt: string;
}

export interface QuizSubmitResponse {
  attemptId: string;
  passed: boolean;
  pointsEarned: number;
  percentage: number;
}

export const quizApi = {
  submit: (quizId: string, skill: string, soloLevel: number, score: number, totalQuestions: number) =>
    api.post<QuizSubmitResponse>('/api/quiz/submit', { quizId, skill, soloLevel, score, totalQuestions }),

  attempts: () =>
    api.get<QuizAttempt[]>('/api/quiz/attempts'),

  stats: () =>
    api.get<any>('/api/quiz/stats'),
};