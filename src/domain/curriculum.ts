export type CEFRLevel = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type CapabilitySkill = "reading" | "listening" | "speaking" | "writing" | "grammar" | "vocabulary" | "pronunciation" | "mediation";

export interface LearningObjective {
  id: string;
  title: string;
  level: CEFRLevel;
  skill: CapabilitySkill;
  description: string;
  prerequisites: string[];
  missionIds: string[];
  masteryThreshold: number;
  retentionDays: number;
  version: number;
}

export interface CurriculumLesson {
  id: string;
  objectiveId: string;
  title: string;
  level: CEFRLevel;
  skill: CapabilitySkill;
  sequence: number;
  mission: string;
}

export const MVP_OBJECTIVES: LearningObjective[] = [
  { id: "a1-self-introduction-speaking", title: "Introduce yourself with basic personal information", level: "A1", skill: "speaking", description: "Give a short introduction using name, origin, role, interests, and simple present forms.", prerequisites: [], missionIds: ["a1-meet-someone"], masteryThreshold: 0.8, retentionDays: 3, version: 1 },
  { id: "a1-present-simple-routines", title: "Describe routines using the present simple", level: "A1", skill: "grammar", description: "Use present-simple forms accurately for habitual actions and basic facts.", prerequisites: ["a1-self-introduction-speaking"], missionIds: ["a1-meet-someone"], masteryThreshold: 0.8, retentionDays: 4, version: 1 },
  { id: "a1-asking-basic-questions", title: "Ask and answer common personal questions", level: "A1", skill: "speaking", description: "Form and respond to common who/what/where/when questions in simple interactions.", prerequisites: ["a1-self-introduction-speaking"], missionIds: ["a1-meet-someone"], masteryThreshold: 0.8, retentionDays: 4, version: 1 },
  { id: "a1-basic-listening-intent", title: "Understand the main point of short everyday exchanges", level: "A1", skill: "listening", description: "Identify the basic purpose and key information in short, clearly spoken exchanges.", prerequisites: ["a1-self-introduction-speaking"], missionIds: ["a1-meet-someone"], masteryThreshold: 0.8, retentionDays: 5, version: 1 },
  { id: "prea1-survival-phrases", title: "Recognize essential survival phrases", level: "Pre-A1", skill: "vocabulary", description: "Recognize greetings, numbers, yes/no responses, and essential classroom phrases.", prerequisites: [], missionIds: ["prea1-survive"], masteryThreshold: 0.75, retentionDays: 2, version: 1 },
  { id: "prea1-sound-foundations", title: "Hear and reproduce core English sounds", level: "Pre-A1", skill: "pronunciation", description: "Distinguish and imitate a small set of high-value English sounds and stress patterns.", prerequisites: ["prea1-survival-phrases"], missionIds: ["prea1-survive"], masteryThreshold: 0.75, retentionDays: 2, version: 1 },
  { id: "prea1-basic-reading", title: "Decode short familiar words", level: "Pre-A1", skill: "reading", description: "Recognize common words, labels, names, and simple signs.", prerequisites: ["prea1-survival-phrases"], missionIds: ["prea1-survive"], masteryThreshold: 0.75, retentionDays: 3, version: 1 },
  { id: "prea1-basic-listening", title: "Identify key information in very short speech", level: "Pre-A1", skill: "listening", description: "Catch names, numbers, simple requests, and familiar everyday words.", prerequisites: ["prea1-survival-phrases"], missionIds: ["prea1-survive"], masteryThreshold: 0.75, retentionDays: 3, version: 1 },
  { id: "a2-daily-interactions", title: "Handle routine transactions and everyday interactions", level: "A2", skill: "speaking", description: "Complete simple practical interactions about shopping, travel, schedules, and services.", prerequisites: ["a1-basic-listening-intent"], missionIds: ["a2-real-life"], masteryThreshold: 0.8, retentionDays: 5, version: 1 },
  { id: "a2-past-events", title: "Describe completed past events clearly", level: "A2", skill: "grammar", description: "Use common past forms and time markers to describe experiences and events.", prerequisites: ["a1-present-simple-routines"], missionIds: ["a2-real-life"], masteryThreshold: 0.8, retentionDays: 6, version: 1 },
  { id: "a2-short-messages", title: "Write useful short messages", level: "A2", skill: "writing", description: "Write short notes, messages, invitations, and simple personal descriptions.", prerequisites: ["a1-present-simple-routines"], missionIds: ["a2-real-life"], masteryThreshold: 0.8, retentionDays: 6, version: 1 },
  { id: "a2-main-idea", title: "Understand the main idea of everyday conversations", level: "A2", skill: "listening", description: "Follow familiar conversations and extract key details when speech is clear.", prerequisites: ["a1-basic-listening-intent"], missionIds: ["a2-real-life"], masteryThreshold: 0.8, retentionDays: 6, version: 1 },
  { id: "b1-independent-conversation", title: "Maintain an independent everyday conversation", level: "B1", skill: "speaking", description: "Give connected answers, ask follow-up questions, and manage common social and work situations.", prerequisites: ["a2-daily-interactions"], missionIds: ["b1-independent"], masteryThreshold: 0.82, retentionDays: 7, version: 1 },
  { id: "b1-opinion-writing", title: "Write connected paragraphs expressing opinions", level: "B1", skill: "writing", description: "Produce coherent paragraphs with reasons, examples, and basic linking devices.", prerequisites: ["a2-short-messages"], missionIds: ["b1-independent"], masteryThreshold: 0.82, retentionDays: 8, version: 1 },
  { id: "b1-authentic-listening", title: "Follow the main points of authentic speech", level: "B1", skill: "listening", description: "Understand the main points and useful details in standard speech on familiar topics.", prerequisites: ["a2-main-idea"], missionIds: ["b1-independent"], masteryThreshold: 0.82, retentionDays: 8, version: 1 },
  { id: "b1-reading-articles", title: "Read practical articles for meaning and detail", level: "B1", skill: "reading", description: "Locate main ideas, supporting details, and the writer's basic purpose.", prerequisites: ["a2-main-idea"], missionIds: ["b1-independent"], masteryThreshold: 0.82, retentionDays: 8, version: 1 },
  { id: "b2-argumentation", title: "Develop and defend a position", level: "B2", skill: "speaking", description: "Explain viewpoints, weigh alternatives, and respond naturally to counterpoints.", prerequisites: ["b1-independent-conversation"], missionIds: ["b2-professional"], masteryThreshold: 0.85, retentionDays: 10, version: 1 },
  { id: "b2-structured-writing", title: "Write clear structured professional texts", level: "B2", skill: "writing", description: "Organize reports, emails, and essays with clear structure, evidence, and appropriate tone.", prerequisites: ["b1-opinion-writing"], missionIds: ["b2-professional"], masteryThreshold: 0.85, retentionDays: 10, version: 1 },
  { id: "b2-fast-listening", title: "Follow extended speech and discussions", level: "B2", skill: "listening", description: "Track arguments, implied connections, and specific details in extended standard speech.", prerequisites: ["b1-authentic-listening"], missionIds: ["b2-professional"], masteryThreshold: 0.85, retentionDays: 10, version: 1 },
  { id: "b2-nuanced-reading", title: "Infer attitude and purpose in longer texts", level: "B2", skill: "reading", description: "Interpret tone, supporting evidence, and implied meaning across longer authentic texts.", prerequisites: ["b1-reading-articles"], missionIds: ["b2-professional"], masteryThreshold: 0.85, retentionDays: 10, version: 1 },
  { id: "c1-fluent-discussion", title: "Participate fluently in complex discussion", level: "C1", skill: "speaking", description: "Speak spontaneously with precise language, flexible turn-taking, and controlled nuance.", prerequisites: ["b2-argumentation"], missionIds: ["c1-fluency"], masteryThreshold: 0.88, retentionDays: 14, version: 1 },
  { id: "c1-advanced-writing", title: "Write precise, coherent advanced texts", level: "C1", skill: "writing", description: "Write well-structured analytical and professional texts using varied language and controlled register.", prerequisites: ["b2-structured-writing"], missionIds: ["c1-fluency"], masteryThreshold: 0.88, retentionDays: 14, version: 1 },
  { id: "c1-complex-listening", title: "Understand long complex speech with implicit meaning", level: "C1", skill: "listening", description: "Follow complex talks, interviews, and discussions including attitude and inference.", prerequisites: ["b2-fast-listening"], missionIds: ["c1-fluency"], masteryThreshold: 0.88, retentionDays: 14, version: 1 },
  { id: "c1-critical-reading", title: "Interpret complex texts critically", level: "C1", skill: "reading", description: "Evaluate claims, rhetoric, assumptions, and subtle meaning in demanding texts.", prerequisites: ["b2-nuanced-reading"], missionIds: ["c1-fluency"], masteryThreshold: 0.88, retentionDays: 14, version: 1 },
  { id: "c2-precision-speaking", title: "Express precise distinctions effortlessly", level: "C2", skill: "speaking", description: "Handle highly nuanced professional, academic, and social discussion with precision.", prerequisites: ["c1-fluent-discussion"], missionIds: ["c2-mastery"], masteryThreshold: 0.92, retentionDays: 21, version: 1 },
  { id: "c2-expert-writing", title: "Produce expert-level writing for varied audiences", level: "C2", skill: "writing", description: "Control structure, register, rhetorical effect, and subtle lexical choices in sophisticated writing.", prerequisites: ["c1-advanced-writing"], missionIds: ["c2-mastery"], masteryThreshold: 0.92, retentionDays: 21, version: 1 },
  { id: "c2-complex-listening", title: "Understand virtually all standard spoken English", level: "C2", skill: "listening", description: "Follow fast, complex speech, idiom, inference, and register shifts with minimal effort.", prerequisites: ["c1-complex-listening"], missionIds: ["c2-mastery"], masteryThreshold: 0.92, retentionDays: 21, version: 1 },
  { id: "c2-expert-reading", title: "Interpret sophisticated texts and rhetoric", level: "C2", skill: "reading", description: "Understand fine-grained meaning, style, argumentation, and rhetorical choices across demanding texts.", prerequisites: ["c1-critical-reading"], missionIds: ["c2-mastery"], masteryThreshold: 0.92, retentionDays: 21, version: 1 },
];

