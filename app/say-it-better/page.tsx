"use client";
import { useEffect, useMemo, useState } from "react";
import { levelContent } from "@/src/domain/content-library";
import type { CEFRLevel } from "@/src/domain/learner";
import { WordExplainer } from "@/app/components/WordPopover";

type Step="identify"|"correct"|"retry"|"transfer";

export default function SayItBetterPage(){
 const [level,setLevel]=useState<CEFRLevel>("A1");
 const [step,setStep]=useState<Step>("identify");
 const item=useMemo(()=>levelContent(level).sayItBetter,[level]);
 const [retry,setRetry]=useState("");
 const [transfer,setTransfer]=useState("");
 const [saved,setSaved]=useState(false);
 const [busy,setBusy]=useState(false);
 useEffect(()=>{fetch("/api/profile").then(r=>r.json()).then(p=>{if(p.profile?.targetLevel)setLevel(p.profile.targetLevel);}).catch(()=>{});},[]);
 async function saveAttempt(context:"FAMILIAR"|"TRANSFER"){
   setBusy(true);setSaved(false);
   try{
     const response=await fetch("/api/evidence",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sessionType:"STANDARD_JOURNEY",missionId:`say-it-better:${level.toLowerCase()}`,objectiveId:`say-it-better:${context.toLowerCase()}`,capabilityIds:[`revision:${level.toLowerCase()}`],modality:"WRITING",outcome:"PARTIAL",score:0,confidence:0,level,context,errorTags:["awaiting-assessment"]})});
     if(!response.ok)throw new Error("save-failed");
     setSaved(true);
   }catch{setSaved(false);}
   finally{setBusy(false);}
 }
 function advance(){
   if(step==="identify")setStep("correct");
   else if(step==="correct"){setStep("retry");void saveAttempt("FAMILIAR");}
   else if(step==="retry"){if(!retry.trim())return;setStep("transfer");void saveAttempt("FAMILIAR");}
   else {if(!transfer.trim())return;void saveAttempt("TRANSFER");}
 }
 return <main id="main-content" style={{maxWidth:860,margin:"0 auto",padding:"48px 24px"}}><p className="eyebrow">Say It Better</p><h1>Turn correct English into natural English</h1><p style={{marginTop:8,opacity:.75}}>Notice the difference, understand why it matters, retry it yourself, then transfer the pattern to a new situation.</p><select value={level} onChange={e=>{setLevel(e.target.value as CEFRLevel);setStep("identify");setRetry("");setTransfer("");setSaved(false);}}>{["Pre-A1","A1","A2","B1","B2","C1","C2"].map(x=><option key={x}>{x}</option>)}</select><section className="panel" style={{marginTop:18}}><div className="eyebrow">Your version</div><p style={{fontSize:24}}><WordExplainer text={item.learnerVersion}/></p><div className="eyebrow" style={{marginTop:18}}>Correction</div><p><WordExplainer text={item.correctedVersion}/></p><div className="eyebrow" style={{marginTop:18}}>Natural</div><p><WordExplainer text={item.naturalVersion}/></p><div className="eyebrow" style={{marginTop:18}}>Advanced</div><p><WordExplainer text={item.advancedVersion}/></p><div className="eyebrow" style={{marginTop:18}}>Professional</div><p><WordExplainer text={item.professionalVersion}/></p><p><strong>Why:</strong> <WordExplainer text={item.changeNotes.join(" · ")}/></p></section>{step!=="identify"&&<section className="panel" style={{marginTop:18}}><h2>Retry</h2><p><WordExplainer text={item.retryPrompt}/></p><textarea rows={4} value={retry} onChange={e=>setRetry(e.target.value)} placeholder="Write your new version…" /></section>}{(step==="transfer")&&<section className="panel" style={{marginTop:18}}><h2>Transfer</h2><p><WordExplainer text={item.transferPrompt}/></p><textarea rows={4} value={transfer} onChange={e=>setTransfer(e.target.value)} placeholder="Use the same skill in a new context…" /></section>}<div style={{display:"flex",gap:10,marginTop:16}}><button className="button" disabled={busy||(step==="retry"&&!retry.trim())||(step==="transfer"&&!transfer.trim())} onClick={advance}>{busy?"Saving…":step==="identify"?"See why":step==="correct"?"Start retry":step==="retry"?"Move to transfer":"Save transfer"}</button></div><p className="subtle" style={{marginTop:10}}>Revision attempts are stored as learning evidence without inventing an AI accuracy score.</p>{saved&&<p className="subtle" style={{marginTop:8}}>Saved to your learner evidence.</p>}</main>;
}
