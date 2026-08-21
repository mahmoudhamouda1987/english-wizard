"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const GOALS = ["Speak confidently", "Improve work English", "Travel comfortably", "Understand movies and podcasts", "Build everyday vocabulary", "Write more accurately"];

export default function OnboardingPage() {
  const router = useRouter();
  const [name,setName]=useState("");
  const [nativeLanguage,setNativeLanguage]=useState("Arabic");
  const [targetLevel,setTargetLevel]=useState("B1");
  const [dailyMinutes,setDailyMinutes]=useState(20);
  const [goals,setGoals]=useState<string[]>(["Speak confidently", "Build everyday vocabulary"]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);
  function toggleGoal(goal:string){setGoals(current=>current.includes(goal)?current.filter(item=>item!==goal):[...current,goal]);}
  async function start(){
    setBusy(true);setError(null);
    try{
      const state=await fetch("/api/learner-state",{method:"POST"});
      const statePayload=await state.json();
      if(!state.ok)throw new Error(statePayload.error??"Unable to create your learner state.");
      const profile=await fetch("/api/profile",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({displayName:name,nativeLanguage,targetLevel,dailyMinutes,goals})});
      const profilePayload=await profile.json();
      if(!profile.ok)throw new Error(profilePayload.error??"Unable to save your profile.");
      router.push("/diagnostic");
    }catch(r){setError(r instanceof Error?r.message:"Unable to start your learning journey.")}
    finally{setBusy(false)}
  }
  return <main id="main-content" style={{maxWidth:760,margin:"0 auto",padding:"56px 24px"}}><p className="eyebrow">Welcome</p><h1>Let’s build your English learning path.</h1><p className="subtle">A short setup lets English Wizard personalize the diagnostic and learning plan.</p><section className="panel" style={{display:"grid",gap:14,marginTop:24}}><label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label><label>Native language<input value={nativeLanguage} onChange={e=>setNativeLanguage(e.target.value)}/></label><label>Target level<select value={targetLevel} onChange={e=>setTargetLevel(e.target.value)}>{["A1","A2","B1","B2","C1","C2"].map(x=><option key={x}>{x}</option>)}</select></label><label>Minutes per day<input type="number" min="5" max="180" value={dailyMinutes} onChange={e=>setDailyMinutes(Number(e.target.value))}/></label><fieldset style={{border:0,padding:0,margin:0}}><legend>What do you want English for?</legend><div style={{display:"grid",gap:8}}>{GOALS.map(goal=><label key={goal} style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={goals.includes(goal)} onChange={()=>toggleGoal(goal)}/><span>{goal}</span></label>)}</div></fieldset><button className="button" disabled={busy||goals.length===0} onClick={start}>{busy?"Preparing your profile…":"Start diagnostic →"}</button>{error&&<p role="alert" style={{color:"#a53b3b"}}>{error}</p>}</section></main>;
}
