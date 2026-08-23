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

const obj = (
  n: number, title: string, level: CEFRLevel, skill: CapabilitySkill, description: string,
): LearningObjective => ({
  id: `obj-${String(n).padStart(2, "0")}`,
  title,
  level,
  skill,
  description,
  prerequisites: n === 1 ? [] : [`obj-${String(n - 1).padStart(2, "0")}`],
  missionIds: [`lesson-${String(n).padStart(2, "0")}`],
  masteryThreshold: level === "Pre-A1" ? 0.75 : level === "A1" ? 0.78 : level === "A2" ? 0.8 : level === "B1" ? 0.82 : level === "B2" ? 0.85 : level === "C1" ? 0.88 : 0.92,
  retentionDays: level === "Pre-A1" ? 3 : level === "A1" ? 4 : level === "A2" ? 6 : level === "B1" ? 8 : level === "B2" ? 10 : level === "C1" ? 14 : 21,
  version: 1,
});

/** One measurable objective per lesson; the chain is strictly sequential (each unlocks the next). */
export const MVP_OBJECTIVES: LearningObjective[] = [
  obj(1, "Use survival English to introduce yourself", "Pre-A1", "speaking", "Greet people, say your name and origin, exchange basic courtesies, and survive a first meeting using fixed chunks."),
  obj(2, "Describe your home and daily surroundings", "Pre-A1", "vocabulary", "Name rooms, household objects and belongings, and describe where you live with high-frequency words."),
  obj(3, "Buy food and handle everyday services", "A1", "speaking", "Order food, ask prices, pay and manage simple shop transactions with polite fixed phrases."),
  obj(4, "Navigate places and follow directions", "A1", "listening", "Understand directions, transport announcements and location descriptions well enough to move around a town."),
  obj(5, "Talk about health and see a doctor", "A1", "reading", "Read symptoms pages, labels and appointment details, and describe basic health problems."),
  obj(6, "Build your social life in English", "A2", "speaking", "Make friends, accept and decline invitations, and keep simple social conversations going."),
  obj(7, "Tell stories about your past", "A2", "grammar", "Use common past tenses and time markers to narrate experiences, memories and recent events accurately."),
  obj(8, "Make plans and talk about the future", "A2", "writing", "Write messages about arrangements, intentions and predictions using will, going to and present continuous."),
  obj(9, "Handle study and learning situations", "A2", "reading", "Understand course information, study tips and educational texts about school, exams and online learning."),
  obj(10, "Manage work basics and interviews", "A2", "speaking", "Talk about jobs and workplaces, answer simple interview questions and introduce yourself professionally."),
  obj(11, "Communicate digitally and by email", "A2", "writing", "Write clear short emails and messages, adjust tone online and manage digital communication politely."),
  obj(12, "Travel internationally with confidence", "A2", "listening", "Follow airport, hotel and travel conversations including announcements, problems and requests abroad."),
  obj(13, "Navigate relationships and behaviour", "B1", "speaking", "Discuss relationships, handle disagreement politely and interpret other people's behaviour in conversation."),
  obj(14, "Take control of your money", "B1", "reading", "Read bank letters, budgets and financial information, and discuss saving, spending and debt."),
  obj(15, "Discuss media and entertainment", "B1", "listening", "Follow reviews, interviews and discussions about films, music, books and news content."),
  obj(16, "Engage with culture and society", "B1", "writing", "Write connected paragraphs about traditions, festivals and life in multicultural societies."),
  obj(17, "Operate in business and economic contexts", "B2", "listening", "Follow business meetings, customer conversations and discussions about companies and markets."),
  obj(18, "Communicate professionally at a high level", "B2", "writing", "Write professional emails, reports and persuasive documents with appropriate register and structure."),
  obj(19, "Solve problems and make decisions", "B2", "speaking", "Analyse problems aloud, compare options, weigh risks and defend decisions under gentle challenge."),
  obj(20, "Debate technology and the digital future", "B2", "reading", "Interpret articles about AI, automation and privacy, inferring stance and evaluating evidence."),
  obj(21, "Discuss science and the natural world", "C1", "listening", "Follow science explainers and debates about climate, energy and discovery, including uncertainty."),
  obj(22, "Analyse psychology and human behaviour", "C1", "reading", "Read demanding non-fiction about motivation, habits and decision-making, evaluating claims critically."),
  obj(23, "Lead, develop yourself and others", "C1", "speaking", "Discuss leadership, teamwork and growth with fluency, nuance and controlled emphasis."),
  obj(24, "Engage with global issues and politics", "C1", "listening", "Follow complex discussion of governments, inequality and global challenges, tracking argument and stance."),
  obj(25, "Reason about ideas, ethics and meaning", "C1", "writing", "Write precise analytical prose on abstract themes such as values, happiness and moral choice."),
  obj(26, "Argue, persuade and debate masterfully", "C2", "speaking", "Build rigorous arguments, rebut precisely, deploy rhetoric deliberately and stay composed under attack."),
  obj(27, "Perform academically and professionally at expert level", "C2", "writing", "Produce academic and professional texts — papers, talks, documentation — controlling hedging and register."),
  obj(28, "Integrate everything into real-world performance", "C2", "mediation", "Switch registers, bridge cultures, resolve disputes and perform complex real-world tasks entirely in English."),
];

