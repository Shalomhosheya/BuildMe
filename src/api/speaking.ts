
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface SpeakingResult {
  evaluationId:    string;
  transcript:      string;
  fluency:         number;
  pronunciation:   number;
  vocabulary:      number;
  grammar:         number;
  overallBand:     number;
  feedback:        string;
  improvements:    string[];
  pointsEarned:    number;
}

export interface SpeakingHistory {
  id:          string;
  question:    string;
  transcript:  string;
  overallBand: number;
  fluency:     number;
  pronunciation: number;
  vocabulary:  number;
  grammar:     number;
  feedback:    string;
  pointsEarned: number;
  evaluatedAt: string;
}

export const speakingApi = {
  evaluate: async (audioBlob: Blob, question: string): Promise<SpeakingResult> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('question', question);

    const token = localStorage.getItem('buildme_token');
    const res   = await fetch(`${BASE_URL}/api/speaking/evaluate`, {
      method:  'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body:    formData,
    });

    if (res.status === 401) {
      localStorage.removeItem('buildme_token');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Evaluation failed');
    return data;
  },

  history: async (): Promise<SpeakingHistory[]> => {
    const token = localStorage.getItem('buildme_token');
    const res   = await fetch(`${BASE_URL}/api/speaking/history`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load history');
    return data;
  },

  questions: async (): Promise<string[]> => {
    const token = localStorage.getItem('buildme_token');
    const res   = await fetch(`${BASE_URL}/api/speaking/questions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (!res.ok) return FALLBACK_QUESTIONS;
    return data;
  },
};

// Used if backend is unreachable
export const FALLBACK_QUESTIONS = [
  'Describe a place you enjoy visiting. What makes it special to you?',
  'Talk about a skill you would like to learn. Why is it important to you?',
  'Describe a person who has influenced you greatly. How did they change your life?',
  'Some people prefer living in cities, others prefer rural areas. Discuss both views.',
  'Talk about an important decision you made. How did you make it and what happened?',
  'Describe a memorable journey or trip you have taken.',
  'Some people think technology has made life better. Others disagree. What is your view?',
  'Talk about a book, film, or TV show that had a big impact on you.',
];

