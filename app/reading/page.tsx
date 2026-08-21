"use client";
import { useEffect, useMemo, useState } from "react";
import { levelContent } from "@/src/domain/content-library";
import type { CEFRLevel } from "@/src/domain/learner";
import { WordExplainer } from "@/app/components/WordPopover";

export default function ReadingPage(){
 const [level,setLevel]=useState<CEFRLevel>("A1");
 const content=useMemo(()=>levelContent(level).reading,[level]);
 const [answers,setAnswers]=useState<Record<string,string>>({});
 const [submitted,setSubmitted]=useState(false);
 const [transfer,setTransfer]=useState("");
 const [saved,setSaved]=useState(false);
 const [busy,setBusy]=useState(false);
 useEffect(()=>{fetch("/api/profile").then(r=>r.json()).then(p=>{if(p.profile?.targetLevel)setLevel(p.profile.targetLevel);}).catch(()=>{});},[]);
 function scoreAnswers(){
   const items=content.comprehensionQuestions;
   const correct=items.filter(q=>answers[q.id]?.trim().toLowerCase().includes(q.answer.toLowerCase())).length;
   return {correct,total:items.length,score:items.length?Math.round(correct/items.length*100):0};
 }
 async function saveEvidence(context:"FAMILIAR"|"TRANSFER", score:number, outcome:"CORRECT"|"PARTIAL"|"SKIPPED", errorTags:string[]=[]){
   setBusy(true); setSaved(false);
   try{
     const response=await fetch("/api/evidence",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sessionType:"STANDARD_JOURNEY",missionId:`reading:${level.toLowerCase()}`,objectiveId:`reading:${level.toLowerCase()}:${context.toLowerCase()}`,capabilityIds:[`reading:${level.toLowerCase()}`],modality:context==="TRANSFER"?"TRANSFER":"READING",outcome,score,confidence:context==="TRANSFER"?0:0.75,level,context,errorTags})});
     if(!response.ok)throw new Error("save-failed");
     setSaved(true);
   }catch{setSaved(false);}
   finally{setBusy(false);}
 }
 function check(){const result=scoreAnswers();setSubmitted(true);void saveEvidence("FAMILIAR",result.score,result.score===100?"CORRECT":result.score>=50?"PARTIAL":"PARTIAL",result.score<70?["reading-comprehension"]:[]);}
 async function submitTransfer(){if(!transfer.trim())return;await saveEvidence("TRANSFER",0,"PARTIAL",["awaiting-assessment"]);setTransfer("");}
 return <main id="main-content" style={{maxWidth:860,margin:"0 auto",padding:"48px 24px"}}><p className="eyebrow">Reading Engine</p><h1>{content.title}</h1><p style={{marginTop:8,opacity:.75}}>Read, understand, answer, then transfer the same capability to a new context.</p><select value={level} onChange={e=>{setLevel(e.target.value as CEFRLevel);setSubmitted(false);setAnswers({});setTransfer("");setSaved(false);}}>{["Pre-A1","A1","A2","B1","B2","C1","C2"].map(x=><option key={x}>{x}</option>)}</select><article className="panel" style={{marginTop:18,lineHeight:1.8}}><p><WordExplainer text={content.passage}/></p></article><section style={{display:"grid",gap:14,marginTop:18}}>{content.comprehensionQuestions.map(q=><div className="panel" key={q.id}><strong><WordExplainer text={q.question}/></strong><input value={answers[q.id]??""} onChange={e=>setAnswers({...answers,[q.id]:e.target.value})}/>{submitted&&<p>{answers[q.id]?.toLowerCase().includes(q.answer.toLowerCase())?"✓ Good answer":"Review the passage and try again."}</p>}</div>)}</section><button className="button" style={{marginTop:16}} disabled={busy} onClick={check}>{busy?"Saving…":"Check understanding"}</button>{submitted&&<section className="result-box" style={{marginTop:16}}><strong>{scoreAnswers().correct}/{scoreAnswers().total} correct.</strong> Evidence has been stored for your reading progression.</section>}{content.transferPrompt&&<section className="panel" style={{marginTop:18}}><h2>Transfer</h2><p><WordExplainer text={content.transferPrompt}/></p><textarea rows={4} value={transfer} onChange={e=>setTransfer(e.target.value)} placeholder="Write your response…" /><button className="button" style={{marginTop:10}} disabled={!transfer.trim()||busy} onClick={()=>void submitTransfer()}>{busy?"Saving…":"Save transfer attempt"}</button><p className="subtle" style={{marginTop:8}}>The transfer attempt is recorded without inventing an accuracy score.</p></section>}{saved&&<p className="subtle" style={{marginTop:12}}>Your latest performance is now part of your learning evidence.</p>}</main>;
}
