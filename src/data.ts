import { Skill, Badge, Note, QuizSet } from './types';

export const SKILLS: Skill[] = [
  { id: 'writing',   name: 'Writing',   level: 3, levelName: 'Multistructural', pts: 360, maxPts: 500, color: '#534AB7', bg: '#EEEDFE' },
  { id: 'reading',   name: 'Reading',   level: 2, levelName: 'Unistructural',   pts: 180, maxPts: 400, color: '#1D9E75', bg: '#E1F5EE' },
  { id: 'listening', name: 'Listening', level: 2, levelName: 'Unistructural',   pts: 120, maxPts: 400, color: '#BA7517', bg: '#FAEEDA' },
  { id: 'speaking',  name: 'Speaking',  level: 1, levelName: 'Prestructural',   pts: 50,  maxPts: 300, color: '#888780', bg: '#F1EFE8' },
];

export const BADGES: Badge[] = [
  { id: 'starter',   name: 'Starter',     desc: 'Level 1 complete',   earned: true,  color: '#085041', bg: '#E1F5EE' },
  { id: 'explorer',  name: 'Explorer',    desc: 'Level 2 complete',   earned: true,  color: '#633806', bg: '#FAEEDA' },
  { id: 'builder',   name: 'Builder',     desc: 'Writing Level 3',    earned: true,  color: '#3C3489', bg: '#EEEDFE' },
  { id: 'analyst',   name: 'Analyst',     desc: 'All Level 3',        earned: false, color: '#444441', bg: '#F1EFE8' },
  { id: 'certified', name: 'Certified',   desc: 'Full certificate',   earned: false, color: '#444441', bg: '#F1EFE8' },
  { id: 'ready',     name: 'IELTS Ready', desc: 'Band 7+ estimated',  earned: false, color: '#444441', bg: '#F1EFE8' },
];

export const INITIAL_NOTES: Note[] = [
  { id: 1, title: 'Cohesion tips — Task 2', tag: 'writing', date: 'Today',
    content: 'Use a range of cohesive devices:\n\n• Furthermore, Moreover, In addition — adding ideas\n• However, Nevertheless, On the other hand — contrasting\n• Therefore, Consequently, As a result — showing cause\n• For instance, To illustrate, For example — giving examples\n\nAvoid overusing "also" and "but".' },
  { id: 2, title: 'True/False/Not Given strategy', tag: 'reading', date: 'Yesterday',
    content: 'Key rule: Not Given = no information in the passage.\n\nStep 1 — Read the statement carefully\nStep 2 — Scan for keywords in the passage\nStep 3 — Compare what the passage says\nStep 4 — If nothing confirms OR denies it — choose Not Given' },
  { id: 3, title: 'Common grammar mistakes', tag: 'grammar', date: '2 days ago',
    content: 'Subject-verb agreement:\n— "The number of students is..."\n— "A number of students are..."\n\nConditionals:\n— Type 1: If + present, will + infinitive\n— Type 2: If + past, would + infinitive' },
  { id: 4, title: 'Academic word list — top 20', tag: 'vocab', date: '3 days ago',
    content: '1. analyse  2. approach  3. assess  4. concept  5. constitute\n6. context  7. data  8. derive  9. establish  10. evident\n11. factor  12. function  13. identify  14. indicate  15. interpret\n16. involve  17. major  18. occur  19. require  20. significant' },
];

