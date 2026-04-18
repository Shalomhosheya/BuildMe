export type Screen = 'dashboard' | 'quiz' | 'ai-tutor' | 'notes' | 'portfolio' | 'speaking' | 'listening' | 'essay';

export interface Skill {
  id: string; name: string; level: number; levelName: string;
  pts: number; maxPts: number; color: string; bg: string;
}
export interface Note {
  id: number; title: string; content: string; tag: string; date: string;
}
export interface Badge {
  id: string; name: string; desc: string; earned: boolean; color: string; bg: string;
}
export interface QuizQuestion {
  q: string; opts: string[]; ans: number; exp: string;
}
export interface QuizSet {
  id: string; skill: string; title: string; desc: string;
  level: number; levelName: string; pts: number; done: boolean;passage?: string;
  questions: QuizQuestion[];
}