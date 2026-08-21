"use client";
import { useEffect, useState } from "react";

type Chunk = { id:string; text:string; meaning:string; level:string; functions:string[]; variants:string[]; contexts:string[]; commonErrors:string[]; state?: { knowledge:string; encounters:number; productive_attempts:number; successful_productions:number } | null };

export default function ChunksPage(){
  const [chunks,setChunks]=useState<Chunk[]>([]);
  const [message,setMessage]=useState("");
  useEffect(()=>{fetch("/api/chunks").then(r=>r.json()).then(d=>setChunks(d.chunks??[]));},[]);
  async function mark(id:string,productive:boolean){
    const response=await fetch("/api/chunks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chunkId:id,productive,success:productive})});
    if(response.ok){ const next=await response.json(); setChunks(current=>current.map(c=>c.id===id?{...c,state:{...(c.state??{encounters:0,productive_attempts:0,successful_productions:0}),knowledge:next.knowledge,encounters:next.encounters,productive_attempts:next.productiveAttempts,successful_productions:next.successfulProductions}}:c)); setMessage(productive?"Productive use recorded.":"Receptive encounter recorded."); }
  }
  return <main id="main-content" style={{maxWidth:980,margin:"0 auto",padding:40}}><p className="eyebrow">Chunks & communication</p><h1>Learn language people actually use</h1><p className="muted">Build receptive knowledge first, then turn useful chunks into productive language for real communication functions.</p><div style={{display:"grid",gap:16,marginTop:24}}>{chunks.map(chunk=><article className="panel" key={chunk.id}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><div><p className="eyebrow">{chunk.level} · {chunk.functions.join(" · ")}</p><h2>{chunk.text}</h2><p>{chunk.meaning}</p><p className="muted">Variants: {chunk.variants.join(" / ")}</p></div><strong>{chunk.state?.knowledge ?? "NEW"}</strong></div><div style={{display:"flex",gap:8,marginTop:16}}><button className="button secondary" onClick={()=>mark(chunk.id,false)}>I recognise it</button><button className="button" onClick={()=>mark(chunk.id,true)}>I can use it</button></div></article>)}</div>{message&&<p role="status" style={{marginTop:18}}>{message}</p>}</main>
}
