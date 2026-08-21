import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentUser, COOKIE } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

export async function POST(request: Request){
  const user = await currentUser();
  if(!user) return NextResponse.json({error:"Unauthorized"},{status:401});
  const body = await request.json().catch(()=>null) as Record<string,unknown>|null;
  if(body?.confirm !== "DELETE_MY_ACCOUNT") return NextResponse.json({error:"Explicit deletion confirmation is required."},{status:400});
  const account = await query("SELECT id FROM user_accounts WHERE learner_id=$1",[user.learnerId]);
  if(account.rows.length === 0) return NextResponse.json({error:"Account not found."},{status:404});

  await query(`INSERT INTO audit_events (id, learner_id, actor_id, action, entity_type, entity_id, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7)`,[
    randomUUID(),
    user.learnerId,
    String(user.learnerId),
    "ACCOUNT_DELETE_REQUESTED",
    "learner",
    String(user.learnerId),
    JSON.stringify({source:"privacy_api",explicitConfirmation:true}),
  ]);

  await query("DELETE FROM learners WHERE id=$1",[user.learnerId]);
  const response = NextResponse.json({deleted:true});
  response.cookies.set(COOKIE,"",{httpOnly:true,secure:request.headers.get("x-forwarded-proto")==="https",sameSite:"lax",path:"/",maxAge:0});
  return response;
}
