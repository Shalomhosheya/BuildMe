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
  {
  id: 'speaking-1',
  skill: 'Speaking',
  title: 'IELTS Speaking — Hobbies',
  desc: 'Practice common speaking questions about hobbies and leisure activities.',
  level: 1,
  levelName: 'Prestructural',
  pts: 50,
  done: false,
  questions: [
    {
      q: 'Why do people have hobbies?',
      opts: [
        'To waste time',
        'To relax and enjoy free time',
        'To avoid work',
        'To compete with others'
      ],
      ans: 1,
      exp: 'Hobbies help people relax, reduce stress, and enjoy their free time effectively.'
    },
    {
      q: 'What is the main purpose of hobbies?',
      opts: [
        'To earn money',
        'To improve physical strength only',
        'To provide enjoyment and personal satisfaction',
        'To impress others'
      ],
      ans: 2,
      exp: 'Hobbies are mainly for personal enjoyment and satisfaction, not necessarily for money or competition.'
    },
    {
      q: 'In IELTS Speaking Part 2, what should you do?',
      opts: [
        'Give one-word answers',
        'Speak for 1-2 minutes on a topic',
        'Write an essay',
        'Answer multiple choice questions'
      ],
      ans: 1,
      exp: 'Part 2 requires speaking continuously for 1–2 minutes using a cue card.'
    }
  ]
},
{
  id: 'speaking-2',
  skill: 'Speaking',
  title: 'Speaking — Expressing Opinions',
  desc: 'Develop reasoning and justification skills.',
  level: 2,
  levelName: 'Unistructural',
  pts: 100,
  done: false,
  questions: [
    {
      q: 'What does a good IELTS Speaking answer include?',
      opts: [
        'Only short answers',
        'Clear ideas with explanation and examples',
        'Memorized sentences only',
        'Grammar rules only'
      ],
      ans: 1,
      exp: 'A strong answer includes ideas, explanations, and sometimes examples.'
    },
    {
      q: 'Why is it important to encourage children to have hobbies?',
      opts: [
        'To make them busy only',
        'To develop skills and confidence',
        'To reduce school time',
        'To avoid studying'
      ],
      ans: 1,
      exp: 'Hobbies help children build skills, confidence, and discover talents.'
    },
    {
      q: 'What is the best way to answer opinion questions?',
      opts: [
        'Say yes or no only',
        'Give opinion + reason + example',
        'Avoid answering',
        'Repeat the question'
      ],
      ans: 1,
      exp: 'The best structure is: Opinion → Reason → Example.'
    }
  ]
},

{
  id: 'speaking-3',
  skill: 'Speaking',
  title: 'Speaking — Advanced Discussion',
  desc: 'Handle abstract and analytical questions.',
  level: 3,
  levelName: 'Multistructural',
  pts: 150,
  done: false,
  questions: [
    {
      q: 'What is expected in IELTS Speaking Part 3?',
      opts: [
        'Simple yes/no answers',
        'Deep discussion with reasoning',
        'Reading a passage',
        'Writing answers'
      ],
      ans: 1,
      exp: 'Part 3 focuses on deeper discussion, opinions, and analysis.'
    },
    {
      q: 'How can you improve fluency in speaking?',
      opts: [
        'Memorizing answers only',
        'Practicing regularly and speaking naturally',
        'Avoiding mistakes completely',
        'Speaking very fast'
      ],
      ans: 1,
      exp: 'Fluency improves with regular practice and natural speaking.'
    },
    {
      q: 'What makes a response “coherent” in speaking?',
      opts: [
        'Using long words only',
        'Logical flow of ideas',
        'Speaking loudly',
        'Using slang'
      ],
      ans: 1,
      exp: 'Coherence means ideas are logically connected and easy to follow.'
    }
  ]
},

