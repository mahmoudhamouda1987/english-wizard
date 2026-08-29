import type { CEFRLevel } from "./curriculum";

/**
 * The renovated Worlds & Missions curriculum (Parts 30–39).
 * Worlds are organised by CEFR level → world → mission → practice.
 * Every world states its purpose, what the learner will study and what they
 * will be able to DO after completing it. Missions carry a structured exercise
 * plan (Part 84 mix) delivered through the platform's practice engines.
 */

export type PracticeType =
  | "multiple-choice" | "matching" | "ordering" | "gap-fill" | "listening-comprehension"
  | "short-answer" | "reading-inference" | "sentence-transformation" | "pronunciation"
  | "speaking" | "writing" | "dialogue-completion" | "meaning-selection" | "error-correction" | "real-life-response";

export interface ExerciseTypeSpec {
  type: PracticeType;
  count: number;
}

export interface WorldMission {
  id: string;
  title: string;
  /** The real-life outcome the mission trains. */
  outcome: string;
  /** Lesson ids from the general curriculum that deliver this mission. */
  lessonIds: string[];
  /** Structured practice mix (Part 84). */
  exercises: ExerciseTypeSpec[];
  /** Primary skills exercised. */
  skills: Array<"reading" | "writing" | "listening" | "speaking">;
  estimatedMinutes: number;
}

export interface LearningWorldV2 {
  id: string;
  level: CEFRLevel;
  number: number;
  title: string;
  /** Why this world exists (Part 29). */
  purpose: string;
  /** Topics covered. */
  topics: string[];
  /** "What you will learn" bullets. */
  willLearn: string[];
  /** "What you will be able to do" outcomes (Part 39). */
  canDo: string[];
  skills: Array<"reading" | "writing" | "listening" | "speaking">;
  estimatedHours: number;
  missions: WorldMission[];
}

const m = (
  id: string, title: string, outcome: string, lessonIds: string[],
  exercises: ExerciseTypeSpec[], skills: WorldMission["skills"], estimatedMinutes: number,
): WorldMission => ({ id, title, outcome, lessonIds, exercises, skills, estimatedMinutes });

const mc = (n: number): ExerciseTypeSpec => ({ type: "multiple-choice", count: n });
const match = (n: number): ExerciseTypeSpec => ({ type: "matching", count: n });
const order = (n: number): ExerciseTypeSpec => ({ type: "ordering", count: n });
const gap = (n: number): ExerciseTypeSpec => ({ type: "gap-fill", count: n });
const listen = (n: number): ExerciseTypeSpec => ({ type: "listening-comprehension", count: n });
const short = (n: number): ExerciseTypeSpec => ({ type: "short-answer", count: n });
const infer = (n: number): ExerciseTypeSpec => ({ type: "reading-inference", count: n });
const transform = (n: number): ExerciseTypeSpec => ({ type: "sentence-transformation", count: n });
const pron = (n: number): ExerciseTypeSpec => ({ type: "pronunciation", count: n });
const speak = (n: number): ExerciseTypeSpec => ({ type: "speaking", count: n });
const write = (n: number): ExerciseTypeSpec => ({ type: "writing", count: n });
const dialogue = (n: number): ExerciseTypeSpec => ({ type: "dialogue-completion", count: n });
const meaning = (n: number): ExerciseTypeSpec => ({ type: "meaning-selection", count: n });
const errors = (n: number): ExerciseTypeSpec => ({ type: "error-correction", count: n });
const real = (n: number): ExerciseTypeSpec => ({ type: "real-life-response", count: n });

