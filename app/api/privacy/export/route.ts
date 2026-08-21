import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

export async function GET(){
  const user = await currentUser();
  if(!user) return NextResponse.json({error:"Unauthorized"},{status:401});
  const [account, profile, state, diagnostics, events, reviews, privacy, consents, evidence, entitlements] = await Promise.all([
    query("SELECT id,email,display_name,created_at FROM user_accounts WHERE learner_id=$1",[user.learnerId]),
    query("SELECT learner_id,display_name,native_language,target_level,daily_minutes,goals,english_dna,created_at,updated_at FROM learner_profiles WHERE learner_id=$1",[user.learnerId]),
    query("SELECT current_lesson_id,completed_lesson_ids,lesson_history,mastery,errors,next_action,state_version,updated_at FROM learner_state WHERE learner_id=$1",[user.learnerId]),
    query("SELECT answers,scores,cefr_level,english_dna,created_at FROM diagnostic_attempts WHERE learner_id=$1 ORDER BY created_at ASC",[user.learnerId]),
    query("SELECT event_type,payload,occurred_at FROM learning_events WHERE learner_id=$1 ORDER BY occurred_at ASC",[user.learnerId]),
    query("SELECT skill,prompt,answer,interval_days,ease,repetitions,due_at,created_at,updated_at FROM review_cards WHERE learner_id=$1 ORDER BY created_at ASC",[user.learnerId]),
    query("SELECT analytics,personalized_ai,voice_processing,voice_retention_days,share_for_human_review,updated_at FROM learner_privacy_preferences WHERE learner_id=$1",[user.learnerId]),
    query("SELECT purpose,provider_disclosure,consented,consented_at,revoked_at,deletion_requested_at,created_at FROM voice_consents WHERE learner_id=$1 ORDER BY created_at ASC",[user.learnerId]),
    query("SELECT id,source_type,skill,objective_id,evidence,score,transfer,occurred_at FROM evidence_records WHERE learner_id=$1 ORDER BY occurred_at ASC",[user.learnerId]),
    query("SELECT tier,feature,quota,used,reset_at FROM entitlements WHERE learner_id=$1 ORDER BY feature ASC",[user.learnerId]),
  ]);
  return NextResponse.json({ exportedAt:new Date().toISOString(), learnerId:user.learnerId, account:account.rows[0]??null, profile:profile.rows[0]??null, state:state.rows[0]??null, diagnosticAttempts:diagnostics.rows, learningEvents:events.rows, reviewCards:reviews.rows, privacyPreferences:privacy.rows[0]??null, voiceConsents:consents.rows, evidenceRecords:evidence.rows, entitlements:entitlements.rows });
}
