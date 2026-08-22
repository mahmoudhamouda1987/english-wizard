"use client";
import Link from "next/link";
import { WORLDS, MISSIONS, BOSS_MISSIONS } from "@/src/domain/missions";
import { SESSION_MODES } from "@/src/domain/learning-systems";

export default function WorldsPage(){
  return <main id="main-content" style={{maxWidth:1100,margin:"0 auto",padding:"48px 24px"}}>
    <p className="eyebrow">English Wizard Worlds</p>
    <h1>Learn through missions, not just lessons.</h1>
    <p className="subtle">Each world represents a meaningful stage of English capability. Your next mission should be chosen from evidence, not from a fixed checklist.</p>
    <div style={{display:"grid",gap:16,marginTop:24}}>
      {WORLDS.map(world=>{
        const missions=[...MISSIONS,...BOSS_MISSIONS].filter(m=>m.worldId===world.id);
        return <section className="panel" key={world.id}>
          <div className="eyebrow">World {world.number} · {world.level}</div>
          <h2>{world.title}</h2>
          <p>{world.purpose}</p>
          <div style={{display:"grid",gap:10,marginTop:12}}>{missions.map(m=><div key={m.id} style={{padding:14,border:"1px solid var(--border)",borderRadius:12}}><strong>{m.title}{"boss" in m && m.boss ? " · BOSS" : ""}</strong><p style={{margin:"6px 0 0"}}>{m.scenario}</p><small>{m.skillMix.join(" · ")}</small>{m.id === "boss-c2-live-in-english" && <div style={{marginTop:10}}><Link href="/worlds/live-in-english" className="button secondary">Enter Live in English</Link></div>}</div>)}</div>
        </section>;
      })}
    </div>
    <section className="panel" style={{marginTop:24}}><div className="eyebrow">Choose your time</div><h2>Session modes</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>{SESSION_MODES.map(mode=><Link href="/learn" key={mode.type} className="panel" style={{textDecoration:"none"}}><strong>{mode.type.replaceAll("_"," ")}</strong><p>{mode.targetMinutes} min</p><small>{mode.description}</small></Link>)}</div></section>
  </main>;
}
