/** Life-topic library, part 2 of 4 (topics 26–50): culture, education, career foundations. */
import type { LifeTopic, TopicCategory } from "./topics-a";

const t = (n: number, id: string, title: string, category: TopicCategory, ladder: Array<[string, string]>): LifeTopic => ({
  n, id, title, category,
  ladder: ladder.map(([level, example]) => ({ level, example })),
});

export const TOPICS_B: LifeTopic[] = [
  t(26, "conflict-apologies", "Conflict, Apologies & Forgiveness", "social", [
    ["A2", "I'm sorry I'm late — the bus was slow."],
    ["B1", "That came out wrong — let me try again."],
    ["B2", "I owe you an apology; I dismissed your concern far too quickly."],
    ["C1", "Forgiveness means choosing not to prosecute a mistake forever."],
  ]),
  t(27, "celebrations-traditions", "Celebrations, Traditions & Special Occasions", "culture", [
    ["A2", "We eat special food at Eid."],
    ["B1", "Every family has its own version of the same rituals."],
    ["B2", "Traditions persist because they anchor us, not because they're efficient."],
    ["C1", "Celebrations are how a community rehearses its own values."],
  ]),
  t(28, "culture-customs", "Culture, Customs & Different Ways of Life", "culture", [
    ["A2", "In my country, we greet people differently."],
    ["B1", "Small talk feels pointless until you realise it builds trust."],
    ["B2", "What reads as rude in one culture is plain efficiency in another."],
    ["C1", "Culture is less a list of customs than a set of invisible defaults."],
  ]),
  t(29, "school-university", "School, University & Education", "education", [
    ["A2", "My favourite subject is science."],
    ["B1", "I'm studying part-time while working, which is intense but worth it."],
    ["B2", "Lectures reward note-taking more than understanding, sometimes."],
    ["C1", "Universities increasingly sell credentials rather than education — discuss."],
  ]),
  t(30, "languages-study-skills", "Learning Languages & Study Skills", "education", [
    ["A2", "I learn English every day for twenty minutes."],
    ["B1", "Spaced repetition works better for me than cramming."],
    ["B2", "Speaking badly in public is the fastest way to speak well eventually."],
    ["C1", "Fluency is less about knowing words and more about tolerating ambiguity."],
  ]),
  t(31, "exams-goals-academic", "Exams, Goals & Academic Success", "education", [
    ["A2", "I have an exam on Friday."],
    ["B1", "I broke my revision into small daily blocks — it finally stuck."],
    ["B2", "Grades predict first jobs; after that, evidence takes over."],
  ]),
  t(32, "choosing-career", "Choosing a Career", "career", [
    ["A2", "I want to be an engineer like my uncle."],
    ["B1", "I chose my field because it keeps options open, honestly."],
    ["B2", "Pick problems you enjoy, and the career tends to follow."],
    ["C1", "Careers are portfolios now, not ladders — plan accordingly."],
  ]),
  t(33, "jobs-workplace", "Jobs & The Workplace", "career", [
    ["A2", "My father works in a hospital."],
    ["B1", "My manager is supportive, but the workload is heavy."],
    ["B2", "Office politics exist everywhere; ignoring them doesn't make you above them."],
    ["C1", "The workplace quietly rewards those who make other people's jobs easier."],
  ]),
  t(34, "job-applications-cv", "Job Applications & CVs/Resumes", "career", [
    ["A2", "I sent my CV to three companies."],
    ["B1", "Could you look over my cover letter before I send it?"],
    ["B2", "Tailor every application — generic ones go straight to the pile."],
    ["C1", "Your CV is a marketing document, not an autobiography."],
  ]),
  t(35, "job-interviews", "Job Interviews", "career", [
    ["A2", "I have a job interview tomorrow. Wish me luck!"],
    ["B1", "Tell me about a time you handled pressure — that question always comes up."],
    ["B2", "Interviews are two-way: I'm evaluating them as much as they're evaluating me."],
    ["C1", "The strongest candidates reframe weaknesses as works-in-progress with evidence."],
  ]),
  t(36, "starting-new-job", "Starting a New Job", "career", [
    ["A2", "It's my first day at work today."],
    ["B1", "Everyone's been welcoming, though I'm still learning names."],
    ["B2", "First weeks are for listening far more than proving."],
    ["C1", "Early credibility comes from small kept promises, not big statements."],
  ]),
  t(37, "workplace-communication", "Workplace Communication", "workplace", [
    ["A2", "Sorry, could you say that again more slowly?"],
    ["B1", "Just to confirm — you need it by Thursday, not Tuesday?"],
    ["B2", "I'll chase that up and circle back by end of day."],
    ["C1", "Over-communicating beats under-communicating in distributed teams."],
  ]),
  t(38, "meetings-presentations", "Meetings & Presentations", "workplace", [
    ["A2", "The meeting starts at ten."],
    ["B1", "Let me share my screen and walk you through the numbers."],
    ["B2", "To play devil's advocate — what happens if the timeline slips?"],
    ["C1", "Good presentations argue one point; bad ones report everything."],
  ]),
  t(39, "teamwork-collaboration", "Teamwork & Collaboration", "workplace", [
    ["A2", "We work in a small team."],
    ["B1", "I don't mind taking notes if someone else presents."],
    ["B2", "The bottleneck isn't effort — it's handoffs between teams."],
    ["C1", "Psychological safety predicts team performance better than talent does."],
  ]),
  t(40, "leadership-management", "Leadership & Management", "workplace", [
    ["B1", "Our team lead always explains the why behind decisions."],
    ["B2", "Managing former peers is awkward — authority has to be rebuilt, not announced."],
    ["C1", "Great managers remove obstacles; weak ones add supervision."],
    ["C2", "Leadership is stewardship of attention, not command of bodies."],
  ]),
  t(41, "performance-feedback", "Performance, Goals & Feedback", "workplace", [
    ["A2", "My boss says my English is improving."],
    ["B1", "Could you give me one specific thing to improve before the next review?"],
    ["B2", "Feedback stings less when you ask for it yourself."],
    ["C1", "Annual reviews measure memory more than performance — frequent micro-feedback wins."],
  ]),
  t(42, "problem-solving-work", "Problem-Solving at Work", "thinking", [
    ["B1", "The printer's broken again — let's just find a workaround."],
    ["B2", "Before proposing fixes, we should agree on what the actual problem is."],
    ["C1", "Most workplace problems are systems problems wearing people costumes."],
  ]),
  t(43, "negotiation-persuasion", "Negotiation & Persuasion", "business", [
    ["A2", "Is there any discount? It's a bit expensive."],
    ["B1", "If I pay upfront, could you include delivery?"],
    ["B2", "Let's separate the people from the problem and focus on interests."],
    ["C1", "The best deals leave both sides claiming they drove the outcome."],
  ]),
  t(44, "customer-service", "Customer Service & Difficult Customers", "business", [
    ["A2", "Excuse me, this doesn't work. Can I change it?"],
    ["B1", "I understand your frustration — let me see what I can do."],
    ["B2", "De-escalation starts with letting the customer finish completely."],
    ["C1", "One recovered complaint can build more loyalty than ten smooth transactions."],
  ]),
  t(45, "sales-business-development", "Sales & Business Development", "business", [
    ["B1", "We follow up with every enquiry within a day."],
    ["B2", "Selling is diagnosing before prescribing — most pitches skip the diagnosis."],
    ["C1", "Pipeline math beats charisma: volume, conversion, then value."],
  ]),
  t(46, "marketing-branding", "Marketing, Advertising & Branding", "business", [
    ["A2", "This shop has beautiful advertisements."],
    ["B1", "Their ads target students during exam season — clever timing."],
    ["B2", "A brand is a promise repeatedly kept, not a logo."],
    ["C1", "Attention is the scarcest resource; everything else in marketing is logistics."],
  ]),
  t(47, "starting-business", "Starting a Business", "business", [
    ["B1", "She started a bakery with her savings last year."],
    ["B2", "Validate demand before signing a lease — orders first, office later."],
    ["C1", "Most startups die of indigestion, not starvation: too many opportunities pursued badly."],
  ]),
  t(48, "entrepreneurship-innovation", "Entrepreneurship & Innovation", "business", [
    ["B1", "His little app became a real business, surprisingly."],
    ["B2", "Innovation is rarely lightning; it's usually remixing under constraints."],
    ["C1", "Entrepreneurs price risk differently — that asymmetry defines them."],
  ]),
  t(49, "business-ideas-opportunities", "Business Ideas & Opportunities", "business", [
    ["B1", "There's no good coffee near campus — that's an opportunity."],
    ["B2", "Ideas are cheap; distribution is the moat."],
    ["C1", "Look where complaints cluster — that's your product roadmap."],
  ]),
  t(50, "running-small-business", "Running a Small Business", "business", [
    ["B1", "My aunt runs a tailoring shop from home."],
    ["B2", "Cash flow kills small businesses long before competition does."],
    ["C1", "Small businesses win on relationships, never on scale."],
  ]),
];
