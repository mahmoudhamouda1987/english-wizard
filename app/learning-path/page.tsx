"use client";
import { useEffect, useState } from "react";
import { ALL_LESSONS } from "@/src/domain/all-lessons";

export default function LearningPathPage(){
 const [done,setDone]=useState<string[]>([]);
 const [current,setCurrent]=useState<string|null>(null);
 const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/learner-state",{cache:"no-store"}).then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error);setDone(p.state?.completedLessonIds??[]);setCurrent(p.state?.currentLessonId??null);}).catch(()=>setError("Sign in and complete onboarding to see your path."));},[]);
 return <main style={{maxWidth:980,margin:"0 auto",padding:"48px 24px"}}><p className="eyebrow">Personalized path</p><h1>Your learning path</h1><p className="subtle">Your path spans Pre-A1 → C2. Evidence, mastery and review can change what comes next.</p>{error&&<p role="alert">{error}</p>}<div style={{display:"grid",gap:14,marginTop:24}}>{ALL_LESSONS.map((l,i)=>{const completed=done.includes(l.id);const isCurrent=l.id===current;const unlocked=isCurrent||completed||(!current&&i===0);return <section className="panel" key={l.id}><div style={{display:"flex",justifyContent:"space-between",gap:16}}><div><span className="eyebrow">{i+1} · {l.level} · {l.skill}</span><h2>{l.title}</h2><p>{l.mission}</p></div><span>{completed?"✓ Completed":isCurrent?"Next":unlocked?"Available":"Locked"}</span></div></section>})}</div></main>;
}
