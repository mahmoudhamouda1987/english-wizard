import type { Skill } from "./learner";

export type CEFRBand = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface RubricDescriptor {
  band: CEFRBand;
  descriptor: string;
  canDoExample: string;
}

export type SkillRubric = Record<Skill, Record<CEFRBand, RubricDescriptor>>;

const RUBRIC_SOURCE: Array<{ skill: Skill; bands: Array<[CEFRBand, string, string]> }> = [
  {
    skill: "speaking",
    bands: [
      ["Pre-A1", "Produces isolated words and memorised phrases with heavy support.", "Can say their name and greet someone."],
      ["A1", "Uses simple phrases and sentences about personal details.", "Can order a drink using a short memorised sentence."],
      ["A2", "Describes everyday topics in a series of simple connected phrases.", "Can describe their family and daily routine."],
      ["B1", "Connects ideas smoothly to narrate experiences and give reasons.", "Can explain a problem at work and propose a solution."],
      ["B2", "Speaks clearly and interactively on abstract topics with natural errors.", "Can debate a workplace policy and defend a position."],
      ["C1", "Speaks fluently and flexibly, differentiating meaning precisely.", "Can present a nuanced argument and respond to challenges."],
      ["C2", "Conveys fine shades of meaning effortlessly in any context.", "Can mediate a sensitive negotiation between two parties."],
    ],
  },
  {
    skill: "writing",
    bands: [
      ["Pre-A1", "Copies familiar words and writes single isolated words.", "Can write their own name."],
      ["A1", "Writes short simple sentences about themselves.", "Can fill in a form with personal details."],
      ["A2", "Writes linked sentences on familiar or predictable topics.", "Can write a short note cancelling a meeting."],
      ["B1", "Writes straightforward connected text on familiar subjects.", "Can write an email explaining a delay and apologising."],
      ["B2", "Writes clear, detailed text arguing a point of view.", "Can write a structured report recommending an action."],
      ["C1", "Writes well-organised text with controlled style and register.", "Can draft a persuasive proposal for senior stakeholders."],
      ["C2", "Writes complex, precise, well-structured documents in any register.", "Can produce publishable analytical prose."],
    ],
  },
  {
    skill: "reading",
    bands: [
      ["Pre-A1", "Recognises familiar names, words and basic signs.", "Can read the word 'exit' on a sign."],
      ["A1", "Understands short simple texts with frequent words.", "Can read a short message about meeting time."],
      ["A2", "Reads straightforward factual texts on routine matters.", "Can understand simple instructions for an appliance."],
      ["B1", "Understands the main points of clear standard text.", "Can follow the argument of a newspaper opinion piece."],
      ["B2", "Reads articles and reports on contemporary issues with comprehension.", "Can evaluate evidence and tone in a specialist article."],
      ["C1", "Understands demanding longer texts and implicit meaning.", "Can critique methodology in an academic paper."],
      ["C2", "Understands virtually all forms of written language including nuance.", "Can interpret layered literary and technical texts."],
    ],
  },
  {
    skill: "listening",
    bands: [
      ["Pre-A1", "Recognises familiar words and very basic phrases when spoken slowly.", "Can identify numbers and greetings."],
      ["A1", "Understands familiar everyday expressions spoken slowly and clearly.", "Can catch a name and phone number in a message."],
      ["A2", "Understands clear speech on familiar matters.", "Can follow directions to a nearby location."],
      ["B1", "Understands extended speech and most TV news.", "Can follow a podcast discussion on a familiar topic."],
      ["B2", "Understands extended speech even with unclear structure.", "Can follow a fast workplace meeting debate."],
      ["C1", "Understands spoken language at natural speed in any context.", "Can follow idiomatic radio discussion without effort."],
      ["C2", "Comprehends fully even in fast native-level interaction.", "Can track overlapping speakers in a live negotiation."],
    ],
  },
];

export const SKILL_RUBRICS: SkillRubric = Object.fromEntries(
  RUBRIC_SOURCE.map(({ skill, bands }) => [skill, Object.fromEntries(bands.map(([band, descriptor, example]) => [band, { band, descriptor, canDoExample: example }]))]),
) as SkillRubric;

export function rubricFor(skill: Skill): Record<CEFRBand, RubricDescriptor> | undefined {
  return SKILL_RUBRICS[skill];
}

export function rubricScoreFromBand(band: CEFRBand): number {
  return { "Pre-A1": 10, A1: 25, A2: 40, B1: 55, B2: 70, C1: 85, C2: 97 }[band];
}