export const MVP_LESSONS: CurriculumLesson[] = [
  { id: "lesson-a1-self-introduction", objectiveId: "a1-self-introduction-speaking", title: "Meet Someone: Introduce Yourself", level: "A1", skill: "speaking", sequence: 10, mission: "Meet someone new and introduce yourself naturally." },
  { id: "lesson-a1-routines", objectiveId: "a1-present-simple-routines", title: "Talk About Your Routine", level: "A1", skill: "grammar", sequence: 20, mission: "Describe a normal day and ask someone about theirs." },
  { id: "lesson-a1-questions", objectiveId: "a1-asking-basic-questions", title: "Keep the Conversation Going", level: "A1", skill: "speaking", sequence: 30, mission: "Ask and answer personal questions in a short conversation." },
  { id: "lesson-a1-listening", objectiveId: "a1-basic-listening-intent", title: "Catch the Point", level: "A1", skill: "listening", sequence: 40, mission: "Listen to a short exchange and identify what each person needs." },
  { id: "lesson-prea1-survival", objectiveId: "prea1-survival-phrases", title: "English Survival Kit", level: "Pre-A1", skill: "vocabulary", sequence: 1, mission: "Use essential greetings, numbers, and survival phrases." },
  { id: "lesson-prea1-sounds", objectiveId: "prea1-sound-foundations", title: "Sound Like English", level: "Pre-A1", skill: "pronunciation", sequence: 2, mission: "Hear and imitate high-value English sounds." },
  { id: "lesson-prea1-reading", objectiveId: "prea1-basic-reading", title: "Read the World Around You", level: "Pre-A1", skill: "reading", sequence: 3, mission: "Decode familiar English words, labels, and signs." },
  { id: "lesson-prea1-listening", objectiveId: "prea1-basic-listening", title: "Catch the Important Word", level: "Pre-A1", skill: "listening", sequence: 4, mission: "Catch names, numbers, and simple requests." },
  { id: "lesson-a2-interactions", objectiveId: "a2-daily-interactions", title: "Real-Life English", level: "A2", skill: "speaking", sequence: 50, mission: "Handle a practical everyday interaction." },
  { id: "lesson-a2-past", objectiveId: "a2-past-events", title: "Tell Me What Happened", level: "A2", skill: "grammar", sequence: 60, mission: "Describe a completed event clearly." },
  { id: "lesson-a2-messages", objectiveId: "a2-short-messages", title: "Useful Messages", level: "A2", skill: "writing", sequence: 70, mission: "Write a short practical message." },
  { id: "lesson-a2-listening", objectiveId: "a2-main-idea", title: "Follow the Conversation", level: "A2", skill: "listening", sequence: 80, mission: "Catch the main idea and key details." },
  { id: "lesson-b1-conversation", objectiveId: "b1-independent-conversation", title: "Speak Without Scripts", level: "B1", skill: "speaking", sequence: 90, mission: "Maintain a connected independent conversation." },
  { id: "lesson-b1-writing", objectiveId: "b1-opinion-writing", title: "Give Your Opinion", level: "B1", skill: "writing", sequence: 100, mission: "Write a connected opinion paragraph." },
  { id: "lesson-b1-listening", objectiveId: "b1-authentic-listening", title: "Listen for the Real Point", level: "B1", skill: "listening", sequence: 110, mission: "Follow the main points of authentic speech." },
  { id: "lesson-b1-reading", objectiveId: "b1-reading-articles", title: "Read for Meaning", level: "B1", skill: "reading", sequence: 120, mission: "Find main ideas and supporting details in an article." },
  { id: "lesson-b2-argument", objectiveId: "b2-argumentation", title: "Make Your Case", level: "B2", skill: "speaking", sequence: 130, mission: "Defend a position and respond to counterpoints." },
  { id: "lesson-b2-writing", objectiveId: "b2-structured-writing", title: "Write Like a Professional", level: "B2", skill: "writing", sequence: 140, mission: "Produce a clear structured professional text." },
  { id: "lesson-b2-listening", objectiveId: "b2-fast-listening", title: "Keep Up With the Discussion", level: "B2", skill: "listening", sequence: 150, mission: "Follow extended speech and arguments." },
  { id: "lesson-b2-reading", objectiveId: "b2-nuanced-reading", title: "Read Between the Lines", level: "B2", skill: "reading", sequence: 160, mission: "Infer attitude, purpose, and implied meaning." },
  { id: "lesson-c1-discussion", objectiveId: "c1-fluent-discussion", title: "Lead a Complex Conversation", level: "C1", skill: "speaking", sequence: 170, mission: "Participate fluently in a demanding discussion." },
  { id: "lesson-c1-writing", objectiveId: "c1-advanced-writing", title: "Write With Precision", level: "C1", skill: "writing", sequence: 180, mission: "Write a precise advanced text for a specific audience." },
  { id: "lesson-c1-listening", objectiveId: "c1-complex-listening", title: "Hear the Meaning Behind the Words", level: "C1", skill: "listening", sequence: 190, mission: "Follow complex talks and infer attitude and intent." },
  { id: "lesson-c1-reading", objectiveId: "c1-critical-reading", title: "Think Critically in English", level: "C1", skill: "reading", sequence: 200, mission: "Evaluate claims, assumptions, and rhetoric." },
  { id: "lesson-c2-speaking", objectiveId: "c2-precision-speaking", title: "Speak With Exact Precision", level: "C2", skill: "speaking", sequence: 210, mission: "Handle highly nuanced discussion effortlessly." },
  { id: "lesson-c2-writing", objectiveId: "c2-expert-writing", title: "Write at Expert Level", level: "C2", skill: "writing", sequence: 220, mission: "Control structure, register, and rhetorical effect." },
  { id: "lesson-c2-listening", objectiveId: "c2-complex-listening", title: "Understand Everything That Matters", level: "C2", skill: "listening", sequence: 230, mission: "Follow fast, complex speech with minimal effort." },
  { id: "lesson-c2-reading", objectiveId: "c2-expert-reading", title: "Master Sophisticated Texts", level: "C2", skill: "reading", sequence: 240, mission: "Interpret fine-grained meaning and rhetoric." },
];

export function lessonIdsInOrder(): string[] {
  return [...MVP_LESSONS].sort((a, b) => a.sequence - b.sequence).map((lesson) => lesson.id);
}
