import { api } from './client';

export type Accent = 
  | 'british' 
  | 'australian' 
  | 'american' 
  | 'african' 
  | 'indian' 
  | 'russian' 
  | 'chinese';

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

export const ACCENT_META: Record<Accent, { 
  label: string; 
  flag: string; 
  color: string; 
  bg: string; 
  desc: string 
}> = {
  british: {
    label: 'British English',
    flag: '🇬🇧',
    color: '#003087',
    bg: '#EBF0FB',
    desc: 'RP & regional UK accents'
  },
  australian: {
    label: 'Australian English',
    flag: '🇦🇺',
    color: '#00843D',
    bg: '#E8F6EF',
    desc: 'General Australian accent'
  },
  american: {
    label: 'American English',
    flag: '🇺🇸',
    color: '#B22234',
    bg: '#FDECEA',
    desc: 'General American accent'
  },
  african: {
    label: 'African English',
    flag: '🌍',
    color: '#C8102E',
    bg: '#FFF0F0',
    desc: 'Nigerian, Kenyan, South African & other varieties'
  },
  indian: {
    label: 'Indian English',
    flag: '🇮🇳',
    color: '#FF9933',
    bg: '#FFF8E8',
    desc: 'General Indian English (sing-song rhythm, retroflex consonants)'
  },
  russian: {
    label: 'Russian English',
    flag: '🇷🇺',
    color: '#0039A6',
    bg: '#E8F0FF',
    desc: 'Russian-influenced English (rolled R, vowel shifts)'
  },
  chinese: {
    label: 'Chinese English',
    flag: '🇨🇳',
    color: '#DE2910',
    bg: '#FFF0F0',
    desc: 'Chinese-influenced English (common in mainland China, Hong Kong & Singapore)'
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL TRACKS
// All `ans` values are 0-based (index into the `opts` array).
// e.g. ans: 0 = first option, ans: 1 = second option, ans: 2 = third option
// ─────────────────────────────────────────────────────────────────────────────
export const LOCAL_TRACKS: ListeningTrack[] = [

  // ── British ────────────────────────────────────────────────────────────────
  {
    id: 'br-1',
    title: 'University accommodation',
    accent: 'british',
    level: 1,
    levelName: 'Prestructural',
    duration: '2:30',
    topic: 'Education',
    transcript: `Good morning. I am calling about the student accommodation application I submitted last week. My name is James Whitfield and my student ID is W4892. I applied for a single en-suite room in Northfield Hall. Yes, I can see your application here Mr Whitfield. You have been allocated a room on the third floor. The room includes a bed, desk, wardrobe and en-suite bathroom. The weekly rent is two hundred and fifteen pounds including utilities. Move-in date is the fourteenth of September. You will need to bring your tenancy agreement and student ID card on that day.`,
    questions: [
      { id: 1, q: "What type of room did James apply for?", opts: ["Shared room", "Single en-suite room", "Studio flat", "Double room"], ans: 1, exp: "He applied for a single en-suite room in Northfield Hall." },
      { id: 2, q: "Which floor is his room on?", opts: ["First floor", "Second floor", "Third floor", "Fourth floor"], ans: 2, exp: "You have been allocated a room on the third floor." },
      { id: 3, q: "How much is the weekly rent?", opts: ["£185", "£200", "£215", "£230"], ans: 2, exp: "The weekly rent is two hundred and fifteen pounds including utilities." },
      { id: 4, q: "What must James bring on move-in day?", opts: ["Only his passport", "Tenancy agreement and student ID", "Bank statement only", "Letter from his parents"], ans: 1, exp: "You will need to bring your tenancy agreement and student ID card." },
    ]
  },
  {
    id: 'br-2',
    title: 'NHS appointment booking',
    accent: 'british',
    level: 2,
    levelName: 'Unistructural',
    duration: '3:10',
    topic: 'Health',
    transcript: `Hello, this is Northfield Medical Practice, how can I help you today? Yes, I would like to book an appointment with Doctor Patel please. I have had a sore throat and headache for the past three days. I am afraid Doctor Patel is fully booked this week. However, we have an appointment available with Doctor Singh on Thursday at half past ten. Would that suit you? Yes, that is fine. Can I take your name and date of birth please? Certainly, my name is Sarah Thornton, date of birth the second of March nineteen eighty-eight. Thank you Sarah, your appointment is confirmed for Thursday the twenty-second at ten thirty. Please arrive five minutes early and bring your prescription exemption card if you have one.`,
    questions: [
      { id: 1, q: "Why is Sarah calling the medical practice?", opts: ["To cancel an appointment", "To book an appointment", "To request a repeat prescription", "To speak to a nurse"], ans: 1, exp: "She wants to book an appointment with Doctor Patel." },
      { id: 2, q: "What symptoms does Sarah have?", opts: ["Cough and fever", "Sore throat and headache", "Back pain only", "Stomach ache"], ans: 1, exp: "She has had a sore throat and headache for three days." },
      { id: 3, q: "Who will Sarah see instead of Doctor Patel?", opts: ["Doctor Ahmed", "Doctor Johnson", "Doctor Singh", "Doctor Williams"], ans: 2, exp: "We have an appointment available with Doctor Singh." },
      { id: 4, q: "What time is the appointment?", opts: ["09:30", "10:00", "10:30", "11:00"], ans: 2, exp: "Thursday at half past ten — 10:30." },
    ]
  },

  // ── Australian ─────────────────────────────────────────────────────────────
  {
    id: 'au-1',
    title: 'Tourist information centre',
    accent: 'australian',
    level: 1,
    levelName: 'Prestructural',
    duration: '2:45',
    topic: 'Tourism',
    transcript: `G'day, welcome to the Blue Mountains Visitor Centre! How can I help you today mate? Hi, we have just arrived from Sydney and we are not sure what to do around here. No worries! The most popular thing is definitely the Three Sisters lookout at Echo Point — it is only about two kilometres from here. You can also do the Prince Henry Cliff Walk which takes about three hours return. If you want something more adventurous, there is a canyon tour that leaves at nine in the morning. Bookings are essential for that one though. Entry to the lookout is free but the canyon tour is sixty-five dollars per person.`,
    questions: [
      { id: 1, q: "Where have the tourists come from?", opts: ["Melbourne", "Brisbane", "Sydney", "Canberra"], ans: 2, exp: "We have just arrived from Sydney." },
      { id: 2, q: "How far is the Three Sisters lookout?", opts: ["1 km", "2 km", "3 km", "5 km"], ans: 1, exp: "It is only about two kilometres from here." },
      { id: 3, q: "How long does the cliff walk take return?", opts: ["One hour", "Two hours", "Three hours", "Four hours"], ans: 2, exp: "The Prince Henry Cliff Walk takes about three hours return." },
      { id: 4, q: "How much does the canyon tour cost?", opts: ["$45", "$55", "$65", "$75"], ans: 2, exp: "The canyon tour is sixty-five dollars per person." },
    ]
  },
  {
    id: 'au-2',
    title: 'Job interview preparation',
    accent: 'australian',
    level: 2,
    levelName: 'Unistructural',
    duration: '3:20',
    topic: 'Work',
    transcript: `So tell me a bit about yourself. Sure! I have been working in hospitality for about four years now, mostly in front-of-house roles. I completed my Certificate III in Hospitality at TAFE last year and I have experience managing small teams during busy service periods. Why do you want to work here specifically? I have always admired how this place treats its staff. A few of my mates have worked here and they have only had good things to say. Also, the weekend shifts suit my uni schedule. We are looking for someone who can commit to at least twenty hours a week including Friday and Saturday nights. Is that something you can manage? Absolutely, that is perfect for me.`,
    questions: [
      { id: 1, q: "How long has the applicant worked in hospitality?", opts: ["Two years", "Three years", "Four years", "Five years"], ans: 2, exp: "I have been working in hospitality for about four years." },
      { id: 2, q: "What qualification did the applicant complete?", opts: ["Certificate II", "Certificate III", "Diploma", "Bachelor degree"], ans: 1, exp: "I completed my Certificate III in Hospitality at TAFE." },
      { id: 3, q: "Why does the applicant want this job?", opts: ["Higher salary", "Closer to home", "Good reputation and suitable shifts", "Full-time opportunity"], ans: 2, exp: "Good reputation and weekend shifts suit uni schedule." },
      { id: 4, q: "How many hours per week is the role?", opts: ["At least 10 hours", "At least 15 hours", "At least 20 hours", "At least 30 hours"], ans: 2, exp: "At least twenty hours a week including Friday and Saturday nights." },
    ]
  },

  // ── American ───────────────────────────────────────────────────────────────
  {
    id: 'us-1',
    title: 'Campus orientation',
    accent: 'american',
    level: 1,
    levelName: 'Prestructural',
    duration: '2:50',
    topic: 'Education',
    transcript: `Welcome to Westfield University! I am your orientation leader, my name is Tyler. Today we are going to cover some really important stuff. First, your student ID card — you need this for literally everything on campus: the library, the gym, the dining hall, and to swipe into your dorm. Next, dining. The main cafeteria is open from seven AM to nine PM on weekdays. If you have a meal plan, you get nineteen meals per week. The campus store is located in the student union building and it sells textbooks, supplies and Westfield merchandise. Any questions so far? Great. The health center is open Monday through Friday eight to five, and there is a twenty-four-hour emergency line on the back of your student ID.`,
    questions: [
      { id: 1, q: "What is the orientation leader's name?", opts: ["Taylor", "Tyler", "Trevor", "Tanner"], ans: 1, exp: "My name is Tyler." },
      { id: 2, q: "What hours is the main cafeteria open on weekdays?", opts: ["6 AM – 8 PM", "7 AM – 9 PM", "8 AM – 10 PM", "6 AM – 10 PM"], ans: 1, exp: "Open from seven AM to nine PM on weekdays." },
      { id: 3, q: "How many meals per week does the meal plan include?", opts: ["14", "17", "19", "21"], ans: 2, exp: "You get nineteen meals per week." },
      { id: 4, q: "Where is the campus store located?", opts: ["Main library", "Gym building", "Student union building", "Dormitory lobby"], ans: 2, exp: "The campus store is located in the student union building." },
    ]
  },
  {
    id: 'us-2',
    title: 'Radio traffic update',
    accent: 'american',
    level: 2,
    levelName: 'Unistructural',
    duration: '2:20',
    topic: 'Transport',
    transcript: `Good morning, you are listening to KBTL traffic on the fives. Right now we are seeing heavy delays on Interstate 95 southbound due to a three-car collision near Exit 14. Expect delays of up to forty-five minutes if you are heading downtown. As an alternate route, we suggest taking Route 1 through Millbrook which should add only about ten minutes to your commute. On the good news side, the construction on Highway 7 near the airport has been completed and all lanes are now open. The Millbrook Bridge is currently closed for maintenance until Friday. Traffic is moving smoothly on I-285. Stay with us for updates every five minutes.`,
    questions: [
      { id: 1, q: "What caused the delay on Interstate 95?", opts: ["Road construction", "A three-car collision", "A fallen tree", "A broken traffic light"], ans: 1, exp: "A three-car collision near Exit 14." },
      { id: 2, q: "How long are the expected delays?", opts: ["15 minutes", "30 minutes", "45 minutes", "60 minutes"], ans: 2, exp: "Expect delays of up to forty-five minutes." },
      { id: 3, q: "What is the suggested alternate route?", opts: ["Highway 7", "I-285", "Route 1 through Millbrook", "The Millbrook Bridge"], ans: 2, exp: "Take Route 1 through Millbrook." },
      { id: 4, q: "What road is now fully open after construction?", opts: ["Interstate 95", "Route 1", "I-285", "Highway 7 near the airport"], ans: 3, exp: "Construction on Highway 7 near the airport has been completed and all lanes are now open." },
    ]
  },

  // ── African ────────────────────────────────────────────────────────────────
  {
    id: 'af-1',
    title: 'Market conversation in Lagos',
    accent: 'african',
    level: 1,
    levelName: 'Prestructural',
    duration: '2:40',
    topic: 'Daily Life',
    transcript: `Good afternoon madam. How are you today? I am fine thank you. What are you selling? I have fresh tomatoes, onions, peppers and plantain. How much is the tomatoes? One basket is 500 naira. That is too expensive. Please give me discount. Okay, for you I will do 400 naira. Thank you, I will take two baskets. Good, anything else? Yes, give me one bunch of plantain also. The plantain is 300 naira. Okay, here is 1100 naira total.`,
    questions: [
      { id: 1, q: "What items is the seller offering?", opts: ["Rice and beans", "Tomatoes, onions, peppers and plantain", "Fish and vegetables", "Bread and butter"], ans: 1, exp: "She has fresh tomatoes, onions, peppers and plantain." },
      { id: 2, q: "What was the original price of one basket of tomatoes?", opts: ["300 naira", "400 naira", "500 naira", "600 naira"], ans: 2, exp: "One basket is 500 naira." },
      { id: 3, q: "How many baskets of tomatoes did the customer buy?", opts: ["One basket", "Two baskets", "Three baskets", "Four baskets"], ans: 1, exp: "I will take two baskets." },
      { id: 4, q: "How much did the customer pay in total?", opts: ["800 naira", "900 naira", "1000 naira", "1100 naira"], ans: 3, exp: "Here is 1100 naira total — two baskets at 400 + plantain at 300." },
    ]
  },
  {
    id: 'af-2',
    title: 'University registration in Nairobi',
    accent: 'african',
    level: 2,
    levelName: 'Unistructural',
    duration: '3:05',
    topic: 'Education',
    transcript: `Good morning. I am here to register for the new semester. Welcome. Please give me your student ID. Here it is — K2031. Thank you. I can see you are registering for Business Administration. Yes, that is correct. You need to choose four units this semester. I want to take Accounting, Economics, Business Law and Marketing. Good choices. The registration fee is 25,000 shillings. Can I pay in installments? Yes, you can pay half now and half at mid-semester. That is very helpful, thank you. Please collect your timetable from room 14.`,
    questions: [
      { id: 1, q: "What course is the student registered for?", opts: ["Computer Science", "Medicine", "Business Administration", "Engineering"], ans: 2, exp: "You are registering for Business Administration." },
      { id: 2, q: "How many units must the student take this semester?", opts: ["Two", "Three", "Four", "Five"], ans: 2, exp: "You need to choose four units this semester." },
      { id: 3, q: "What is the registration fee?", opts: ["15,000 shillings", "20,000 shillings", "25,000 shillings", "30,000 shillings"], ans: 2, exp: "The registration fee is 25,000 shillings." },
      { id: 4, q: "Where should the student collect the timetable?", opts: ["Room 4", "Room 10", "Room 14", "Room 20"], ans: 2, exp: "Please collect your timetable from room 14." },
    ]
  },

  // ── Indian ─────────────────────────────────────────────────────────────────
  {
    id: 'in-1',
    title: 'Railway ticket booking',
    accent: 'indian',
    level: 1,
    levelName: 'Prestructural',
    duration: '2:55',
    topic: 'Travel',
    transcript: `Good morning sir, welcome to Indian Railways enquiry. How can I help you today? Yes, I want to book a ticket from Delhi to Mumbai. Okay, for which date? Tomorrow please. We have a train at 16:30 that reaches Mumbai the next morning. That sounds perfect. How many seats? Just one, in sleeper class. The fare is 1850 rupees. Shall I confirm the booking? Yes please. Your booking is confirmed. The PNR number is 4421987. Please arrive at the station at least thirty minutes before departure.`,
    questions: [
      { id: 1, q: "Where does the passenger want to travel?", opts: ["Delhi to Kolkata", "Delhi to Mumbai", "Mumbai to Chennai", "Bangalore to Delhi"], ans: 1, exp: "He says from Delhi to Mumbai." },
      { id: 2, q: "On which day does he want to travel?", opts: ["Today", "Tomorrow", "Next week", "This weekend"], ans: 1, exp: "The passenger says Tomorrow please." },
      { id: 3, q: "What is the departure time of the train?", opts: ["14:30", "16:30", "18:00", "19:45"], ans: 1, exp: "There is a train at 16:30." },
      { id: 4, q: "How much is the fare?", opts: ["1500 rupees", "1750 rupees", "1850 rupees", "2100 rupees"], ans: 2, exp: "The fare is 1850 rupees." },
    ]
  },
  {
    id: 'in-2',
    title: 'Calling about a job interview',
    accent: 'indian',
    level: 2,
    levelName: 'Unistructural',
    duration: '3:25',
    topic: 'Work',
    transcript: `Hello, this is HR department of TechSolutions. Am I speaking with Priya? Yes, this is Priya speaking. We are calling to confirm your interview for the software tester position. Your interview is scheduled for next Monday at 11 AM. Please bring your original documents and a copy of your resume. Our office is in Cyber City, Gurgaon. Do you have any questions? No, I will be there. Thank you very much. We look forward to meeting you Priya. Have a good day.`,
    questions: [
      { id: 1, q: "What position did Priya apply for?", opts: ["Software developer", "Software tester", "HR manager", "Data analyst"], ans: 1, exp: "Software tester position." },
      { id: 2, q: "When is the interview scheduled?", opts: ["This Friday", "Next Monday", "Next Wednesday", "Tomorrow"], ans: 1, exp: "Next Monday at 11 AM." },
      { id: 3, q: "Where is the company located?", opts: ["Noida", "Gurgaon", "Bangalore", "Hyderabad"], ans: 1, exp: "Cyber City, Gurgaon." },
      { id: 4, q: "What should Priya bring to the interview?", opts: ["Only resume", "Original documents and resume", "Portfolio only", "Nothing special"], ans: 1, exp: "Original documents and a copy of your resume." },
    ]
  },

  // ── Russian ────────────────────────────────────────────────────────────────
  {
    id: 'ru-1',
    title: 'Weather and travel plans',
    accent: 'russian',
    level: 1,
    levelName: 'Prestructural',
    duration: '2:40',
    topic: 'Daily Life',
    transcript: `Hello, my name is Alexei. I am from Moscow. Today the weather is very cold, minus fifteen degrees. I am planning to visit Saint Petersburg next weekend. The train is very comfortable and takes about four hours. I like travelling by train because it is comfortable and you can see the Russian countryside. Have you ever been to Russia? Russia is a very big country with many beautiful places to visit.`,
    questions: [
      { id: 1, q: "Where is Alexei from?", opts: ["Saint Petersburg", "Moscow", "Vladivostok", "Kazan"], ans: 1, exp: "I am from Moscow." },
      { id: 2, q: "What is the current temperature?", opts: ["Minus 5", "Minus 10", "Minus 15", "Plus 5"], ans: 2, exp: "Minus fifteen degrees." },
      { id: 3, q: "How long does the train to Saint Petersburg take?", opts: ["Two hours", "Three hours", "Four hours", "Six hours"], ans: 2, exp: "About four hours." },
      { id: 4, q: "Why does Alexei like travelling by train?", opts: ["It is fast", "It is cheap", "It is comfortable", "It has good food"], ans: 2, exp: "It is comfortable." },
    ]
  },
  {
    id: 'ru-2',
    title: 'University lecture about space',
    accent: 'russian',
    level: 2,
    levelName: 'Unistructural',
    duration: '3:15',
    topic: 'Education',
    transcript: `Good morning everyone. Today we will talk about the Russian space program. The first satellite Sputnik was launched in 1957. This was a great achievement. Then in 1961 Yuri Gagarin became the first man in space. He orbited the Earth one time in one hundred and eight minutes. Later in 1963 Valentina Tereshkova became the first woman in space. Now Roscosmos works together with NASA and other space agencies on the International Space Station. Any questions?`,
    questions: [
      { id: 1, q: "When was Sputnik launched?", opts: ["1947", "1957", "1961", "1971"], ans: 1, exp: "The first satellite Sputnik was launched in 1957." },
      { id: 2, q: "Who was the first man in space?", opts: ["Neil Armstrong", "Yuri Gagarin", "Valentina Tereshkova", "Alexei Leonov"], ans: 1, exp: "Yuri Gagarin became the first man in space." },
      { id: 3, q: "How many times did Gagarin orbit the Earth?", opts: ["One time", "Two times", "Three times", "Four times"], ans: 0, exp: "He orbited the Earth one time." },
      { id: 4, q: "What is the name of the current Russian space agency?", opts: ["NASA", "ESA", "Roscosmos", "CNSA"], ans: 2, exp: "Now Roscosmos works together with NASA." },
    ]
  },

  // ── Chinese ────────────────────────────────────────────────────────────────
  {
    id: 'cn-1',
    title: 'Ordering food at a restaurant',
    accent: 'chinese',
    level: 1,
    levelName: 'Prestructural',
    duration: '2:50',
    topic: 'Food & Dining',
    transcript: `Hello, welcome to our restaurant. What would you like to order today? I want sweet and sour chicken, mapo tofu and some fried rice please. Anything to drink? Yes, one orange juice. How spicy do you want the mapo tofu? Medium spicy is fine. Okay, it will be ready in about fifteen minutes. Please wait a moment. Thank you for coming.`,
    questions: [
      { id: 1, q: "What main dishes does the customer order?", opts: ["Kung Pao chicken and noodles", "Sweet and sour chicken and mapo tofu", "Beef stir fry and dumplings", "Spring rolls only"], ans: 1, exp: "Sweet and sour chicken, mapo tofu and some fried rice." },
      { id: 2, q: "What drink does the customer want?", opts: ["Coca Cola", "Orange juice", "Green tea", "Water"], ans: 1, exp: "One orange juice." },
      { id: 3, q: "How spicy does the customer want the mapo tofu?", opts: ["Not spicy", "Mild", "Medium spicy", "Very spicy"], ans: 2, exp: "Medium spicy is fine." },
      { id: 4, q: "How long will the food take?", opts: ["5 minutes", "10 minutes", "15 minutes", "20 minutes"], ans: 2, exp: "It will be ready in about fifteen minutes." },
    ]
  },
  {
    id: 'cn-2',
    title: 'Talking about online shopping',
    accent: 'chinese',
    level: 2,
    levelName: 'Unistructural',
    duration: '3:30',
    topic: 'Shopping & Technology',
    transcript: `Hi, I bought a pair of wireless headphones from your website last week but the sound quality is not very good. Sometimes there is noise and the battery only lasts three hours. Can I return it? Yes, of course. You can return within 30 days. Please send it back with the original box and we will give you full refund. Do you want to exchange for another model? No, I just want refund please. Okay, I have processed your return. The money will be back in your account in 3 to 5 working days.`,
    questions: [
      { id: 1, q: "What problem does the customer have with the headphones?", opts: ["Too expensive", "Bad sound quality and short battery life", "Wrong color", "Delivery delay"], ans: 1, exp: "Sound quality is not very good and battery only lasts three hours." },
      { id: 2, q: "How long is the return period?", opts: ["7 days", "15 days", "30 days", "60 days"], ans: 2, exp: "You can return within 30 days." },
      { id: 3, q: "What does the customer want?", opts: ["Exchange for new one", "Discount", "Full refund", "Free repair"], ans: 2, exp: "No, I just want refund please." },
      { id: 4, q: "When will the customer get the money back?", opts: ["Immediately", "Next day", "3 to 5 working days", "One month"], ans: 2, exp: "The money will be back in your account in 3 to 5 working days." },
    ]
  },

];