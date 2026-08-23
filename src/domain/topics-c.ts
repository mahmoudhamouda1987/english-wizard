/** Life-topic library, part 3 of 4 (topics 51–75): finance, technology, media, personal growth. */
import type { LifeTopic, TopicCategory } from "./topics-a";

const t = (n: number, id: string, title: string, category: TopicCategory, ladder: Array<[string, string]>): LifeTopic => ({
  n, id, title, category,
  ladder: ladder.map(([level, example]) => ({ level, example })),
});

export const TOPICS_C: LifeTopic[] = [
  t(51, "money-personal-finance", "Money, Income & Personal Finance", "finance", [
    ["A1", "How much is it?"],
    ["A2", "I need a new phone, but it's expensive."],
    ["B1", "I'm trying to manage my monthly budget properly."],
    ["C1", "Rising living costs are quietly rewriting people's priorities."],
    ["C2", "To what extent should individuals bear responsibility for financial outcomes in an unequal economy?"],
  ]),
  t(52, "banking-payments", "Banking, Cards & Payments", "finance", [
    ["A1", "I want to open an account."],
    ["A2", "Do you take card, or cash only?"],
    ["B1", "The payment didn't go through — can you check on your end?"],
    ["B2", "I'd rather move my savings somewhere with better interest terms."],
  ]),
  t(53, "saving-budgeting", "Saving, Spending & Budgeting", "finance", [
    ["B1", "I save a small amount at the start of the month, not the end."],
    ["B2", "Budgets fail when they ignore how people actually behave."],
    ["C1", "Automating savings removes willpower from the equation entirely."],
  ]),
  t(54, "loans-debt", "Loans, Debt & Financial Decisions", "finance", [
    ["B1", "We took out a small loan for the car."],
    ["B2", "Not all debt is equal — a mortgage and a payday loan live in different universes."],
    ["C1", "Lenders sell simplicity; borrowers pay for it in compound interest."],
  ]),
  t(55, "investing-wealth", "Investing & Building Wealth", "finance", [
    ["B1", "She invests a little every month, rain or shine."],
    ["B2", "Time in the market beats timing the market — boring but true."],
    ["C1", "Diversification is the only free lunch in finance, as they say."],
  ]),
  t(56, "business-finance-profit", "Business Finance & Profit", "finance", [
    ["B1", "The shop finally made a profit this year."],
    ["B2", "Revenue is vanity, profit is sanity, cash is king — clichés exist for reasons."],
    ["C1", "Growth funded by discounts is just buying your own revenue."],
  ]),
  t(57, "buying-home-property", "Buying a Home & Real Estate", "finance", [
    ["B1", "House prices here are impossible for first-time buyers."],
    ["B2", "Renting isn't wasting money if it buys flexibility you actually use."],
    ["C1", "Location premiums capitalise school quality, commute and safety into one number."],
  ]),
  t(58, "technology-everyday", "Technology in Everyday Life", "technology", [
    ["A2", "My phone battery dies so quickly these days."],
    ["B1", "Half my life runs through five apps now."],
    ["B2", "Convenience quietly becomes dependency — notice it before it hardens."],
    ["C1", "Every technology trades a small annoyance for a large dependency."],
  ]),
  t(59, "smartphones-apps", "Smartphones, Apps & Digital Services", "technology", [
    ["A2", "There's an app for everything now."],
    ["B1", "I cancelled three subscriptions I'd forgotten about."],
    ["B2", "Default settings are decisions someone else made for you."],
    ["C1", "Digital services compete for habit loops, not features."],
  ]),
  t(60, "internet-social-media", "The Internet & Social Media", "media", [
    ["A2", "I use social media to talk to my cousins abroad."],
    ["B1", "I've started muting accounts that make me feel worse."],
    ["B2", "Feeds optimise for reaction, not reflection."],
    ["C1", "Social media collapsed the cost of publishing before society priced the externalities."],
  ]),
  t(61, "ai-future-work", "Artificial Intelligence & The Future of Work", "technology", [
    ["B1", "AI tools help me draft emails much faster now."],
    ["B2", "AI won't take your job, but someone using it might."],
    ["C1", "The interesting question isn't replacement — it's renegotiation of every task's value."],
  ]),
  t(62, "online-safety-privacy", "Online Safety, Privacy & Cybersecurity", "technology", [
    ["B1", "Never click strange links — my account got hacked once."],
    ["B2", "If the service is free, read the business model carefully."],
    ["C1", "Privacy is no longer secrecy; it's control over context."],
  ]),
  t(63, "remote-work-collaboration", "Remote Work & Digital Collaboration", "workplace", [
    ["B1", "I work from home twice a week — I focus much better."],
    ["B2", "Async communication favours good writers; meetings favour the loud."],
    ["C1", "Remote work exposes process debt that offices used to hide."],
  ]),
  t(64, "news-media-information", "News, Media & Information", "media", [
    ["B1", "I skim headlines in the morning and read one full article."],
    ["B2", "Being first beats being right far too often in breaking news."],
    ["C1", "Attention economics rewards outrage; media literacy is self-defence now."],
  ]),
  t(65, "social-media-influence", "Social Media Influence & Online Culture", "media", [
    ["B1", "Influencers earn money by reviewing products online."],
    ["B2", "Parasocial trust is still trust — that's why it sells."],
    ["C1", "Online culture moves faster than institutions can metabolise."],
  ]),
  t(66, "decisions-problem-solving", "Making Decisions & Solving Problems", "thinking", [
    ["B1", "I list pros and cons when I'm stuck."],
    ["B2", "Most decisions are reversible; treat those as experiments."],
    ["C1", "Slow down for irreversible choices; speed up everywhere else."],
  ]),
  t(67, "goals-growth", "Goals, Ambition & Personal Growth", "thinking", [
    ["B1", "My goal this year is to speak English without translating."],
    ["B2", "Systems beat goals once motivation fades."],
    ["C1", "Growth feels like loss at first — old identities don't leave quietly."],
  ]),
  t(68, "success-failure-resilience", "Success, Failure & Resilience", "thinking", [
    ["B1", "I failed my driving test twice before passing."],
    ["B2", "Resilience isn't toughness; it's recovery speed."],
    ["C1", "Failure teaches, but only with honest post-mortems."],
  ]),
  t(69, "time-management-productivity", "Time Management & Productivity", "thinking", [
    ["B1", "I plan tomorrow's top three tasks tonight."],
    ["B2", "Busy is not the same as productive — calendar audit proves it fast."],
    ["C1", "Protect mornings like meetings; nobody schedules over what's already booked."],
  ]),
  t(70, "stress-balance", "Stress, Pressure & Work-Life Balance", "health", [
    ["B1", "I switch off my work notifications after seven."],
    ["B2", "Boundaries only work when you enforce them calmly, repeatedly."],
    ["C1", "Burnout is an organisational problem wearing a personal costume."],
  ]),
  t(71, "motivation-discipline-habits", "Motivation, Discipline & Habits", "personal", [
    ["B1", "Motivation gets me started; routine keeps me going."],
    ["B2", "Make the good habit two minutes easier than the alternative."],
    ["C1", "Identity drives habits: become the kind of person who doesn't skip."],
  ]),
  t(72, "confidence-self-expression", "Confidence & Self-Expression", "personal", [
    ["B1", "I used to rehearse sentences in my head before speaking."],
    ["B2", "Confidence follows competence more often than it leads it."],
    ["C1", "Say the thing simply; complexity is often camouflage for fear."],
  ]),
  t(73, "communication-styles", "Communication Styles & Misunderstandings", "social", [
    ["B1", "I'm direct, which some people misread as rude."],
    ["B2", "High-context cultures hear the room; low-context cultures hear the words."],
    ["C1", "Most misunderstandings are style collisions, not bad intentions."],
  ]),
  t(74, "critical-thinking-information", "Critical Thinking & Evaluating Information", "thinking", [
    ["B1", "Don't believe everything you read online."],
    ["B2", "Check who benefits before deciding what's true."],
    ["C1", "Strong claims survive steel-manning, not straw-manning."],
    ["C2", "Epistemic humility is the beginning of rigour, not the end of conviction."],
  ]),
  t(75, "ethics-values-choices", "Ethics, Values & Moral Choices", "philosophy", [
    ["B1", "He returned the wallet — it was the right thing to do."],
    ["B2", "Values show in budgets and calendars, not bios."],
    ["C1", "Integrity is what you refuse when refusal costs something."],
  ]),
];
