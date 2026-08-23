/** Life-topic library, part 4 of 4 (topics 76–100): society, global issues, philosophy, debate. */
import type { LifeTopic, TopicCategory } from "./topics-a";

const t = (n: number, id: string, title: string, category: TopicCategory, ladder: Array<[string, string]>): LifeTopic => ({
  n, id, title, category,
  ladder: ladder.map(([level, example]) => ({ level, example })),
});

export const TOPICS_D: LifeTopic[] = [
  t(76, "law-rules-rights", "Law, Rules & Personal Rights", "society", [
    ["B1", "Read the contract before signing — always."],
    ["B2", "Rights you don't understand are rights you can't use."],
    ["C1", "Rules are downstream of power; knowing that changes how you read them."],
  ]),
  t(77, "government-politics-citizenship", "Government, Politics & Citizenship", "society", [
    ["B1", "Voting took me ten minutes but I'd researched for weeks."],
    ["B2", "Local politics shapes daily life more than headlines admit."],
    ["C1", "Citizenship is participation, not just paperwork."],
  ]),
  t(78, "economy-cost-of-living", "Economy, Jobs & Cost of Living", "global", [
    ["B1", "Everything costs more this year — rent especially."],
    ["B2", "Wages lag prices, and that gap is where frustration lives."],
    ["C1", "Inflation is a tax nobody voted for, hitting fixed incomes hardest."],
  ]),
  t(79, "business-markets-trade", "Business, Markets & Global Trade", "global", [
    ["B1", "Our supermarket sells fruit from four continents."],
    ["B2", "Comparative advantage sounds abstract until factory towns empty out."],
    ["C1", "Supply chains optimise cost and quietly import fragility."],
  ]),
  t(80, "globalization-international-business", "Globalization & International Business", "global", [
    ["B1", "Her company has offices in five countries."],
    ["B2", "Global reach means global exposure — one port closure ripples everywhere."],
    ["C1", "Globalisation lifted millions and hollowed out towns; both sentences are true."],
  ]),
  t(81, "environment-sustainability", "Environment, Climate & Sustainability", "global", [
    ["A2", "We should recycle more."],
    ["B1", "Small changes matter, but policy matters more."],
    ["B2", "Sustainability fails when it's a luxury good."],
    ["C1", "The climate debate is really an argument about who pays, and when."],
  ]),
  t(82, "energy-resources-future", "Energy, Resources & The Future", "global", [
    ["B1", "Solar panels are much cheaper than ten years ago."],
    ["B2", "Every energy transition creates losers; pretending otherwise stalls progress."],
    ["C1", "The grid, not the panel, is the hard problem."],
  ]),
  t(83, "science-medicine-progress", "Science, Medicine & Human Progress", "future", [
    ["B1", "New treatments get approved faster now than before."],
    ["B2", "Progress is uneven by design — funding follows visible problems."],
    ["C1", "Science advances one funeral at a time, as the saying goes."],
  ]),
  t(84, "space-exploration-universe", "Space, Exploration & The Universe", "future", [
    ["B1", "They launched another rocket last night — did you see it?"],
    ["B2", "Space budgets raise a fair question: fix Earth first?"],
    ["C1", "Exploration pays back in perspective even when it fails commercially."],
  ]),
  t(85, "cities-urban-life", "Cities, Urban Life & The Future of Society", "society", [
    ["B1", "Cities never sleep, and neither do their rents."],
    ["B2", "Density enables culture and spreads disease — same mechanism."],
    ["C1", "The future of society is a housing policy question in disguise."],
  ]),
  t(86, "poverty-inequality-mobility", "Poverty, Inequality & Social Mobility", "society", [
    ["B1", "Where you're born still shapes where you end up."],
    ["B2", "Mobility statistics hide the doors that closed quietly."],
    ["C1", "Inequality compounds like interest — across generations."],
  ]),
  t(87, "diversity-inclusion-perspectives", "Diversity, Inclusion & Different Perspectives", "society", [
    ["B1", "Our team speaks six languages between us."],
    ["B2", "Diverse teams argue more and decide better — if led well."],
    ["C1", "Inclusion isn't inviting people to the table; it's sharing the menu."],
  ]),
  t(88, "migration-living-abroad", "Migration, Travel & Living Abroad", "global", [
    ["B1", "Living abroad teaches you what home actually meant."],
    ["B2", "Migrants send money, skills and recipes — the ledger is richer than slogans."],
    ["C1", "Every diaspora is a bridge that carries traffic in both directions."],
  ]),
  t(89, "international-relations-challenges", "International Relations & Global Challenges", "global", [
    ["B1", "World leaders met to discuss climate agreements again."],
    ["B2", "Global problems need coordination no democracy was designed for."],
    ["C1", "Diplomacy is the art of disagreeing without detonating."],
  ]),
  t(90, "war-peace-resolution", "War, Peace & Conflict Resolution", "global", [
    ["B1", "The news about the conflict is heartbreaking."],
    ["B2", "Lasting peace requires addressing causes, not just ceasefires."],
    ["C1", "Conflict resolution begins where victory stops being the goal."],
  ]),
  t(91, "philosophy-meaning-life", "Philosophy & The Meaning of Life", "philosophy", [
    ["B2", "Does meaning come from within or from what we build together?"],
    ["C1", "Meaning may be manufactured rather than discovered — and that's liberating."],
    ["C2", "If life has no inherent meaning, is responsibility heavier or lighter?"],
  ]),
  t(92, "happiness-good-life", "Happiness & What Makes a Good Life", "philosophy", [
    ["B2", "I thought money would fix everything; it fixed surprisingly little."],
    ["C1", "Happiness research keeps circling one answer: relationships."],
    ["C2", "A good life pursued directly tends to evade its pursuers."],
  ]),
  t(93, "freedom-responsibility-choice", "Freedom, Responsibility & Personal Choice", "philosophy", [
    ["B2", "Freedom without consequences is just options."],
    ["C1", "Every freedom quietly assigns someone a duty."],
    ["C2", "We are condemned to choose, as Sartre said — evasion is also a choice."],
  ]),
  t(94, "human-behavior-psychology", "Human Behavior & Why People Act the Way They Do", "philosophy", [
    ["B2", "People rarely change their minds; they change their circumstances."],
    ["C1", "Behaviour is a function of person and environment — fix the second before judging the first."],
    ["C2", "Self-report explains less about conduct than context does."],
  ]),
  t(95, "love-human-connection", "Relationships, Love & Human Connection", "philosophy", [
    ["B2", "Love is a verb dressed as a feeling."],
    ["C1", "Connection requires the risk of being genuinely seen."],
    ["C2", "Loneliness is the proof that we are built for others."],
  ]),
  t(96, "future-of-humanity", "The Future of Humanity", "future", [
    ["B2", "Will our grandchildren laugh at our technology or envy it?"],
    ["C1", "Long-term thinking is rare precisely because short-term rewards are loud."],
    ["C2", "Civilisation is a promise made to people who cannot yet vote."],
  ]),
  t(97, "technology-vs-humanity", "Technology vs. Humanity", "philosophy", [
    ["B2", "My phone knows my habits better than my family does."],
    ["C1", "Tools shape their users — the loom weaves the weaver."],
    ["C2", "The question is not whether machines think, but whether we still choose to."],
  ]),
  t(98, "leadership-power-influence", "Leadership, Power & Influence", "philosophy", [
    ["B2", "Power reveals character; it doesn't create it."],
    ["C1", "Influence decays the moment coercion replaces consent."],
    ["C2", "The powerful mistake access for agreement until the room empties."],
  ]),
  t(99, "big-ideas-arguments-debates", "Big Ideas, Arguments & Debates", "thinking", [
    ["B2", "Steelman your opponent before you dismantle them."],
    ["C1", "A debate won on technicalities loses the audience."],
    ["C2", "Ideas earn belief through survival, not declaration."],
  ]),
  t(100, "vision-future-your-place", "Vision for the Future & Your Place in the World", "future", [
    ["B2", "Where do you want to be in ten years — honestly?"],
    ["C1", "Your place in the world is negotiated between talent, need and timing."],
    ["C2", "Write the future you want, then live like the first sentence."],
  ]),
];
