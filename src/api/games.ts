import { api } from './client';

export interface LeaderboardEntry {
  id: string;
  userName: string;
  score: number;
  wordsCorrect: number;
  level: number;
  difficulty: string;
  playedAt: string;
}

export interface MyScore {
  id: string;
  score: number;
  wordsCorrect: number;
  level: number;
  difficulty: string;
  playedAt: string;
}

export interface SaveScoreResponse {
  scoreId: string;
  pointsEarned: number;
  message: string;
}

export const gameApi = {
  saveScore: (score: number, wordsCorrect: number, level: number, difficulty: string) =>
    api.post<SaveScoreResponse>('/api/game/score', { score, wordsCorrect, level, difficulty }),

  leaderboard: () =>
    api.get<LeaderboardEntry[]>('/api/game/leaderboard'),

  myScores: () =>
    api.get<MyScore[]>('/api/game/my-scores'),
};
