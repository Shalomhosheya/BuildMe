
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
  // Part 2 — Long turn (describe)
  'Describe a place you enjoy visiting. What makes it special to you?',
  'Talk about a skill you would like to learn. Why is it important to you?',
  'Describe a person who has influenced you greatly. How did they change your life?',
  'Talk about an important decision you made. How did you make it and what happened?',
  'Describe a memorable journey or trip you have taken.',
  'Talk about a book, film, or TV show that had a big impact on you.',
  'Describe an object that is very important to you. Explain why it matters.',
  'Talk about a time when you helped someone. What did you do and how did it make you feel?',
  'Describe a celebration or festival you have enjoyed. What makes it memorable?',
  'Talk about a sport or physical activity you enjoy. How did you get into it?',
  'Describe a teacher or mentor who had a positive effect on your education.',
  'Talk about a goal you have set for yourself. How do you plan to achieve it?',
  'Describe a piece of art, music, or architecture you find beautiful. Why do you like it?',
  'Talk about a challenge you overcame. What did you learn from the experience?',
  'Describe a tradition from your culture that you find meaningful.',
  'Talk about a time you experienced a culture different from your own.',
  'Describe a local business or place you visit regularly.',
  'Talk about a news story that interested or affected you recently.',
  'Describe a time you worked as part of a team. What was your role?',
  'Talk about a historical figure you admire. What did they achieve?',

  // Part 3 — Discussion (opinion / both sides)
  'Some people prefer living in cities, others prefer rural areas. Discuss both views.',
  'Some people think technology has made life better. Others disagree. What is your view?',
  'Do you think governments should invest more in public transport or road infrastructure? Why?',
  'Should higher education be free for all students? Discuss the advantages and disadvantages.',
  'Many people argue that social media does more harm than good. Do you agree?',
  'Is it better to learn from books or from real-life experience? Explain your view.',
  'Some believe that globalisation is beneficial for all countries. Others disagree. What do you think?',
  'Should children be taught about environmental issues in school? Why or why not?',
  'Do you think remote working will replace traditional office-based work in the future?',
  'Is it important for people to maintain a balance between work and leisure? Why?',
];

