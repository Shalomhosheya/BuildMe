import { api } from './client';

export interface EvaluationResult {
  evaluationId:      string;
  overallBand:       number;
  taskResponse:      number;
  coherenceCohesion: number;
  lexicalResource:   number;
  grammaticalRange:  number;
  feedback:          string;
  pointsEarned:      number;
}

export interface EssayEvaluation extends EvaluationResult {
  id:          string;
  question:    string;
  essay:       string;
  taskType:    string;
  evaluatedAt: string;
}

export interface ChatResponse {
  reply: string;
}

export const aiApi = {
  evaluate: (essay: string, question?: string, taskType?: string) =>
    api.post<EvaluationResult>('/api/ai/evaluate', { essay, question, taskType }),

  chat: (message: string) =>
    api.post<ChatResponse>('/api/ai/chat', { message }),

  history: () =>
    api.get<EssayEvaluation[]>('/api/ai/history'),
};