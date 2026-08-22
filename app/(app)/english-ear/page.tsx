"use client";
import { speakText } from "@/src/domain/tts";
import { Celebration } from "@/app/components/celebration";
import { useEffect, useMemo, useState } from "react";
import type { CEFRLevel } from "@/src/domain/learner";
import { levelContent } from "@/src/domain/content-library";
import { WordExplainer } from "@/app/components/WordPopover";

export default function EnglishEarPage(){
 const [level,setLevel]=useState<CEFRLevel>("A1");
 const item=useMemo(()=>levelContent(level).ear,[level]);
 const [heard,setHeard]=useState(0);
 const [answer,setAnswer]=useState("");
 const [checked,setChecked]=useState(false);
 const [saved,setSaved]=useState(false);
 const [busy,setBusy]=useState(false);
 useEffect(()=>{fetch("/api/profile").then(r=>r.json()).then(p=>{if(p.profile?.targetLevel)setLevel(p.profile.targetLevel);}).catch(()=>{});},[]);
 function speak(text:string){speakText(text,{lang:"en-GB",rate:0.9});}
 async function check(){
   const normal=(answer.trim().replace(/\s+/g," ")).toLowerCase();
   const expected=item.writtenForm.trim().replace(/\s+/g," ").toLowerCase();
   const correct=normal===expected;
   setChecked(true); setBusy(true); setSaved(false);
   try{
     const response=await fetch("/api/evidence",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sessionType:"QUICK_QUEST",missionId:`english-ear:${level.toLowerCase()}`,objectiveId:`english-ear:${item.patternType.toLowerCase()}`,capabilityIds:[`ear:${item.patternType.toLowerCase()}`],modality:"LISTENING",outcome:correct?"CORRECT":"PARTIAL",score:correct?100:0,confidence:correct?0.8:0.5,level,context:"FAMILIAR",errorTags:correct?[]:["connected-speech-decoding"]})});
     if(!response.ok)throw new Error("save-failed");
     setSaved(true);
   }catch{setSaved(false);}
   finally{setBusy(false);}
 }
 return <main id="main-content" style={{maxWidth:820,margin:"0 auto",padding:"48px 24px"}}><p className="eyebrow">English Ear</p><h1>Hear what people actually say</h1><p style={{marginTop:8,opacity:.75}}>Train connected and reduced speech by hearing the spoken form, comparing it with the formal spelling, then decoding it yourself.</p><select value={level} onChange={e=>{setLevel(e.target.value as CEFRLevel);setAnswer("");setChecked(false);setSaved(false);}}>{["Pre-A1","A1","A2","B1","B2","C1","C2"].map(x=><option key={x}>{x}</option>)}</select><section className="panel" style={{marginTop:18}}><div className="eyebrow">{item.patternType}</div><h2><WordExplainer text={item.spokenForm}/></h2><p>Written form: <strong><WordExplainer text={item.writtenForm}/></strong></p><p><WordExplainer text={item.explanation}/></p><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button className="button" onClick={()=>{speak(item.spokenForm);setHeard(heard+1)}}>▶ Hear spoken form</button><button className="button secondary" onClick={()=>speak(item.writtenForm)}>Hear full form</button></div><p>Listen attempts: {heard} / {item.replayCountTarget}</p></section><section className="panel" style={{marginTop:18}}><h2>Decode it</h2><p><WordExplainer text={item.discriminationQuestion}/></p><input value={answer} onChange={e=>{setAnswer(e.target.value);setChecked(false);}} placeholder="Type the full form you heard…" /><button className="button" disabled={!answer.trim()||busy} style={{marginTop:10}} onClick={()=>void check()}>{busy?"Saving…":"Check"}</button>{checked&&<p style={{marginTop:12}}>{answer.trim().replace(/\s+/g," ").toLowerCase()===item.writtenForm.trim().replace(/\s+/g," ").toLowerCase()?"✓ Correct decoding.":"Not quite. Listen again, compare the connected form, and retry."}</p>}</section><Celebration trigger={saved ? "yes" : ""} />{saved&&<p className="subtle" style={{marginTop:12}}>Your listening evidence is now part of your learner model.</p>}</main>;
}
