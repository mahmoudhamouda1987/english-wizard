import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { getLearnerState } from "@/src/infrastructure/learner-repository";
import { getProfile } from "@/src/infrastructure/profile-repository";
import { chooseTeachingMove, explainDifferently, thinkingInEnglishPrompt } from "@/src/domain/teacher-adaptation";
import { getSubscription } from "@/src/infrastructure/subscription-repository";
import { effectiveTier } from "@/src/domain/subscription";
import { checkFeature, recordUsage } from "@/src/infrastructure/usage-guard";
import type { CEFRLevel, Skill } from "@/src/domain/learner";

const skills = new Set<Skill>(["reading","listening","writing","speaking","grammar","vocabulary","pronunciation","mediation"]);
const levels = new Set<CEFRLevel>(["Pre-A1","A1","A2","B1","B2","C1","C2"]);
const modes = new Set(["simpler_words","different_example","visual","step_by_step","arabic_support","real_life_example","compare_forms"]);

export async function POST(req: Request){
  const user = await currentUser();
  if(!user) return NextResponse.json({error:"Unauthorized"},{status:401});
  const body = await req.json().catch(()=>null) as Record<string,unknown>|null;
  if(!body) return NextResponse.json({error:"JSON body required."},{status:400});
  const tier = effectiveTier(await getSubscription(user.learnerId));
  const guard = await checkFeature(user.learnerId, tier, "AI_TEACHER");
  if(!guard.allowed){
    return NextResponse.json({
      error:`You've used today's free Teacher AI sessions (${guard.quota}/day). Upgrade to PLUS for 30 a day.`,
      upgrade:{feature:"AI_TEACHER",neededTier:"PLUS",usedToday:guard.usedToday,quota:guard.quota},
    },{status:402});
  }
  await recordUsage(user.learnerId, "AI_TEACHER");
  const profile = await getProfile(user.learnerId);
  const state = await getLearnerState(user.learnerId);
  const level = (levels.has(body.level as CEFRLevel) ? body.level as CEFRLevel : profile?.targetLevel ?? "A1");
  const skill = skills.has(body.skill as Skill) ? body.skill as Skill : "grammar";
  const score = typeof body.score === "number" ? body.score : (state?.mastery.find(item=>item.skill===skill)?.score ?? 0);
  const confidence = typeof body.confidence === "number" ? body.confidence : (state?.mastery.find(item=>item.skill===skill)?.confidence ?? 0.4);
  const errorCount = state?.errors.filter(item=>item.skill===skill).reduce((sum,item)=>sum+item.occurrences,0) ?? 0;
  const adaptation = chooseTeachingMove({level,skill,score,confidence,errorCount,learnerAskedForHelp:body.askedForHelp===true,repeatedFailure:body.repeatedFailure===true,strongPerformance:body.strongPerformance===true,dailyMinutes:profile?.dailyMinutes??20});
  const help = typeof body.mode === "string" && modes.has(body.mode) && typeof body.target === "string" ? explainDifferently(body.mode as Parameters<typeof explainDifferently>[0], body.target.slice(0,1000)) : undefined;
  return NextResponse.json({adaptation, help, thinkingInEnglish: thinkingInEnglishPrompt(level)});
}
