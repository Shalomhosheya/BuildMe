export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  type?: 'answer' | 'correction' | 'ideas' | 'general';
  timestamp: string;
}

export interface ChatResponse {
  reply: string;
  type: 'answer' | 'correction' | 'ideas' | 'general';
  suggestions?: string[];
}

// ── Main API ──────────────────────────────────────────────────────────────
export const chatbotApi = {
  
  
};

export const QUICK_PROMPTS = [
  { label: 'What is Task Response?',  text: 'What is Task Response in IELTS writing and how is it scored?' },
  { label: 'Fix my sentence',         text: 'Can you fix this sentence: "She don\'t knows the answer"' },
  { label: 'Ideas: technology',       text: 'Give me ideas, vocabulary and arguments for the IELTS topic: technology and society' },
  { label: 'Band 6 vs Band 7',        text: 'What is the difference between Band 6 and Band 7 in IELTS writing?' },
  { label: 'Ideas: environment',      text: 'Give me ideas, vocabulary and arguments for the IELTS topic: environmental problems' },
  { label: 'Linking words list',      text: 'Give me a list of useful linking words for IELTS Task 2 with examples' },
  { label: 'Improve my paragraph',    text: 'How can I improve this paragraph for IELTS Task 2?' },
  { label: 'Speaking Part 2 tips',    text: 'Give me tips for IELTS Speaking Part 2 long turn' },
];