export const WORLDS_V2: LearningWorldV2[] = [
  /* ---------------- PRE-A1 — survival foundations (Part 31) ---------------- */
  {
    id: "prea1-first-english", level: "Pre-A1", number: 1, title: "My First English",
    purpose: "Take the very first steps: greet people, say your name and use numbers and basic words with confidence.",
    topics: ["Greetings", "Names", "Numbers", "Alphabet", "Basic objects"],
    willLearn: ["Greeting someone politely", "Saying and asking for names", "Counting and using numbers 0–100", "Naming everyday objects around you"],
    canDo: ["Greet someone and exchange names", "Count and use simple numbers", "Recognise and name common objects"],
    skills: ["listening", "reading", "speaking"], estimatedHours: 4,
    missions: [
      m("m-prea1-hello", "Say Hello", "Greet people and introduce yourself in a first meeting.", ["lesson-01-me-my-world"], [match(4), listen(4), dialogue(4), pron(4), speak(4)], ["listening", "speaking"], 45),
      m("m-prea1-numbers", "Numbers Around You", "Understand and use numbers in daily situations.", ["lesson-01-me-my-world"], [mc(4), listen(5), gap(5), short(4)], ["listening", "reading"], 40),
      m("m-prea1-things", "Name the Things You See", "Recognise and say the words for everyday objects.", ["lesson-02-home-everyday-life"], [match(5), mc(4), speak(4), pron(4)], ["reading", "speaking"], 40),
    ],
  },
  {
    id: "prea1-survival-english", level: "Pre-A1", number: 2, title: "Survival English",
    purpose: "Handle the essential exchanges that make a day work: meeting someone, asking for what you need and keeping a very short conversation alive.",
    topics: ["Meeting someone new", "Where you are from", "Asking for basics", "Ordering what you need"],
    willLearn: ["Meeting and greeting a stranger", "Saying where you are from", "Asking simple questions", "Ordering food or a drink"],
    canDo: ["Keep a short conversation going", "Ask for basic information", "Order what you need politely"],
    skills: ["listening", "reading", "speaking"], estimatedHours: 5,
    missions: [
      m("m-prea1-meet", "Meet Someone New", "Start and finish a simple first conversation.", ["lesson-01-me-my-world"], [dialogue(5), listen(4), speak(4), mc(4)], ["speaking", "listening"], 45),
      m("m-prea1-ask", "Ask for What You Need", "Ask simple questions and understand short answers.", ["lesson-03-food-shopping-services"], [mc(4), gap(4), real(4), listen(4)], ["listening", "speaking"], 40),
      m("m-prea1-order", "Order What You Need", "Order food and pay in a café or shop.", ["lesson-03-food-shopping-services"], [dialogue(5), listen(5), speak(5), match(4)], ["listening", "speaking"], 45),
    ],
  },
  {
    id: "prea1-daily-world", level: "Pre-A1", number: 3, title: "My Daily World",
    purpose: "Describe the world you live in: family, home, food and the routine of your day.",
    topics: ["Family", "Home", "Food", "Routines", "Time"],
    willLearn: ["Naming family members", "Describing your home", "Talking about food you eat", "Describing your daily routine and telling the time"],
    canDo: ["Describe your family and home", "Talk about daily routines", "Understand simple questions about your life"],
    skills: ["listening", "reading", "speaking"], estimatedHours: 5,
    missions: [
      m("m-prea1-family", "My Family", "Talk about the people in your family.", ["lesson-02-home-everyday-life"], [match(4), mc(4), speak(4), listen(4)], ["speaking", "listening"], 40),
      m("m-prea1-home", "My Home", "Describe where you live and the rooms in it.", ["lesson-02-home-everyday-life"], [gap(5), match(4), short(4), speak(3)], ["reading", "speaking"], 40),
      m("m-prea1-routine", "My Day", "Describe your daily routine and tell the time.", ["lesson-02-home-everyday-life"], [order(5), gap(4), listen(5), speak(4)], ["listening", "speaking"], 45),
    ],
  },

  /* ---------------- A1 — survival communication (Part 32) ---------------- */
  {
    id: "a1-me-my-world", level: "A1", number: 1, title: "Me & My World",
    purpose: "Present yourself clearly, talk about the people and places around you, and handle a first real conversation.",
    topics: ["Introductions", "Personal details", "Countries and origins", "Everyday objects"],
    willLearn: ["Giving personal information", "Describing your world", "Asking and answering simple questions"],
    canDo: ["Introduce yourself and others", "Ask and answer simple personal questions", "Keep a short exchange going"],
    skills: ["listening", "reading", "speaking"], estimatedHours: 6,
    missions: [
      m("m-a1-introduce", "Introduce Yourself", "Give a clear, simple self-introduction.", ["lesson-01-me-my-world"], [dialogue(5), speak(5), pron(4), listen(4)], ["speaking", "listening"], 50),
      m("m-a1-questions", "Ask Simple Questions", "Ask about other people and understand their answers.", ["lesson-01-me-my-world"], [mc(5), listen(5), dialogue(5), short(4)], ["listening", "speaking"], 50),
    ],
  },
  {
    id: "a1-survival-kit", level: "A1", number: 2, title: "Survival Kit",
    purpose: "The essential toolkit: meeting people, ordering, paying and understanding simple signs.",
    topics: ["Meet someone new", "Order food and drinks", "Ask for prices", "Understand simple signs"],
    willLearn: ["Ordering and paying", "Understanding prices and money words", "Reading public signs and notices"],
    canDo: ["Order food and drinks", "Ask for and understand prices", "Follow simple written notices"],
    skills: ["listening", "reading", "speaking"], estimatedHours: 6,
    missions: [
      m("m-a1-order-food", "Order Food and Drinks", "Handle a full café order from greeting to paying.", ["lesson-03-food-shopping-services"], [dialogue(6), listen(5), real(5), mc(4)], ["listening", "speaking"], 55),
      m("m-a1-signs", "Understand Simple Signs", "Read and act on everyday signs and notices.", ["lesson-04-places-getting-around"], [mc(5), match(5), infer(4), short(4)], ["reading"], 45),
    ],
  },
  {
    id: "a1-daily-life", level: "A1", number: 3, title: "Daily Life",
    purpose: "Manage daily life in English: shopping, food, home and the routines that repeat every week.",
    topics: ["Shopping", "Food", "Home", "Daily routine"],
    willLearn: ["Shopping for essentials", "Describing your home and routine", "Understanding simple daily conversations"],
    canDo: ["Buy what you need in a shop", "Describe your home and daily routine", "Understand simple conversations about daily life"],
    skills: ["listening", "reading", "speaking"], estimatedHours: 6,
    missions: [
      m("m-a1-shop", "Go Shopping", "Buy food and everyday items and check the total.", ["lesson-03-food-shopping-services"], [dialogue(5), listen(5), gap(5), real(4)], ["listening", "speaking"], 50),
      m("m-a1-routine", "Talk About Your Day", "Describe your morning to evening routine.", ["lesson-02-home-everyday-life"], [order(5), gap(5), speak(5), listen(4)], ["speaking", "listening"], 50),
    ],
  },
  {
    id: "a1-places-directions", level: "A1", number: 4, title: "Places & Directions",
    purpose: "Find your way: understand directions, use transport and talk about local places.",
    topics: ["Directions", "Transport", "Local places", "Simple maps"],
    willLearn: ["Understanding simple directions", "Using buses and trains", "Naming places in town"],
    canDo: ["Follow simple directions", "Buy a ticket and use transport", "Say where places are"],
    skills: ["listening", "reading", "speaking"], estimatedHours: 5,
    missions: [
      m("m-a1-directions", "Find Your Way", "Ask for and follow simple directions.", ["lesson-04-places-getting-around"], [listen(6), dialogue(5), mc(4), real(4)], ["listening", "speaking"], 50),
      m("m-a1-transport", "Use Public Transport", "Buy tickets and understand basic announcements.", ["lesson-04-places-getting-around"], [listen(5), gap(5), mc(5), short(4)], ["listening", "reading"], 50),
    ],
  },
  {
    id: "a1-work-study-basics", level: "A1", number: 5, title: "Work & Study Basics",
    purpose: "Take first steps in work and study situations: simple workplace talk, study vocabulary and basic messages.",
    topics: ["Jobs", "Study", "Simple messages", "Instructions"],
    willLearn: ["Talking about jobs simply", "Following simple study instructions", "Writing very short messages"],
    canDo: ["Say what your job is simply", "Follow simple instructions", "Write a short note or message"],
    skills: ["reading", "writing", "listening"], estimatedHours: 5,
    missions: [
      m("m-a1-job", "Talk About Work", "Describe your job or studies in simple words.", ["lesson-10-work-careers"], [gap(5), mc(4), speak(4), short(4)], ["speaking", "writing"], 45),
      m("m-a1-messages", "Short Messages", "Read and write short everyday messages.", ["lesson-11-communication-technology"], [gap(5), order(4), write(4), mc(4)], ["reading", "writing"], 45),
    ],
  },

  /* ---------------- A2 — independent everyday communication (Part 33) ---------------- */
  {
    id: "a2-travel-confidence", level: "A2", number: 1, title: "Travel with Confidence",
    purpose: "Travel abroad with the language you need: airports, hotels, directions and asking for help.",
    topics: ["Airports", "Hotels", "Directions", "Asking for help"],
    willLearn: ["Checking in and out", "Understanding travel announcements", "Asking for and giving directions"],
    canDo: ["Handle airport and hotel situations", "Understand travel announcements", "Solve simple travel problems"],
    skills: ["listening", "reading", "speaking"], estimatedHours: 7,
    missions: [
      m("m-a2-airport", "Through the Airport", "Check in, pass security and find your gate.", ["lesson-12-travel-international"], [listen(6), dialogue(5), mc(5), real(4)], ["listening", "speaking"], 55),
      m("m-a2-hotel", "Check In, Settle In", "Check into a hotel and handle simple requests.", ["lesson-12-travel-international"], [dialogue(6), listen(5), real(5), gap(4)], ["listening", "speaking"], 55),
    ],
  },
  {
    id: "a2-everyday-problems", level: "A2", number: 2, title: "Everyday Problems",
    purpose: "Stay calm and capable when things go wrong: explain problems, ask for solutions and follow the outcome.",
    topics: ["Explaining problems", "Asking for help", "Following instructions"],
    willLearn: ["Describing what happened", "Asking staff for a solution", "Understanding the answer you get"],
    canDo: ["Explain a problem clearly", "Ask for and follow a solution", "Describe past events simply"],
    skills: ["listening", "speaking", "writing"], estimatedHours: 6,
    missions: [
      m("m-a2-report", "Explain What Happened", "Report a simple problem and agree on a next step.", ["lesson-07-past-experiences"], [dialogue(5), order(5), speak(5), write(4)], ["speaking", "writing"], 50),
      m("m-a2-solution", "Ask for a Solution", "Ask the right person and understand their answer.", ["lesson-06-people-social-life"], [listen(5), mc(5), real(5), short(4)], ["listening", "speaking"], 50),
    ],
  },
  {
    id: "a2-work-routine", level: "A2", number: 3, title: "Work & Routine",
    purpose: "Handle the working week: simple workplace conversations, schedules and professional basics.",
    topics: ["Workplaces", "Schedules", "Colleagues", "Simple requests"],
    willLearn: ["Talking about work and routines", "Making simple requests", "Understanding workplace instructions"],
    canDo: ["Describe your job and routine", "Make polite requests at work", "Follow simple spoken instructions"],
    skills: ["listening", "speaking", "reading"], estimatedHours: 6,
    missions: [
      m("m-a2-workday", "A Day at Work", "Describe your working day and your tasks.", ["lesson-10-work-careers"], [gap(5), order(4), speak(5), listen(4)], ["speaking", "listening"], 50),
      m("m-a2-requests", "Polite Requests", "Ask colleagues for help and respond politely.", ["lesson-10-work-careers"], [dialogue(6), mc(4), real(5), listen(4)], ["speaking", "listening"], 50),
    ],
  },
  {
    id: "a2-social-life", level: "A2", number: 4, title: "Social Life",
    purpose: "Enjoy English socially: invitations, plans with friends and keeping conversations going.",
    topics: ["Invitations", "Plans", "Free time", "Small talk"],
    willLearn: ["Inviting and responding", "Making plans together", "Keeping small talk going"],
    canDo: ["Accept and decline invitations", "Make plans with friends", "Hold a simple social conversation"],
    skills: ["listening", "speaking", "writing"], estimatedHours: 6,
    missions: [
      m("m-a2-invitations", "Invitations", "Invite, accept and decline — politely and naturally.", ["lesson-06-people-social-life"], [dialogue(6), mc(4), real(5), write(4)], ["speaking", "writing"], 50),
      m("m-a2-plans", "Make Plans", "Arrange a time and place with friends.", ["lesson-08-future-plans"], [dialogue(5), gap(5), listen(5), speak(4)], ["listening", "speaking"], 50),
    ],
  },
  {
    id: "a2-health-appointments", level: "A2", number: 5, title: "Health & Appointments",
    purpose: "Look after yourself in English: symptoms, doctors, appointments and everyday health vocabulary.",
    topics: ["Symptoms", "Doctors", "Appointments", "Health habits"],
    willLearn: ["Describing symptoms simply", "Booking appointments", "Understanding health advice"],
    canDo: ["Describe basic health problems", "Make and change appointments", "Understand simple health advice"],
    skills: ["listening", "reading", "speaking"], estimatedHours: 5,
    missions: [
      m("m-a2-doctor", "See the Doctor", "Describe how you feel and understand the doctor.", ["lesson-05-health-body"], [dialogue(6), listen(5), mc(4), real(4)], ["listening", "speaking"], 50),
      m("m-a2-booking", "Book an Appointment", "Book, change and confirm appointments.", ["lesson-05-health-body"], [listen(5), dialogue(5), gap(4), write(4)], ["listening", "writing"], 45),
    ],
  },
  {
    id: "a2-shopping-services", level: "A2", number: 6, title: "Shopping & Services",
    purpose: "Handle shops and services with confidence: prices, returns, problems with purchases and polite requests.",
    topics: ["Prices", "Returns", "Customer service", "Polite requests"],
    willLearn: ["Comparing prices and asking questions", "Returning or changing an item", "Dealing with customer service"],
    canDo: ["Shop and pay with confidence", "Return or exchange an item", "Resolve a simple purchase problem"],
    skills: ["listening", "speaking", "reading"], estimatedHours: 5,
    missions: [
      m("m-a2-purchase", "Buy with Confidence", "Ask about products, prices and guarantees.", ["lesson-03-food-shopping-services"], [dialogue(5), listen(5), mc(5), real(4)], ["listening", "speaking"], 50),
      m("m-a2-return", "Return an Item", "Explain a problem with a purchase and agree a solution.", ["lesson-03-food-shopping-services"], [dialogue(5), real(5), errors(4), speak(4)], ["speaking", "listening"], 45),
    ],
  },
  {
    id: "a2-stories-past", level: "A2", number: 7, title: "Stories From The Past",
    purpose: "Tell simple stories about your past: memories, experiences and what happened last week.",
    topics: ["Past tenses", "Memories", "Experiences", "Time markers"],
    willLearn: ["Using past tenses simply", "Sequencing events", "Describing feelings about memories"],
    canDo: ["Tell a simple story from your past", "Describe a memorable experience", "Understand simple past narratives"],
    skills: ["speaking", "writing", "listening"], estimatedHours: 6,
    missions: [
      m("m-a2-memory", "Tell a Memory", "Tell the story of a day you remember well.", ["lesson-07-past-experiences"], [order(5), gap(5), speak(5), write(4)], ["speaking", "writing"], 50),
      m("m-a2-last-week", "Your Last Week", "Describe recent events in clear sequence.", ["lesson-07-past-experiences"], [transform(5), short(4), listen(5), speak(4)], ["writing", "listening"], 50),
    ],
  },
  {
    id: "a2-plans-future", level: "A2", number: 8, title: "Plans & Future",
    purpose: "Talk and write about the future: intentions, dreams and the plans that get you there.",
    topics: ["Future forms", "Intentions", "Predictions", "Ambitions"],
    willLearn: ["Using will and going to simply", "Describing plans and ambitions", "Writing about your future"],
    canDo: ["Talk about your plans", "Make simple predictions", "Write a short message about the future"],
    skills: ["writing", "speaking", "listening"], estimatedHours: 6,
    missions: [
      m("m-a2-dreams", "Plans and Dreams", "Describe what you want to do next and why.", ["lesson-08-future-plans"], [gap(5), mc(4), speak(5), write(5)], ["speaking", "writing"], 50),
      m("m-a2-arrangements", "Arrange the Future", "Write and confirm arrangements with other people.", ["lesson-08-future-plans"], [transform(4), write(5), dialogue(5), listen(4)], ["writing", "listening"], 50),
    ],
  },

  /* ---------------- B1 — independent communication, four skills (Part 34) ---------------- */
  {
    id: "b1-everyday-confidence", level: "B1", number: 1, title: "Everyday Confidence",
    purpose: "Become truly independent in daily life: follow real conversations, handle services and keep discussions going.",
    topics: ["Everyday conversation", "Services", "Following real speech", "Independent problem-solving"],
    willLearn: ["Following natural-speed conversation", "Handling services and appointments", "Giving and asking for opinions"],
    canDo: ["Hold your own in everyday conversations", "Handle most service situations", "Explain problems and solutions in detail"],
    skills: ["reading", "writing", "listening", "speaking"], estimatedHours: 8,
    missions: [
      m("m-b1-conversation", "Keep the Conversation Going", "Hold a natural conversation on an everyday topic.", ["lesson-06-people-social-life"], [dialogue(5), listen(5), speak(5), real(5)], ["speaking", "listening"], 55),
      m("m-b1-services", "Handle Any Service", "Deal with providers, appointments and complaints.", ["lesson-14-money-personal-finance"], [listen(5), dialogue(5), write(5), mc(4)], ["listening", "writing"], 55),
    ],
  },
  {
    id: "b1-social-english", level: "B1", number: 2, title: "Social English",
    purpose: "Build a social life in English: friendships, humour, groups and the confidence to join any conversation.",
    topics: ["Friendship", "Group conversation", "Opinions", "Social plans"],
    willLearn: ["Joining group conversations", "Expressing opinions with reasons", "Understanding humour and implication"],
    canDo: ["Join and contribute to group talk", "Give opinions with clear reasons", "Follow fast social conversation"],
    skills: ["listening", "speaking", "reading", "writing"], estimatedHours: 7,
    missions: [
      m("m-b1-social", "Join the Conversation", "Enter a group discussion and hold your place.", ["lesson-06-people-social-life"], [listen(6), speak(6), dialogue(4), mc(4)], ["listening", "speaking"], 55),
      m("m-b1-opinions", "Say What You Think", "Give and defend a simple opinion politely.", ["lesson-15-media-entertainment"], [speak(5), short(4), infer(4), write(4)], ["speaking", "writing"], 55),
    ],
  },
  {
    id: "b1-workplace-communication", level: "B1", number: 3, title: "Workplace Communication",
    purpose: "Work in English: meetings, updates, clarification and the professional tone that gets taken seriously.",
    topics: ["Meetings", "Updates", "Clarification", "Professional tone"],
    willLearn: ["Giving a clear update", "Asking for clarification", "Writing short professional messages"],
    canDo: ["Contribute in workplace conversations", "Give a structured update", "Write clear professional emails"],
    skills: ["listening", "speaking", "reading", "writing"], estimatedHours: 8,
    missions: [
      m("m-b1-update", "Give an Update", "Present a clear spoken update on your work.", ["lesson-10-work-careers"], [speak(6), order(4), listen(5), write(4)], ["speaking", "writing"], 55),
      m("m-b1-clarify", "Ask the Right Questions", "Ask for clarification without losing the thread.", ["lesson-17-business-economy"], [listen(5), dialogue(6), mc(4), real(4)], ["listening", "speaking"], 55),
    ],
  },
  {
    id: "b1-travel-problem-solving", level: "B1", number: 4, title: "Travel & Problem Solving",
    purpose: "Travel independently: real conversations with staff, unexpected problems and confident decisions.",
    topics: ["Travel conversations", "Unexpected problems", "Negotiating simple outcomes"],
    willLearn: ["Handling problems under pressure", "Explaining situations in detail", "Negotiating simple solutions"],
    canDo: ["Solve travel problems independently", "Explain situations to officials or staff", "Reach a fair outcome in a dispute"],
    skills: ["listening", "speaking", "reading", "writing"], estimatedHours: 7,
    missions: [
      m("m-b1-solve", "Solve It in English", "Handle a real travel problem from start to finish.", ["lesson-12-travel-international"], [dialogue(6), listen(5), real(5), write(4)], ["speaking", "listening"], 55),
      m("m-b1-negotiate", "Reach an Agreement", "Negotiate a fair solution politely and firmly.", ["lesson-19-problem-solving-decisions"], [speak(5), dialogue(5), mc(4), write(4)], ["speaking", "writing"], 55),
    ],
  },
  {
    id: "b1-stories-experiences", level: "B1", number: 5, title: "Stories & Experiences",
    purpose: "Tell longer stories and describe experiences with structure, detail and feeling — in speech and in writing.",
    topics: ["Narrative", "Describing experiences", "Feelings and reactions"],
    willLearn: ["Structuring a spoken story", "Writing a descriptive narrative", "Using time and sequence naturally"],
    canDo: ["Tell an engaging story from your life", "Write a clear narrative paragraph", "Describe reactions and feelings"],
    skills: ["speaking", "writing", "reading", "listening"], estimatedHours: 7,
    missions: [
      m("m-b1-story", "Tell Your Story", "Narrate a personal experience with a clear arc.", ["lesson-07-past-experiences"], [speak(6), write(6), order(4), transform(4)], ["speaking", "writing"], 55),
      m("m-b1-describe", "Describe an Experience", "Bring an experience to life with detail.", ["lesson-16-society-culture"], [write(5), speak(5), meaning(4), short(4)], ["writing", "speaking"], 55),
    ],
  },
  {
    id: "b1-opinions-discussion", level: "B1", number: 6, title: "Opinions & Discussion",
    purpose: "Discuss news, media and everyday issues: agree, disagree and support your view with evidence.",
    topics: ["News", "Media", "Agreeing and disagreeing", "Supporting views"],
    willLearn: ["Structuring an opinion", "Disagreeing politely", "Supporting points with examples"],
    canDo: ["Discuss a news topic for several minutes", "Disagree without conflict", "Support opinions with reasons"],
    skills: ["listening", "speaking", "reading", "writing"], estimatedHours: 7,
    missions: [
      m("m-b1-discuss", "Discuss the News", "Hold a structured discussion on a current topic.", ["lesson-15-media-entertainment"], [listen(6), speak(6), infer(4), mc(4)], ["listening", "speaking"], 55),
      m("m-b1-viewpoint", "Your View in Writing", "Write an opinion paragraph with support.", ["lesson-16-society-culture"], [write(6), infer(4), transform(4), errors(4)], ["writing", "reading"], 55),
    ],
  },

  /* ---------------- B2 — confident complex communication (Part 35) ---------------- */
  {
    id: "b2-professional-english", level: "B2", number: 1, title: "Professional English",
    purpose: "Operate at a professional standard: meetings, reports, persuasion and the register that commands respect.",
    topics: ["Meetings", "Reports", "Persuasion", "Register"],
    willLearn: ["Leading discussions", "Writing structured reports", "Choosing register deliberately"],
    canDo: ["Lead a professional discussion", "Write a persuasive report", "Adapt tone to audience and situation"],
    skills: ["reading", "writing", "listening", "speaking"], estimatedHours: 9,
    missions: [
      m("m-b2-lead", "Lead the Meeting", "Open, steer and close a professional discussion.", ["lesson-17-business-economy"], [speak(6), listen(6), dialogue(4), write(4)], ["speaking", "listening"], 60),
      m("m-b2-report", "Write the Report", "Produce a structured, persuasive report.", ["lesson-18-professional-communication"], [write(8), infer(4), transform(4), errors(4)], ["writing", "reading"], 60),
    ],
  },
  {
    id: "b2-complex-conversations", level: "B2", number: 2, title: "Complex Conversations",
    purpose: "Handle fast, nuanced, high-stakes conversations: disagreement, negotiation and thinking on your feet.",
    topics: ["Negotiation", "Disagreement", "Fast speech", "Nuance"],
    willLearn: ["Negotiating outcomes", "Managing disagreement", "Tracking fast natural speech"],
    canDo: ["Negotiate under pressure", "Manage a difficult conversation", "Follow complex natural dialogue"],
    skills: ["listening", "speaking", "reading", "writing"], estimatedHours: 8,
    missions: [
      m("m-b2-negotiate", "Negotiate the Outcome", "Reach a complex agreement in real time.", ["lesson-19-problem-solving-decisions"], [dialogue(6), speak(6), listen(5), real(3)], ["speaking", "listening"], 60),
      m("m-b2-fast", "Follow the Fast Lane", "Track and respond to rapid natural conversation.", ["lesson-17-business-economy"], [listen(8), mc(4), short(4), speak(4)], ["listening"], 55),
    ],
  },
  {
    id: "b2-media-information", level: "B2", number: 3, title: "Media & Information",
    purpose: "Read and watch critically: interpret news, evaluate sources and understand stance and bias.",
    topics: ["News analysis", "Stance and bias", "Interviews", "Evidence"],
    willLearn: ["Identifying writer stance", "Evaluating evidence", "Understanding interview dynamics"],
    canDo: ["Analyse a news article critically", "Identify bias and stance", "Summarise complex media accurately"],
    skills: ["reading", "listening", "writing", "speaking"], estimatedHours: 8,
    missions: [
      m("m-b2-media", "Read Critically", "Analyse stance and evidence in real articles.", ["lesson-20-technology-digital-future"], [infer(8), mc(4), short(4), write(4)], ["reading", "writing"], 60),
      m("m-b2-interview", "Follow the Interview", "Track a real interview and extract the argument.", ["lesson-15-media-entertainment"], [listen(7), infer(5), short(4), speak(4)], ["listening"], 55),
    ],
  },
  {
    id: "b2-argument-persuasion", level: "B2", number: 4, title: "Argument & Persuasion",
    purpose: "Build arguments that hold: structure, evidence, counter-arguments and persuasive delivery.",
    topics: ["Argument structure", "Counter-arguments", "Persuasive writing", "Debate"],
    willLearn: ["Structuring a full argument", "Handling counter-arguments", "Writing to persuade"],
    canDo: ["Build and defend a complete argument", "Write persuasive prose", "Debate a contested topic"],
    skills: ["reading", "writing", "speaking", "listening"], estimatedHours: 8,
    missions: [
      m("m-b2-argue", "Build the Argument", "Construct and deliver a convincing argument.", ["lesson-26-advanced-argumentation"], [speak(6), write(6), infer(4), transform(4)], ["speaking", "writing"], 60),
      m("m-b2-counter", "Meet the Counter-Argument", "Anticipate and answer opposing views.", ["lesson-20-technology-digital-future"], [infer(5), errors(4), write(6), speak(5)], ["writing", "reading"], 60),
    ],
  },
  {
    id: "b2-academic-communication", level: "B2", number: 5, title: "Academic Communication",
    purpose: "Study and research in English: lectures, academic texts, note-taking and structured writing.",
    topics: ["Lectures", "Academic reading", "Note-taking", "Structured writing"],
    willLearn: ["Following academic lectures", "Reading academic texts efficiently", "Writing structured responses"],
    canDo: ["Follow a real lecture", "Read academic material with purpose", "Write an evidence-based response"],
    skills: ["listening", "reading", "writing", "speaking"], estimatedHours: 8,
    missions: [
      m("m-b2-lecture", "Follow the Lecture", "Take usable notes from a real lecture.", ["lesson-21-science-natural-world"], [listen(8), short(6), mc(4), write(2)], ["listening"], 60),
      m("m-b2-essay", "The Evidence Essay", "Write a structured response to a source.", ["lesson-25-advanced-ideas"], [write(8), infer(6), transform(4), errors(2)], ["writing", "reading"], 60),
    ],
  },
  {
    id: "b2-culture-society", level: "B2", number: 6, title: "Culture & Society",
    purpose: "Discuss society with depth: traditions, change, identity and the debates shaping communities.",
    topics: ["Traditions", "Social change", "Identity", "Public debate"],
    willLearn: ["Discussing social topics sensitively", "Interpreting cultural difference", "Writing about society"],
    canDo: ["Discuss cultural and social issues", "Interpret different perspectives", "Write a connected discussion piece"],
    skills: ["reading", "writing", "listening", "speaking"], estimatedHours: 8,
    missions: [
      m("m-b2-society", "Discuss Society", "Explore a social debate from several angles.", ["lesson-24-society-politics-global"], [infer(5), listen(5), speak(5), write(5)], ["reading", "listening"], 60),
      m("m-b2-culture", "Explain Your Culture", "Present your own culture to an international audience.", ["lesson-16-society-culture"], [write(6), speak(6), meaning(4), short(4)], ["writing", "speaking"], 55),
    ],
  },

  /* ---------------- C1 — advanced precision and fluency (Part 36) ---------------- */
  {
    id: "c1-influence", level: "C1", number: 1, title: "Influence",
    purpose: "Move people with language: persuasion, rhetoric and the credibility that comes from precision.",
    topics: ["Rhetoric", "Persuasion", "Credibility", "Audience design"],
    willLearn: ["Deploying rhetorical devices deliberately", "Designing messages for audiences", "Sustaining credibility under challenge"],
    canDo: ["Persuade a sceptical audience", "Adapt rhetoric to context", "Hold authority in discussion"],
    skills: ["speaking", "writing", "reading", "listening"], estimatedHours: 10,
    missions: [
      m("m-c1-persuade", "Persuade the Room", "Deliver a persuasive case to a sceptical audience.", ["lesson-26-advanced-argumentation"], [speak(8), write(6), infer(4), transform(2)], ["speaking", "writing"], 65),
      m("m-c1-rhetoric", "Read the Rhetoric", "Analyse how skilled writers persuade.", ["lesson-25-advanced-ideas"], [infer(8), meaning(6), mc(4), write(2)], ["reading"], 60),
    ],
  },
  {
    id: "c1-professional-mastery", level: "C1", number: 2, title: "Professional Mastery",
    purpose: "Operate at senior professional level: leadership communication, complex documentation and strategic discussion.",
    topics: ["Leadership", "Strategy", "Complex documents", "High-stakes talk"],
    willLearn: ["Leading strategic discussions", "Producing complex documentation", "Communicating decisions with clarity"],
    canDo: ["Lead senior-level discussions", "Produce professional-grade documents", "Communicate decisions persuasively"],
    skills: ["speaking", "writing", "reading", "listening"], estimatedHours: 10,
    missions: [
      m("m-c1-lead", "Lead the Strategy", "Steer a high-level strategic discussion.", ["lesson-23-leadership-personal-development"], [speak(8), listen(6), dialogue(4), write(2)], ["speaking", "listening"], 65),
      m("m-c1-docs", "Write the Decision", "Produce documentation that drives decisions.", ["lesson-18-professional-communication"], [write(10), infer(4), transform(4), errors(2)], ["writing"], 65),
    ],
  },
  {
    id: "c1-ideas-arguments", level: "C1", number: 3, title: "Ideas & Arguments",
    purpose: "Reason in English at full depth: abstract ideas, ethical questions and multi-layered argument.",
    topics: ["Abstract ideas", "Ethics", "Multi-layer argument", "Critical reading"],
    willLearn: ["Handling abstract discussion", "Evaluating layered arguments", "Writing precise analysis"],
    canDo: ["Discuss abstract ideas fluently", "Evaluate complex arguments", "Write precise analytical prose"],
    skills: ["reading", "writing", "speaking", "listening"], estimatedHours: 10,
    missions: [
      m("m-c1-abstract", "Think Out Loud", "Discuss an abstract question with fluency and nuance.", ["lesson-25-advanced-ideas"], [speak(8), listen(6), infer(4), mc(2)], ["speaking", "listening"], 65),
      m("m-c1-analyse", "Analyse the Argument", "Dissect and evaluate a demanding text.", ["lesson-22-psychology-human-mind"], [infer(10), meaning(4), short(4), write(2)], ["reading"], 65),
    ],
  },
  {
    id: "c1-media-society", level: "C1", number: 4, title: "Media & Society",
    purpose: "Engage with public discourse: long-form journalism, complex broadcasts and the media shaping society.",
    topics: ["Long-form journalism", "Broadcasts", "Public discourse", "Media literacy"],
    willLearn: ["Reading long-form journalism critically", "Following complex broadcasts", "Contributing to public debate"],
    canDo: ["Analyse long-form media", "Follow demanding broadcasts", "Contribute to public discussion"],
    skills: ["reading", "listening", "writing", "speaking"], estimatedHours: 10,
    missions: [
      m("m-c1-longform", "The Long Read", "Work through a long article and its implications.", ["lesson-24-society-politics-global"], [infer(10), mc(4), short(4), write(2)], ["reading"], 65),
      m("m-c1-broadcast", "The Broadcast", "Follow a complex discussion programme.", ["lesson-21-science-natural-world"], [listen(10), short(4), infer(4), speak(2)], ["listening"], 65),
    ],
  },
  {
    id: "c1-advanced-communication", level: "C1", number: 5, title: "Advanced Communication",
    purpose: "Refine every dimension of expression: style, idiom, discourse control and natural fluency.",
    topics: ["Style", "Idiom", "Discourse control", "Fluency"],
    willLearn: ["Controlling style and idiom", "Managing long discourse naturally", "Sounding natural at speed"],
    canDo: ["Write with personal style", "Control long spoken discourse", "Use idiom appropriately"],
    skills: ["speaking", "writing", "reading", "listening"], estimatedHours: 10,
    missions: [
      m("m-c1-style", "Find Your Voice", "Develop control of style in speech and writing.", ["lesson-23-leadership-personal-development"], [write(6), speak(8), meaning(4), transform(2)], ["speaking", "writing"], 65),
      m("m-c1-discourse", "Hold the Floor", "Manage extended spoken discourse with confidence.", ["lesson-26-advanced-argumentation"], [speak(10), listen(4), real(4), mc(2)], ["speaking"], 65),
    ],
  },
  {
    id: "c1-leadership-language", level: "C1", number: 6, title: "Leadership Language",
    purpose: "The language of leadership: vision, motivation, challenge and composure when it matters.",
    topics: ["Vision", "Motivation", "Challenge", "Composure"],
    willLearn: ["Communicating vision", "Motivating through language", "Staying composed under attack"],
    canDo: ["Communicate a compelling vision", "Motivate a team in speech", "Handle challenge with composure"],
    skills: ["speaking", "listening", "writing", "reading"], estimatedHours: 10,
    missions: [
      m("m-c1-vision", "Communicate the Vision", "Present a vision people want to follow.", ["lesson-23-leadership-personal-development"], [speak(8), write(6), listen(4), transform(2)], ["speaking", "writing"], 65),
      m("m-c1-composure", "Under Pressure", "Respond to challenge without losing the thread.", ["lesson-19-problem-solving-decisions"], [dialogue(6), speak(6), listen(4), real(4)], ["speaking", "listening"], 65),
    ],
  },

  /* ---------------- C2 — near-complete flexibility and nuance (Part 37) ---------------- */
  {
    id: "c2-precision-nuance", level: "C2", number: 1, title: "Precision & Nuance",
    purpose: "Control meaning at the finest grain: subtlety, register, inference and the difference almost-right makes.",
    topics: ["Subtle meaning", "Register", "Inference", "Implication"],
    willLearn: ["Interpreting subtle meaning", "Shifting register deliberately", "Reading implication and inference"],
    canDo: ["Detect and use subtle meaning", "Shift register at will", "Draw complex inferences"],
    skills: ["reading", "writing", "listening", "speaking"], estimatedHours: 12,
    missions: [
      m("m-c2-subtle", "The Subtle Text", "Interpret nuance, irony and implication in demanding texts.", ["lesson-27-academic-professional-mastery"], [infer(10), meaning(6), mc(4)], ["reading"], 70),
      m("m-c2-register", "Shift the Register", "Move between registers precisely and naturally.", ["lesson-28-real-world-mastery"], [transform(6), write(8), speak(4), real(2)], ["writing", "speaking"], 70),
    ],
  },
  {
    id: "c2-rhetoric-discourse", level: "C2", number: 2, title: "Rhetoric & Discourse",
    purpose: "Full rhetorical command: build, attack and defend arguments in extended real-time discourse.",
    topics: ["Advanced rhetoric", "Rebuttal", "Extended discourse", "Composure"],
    willLearn: ["Building watertight arguments", "Rebutting precisely", "Sustaining extended discourse"],
    canDo: ["Debate at expert level", "Rebut with precision", "Sustain long, complex discourse"],
    skills: ["speaking", "listening", "reading", "writing"], estimatedHours: 12,
    missions: [
      m("m-c2-debate", "The Full Debate", "Argue, rebut and close in extended debate.", ["lesson-26-advanced-argumentation"], [speak(10), listen(6), infer(4)], ["speaking", "listening"], 70),
      m("m-c2-discourse", "Sustain the Discourse", "Lead a long, layered professional discussion.", ["lesson-28-real-world-mastery"], [dialogue(6), speak(8), listen(4), real(2)], ["speaking", "listening"], 70),
    ],
  },
  {
    id: "c2-expert-writing", level: "C2", number: 3, title: "Expert Writing",
    purpose: "Produce expert-level documents: academic prose, professional papers and precise, hedged argument.",
    topics: ["Academic prose", "Professional papers", "Hedging", "Synthesis"],
    willLearn: ["Controlling academic register", "Hedging claims precisely", "Synthesising multiple sources"],
    canDo: ["Write academic and professional papers", "Hedge and qualify expertly", "Synthesise sources into argument"],
    skills: ["writing", "reading"], estimatedHours: 12,
    missions: [
      m("m-c2-paper", "The Paper", "Produce a complete academic-style paper.", ["lesson-27-academic-professional-mastery"], [write(12), infer(4), transform(4)], ["writing", "reading"], 70),
      m("m-c2-synthesis", "Synthesise the Sources", "Combine multiple sources into one argument.", ["lesson-25-advanced-ideas"], [infer(6), write(10), short(4)], ["writing", "reading"], 70),
    ],
  },
  {
    id: "c2-real-world-mastery", level: "C2", number: 4, title: "Real-World Mastery",
    purpose: "Perform at the highest level in the real world: negotiation, mediation, crisis communication and culture bridging.",
    topics: ["Negotiation", "Mediation", "Crisis communication", "Cultural bridging"],
    willLearn: ["Mediating between parties", "Communicating in crisis", "Bridging cultural expectations"],
    canDo: ["Mediate complex disputes", "Communicate calmly in crisis", "Bridge cultures in professional settings"],
    skills: ["speaking", "listening", "writing", "reading"], estimatedHours: 12,
    missions: [
      m("m-c2-mediate", "Mediate the Dispute", "Bridge two positions and broker agreement.", ["lesson-28-real-world-mastery"], [dialogue(8), speak(6), write(4), real(2)], ["speaking", "writing"], 70),
      m("m-c2-crisis", "Crisis Communication", "Communicate clearly and calmly under pressure.", ["lesson-28-real-world-mastery"], [speak(8), listen(6), real(4), write(2)], ["speaking", "listening"], 70),
    ],
  },
];

export function worldsForLevel(level: CEFRLevel): LearningWorldV2[] {
  return WORLDS_V2.filter((w) => w.level === level);
}

export function worldById(id: string): LearningWorldV2 | undefined {
  return WORLDS_V2.find((w) => w.id === id);
}

export function totalExerciseCount(world: LearningWorldV2): number {
  return world.missions.reduce((sum, mi) => sum + mi.exercises.reduce((s, e) => s + e.count, 0), 0);
}
