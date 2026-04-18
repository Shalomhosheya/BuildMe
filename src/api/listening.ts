import { api } from './client';

export type Accent = 'british' | 'australian' | 'american';

export interface ListeningTrack {
  id: string;
  title: string;
  accent: Accent;
  level: number;
  levelName: string;
  duration: string;
  topic: string;
  transcript: string;
  questions: ListeningQuestion[];
  audioUrl?: string;
}

export interface ListeningQuestion {
  id: number;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

export interface ListeningAttempt {
  id: string;
  trackId: string;
  accent: Accent;
  score: number;
  total: number;
  pointsEarned: number;
  completedAt: string;
}

export interface ListeningSubmitResponse {
  attemptId: string;
  score: number;
  total: number;
  percentage: number;
  pointsEarned: number;
}

export const listeningApi = {
  getTracks: (accent?: Accent) =>
    api.get<ListeningTrack[]>(`/api/listening/tracks${accent ? `?accent=${accent}` : ''}`),

  submit: (trackId: string, accent: Accent, score: number, total: number) =>
    api.post<ListeningSubmitResponse>('/api/listening/submit', { trackId, accent, score, total }),

  history: () =>
    api.get<ListeningAttempt[]>('/api/listening/history'),
};

export const ACCENT_META: Record<Accent, { label: string; flag: string; color: string; bg: string; desc: string }> = {
  british:    { label: 'British English',    flag: '🇬🇧', color: '#003087', bg: '#EBF0FB', desc: 'RP & regional UK accents' },
  australian: { label: 'Australian English', flag: '🇦🇺', color: '#00843D', bg: '#E8F6EF', desc: 'General Australian accent' },
  american:   { label: 'American English',   flag: '🇺🇸', color: '#B22234', bg: '#FDECEA', desc: 'General American accent'  },
};

// Local tracks — used when backend is offline
export const LOCAL_TRACKS: ListeningTrack[] = [
  {
    id: 'br-1', title: 'University accommodation', accent: 'british', level: 1, levelName: 'Prestructural',
    duration: '2:30', topic: 'Education',
    transcript: `Good morning. I am calling about the student accommodation application I submitted last week. My name is James Whitfield and my student ID is W4892. I was wondering whether you had received my deposit payment and whether there are any rooms still available in the main halls. I would prefer a single en-suite room if possible, ideally on one of the lower floors as I have quite a lot of equipment to carry. Could you also let me know about the laundry facilities? I understand there is a communal kitchen on each floor. I look forward to hearing from you at your earliest convenience.`,
    questions: [
      { id:1, q:"What is the caller's surname?",       opts:["Whitfield","Whitmore","Whitley","Whitaker"], ans:0, exp:"The caller says 'My name is James Whitfield'." },
      { id:2, q:"What type of room does he prefer?",   opts:["Double room","Shared dormitory","Single en-suite","Studio flat"], ans:2, exp:"He says 'I would prefer a single en-suite room if possible'." },
      { id:3, q:"Why does he want a lower floor?",     opts:["He is afraid of heights","He has heavy equipment","The lift is broken","He prefers the view"], ans:1, exp:"He says 'I have quite a lot of equipment to carry'." },
      { id:4, q:"What does he ask about specifically?", opts:["Car parking","Laundry facilities","Library hours","Meal plans"], ans:1, exp:"He asks 'Could you also let me know about the laundry facilities'." },
    ]
  },
  {
    id: 'br-2', title: 'NHS appointment booking', accent: 'british', level: 2, levelName: 'Unistructural',
    duration: '3:10', topic: 'Health',
    transcript: `Hello, this is Northfield Medical Practice. How can I help you today? Yes, I would like to make an appointment with Dr Patel please. She is my regular GP. Of course. Could I take your name and date of birth? Certainly. It is Sarah Thornton, the fifth of March nineteen eighty-seven. Thank you. Now, Dr Patel has an opening on Thursday at quarter past ten or Friday at half past two. Which would suit you better? Thursday at quarter past ten would be perfect, thank you. Shall I put that down as a routine appointment or is it more urgent? It is fairly urgent actually — I have had a persistent cough for three weeks now. In that case I will mark it as priority. Do you need a reminder text? Yes please, to my mobile. Wonderful. We have got you booked in. Is there anything else I can help with?`,
    questions: [
      { id:1, q:"Which doctor does Sarah want to see?", opts:["Dr Thomas","Dr Patel","Dr Singh","Dr Brown"], ans:1, exp:"Sarah says 'I would like to make an appointment with Dr Patel'." },
      { id:2, q:"What is Sarah's date of birth?",       opts:["5 March 1978","5 March 1987","15 March 1987","5 March 1997"], ans:1, exp:"She says 'fifth of March nineteen eighty-seven'." },
      { id:3, q:"Which appointment slot does she choose?", opts:["Thursday 10:15","Friday 14:30","Thursday 10:30","Friday 10:15"], ans:0, exp:"She chooses 'Thursday at quarter past ten'." },
      { id:4, q:"How long has she had the cough?",      opts:["One week","Two weeks","Three weeks","Four weeks"], ans:2, exp:"She says 'I have had a persistent cough for three weeks'." },
    ]
  },
  {
    id: 'au-1', title: 'Tourist information centre', accent: 'australian', level: 1, levelName: 'Prestructural',
    duration: '2:45', topic: 'Tourism',
    transcript: `G'day, welcome to the Blue Mountains Visitor Centre. How can I help you mate? Hi there, I am looking for information about the Three Sisters walk. Sure thing! The classic Echo Point lookout is just a five-minute walk from here — you can get a ripper view of the Three Sisters from there. The full Grand Cliff Top walk takes about two hours each way. You will want to bring a fair bit of water because it gets pretty warm out on the track, especially arvo. Do you reckon it is suitable for kids? Absolutely, the lookout section is fully accessible and the kids will love it. There is also a light rail service that runs to Gordon Falls if your little ones get tired. Make sure you grab a map from the counter — it shows all the walking trails and the picnic spots. Enjoy your arvo out there!`,
    questions: [
      { id:1, q:"How far is the Echo Point lookout?",   opts:["2 minutes","5 minutes","10 minutes","15 minutes"], ans:1, exp:"The guide says 'just a five-minute walk from here'." },
      { id:2, q:"How long is the Grand Cliff Top walk one way?", opts:["30 minutes","1 hour","2 hours","3 hours"], ans:2, exp:"The guide says 'about two hours each way'." },
      { id:3, q:"What does the guide recommend bringing?", opts:["Sunscreen","A jacket","Water","Snacks"], ans:2, exp:"'You will want to bring a fair bit of water'." },
      { id:4, q:"What transport is available for tired children?", opts:["Bus","Taxi","Light rail","Cable car"], ans:2, exp:"'There is also a light rail service that runs to Gordon Falls'." },
    ]
  },
  {
    id: 'au-2', title: 'Job interview preparation', accent: 'australian', level: 2, levelName: 'Unistructural',
    duration: '3:20', topic: 'Work',
    transcript: `So tell me a bit about yourself and why you applied for this position. Sure. I have been working in logistics for about four years now, mostly with a warehousing company in Parramatta. I am keen to move into supply chain management because I reckon I have got solid skills in inventory control and team coordination. We are a pretty flat organisation here — everyone pitches in. How do you feel about working flexible hours, sometimes starting at six in the morning? That is totally fine by me. I am an early riser anyway and I have got my own transport so the commute is not an issue. Good on ya. Now, could you walk me through a time when you had to deal with a difficult situation at work? Yeah, there was a time when a major shipment went missing during peak season. I coordinated with three different freight companies over two days to track it down. We got it sorted before the deadline and the client was stoked.`,
    questions: [
      { id:1, q:"How many years of logistics experience does the applicant have?", opts:["2","3","4","5"], ans:2, exp:"The applicant says 'about four years now'." },
      { id:2, q:"What area of management does the applicant want to move into?", opts:["Human resources","Supply chain","Finance","Operations"], ans:1, exp:"'I am keen to move into supply chain management'." },
      { id:3, q:"What time might early shifts start?", opts:["5am","6am","7am","8am"], ans:1, exp:"The interviewer says 'sometimes starting at six in the morning'." },
      { id:4, q:"How long did it take to resolve the missing shipment?", opts:["One day","Two days","Three days","One week"], ans:1, exp:"'I coordinated... over two days to track it down'." },
    ]
  },
  {
    id: 'us-1', title: 'Campus orientation', accent: 'american', level: 1, levelName: 'Prestructural',
    duration: '2:50', topic: 'Education',
    transcript: `Welcome to Westfield University! I am your orientation leader, Tyler, and I will be showing you around campus today. So the first thing to know is that the main dining hall — we call it the Commons — is open from seven in the morning until nine at night on weekdays. On weekends it opens a little later, around eight thirty. Your student ID doubles as your meal card, so make sure you have it with you at all times. The library is open twenty-four hours during midterms and finals, but regular hours are eight AM to midnight. If you need tech support, the IT helpdesk is on the second floor of the Student Union building. They can help with WiFi login, printing, and software licensing. Any questions so far? Great. Let us head over to the Recreation Center next — you are all going to love it.`,
    questions: [
      { id:1, q:"What is the dining hall called?",      opts:["The Hub","The Commons","The Union","The Hall"], ans:1, exp:"Tyler says 'the main dining hall — we call it the Commons'." },
      { id:2, q:"What time does it open on weekends?",  opts:["7:00am","7:30am","8:00am","8:30am"], ans:3, exp:"'On weekends it opens a little later, around eight thirty'." },
      { id:3, q:"What does the student ID also function as?", opts:["Library card","Bus pass","Meal card","Gym pass"], ans:2, exp:"'Your student ID doubles as your meal card'." },
      { id:4, q:"Where is the IT helpdesk located?",   opts:["Library ground floor","Student Union 2nd floor","Rec Center","Science building"], ans:1, exp:"'The IT helpdesk is on the second floor of the Student Union building'." },
    ]
  },
  {
    id: 'us-2', title: 'Radio traffic update', accent: 'american', level: 2, levelName: 'Unistructural',
    duration: '2:20', topic: 'Transport',
    transcript: `Good morning, you are listening to KBTL traffic on the fours. It is currently seven forty-four and we are seeing some significant delays across the metro area this Tuesday morning. On Interstate 95 northbound, there is a three-car fender bender just past exit forty-two that is causing a major backup — expect delays of up to forty minutes from the Riverside on-ramp. The HOV lanes are moving well if you have got two or more passengers. Over on Route 7, there is some construction work between Maple Avenue and Oak Street that is narrowing traffic down to one lane. Expect about fifteen minutes of additional travel time through that stretch. Downtown, the Metro Blue Line is running on a modified schedule due to track maintenance. Allow an extra twenty minutes if you are taking the train to Union Station. Drive safely out there, and we will have another update at seven fifty-four.`,
    questions: [
      { id:1, q:"What caused the Interstate 95 delay?",   opts:["Road works","A three-car accident","A broken down truck","A police incident"], ans:1, exp:"'A three-car fender bender just past exit forty-two'." },
      { id:2, q:"How long are the I-95 delays expected?", opts:["15 minutes","20 minutes","30 minutes","40 minutes"], ans:3, exp:"'Expect delays of up to forty minutes'." },
      { id:3, q:"What is causing delays on Route 7?",    opts:["An accident","Flooding","Construction work","A parade"], ans:2, exp:"'There is some construction work between Maple Avenue and Oak Street'." },
      { id:4, q:"How much extra time for the Metro Blue Line?", opts:["10 minutes","15 minutes","20 minutes","25 minutes"], ans:2, exp:"'Allow an extra twenty minutes if you are taking the train'." },
    ]
  },
];