const les = (
  n: number, id: string, title: string, mission: string,
): CurriculumLesson => {
  const objective = MVP_OBJECTIVES[n - 1];
  return { id, objectiveId: objective.id, title, level: objective.level, skill: objective.skill, sequence: n * 10, mission };
};

/** The 28-lesson progression: coherent life domains from survival English to full mastery. */
export const MVP_LESSONS: CurriculumLesson[] = [
  les(1, "lesson-01-me-my-world", "Me and My World", "Introduce yourself, greet people and talk about your world in survival English."),
  les(2, "lesson-02-home-everyday-life", "Home and Everyday Life", "Describe your home, your things and your daily routine."),
  les(3, "lesson-03-food-shopping-services", "Food, Shopping and Services", "Order food, buy what you need and handle shops, cafés and services."),
  les(4, "lesson-04-places-getting-around", "Places and Getting Around", "Find your way around town: directions, transport and local places."),
  les(5, "lesson-05-health-body", "Health and the Body", "Describe symptoms, visit the doctor and talk about healthy habits."),
  les(6, "lesson-06-people-social-life", "People and Social Life", "Make friends, swap invitations and enjoy social occasions in English."),
  les(7, "lesson-07-past-experiences", "Past Experiences", "Tell the story of your weekend, your childhood and memorable events."),
  les(8, "lesson-08-future-plans", "Future Plans and Dreams", "Make plans, describe ambitions and write about your future."),
  les(9, "lesson-09-education-learning", "Education and Learning", "Talk about school, studying, exams and learning languages."),
  les(10, "lesson-10-work-careers", "Work and Careers", "Discuss jobs, workplaces and interviews, and present yourself professionally."),
  les(11, "lesson-11-communication-technology", "Communication and Technology", "Handle phones, email and social media — clearly and politely."),
  les(12, "lesson-12-travel-international", "Travel and International Experiences", "Travel abroad: airports, hotels, problems and cultural surprises."),
  les(13, "lesson-13-relationships-behaviour", "Relationships and Behaviour", "Discuss relationships, handle conflict and understand why people act as they do."),
  les(14, "lesson-14-money-personal-finance", "Money and Personal Finance", "Budget, save, bank and borrow — take control of your money in English."),
  les(15, "lesson-15-media-entertainment", "Media and Entertainment", "Discuss films, music, books and the news, and share opinions confidently."),
  les(16, "lesson-16-society-culture", "Society and Culture", "Explore traditions, festivals and multicultural life, and write about them."),
  les(17, "lesson-17-business-economy", "Business and the Economy", "Follow meetings, serve customers and discuss companies and markets."),
  les(18, "lesson-18-professional-communication", "Professional Communication", "Write professional emails and reports, negotiate and present persuasively."),
  les(19, "lesson-19-problem-solving-decisions", "Problem-Solving and Decisions", "Analyse problems, compare options and defend decisions out loud."),
  les(20, "lesson-20-technology-digital-future", "Technology and the Digital Future", "Read and debate AI, automation, privacy and our digital future."),
  les(21, "lesson-21-science-natural-world", "Science and the Natural World", "Follow science explainers and debates on climate, energy and discovery."),
  les(22, "lesson-22-psychology-human-mind", "Psychology and the Human Mind", "Discuss motivation, habits, stress and how minds really work."),
  les(23, "lesson-23-leadership-personal-development", "Leadership and Personal Development", "Talk leadership, teamwork and growth — and lead the conversation."),
  les(24, "lesson-24-society-politics-global", "Society, Politics and Global Issues", "Follow and join complex discussions on power, fairness and global challenges."),
  les(25, "lesson-25-advanced-ideas", "Advanced Ideas and Abstract Thought", "Write and reason about ethics, happiness, freedom and meaning."),
  les(26, "lesson-26-advanced-argumentation", "Advanced Argumentation", "Build arguments, dismantle counterclaims and persuade any audience."),
  les(27, "lesson-27-academic-professional-mastery", "Academic and Professional Mastery", "Deliver academic prose, polished presentations and expert documentation."),
  les(28, "lesson-28-real-world-mastery", "Real-World Mastery", "Perform interviews, negotiations and crisis communication entirely in English."),
];

export function lessonIdsInOrder(): string[] {
  return [...MVP_LESSONS].sort((a, b) => a.sequence - b.sequence).map((lesson) => lesson.id);
}