export const QUIZ_SETS: QuizSet[] = [
  {
    id: 'writing-1', skill: 'Writing', title: 'IELTS writing basics', desc: 'Identify Task 1 vs Task 2, format and structure.',
    level: 1, levelName: 'Prestructural', pts: 50, done: true,
    questions: [
      { q: 'IELTS Academic Writing Task 1 requires you to:', opts: ['Write an opinion essay','Describe visual information such as a chart','Write a letter','Summarise a reading passage'], ans: 1, exp: 'Task 1 Academic requires describing visual data — charts, graphs, diagrams or maps — in at least 150 words.' },
      { q: 'What is the minimum word count for Writing Task 2?', opts: ['150 words','200 words','250 words','300 words'], ans: 2, exp: 'Task 2 requires a minimum of 250 words. Writing less will result in a penalty.' },
    ],
  },
  {
    id: 'reading-1', skill: 'Reading', title: 'Reading task types', desc: 'Identify question types: MCQ, matching, T/F/NG.',
    level: 1, levelName: 'Prestructural', pts: 50, done: true,
    questions: [
      { q: 'IELTS Reading has how many passages?', opts: ['2','3','4','5'], ans: 1, exp: 'IELTS Academic Reading has 3 passages with 40 questions answered in 60 minutes.' },
      { q: "In True/False/Not Given, 'Not Given' means:", opts: ['The statement is false','The information is not in the passage','The writer disagrees','The statement is partially true'], ans: 1, exp: "'Not Given' means there is no information in the passage to confirm or contradict the statement." },
    ],
  },
  {
    id: 'writing-2', skill: 'Writing', title: 'Coherence & cohesion', desc: 'Define linking words, topic sentences, paragraph structure.',
    level: 2, levelName: 'Unistructural', pts: 100, done: true,
    questions: [
      { q: 'Which word best links two contrasting sentences?', opts: ['Moreover','However','Therefore','Similarly'], ans: 1, exp: "'However' introduces contrast. 'Moreover' adds, 'Therefore' shows result, 'Similarly' compares." },
      { q: 'A topic sentence in a body paragraph should:', opts: ['Summarise the whole essay','Introduce the main idea of that paragraph','Give a specific example','Conclude the argument'], ans: 1, exp: 'The topic sentence states the main point of the paragraph, guiding the reader.' },
    ],
  },
  {
    id: 'reading-2', skill: 'Reading', title: 'Skimming & scanning', desc: 'Apply reading strategies to locate specific information.',
    level: 2, levelName: 'Unistructural', pts: 100, done: false,
    questions: [
      { q: 'Skimming a passage means:', opts: ['Reading every word carefully','Quickly reading for the general idea','Looking for specific facts only','Ignoring the headings'], ans: 1, exp: 'Skimming means reading quickly to understand the general topic and structure.' },
      { q: 'Scanning is best used when:', opts: ['You want to understand the whole text','You are looking for a specific piece of information','You need to analyse the argument','You are reading for pleasure'], ans: 1, exp: 'Scanning means moving your eyes quickly to find specific information, like a name or date.' },
    ],
  },
  {
    id: 'listening-1', skill: 'Listening', title: 'Listening format', desc: 'Identify the 4 sections and what to expect in each.',
    level: 1, levelName: 'Prestructural', pts: 50, done: false,
    questions: [
      { q: 'How many sections does the IELTS Listening test have?', opts: ['2','3','4','5'], ans: 2, exp: 'The IELTS Listening test has 4 sections, each with 10 questions, totalling 40.' },
      { q: 'In the Listening test, you hear each recording:', opts: ['Twice','Once only','Three times','As many times as needed'], ans: 1, exp: 'Each recording is played once only. You must listen carefully.' },
    ],
  },
  {
    id: 'writing-3', skill: 'Writing', title: 'Task 2 — argument essay', desc: 'Connect ideas, build arguments, evaluate band criteria.',
    level: 3, levelName: 'Multistructural', pts: 150, done: false,
    questions: [
      { q: "What does 'coherence' primarily refer to in IELTS Writing?", opts: ['Correct spelling and grammar','Logical flow and organisation of ideas','Use of complex vocabulary','Length of the essay'], ans: 1, exp: 'Coherence refers to how logically ideas are organised and connected throughout the essay.' },
      { q: 'Which linking phrase best introduces a contrasting idea?', opts: ['Furthermore','In addition','Nevertheless','As a result'], ans: 2, exp: "'Nevertheless' signals contrast. 'Furthermore' and 'In addition' add ideas." },
      { q: 'A Band 7 essay in Task Response must:', opts: ['Answer only part of the task','Present a clear position with well-developed ideas','Use only simple vocabulary','Be exactly 250 words'], ans: 1, exp: 'Band 7 requires a clear, relevant position with well-extended and supported ideas.' },
    ],
  },
];