{
  id: 'speaking-1',
  skill: 'Speaking',
  title: 'IELTS Speaking — Hobbies',
  desc: 'Practice speaking',
  level: 1,
  levelName: 'Unistructural',
  pts: 50,
  done: false,

  questions: [
    {
      q: 'Why do people have hobbies?',
      opts: [
        'To waste time',
        'To relax and enjoy free time',
        'To avoid work',
        'To compete'
      ],
      ans: 1,
      exp: 'Hobbies help people relax and enjoy their free time.'
    },
    {
      q: 'Is it important to have hobbies?',
      opts: [
        'No',
        'Yes, for mental health',
        'Only for children',
        'Only for athletes'
      ],
      ans: 1,
      exp: 'Hobbies are important because they improve mental health and reduce stress.'
    },
    {
      q: 'What is your favorite hobby?',
      opts: [
        'I don’t have any hobbies',
        'Playing video games',
        'Reading books and listening to music',
        'Sleeping all day'
      ],
      ans: 2,
      exp: 'A good answer could be: "My favorite hobby is reading books and listening to music because they help me relax."'
    },
    {
      q: 'How much time do you spend on your hobbies?',
      opts: [
        'I never do hobbies',
        'Very little, maybe once a month',
        'About 1-2 hours every day',
        'More than 10 hours a day'
      ],
      ans: 2,
      exp: 'A natural IELTS answer is around 1-2 hours daily or on weekends.'
    },
    {
      q: 'Did you have the same hobbies when you were a child?',
      opts: [
        'Yes, exactly the same',
        'No, my hobbies have changed a lot',
        'I had no hobbies as a child',
        'Children should not have hobbies'
      ],
      ans: 1,
      exp: 'Most people say their hobbies have changed since childhood.'
    },
    {
      q: 'Do you think hobbies are different for men and women?',
      opts: [
        'Yes, completely different',
        'Some hobbies are more popular with one gender',
        'No, hobbies are the same for everyone',
        'Only men should have hobbies'
      ],
      ans: 1,
      exp: 'It is acceptable to say some hobbies are more common among men or women.'
    },
    {
      q: 'What hobbies are popular in your country?',
      opts: [
        'Only studying and working',
        'Playing sports, watching movies, and using social media',
        'No one has hobbies in my country',
        'Only cooking'
      ],
      ans: 1,
      exp: 'Common hobbies include sports, watching films, photography, and social media.'
    },
    {
      q: 'Can hobbies help people in their studies or work?',
      opts: [
        'No, they are a waste of time',
        'Yes, they help reduce stress and improve creativity',
        'Only for rich people',
        'Hobbies make people lazy'
      ],
      ans: 1,
      exp: 'Hobbies can reduce stress and boost creativity, which helps in studies and work.'
    },
    {
      q: 'Would you like to turn your hobby into a job?',
      opts: [
        'Yes, definitely',
        'No, I want to keep it as a hobby',
        'I don’t have any hobby',
        'Only if it pays a lot of money'
      ],
      ans: 1,
      exp: 'Many people prefer to keep their hobby separate from work to enjoy it more.'
    },
    {
      q: 'Do you think people have enough time for hobbies nowadays?',
      opts: [
        'Yes, everyone has plenty of time',
        'No, people are too busy with work and study',
        'Only retired people have time',
        'Hobbies are not necessary'
      ],
      ans: 1,
      exp: 'In modern life, many people complain they don’t have enough free time for hobbies.'
    }
  ]
},
{
  id: 'speaking-1',
  skill: 'Speaking',
  title: 'IELTS Speaking — Hobbies',
  desc: 'Practice speaking',
  level: 1,
  levelName: 'Prestructural',
  pts: 50,
  done: false,

  questions: [
    // Prestructural (Original + simple)
    {
      q: 'Why do people have hobbies?',
      opts: [
        'To waste time',
        'To relax and enjoy free time',
        'To avoid work',
        'To compete'
      ],
      ans: 1,
      exp: 'Hobbies help people relax and enjoy their free time.'
    },
    {
      q: 'Is it important to have hobbies?',
      opts: [
        'No',
        'Yes, for mental health',
        'Only for children',
        'Only for athletes'
      ],
      ans: 1,
      exp: 'Hobbies are important because they improve mental health and reduce stress.'
    },

    // Unistructural Level (Simple single ideas)
    {
      q: 'What is your favorite hobby?',
      opts: [
        'I don’t have any hobbies',
        'Playing video games',
        'Reading books and listening to music',
        'Sleeping all day'
      ],
      ans: 2,
      exp: 'A good simple answer: "My favorite hobby is reading books and listening to music."'
    },
    {
      q: 'How often do you do your hobby?',
      opts: [
        'Never',
        'Once a year',
        'Every day or almost every day',
        'Only on my birthday'
      ],
      ans: 2,
      exp: 'You can say you do your hobby every day or on weekends.'
    },
    {
      q: 'When did you start this hobby?',
      opts: [
        'I started it last week',
        'When I was a child',
        'I have never started any hobby',
        'Only after getting a job'
      ],
      ans: 1,
      exp: 'Many people start hobbies during childhood.'
    },
    {
      q: 'Do you prefer doing hobbies alone or with others?',
      opts: [
        'Only with others',
        'I prefer doing them alone',
        'I don’t like hobbies',
        'Only with family'
      ],
      ans: 1,
      exp: 'It is fine to say you prefer doing hobbies alone or with friends.'
    },

    // Multistructural Level (Combining ideas - more developed)
    {
      q: 'How has your hobby changed since you were a child?',
      opts: [
        'It is exactly the same',
        'My hobbies have changed a lot. Now I prefer more relaxing activities.',
        'I had no hobbies as a child',
        'Children should not have hobbies'
      ],
      ans: 1,
      exp: 'Good answer combines past and present: "When I was a child I played outdoor games, but now I enjoy reading and photography."'
    },
    {
      q: 'What benefits do you get from your hobby?',
      opts: [
        'No benefits at all',
        'It helps me relax, reduce stress, and learn new things',
        'It makes me tired',
        'Only helps me waste time'
      ],
      ans: 1,
      exp: 'Hobbies can help you relax, reduce stress, improve creativity, and sometimes learn new skills.'
    },
    {
      q: 'Do you think people today have enough time for hobbies?',
      opts: [
        'Yes, plenty of time',
        'No, most people are too busy with work and study',
        'Only rich people have time',
        'Hobbies are not important'
      ],
      ans: 1,
      exp: 'In modern life, many people say they don’t have enough free time because of busy schedules.'
    },
    {
      q: 'Can hobbies help a person in their studies or job?',
      opts: [
        'No, they are a waste of time',
        'Yes, they reduce stress and increase creativity',
        'Only for children',
        'Hobbies make people lazy'
      ],
      ans: 1,
      exp: 'Hobbies can reduce stress and improve creativity, which helps performance in studies or work.'
    },
    {
      q: 'Would you like to turn your hobby into a full-time job?',
      opts: [
        'Yes, I want to make money from it',
        'No, I prefer to keep it as a hobby for enjoyment',
        'I don’t have any hobby',
        'Only if it is easy'
      ],
      ans: 1,
      exp: 'Many people prefer to keep their hobby separate so they can enjoy it without pressure.'
    },

    // More Multistructural Questions
    {
      q: 'What kinds of hobbies are popular among young people in your country?',
      opts: [
        'Only studying',
        'Playing sports, watching movies, gaming, and using social media',
        'No hobbies are popular',
        'Only sleeping'
      ],
      ans: 1,
      exp: 'Popular hobbies among youth include sports, online gaming, photography, and social media.'
    },
    {
      q: 'Do you think hobbies are different for different age groups?',
      opts: [
        'No difference at all',
        'Yes, young people like active hobbies while older people prefer calm ones',
        'Only children should have hobbies',
        'Age does not matter'
      ],
      ans: 1,
      exp: 'Young people often enjoy energetic hobbies, while older people may prefer reading or gardening.'
    },
    {
      q: 'How do hobbies help people socially?',
      opts: [
        'They don’t help at all',
        'They help people make new friends and improve communication skills',
        'Hobbies make people lonely',
        'Only for introverts'
      ],
      ans: 1,
      exp: 'Hobbies like sports or clubs help people meet others and build friendships.'
    },
    {
      q: 'Is it better to have one hobby or many hobbies?',
      opts: [
        'Only one is enough',
        'Having several hobbies is better because it brings more variety and skills',
        'Too many hobbies are confusing',
        'No need for any hobby'
      ],
      ans: 1,
      exp: 'Having multiple hobbies gives more balance and helps develop different skills.'
    },
    {
      q: 'Do you think schools should teach students about hobbies?',
      opts: [
        'No, schools should only focus on exams',
        'Yes, schools should encourage students to develop hobbies',
        'Only for rich schools',
        'Hobbies are not serious'
      ],
      ans: 1,
      exp: 'Schools should encourage hobbies to help students develop well-rounded personalities.'
    },
    {
      q: 'What is the difference between a hobby and a sport?',
      opts: [
        'They are exactly the same',
        'A hobby is for enjoyment, while a sport is usually competitive',
        'Sports are not hobbies',
        'Only professionals have sports'
      ],
      ans: 1,
      exp: 'Hobbies are done for fun and relaxation, while sports often involve competition and rules.'
    },
    {
      q: 'Will your hobbies change in the future?',
      opts: [
        'No, they will stay the same forever',
        'Probably yes, as I grow older my interests may change',
        'I will stop all hobbies',
        'Future does not matter'
      ],
      ans: 1,
      exp: 'It is natural for hobbies to change as people’s lifestyles and interests evolve.'
    }
  ]
},
{
  "id": "reading-writing-1",
  "skill": "Reading & Writing",
  "title": "IELTS Reading & Writing — Hobbies",
  "desc": "Practice reading comprehension and writing about hobbies",
  "level": 1,
  "levelName": "Prestructural",
  "pts": 50,
  "done": false,
  "questions": [
    // Prestructural (Basic understanding)
    {
      "q": "What is a hobby?",
      "opts": [
        "A job that you do for money",
        "An activity you enjoy doing in your free time",
        "Something you must do every day",
        "Only sports activities"
      ],
      "ans": 1,
      "exp": "A hobby is an activity that a person enjoys doing during their free time for pleasure and relaxation."
    },
    {
      "q": "Why do people enjoy hobbies?",
      "opts": [
        "To make more money",
        "To relax, reduce stress, and feel happy",
        "Only to win competitions",
        "To avoid sleeping"
      ],
      "ans": 1,
      "exp": "People enjoy hobbies because they help them relax, reduce stress, and bring happiness."
    },

    // Unistructural (Simple single ideas)
    {
      "q": "Which of these is an example of a common hobby?",
      "opts": [
        "Working overtime in the office",
        "Reading books",
        "Cleaning the house every hour",
        "Attending meetings"
      ],
      "ans": 1,
      "exp": "Reading books is a very common and popular hobby."
    },
    {
      "q": "What is one benefit of having a hobby?",
      "opts": [
        "It makes you more tired",
        "It improves mental health and reduces stress",
        "It wastes your time",
        "It makes you forget everything"
      ],
      "ans": 1,
      "exp": "One major benefit of hobbies is that they improve mental health and help reduce stress."
    },
    {
      "q": "When do most people usually do their hobbies?",
      "opts": [
        "During working hours",
        "In their free time or on weekends",
        "Only at midnight",
        "During exams"
      ],
      "ans": 1,
      "exp": "Most people do their hobbies in their free time, especially on weekends or evenings."
    },

    // Multistructural (Combining ideas - more developed answers)
    {
      "q": "How can hobbies help students?",
      "opts": [
        "They make students lazy",
        "They help students relax, reduce study stress, and improve creativity",
        "They are not useful for students",
        "They only help athletes"
      ],
      "ans": 1,
      "exp": "Hobbies help students by reducing stress from studies and improving creativity and focus."
    },
    {
      "q": "What is the difference between a hobby and a job?",
      "opts": [
        "There is no difference",
        "A hobby is done for enjoyment and relaxation, while a job is done for money",
        "A job is always more fun",
        "Hobbies are only for children"
      ],
      "ans": 1,
      "exp": "The main difference is that a hobby is for personal enjoyment, while a job is mainly for earning money."
    },
    {
      "q": "Why do many people say they don’t have time for hobbies?",
      "opts": [
        "Because they sleep too much",
        "Because they are very busy with work, studies, and daily responsibilities",
        "Because hobbies are boring",
        "Because they don’t like relaxing"
      ],
      "ans": 1,
      "exp": "In modern life, many people feel they don’t have enough time for hobbies due to busy work and study schedules."
    },
    {
      "q": "Is it good to turn your hobby into a job? Why?",
      "opts": [
        "Yes, always",
        "It depends. Some people prefer to keep it as a hobby so they can enjoy it without pressure",
        "No, hobbies should never become jobs",
        "Only if the hobby is cooking"
      ],
      "ans": 1,
      "exp": "Many people prefer to keep their hobby separate from work so they can enjoy it freely without stress or deadlines."
    },

    // Higher Multistructural Questions
    {
      "q": "What kinds of hobbies are popular in your country?",
      "opts": [
        "Only watching TV",
        "Playing cricket, watching movies, listening to music, and using social media",
        "Only studying 24 hours",
        "No one has hobbies"
      ],
      "ans": 1,
      "exp": "In many countries including Sri Lanka, popular hobbies include playing cricket, watching movies, listening to music, photography, and gardening."
    },
    {
      "q": "Do hobbies help people make friends?",
      "opts": [
        "No, they make people lonely",
        "Yes, hobbies like sports clubs or music groups help people meet others and make new friends",
        "Only online hobbies help",
        "Hobbies have no social benefit"
      ],
      "ans": 1,
      "exp": "Hobbies help people socially because joining clubs or groups allows them to meet like-minded people and build friendships."
    },
    {
      "q": "Should parents encourage children to have hobbies?",
      "opts": [
        "No, children should only study",
        "Yes, hobbies help children develop creativity, confidence, and social skills",
        "Only if the hobby is expensive",
        "Hobbies are a waste of time for children"
      ],
      "ans": 1,
      "exp": "Parents should encourage hobbies because they help children become more creative, confident, and well-rounded."
    },
    {
      "q": "How can schools help students develop hobbies?",
      "opts": [
        "By giving more homework",
        "By organizing clubs, art classes, sports, and music activities",
        "By cancelling all breaks",
        "Schools should not help with hobbies"
      ],
      "ans": 1,
      "exp": "Schools can help by creating clubs for sports, music, art, photography, and other activities."
    },
    {
      "q": "Will people’s hobbies change as they grow older?",
      "opts": [
        "No, hobbies never change",
        "Yes, young people often prefer active hobbies while older people may prefer calmer activities like reading or gardening",
        "Everyone has the same hobbies forever",
        "Old people don’t need hobbies"
      ],
      "ans": 1,
      "exp": "Yes, hobbies usually change with age. Young people like energetic activities, while older adults often choose more relaxing hobbies."
    }
  ]
},
{
  "id": "reading-writing-1",
  "skill": "Reading & Writing",
  "title": "IELTS Reading & Writing — Hobbies",
  "desc": "Practice reading comprehension and writing about hobbies",
  "level": 1,
  "levelName": "Prestructural",
  "pts": 80,
  "done": false,
  "questions": [
    // Prestructural - Very Basic
    {
      "q": "What is a hobby?",
      "opts": [
        "A job that you do for money",
        "An activity you enjoy doing in your free time",
        "Something you must do every day",
        "Only sports activities"
      ],
      "ans": 1,
      "exp": "A hobby is an activity that a person enjoys doing during their free time for pleasure and relaxation."
    },
    {
      "q": "Why do people have hobbies?",
      "opts": [
        "To waste time",
        "To relax and enjoy their free time",
        "To avoid their family",
        "To become famous"
      ],
      "ans": 1,
      "exp": "People have hobbies to relax and enjoy their free time."
    },
    {
      "q": "Is having a hobby important?",
      "opts": [
        "No, it is not important",
        "Yes, it is important for mental health and happiness",
        "Only important for children",
        "Only important for rich people"
      ],
      "ans": 1,
      "exp": "Yes, hobbies are important because they improve mental health and reduce stress."
    },

    // Unistructural - Simple single ideas
    {
      "q": "Which of these is a popular hobby?",
      "opts": [
        "Working 12 hours a day",
        "Listening to music",
        "Attending meetings",
        "Doing homework all day"
      ],
      "ans": 1,
      "exp": "Listening to music is a very popular and common hobby."
    },
    {
      "q": "When do people usually do their hobbies?",
      "opts": [
        "During office or school hours",
        "In their free time, evenings, or weekends",
        "Only on their birthday",
        "Never"
      ],
      "ans": 1,
      "exp": "People usually do their hobbies in their free time, especially in the evenings or on weekends."
    },
    {
      "q": "What is one simple benefit of hobbies?",
      "opts": [
        "They make you very tired",
        "They help you relax and feel happy",
        "They waste your money",
        "They make you forget your studies"
      ],
      "ans": 1,
      "exp": "One simple benefit is that hobbies help you relax and feel happy."
    },
    {
      "q": "Do you need special equipment for all hobbies?",
      "opts": [
        "Yes, always",
        "No, some hobbies like reading or walking need very little or no equipment",
        "Only expensive hobbies need equipment",
        "All hobbies need a computer"
      ],
      "ans": 1,
      "exp": "No, many hobbies like reading, walking, or singing need very little equipment."
    },

    // Multistructural - Combining ideas (more developed)
    {
      "q": "How can hobbies help a student’s studies?",
      "opts": [
        "They make students lazy and waste time",
        "They reduce stress and improve creativity, which helps in studies",
        "They are not useful for students",
        "Only sports help studies"
      ],
      "ans": 1,
      "exp": "Hobbies reduce stress from studies and improve creativity and concentration."
    },
    {
      "q": "What is the main difference between a hobby and a job?",
      "opts": [
        "They are the same",
        "A hobby is done for enjoyment, while a job is done mainly for money",
        "A job is always more enjoyable",
        "Hobbies are only for old people"
      ],
      "ans": 1,
      "exp": "The main difference is that a hobby is for personal enjoyment and relaxation, while a job is for earning money."
    },
    {
      "q": "Why do many people today have less time for hobbies?",
      "opts": [
        "Because they sleep too much",
        "Because they are busy with work, studies, and family responsibilities",
        "Because hobbies are boring",
        "Because they don’t like free time"
      ],
      "ans": 1,
      "exp": "Many people today have less time for hobbies because of busy work schedules, studies, and daily responsibilities."
    },
    {
      "q": "Should parents encourage their children to have hobbies?",
      "opts": [
        "No, children should only study",
        "Yes, hobbies help children become more creative, confident, and happy",
        "Only if the hobby is very cheap",
        "Hobbies are a waste of time"
      ],
      "ans": 1,
      "exp": "Yes, parents should encourage hobbies because they help children develop creativity, confidence, and social skills."
    },
    {
      "q": "Can hobbies help people make new friends?",
      "opts": [
        "No, hobbies make people lonely",
        "Yes, hobbies like sports, music, or photography clubs help people meet others and make friends",
        "Only online hobbies help",
        "Hobbies have no social benefit"
      ],
      "ans": 1,
      "exp": "Yes, hobbies help people socially by allowing them to meet like-minded people and build friendships."
    },

    // More Multistructural Questions
    {
      "q": "What kinds of hobbies are popular among young people in many countries?",
      "opts": [
        "Only studying all day",
        "Playing sports, gaming, watching movies, listening to music, and using social media",
        "Only sleeping",
        "No hobbies are popular"
      ],
      "ans": 1,
      "exp": "Popular hobbies among young people include playing sports, video gaming, watching movies, listening to music, and social media activities."
    },
    {
      "q": "Do hobbies change as people get older?",
      "opts": [
        "No, they stay exactly the same forever",
        "Yes, young people often like active hobbies while older people prefer calmer activities like reading or gardening",
        "Everyone has the same hobbies all their life",
        "Old people stop all hobbies"
      ],
      "ans": 1,
      "exp": "Yes, hobbies often change with age. Young people prefer energetic hobbies, while older people enjoy more relaxing ones."
    },
    {
      "q": "Is it better to have one hobby or several hobbies?",
      "opts": [
        "Only one hobby is enough",
        "Having several hobbies is better because it gives more variety and develops different skills",
        "Too many hobbies are bad",
        "No need for any hobby"
      ],
      "ans": 1,
      "exp": "Having several hobbies is usually better as it brings variety, balance, and helps develop different skills."
    },
    {
      "q": "Can a hobby ever become a job?",
      "opts": [
        "Never possible",
        "Yes, sometimes people turn their hobby into a career, but many prefer to keep it separate for enjoyment",
        "All hobbies should become jobs",
        "Only bad hobbies become jobs"
      ],
      "ans": 1,
      "exp": "Yes, some people successfully turn their hobby into a job, but many prefer to keep it as a hobby to enjoy it without work pressure."
    },
    {
      "q": "How can schools help students develop good hobbies?",
      "opts": [
        "By giving more exams and homework",
        "By organizing sports clubs, art classes, music groups, and other activities",
        "By stopping all breaks",
        "Schools should not help with hobbies"
      ],
      "ans": 1,
      "exp": "Schools can help by creating different clubs and activities such as sports, art, music, drama, and photography."
    },
    {
      "q": "What are the benefits of doing hobbies with other people?",
      "opts": [
        "There are no benefits",
        "It helps improve communication skills and makes the activity more enjoyable",
        "It always creates problems",
        "Only alone is better"
      ],
      "ans": 1,
      "exp": "Doing hobbies with others improves communication skills, builds friendships, and makes the activity more fun."
    },
    {
      "q": "Do you think technology has changed people’s hobbies?",
      "opts": [
        "No, hobbies are the same",
        "Yes, many people now spend time on online gaming, social media, and watching videos instead of outdoor activities",
        "Technology has no effect on hobbies",
        "Technology only destroys hobbies"
      ],
      "ans": 1,
      "exp": "Yes, technology has changed hobbies a lot. Many young people now enjoy online gaming and social media more than traditional outdoor hobbies."
    }
  ]
},
{
  "id": "reading-writing-hobbies-expanded",
  "skill": "Reading & Writing",
  "title": "IELTS Reading & Writing — Hobbies",
  "desc": "Extensive practice for reading comprehension and writing about hobbies and leisure activities",
  "level": 1,
  "levelName": "Prestructural",
  "pts": 100,
  "done": false,
  "questions": [
    // Prestructural - Very Basic
    {
      "q": "What is a hobby?",
      "opts": [
        "A job that you do to earn money",
        "An activity you enjoy doing in your free time",
        "Something you do only at school",
        "A competition you must win"
      ],
      "ans": 1,
      "exp": "A hobby is an activity that a person enjoys doing during their free time for pleasure and relaxation."
    },
    {
      "q": "Why do people have hobbies?",
      "opts": [
        "To waste their time",
        "To relax and enjoy their free time",
        "Only to make money",
        "To avoid talking to others"
      ],
      "ans": 1,
      "exp": "People have hobbies to relax, reduce stress, and enjoy their free time."
    },
    {
      "q": "Is it important to have hobbies?",
      "opts": [
        "No, they are not important",
        "Yes, they are important for mental health and happiness",
        "Only important for children",
        "Only important for rich people"
      ],
      "ans": 1,
      "exp": "Yes, hobbies are important because they improve mental health, reduce stress, and bring happiness."
    },

    // Unistructural - Simple single ideas
    {
      "q": "Which of these is an example of a hobby?",
      "opts": [
        "Working long hours in an office",
        "Reading books or listening to music",
        "Attending meetings every day",
        "Doing homework all night"
      ],
      "ans": 1,
      "exp": "Reading books and listening to music are popular hobbies."
    },
    {
      "q": "When do people usually do their hobbies?",
      "opts": [
        "During work or school hours",
        "In their free time, evenings, or weekends",
        "Only on their birthday",
        "Never, because they are busy"
      ],
      "ans": 1,
      "exp": "People usually do their hobbies in their free time, especially evenings or weekends."
    },
    {
      "q": "What is one benefit of having a hobby?",
      "opts": [
        "It makes you feel more tired",
        "It helps you relax and feel happy",
        "It wastes your money",
        "It stops you from studying"
      ],
      "ans": 1,
      "exp": "One benefit is that hobbies help people relax and feel happy."
    },
    {
      "q": "Do all hobbies need expensive equipment?",
      "opts": [
        "Yes, all hobbies are expensive",
        "No, some hobbies like reading or walking need very little equipment",
        "Only sports need equipment",
        "All hobbies need a computer"
      ],
      "ans": 1,
      "exp": "No, many hobbies need very little or no special equipment."
    },

    // Multistructural - Combining ideas with reasons
    {
      "q": "How can hobbies help students?",
      "opts": [
        "They make students lazy",
        "They reduce stress from studies and improve creativity",
        "They are not useful for students",
        "Only sports help students"
      ],
      "ans": 1,
      "exp": "Hobbies help students by reducing stress and improving creativity and concentration."
    },
    {
      "q": "What is the main difference between a hobby and a job?",
      "opts": [
        "They are exactly the same",
        "A hobby is done for enjoyment, while a job is done mainly for money",
        "Jobs are always more fun than hobbies",
        "Hobbies are only for old people"
      ],
      "ans": 1,
      "exp": "A hobby is for personal enjoyment and relaxation, while a job is mainly for earning money."
    },
    {
      "q": "Why do many people today have less time for hobbies?",
      "opts": [
        "Because they sleep too much",
        "Because they are busy with work, studies, and family responsibilities",
        "Because hobbies are boring",
        "Because they don’t like relaxing"
      ],
      "ans": 1,
      "exp": "Many people have less time for hobbies due to busy schedules with work, studies, and daily responsibilities."
    },
    {
      "q": "Should parents encourage children to have hobbies?",
      "opts": [
        "No, children should only study",
        "Yes, hobbies help children develop creativity, confidence, and social skills",
        "Only if the hobby is very cheap",
        "Hobbies are a waste of time for children"
      ],
      "ans": 1,
      "exp": "Yes, parents should encourage hobbies because they help children become more creative, confident, and well-rounded."
    },
    {
      "q": "Can hobbies help people make new friends?",
      "opts": [
        "No, hobbies make people lonely",
        "Yes, hobbies like sports or music clubs help people meet others and build friendships",
        "Only online hobbies help",
        "Hobbies have no social benefit"
      ],
      "ans": 1,
      "exp": "Yes, hobbies help socially by allowing people to meet like-minded people and make friends."
    },
    {
      "q": "What kinds of hobbies are popular among young people?",
      "opts": [
        "Only studying all day",
        "Playing sports, gaming, watching movies, listening to music, and using social media",
        "Only sleeping",
        "No hobbies are popular today"
      ],
      "ans": 1,
      "exp": "Popular hobbies among young people include sports, video gaming, watching movies, music, and social media."
    },

    // More advanced Multistructural questions
    {
      "q": "Do hobbies change as people get older?",
      "opts": [
        "No, they stay the same forever",
        "Yes, young people often prefer active hobbies while older people prefer calmer ones like reading or gardening",
        "Everyone has the same hobbies all their life",
        "Older people do not need hobbies"
      ],
      "ans": 1,
      "exp": "Yes, hobbies often change with age. Young people like energetic activities, while older people enjoy more relaxing ones."
    },
    {
      "q": "Is it better to have one hobby or several hobbies?",
      "opts": [
        "Only one hobby is enough",
        "Having several hobbies is better because it gives variety and develops different skills",
        "Too many hobbies are confusing",
        "No need for any hobbies"
      ],
      "ans": 1,
      "exp": "Having several hobbies is usually better as it brings balance and helps develop different skills."
    },
    {
      "q": "Is it good to turn a hobby into a job?",
      "opts": [
        "Yes, everyone should do this",
        "It depends. Many people prefer to keep their hobby separate for pure enjoyment without pressure",
        "Hobbies should never become jobs",
        "Only easy hobbies should become jobs"
      ],
      "ans": 1,
      "exp": "Many people prefer to keep their hobby as a hobby so they can enjoy it without work stress or deadlines."
    },
    {
      "q": "How can schools help students develop hobbies?",
      "opts": [
        "By giving more homework",
        "By organizing sports clubs, art classes, music groups, and other activities",
        "By stopping all breaks and free time",
        "Schools should not help with hobbies"
      ],
      "ans": 1,
      "exp": "Schools can help by creating clubs for sports, art, music, drama, and photography."
    },
    {
      "q": "Has technology changed people’s hobbies?",
      "opts": [
        "No, hobbies are the same as before",
        "Yes, many people now spend time on online gaming, social media, and videos instead of outdoor activities",
        "Technology has destroyed all hobbies",
        "Technology only helps traditional hobbies"
      ],
      "ans": 1,
      "exp": "Yes, technology has changed hobbies. Many young people now enjoy digital activities more than traditional outdoor ones."
    },
    {
      "q": "Do you think spending too much time on a hobby can be harmful?",
      "opts": [
        "No, it is never harmful",
        "Yes, too much time on a hobby may affect studies, work, or health negatively",
        "Only expensive hobbies are harmful",
        "All hobbies are always good"
      ],
      "ans": 1,
      "exp": "Yes, spending excessive time on a hobby can have negative effects on studies, work, or personal health."
    },
    {
      "q": "Why do some people prefer to do hobbies alone?",
      "opts": [
        "Because they hate people",
        "Because it helps them relax and enjoy personal time without pressure",
        "Because hobbies are only for introverts",
        "Because group hobbies are not possible"
      ],
      "ans": 1,
      "exp": "Some people prefer doing hobbies alone because it allows them to relax and enjoy personal time."
    },
    {
      "q": "What hobbies were more common in the past than now?",
      "opts": [
        "Online gaming and social media",
        "Traditional activities like knitting, gardening, or painting",
        "Video games and watching Netflix",
        "No hobbies existed in the past"
      ],
      "ans": 1,
      "exp": "Traditional hobbies like knitting, gardening, and painting were more common in the past."
    },
    {
      "q": "Is it important to encourage children to take up hobbies?",
      "opts": [
        "No, children should only focus on studies",
        "Yes, hobbies help children develop creativity, social skills, and a balanced personality",
        "Only if the hobby is academic",
        "Hobbies are not serious for children"
      ],
      "ans": 1,
      "exp": "Yes, encouraging hobbies helps children become more creative, confident, and well-rounded."
    }
  ]
},{
  "id": "reading-hobbies-1",
  "skill": "Reading",
  "title": "IELTS Reading — Hobbies",
  "desc": "Practice reading comprehension on hobbies and leisure activities",
  "level": 1,
  "levelName": "Prestructural",
  "pts": 80,
  "done": false,
  "questions": [
    // Prestructural - Very Basic
    {
      "q": "What is a hobby?",
      "opts": [
        "A paid job or profession",
        "An activity done for pleasure in free time",
        "Something done only at school",
        "A competitive sport"
      ],
      "ans": 1,
      "exp": "A hobby is an activity that someone does regularly for pleasure and relaxation during their leisure time."
    },
    {
      "q": "What does 'leisure time' mean?",
      "opts": [
        "Time spent working",
        "Free time away from work or responsibilities",
        "Time for sleeping",
        "Time for studying"
      ],
      "ans": 1,
      "exp": "Leisure time is free time used for relaxation and enjoyment."
    },
    {
      "q": "Which activity is an example of a hobby?",
      "opts": [
        "Attending meetings at work",
        "Reading books for enjoyment",
        "Doing homework",
        "Cooking only for family"
      ],
      "ans": 1,
      "exp": "Reading books for enjoyment is a common hobby."
    },

    // Unistructural - Simple single ideas
    {
      "q": "When do people usually do hobbies?",
      "opts": [
        "During working hours",
        "In their free time or on weekends",
        "Only during exams",
        "Never, because they are busy"
      ],
      "ans": 1,
      "exp": "People usually do hobbies in their free time, evenings, or weekends."
    },
    {
      "q": "What is one common benefit of hobbies?",
      "opts": [
        "They make people more stressed",
        "They help people relax and feel happy",
        "They waste money",
        "They stop personal growth"
      ],
      "ans": 1,
      "exp": "Hobbies help people relax and feel happy."
    },
    {
      "q": "Which hobby needs very little equipment?",
      "opts": [
        "Playing expensive video games",
        "Reading books or walking",
        "Collecting rare cars",
        "Skydiving"
      ],
      "ans": 1,
      "exp": "Reading books or walking needs very little or no special equipment."
    },
    {
      "q": "What is stamp collecting also called?",
      "opts": [
        "Philately",
        "Gardening",
        "Cooking",
        "Running"
      ],
      "ans": 0,
      "exp": "Stamp collecting is known as philately."
    },

    // Multistructural - Combining ideas with reasons
    {
      "q": "How do hobbies help students?",
      "opts": [
        "They make students lazy",
        "They reduce stress from studies and improve creativity",
        "They have no effect on studies",
        "They only help athletes"
      ],
      "ans": 1,
      "exp": "Hobbies reduce stress and improve creativity, which can help performance in studies."
    },
    {
      "q": "What is the main difference between a hobby and a job?",
      "opts": [
        "They are the same thing",
        "A hobby is for enjoyment, while a job is mainly for earning money",
        "Jobs are always relaxing",
        "Hobbies require more time than jobs"
      ],
      "ans": 1,
      "exp": "A hobby is done for personal pleasure, while a job is primarily for money."
    },
    {
      "q": "Why do many people have less time for hobbies today?",
      "opts": [
        "Because they sleep too much",
        "Because of busy work, study, and family responsibilities",
        "Because hobbies are not popular",
        "Because all hobbies are expensive"
      ],
      "ans": 1,
      "exp": "Busy schedules with work, studies, and responsibilities leave less free time."
    },
    {
      "q": "How can hobbies help people socially?",
      "opts": [
        "They always make people lonely",
        "They help people meet others and make new friends",
        "They have no social effect",
        "Only online hobbies help"
      ],
      "ans": 1,
      "exp": "Hobbies such as sports clubs or music groups allow people to meet like-minded people and build friendships."
    },
    {
      "q": "What kinds of hobbies are popular among young people?",
      "opts": [
        "Only studying",
        "Sports, gaming, watching movies, listening to music, and social media",
        "Only gardening",
        "No hobbies are popular"
      ],
      "ans": 1,
      "exp": "Popular hobbies among young people include playing sports, video gaming, watching movies, and using social media."
    },

    // More Multistructural Questions
    {
      "q": "Do hobbies usually change as people get older?",
      "opts": [
        "No, they stay exactly the same",
        "Yes, young people often prefer active hobbies while older people prefer calmer ones",
        "Everyone keeps the same hobbies forever",
        "Older people stop having hobbies"
      ],
      "ans": 1,
      "exp": "Hobbies often change with age — younger people like energetic activities, while older people may prefer reading or gardening."
    },
    {
      "q": "What is one educational benefit of stamp collecting?",
      "opts": [
        "It teaches nothing",
        "It provides facts about different countries, plants, animals, and famous people",
        "It only teaches mathematics",
        "It wastes time"
      ],
      "ans": 1,
      "exp": "Stamp collecting has educational value because it opens a window to other countries and what is shown on stamps."
    },
    {
      "q": "Is it better to have one hobby or several?",
      "opts": [
        "Only one is enough",
        "Several hobbies are better because they bring variety and different skills",
        "Too many hobbies cause confusion",
        "Hobbies should be limited to one"
      ],
      "ans": 1,
      "exp": "Having several hobbies provides more balance and helps develop a wider range of skills."
    },
    {
      "q": "How has technology changed hobbies?",
      "opts": [
        "It has had no effect",
        "Many people now prefer online gaming and social media over traditional outdoor activities",
        "Technology only supports old hobbies",
        "All hobbies have disappeared"
      ],
      "ans": 1,
      "exp": "Technology has shifted many hobbies toward digital activities like gaming and social media."
    },
    {
      "q": "Why do some people collect things as a hobby?",
      "opts": [
        "Only to make money",
        "For pleasure, organization, and sometimes educational value",
        "Because they have too much space",
        "To avoid social contact"
      ],
      "ans": 1,
      "exp": "Collecting provides pleasure, a sense of order, and can have educational benefits."
    },
    {
      "q": "What can happen if someone spends too much time on a hobby?",
      "opts": [
        "It is always positive",
        "It may negatively affect studies, work, or health",
        "It improves everything in life",
        "It has no negative effects"
      ],
      "ans": 1,
      "exp": "Excessive time on a hobby can sometimes harm studies, work, or personal health."
    },
    {
      "q": "Should schools encourage hobbies?",
      "opts": [
        "No, only exams matter",
        "Yes, through clubs for sports, art, music, and other activities",
        "Only for rich students",
        "Hobbies are not serious"
      ],
      "ans": 1,
      "exp": "Schools can help by organizing clubs and activities that allow students to explore different hobbies."
    }
  ]
},
{
  "id": "reading-hobbies-passage-1",
  "skill": "Reading",
  "title": "IELTS Reading — Hobbies: Collecting as a Hobby",
  "desc": "Full reading passage with comprehension questions on collecting as a popular hobby",
  "level": 1,
  "levelName": "Prestructural",
  "pts": 100,
  "done": false,
  "passage": "Collecting must be one of the most varied of human activities, and it is one that many psychologists find fascinating. Many forms of collecting have been dignified with a technical name: an arctophile collects teddy bears, a philatelist collects postage stamps, and a deltiologist collects postcards. Amassing hundreds or even thousands of postcards, chocolate wrappers or whatever takes time, energy and money that could surely be put to much more productive use.\n\nOf course, all hobbies give pleasure, but the common factor in collecting is usually passion: pleasure is putting it far too mildly. More than most other hobbies, collecting can give a strong sense of personal fulfilment. It can provide a sense of achievement and satisfaction that other hobbies rarely match.\n\nCollecting often involves the desire to find something special or rare. Another motive for collecting is the wish to complete a set. Some collectors are driven by the financial value of their collection, though for most the pleasure comes from the items themselves rather than their monetary worth.\n\nIf you think about collecting postage stamps, another potential reason for it – or perhaps a result of collecting – is its educational value. Stamp collecting opens a window to other countries, and to the plants, animals, or famous people shown on their stamps. Similarly, in the nineteenth century, many natural history collections were started by enthusiastic amateurs.\n\nStamp collectors, for instance, arrange their stamps in albums, usually very neatly, organising their collection according to certain commonplace principles – perhaps by country in alphabetical order, or grouping stamps by what they depict – people, birds, maps, and so on. This gives collectors a sense of order and control.\n\nCollecting gives a feeling that other hobbies are unlikely to inspire. It can be a highly social hobby too, with collectors meeting at fairs, clubs or online forums to buy, sell or simply admire each other’s collections.",
  "questions": [
    // Prestructural - Basic understanding
    {
      "q": "What is collecting described as in the passage?",
      "opts": [
        "A boring and unproductive activity",
        "One of the most varied of human activities",
        "Something only children do",
        "A very expensive job"
      ],
      "ans": 1,
      "exp": "Collecting is described as one of the most varied of human activities."
    },
    {
      "q": "What does a philatelist collect?",
      "opts": [
        "Teddy bears",
        "Postage stamps",
        "Postcards",
        "Chocolate wrappers"
      ],
      "ans": 1,
      "exp": "A philatelist collects postage stamps."
    },
    {
      "q": "What is one technical name mentioned for a collector of teddy bears?",
      "opts": [
        "Deltiologist",
        "Arctophile",
        "Philatelist",
        "Amateur"
      ],
      "ans": 1,
      "exp": "An arctophile collects teddy bears."
    },

    // Unistructural - Simple ideas
    {
      "q": "According to the passage, what do all hobbies give?",
      "opts": [
        "Money",
        "Pleasure",
        "Stress",
        "Education"
      ],
      "ans": 1,
      "exp": "All hobbies give pleasure."
    },
    {
      "q": "What is a common motive for collecting mentioned in the passage?",
      "opts": [
        "To waste time",
        "To find something special or rare",
        "To avoid social contact",
        "To become famous"
      ],
      "ans": 1,
      "exp": "Collecting often involves the desire to find something special or rare."
    },
    {
      "q": "What benefit does stamp collecting provide according to the text?",
      "opts": [
        "It is very expensive",
        "It has educational value",
        "It requires no effort",
        "It is only for adults"
      ],
      "ans": 1,
      "exp": "Stamp collecting has educational value as it opens a window to other countries, plants, animals, and famous people."
    },

    // Multistructural - Combining ideas
    {
      "q": "Why do many collectors arrange their items neatly?",
      "opts": [
        "To make money quickly",
        "To gain a sense of order and control",
        "Because it is required by law",
        "To show off to friends"
      ],
      "ans": 1,
      "exp": "Collectors arrange items neatly to give themselves a sense of order and control."
    },
    {
      "q": "How does collecting compare to other hobbies in terms of fulfilment?",
      "opts": [
        "It gives less fulfilment than most hobbies",
        "It can give a stronger sense of personal fulfilment than most other hobbies",
        "It gives the same fulfilment as all hobbies",
        "It provides no fulfilment"
      ],
      "ans": 1,
      "exp": "Collecting can give a strong sense of personal fulfilment that other hobbies rarely match."
    },
    {
      "q": "What is one social aspect of collecting mentioned?",
      "opts": [
        "It is always done alone",
        "Collectors meet at fairs, clubs or online forums",
        "It makes people lonely",
        "It is only for introverts"
      ],
      "ans": 1,
      "exp": "Collecting can be a highly social hobby with collectors meeting at fairs, clubs or online forums."
    },
    {
      "q": "What feeling does collecting often inspire that other hobbies rarely do?",
      "opts": [
        "Boredom",
        "A strong sense of personal fulfilment and achievement",
        "Anger",
        "Tiredness"
      ],
      "ans": 1,
      "exp": "Collecting can provide a sense of achievement and satisfaction that other hobbies rarely match."
    },

    // Higher Multistructural
    {
      "q": "According to the passage, what is often a result of collecting stamps?",
      "opts": [
        "Financial loss",
        "Educational value",
        "Physical exercise",
        "Cooking skills"
      ],
      "ans": 1,
      "exp": "Educational value is mentioned as a potential reason or result of collecting stamps."
    },
    {
      "q": "What do some collectors care about more than monetary worth?",
      "opts": [
        "The pleasure from the items themselves",
        "Winning competitions",
        "Becoming famous",
        "Saving time"
      ],
      "ans": 1,
      "exp": "For most collectors, the pleasure comes from the items themselves rather than their monetary worth."
    },
    {
      "q": "How is collecting described in terms of passion compared to other hobbies?",
      "opts": [
        "It has less passion",
        "It usually involves more passion",
        "It has the same passion as all hobbies",
        "It has no passion"
      ],
      "ans": 1,
      "exp": "The common factor in collecting is usually passion – pleasure is putting it far too mildly."
    }
  ]
}

];
