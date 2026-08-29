"use client";
import { useEffect,useMemo,useState } from "react";
import { buildLearningRationale } from "@/src/domain/learning-rationale";
import { MVP_OBJECTIVES } from "@/src/domain/curriculum";
import { lessonBody } from "@/src/domain/lesson-bodies";
import { materialsFor } from "@/src/domain/lesson-materials";
import { speakText } from "@/src/domain/tts";
import { ScenePlayer } from "@/app/components/scene-player";
import { ListeningLab } from "@/app/components/listening-lab";
import { fullSceneSetForLesson, dictationForLevel } from "@/src/domain/scenes";
import { practiceForLesson } from "@/src/domain/practice-generator";
import { missionFor } from "@/src/domain/mission";
import { UpgradePrompt, parseUpgradePayload } from "@/app/components/upgrade-prompt";
interface LearnerState{currentLessonId:string|null;completedLessonIds:string[];nextAction:{type:string;id:string;reason?:string;priority?:string}|null}
interface Lesson{id:string;title:string;mission:string;objectiveId:string;level:string;skill:string}
interface AdaptiveLesson{title?:string;objective?:string;explanation?:string;examples?:string[];guidedPractice?:Array<{prompt:string;answer:string}>;productionTask?:string;successCriteria?:string[];reviewTip?:string}
interface LoopState{phase:string;failedAttempts:number;successfulAttempts:number;transferPassed:boolean;assessedScore:number|null}
interface GradeBreakdown{score:number;feedback:string;errorIntelligence:{pattern:string;explanation:string;severity:string;status:string}|null;masteryState:string|undefined}
function QuickPractice({ exercises }: { exercises: Array<{ q: string; choices?: string[]; answer?: number; typed?: boolean; accept?: string[] }> }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [typed, setTyped] = useState<Record<number, string>>({});
  const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {exercises.map((ex, qi) => {
        if (ex.typed) {
          const value = typed[qi] ?? "";
          const correct = (ex.accept ?? []).some((a) => normalise(a) === normalise(value));
          return (
            <div key={qi}>
              <p style={{ margin: "0 0 6px" }}><strong>{qi + 1}.</strong> {ex.q}</p>
              <input aria-label={`Answer for question ${qi + 1}`} value={value} disabled={picked[qi] !== undefined} onChange={(e) => setTyped((p) => ({ ...p, [qi]: e.target.value.slice(0, 60) }))} onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) setPicked((p) => ({ ...p, [qi]: correct ? 1 : 0 })); }} style={{ maxWidth: 320, padding: "8px 12px" }} placeholder="Type your answer…" />
              {picked[qi] !== undefined && <span style={{ marginLeft: 8 }}>{picked[qi] === 1 ? "✓ Correct" : `✗ The answer was “${ex.accept?.[0]}”`}</span>}
              {picked[qi] === undefined && <button type="button" className="button secondary" style={{ marginLeft: 8, padding: "8px 12px" }} disabled={!value.trim()} onClick={() => setPicked((p) => ({ ...p, [qi]: correct ? 1 : 0 }))}>Check</button>}
            </div>
          );
        }
        const choices = ex.choices ?? [];
        const chosen = picked[qi];
        return (
          <div key={qi}>
            <p style={{ margin: "0 0 6px" }}><strong>{qi + 1}.</strong> {ex.q}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {choices.map((c, ci) => (
                <button key={ci} type="button" className={chosen === undefined ? "button secondary" : ci === ex.answer ? "button" : chosen === ci ? "state-card error" : "button secondary"} style={{ padding: "8px 12px" }} onClick={() => setPicked((p) => ({ ...p, [qi]: ci }))}>
                  {chosen !== undefined && ci === ex.answer ? "✓ " : ""}{c}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
function MaterialsTabs({lesson,completedLessonIds}:{lesson:Lesson;completedLessonIds:string[]}){
 const[tab,setTab]=useState<"words"|"scene"|"listen"|"practice"|"mission">("words");
 const[sceneIdx,setSceneIdx]=useState(0);
 const mats=materialsFor(lesson.id);
 const sceneSet=useMemo(()=>fullSceneSetForLesson(lesson.id),[lesson.id]);
 const mission=useMemo(()=>missionFor(lesson.id),[lesson.id]);
  const recycleFrom=useMemo(()=>completedLessonIds.slice(-4),[completedLessonIds]);
  const recycleKey=recycleFrom.join(",");
  const practiceSet=useMemo(()=>practiceForLesson(lesson.id,recycleKey?recycleKey.split(","):[]),[lesson.id,recycleKey]);
 const scene=sceneSet[Math.min(sceneIdx,sceneSet.length-1)]??sceneSet[0];
 const tabs:Array<[typeof tab,string,string]>=[["mission","🧭","Mission"],["words","","Key words"],["scene",` Scenes (${sceneSet.length})`,"Scenes"],["listen",`🎧 Listening`,"Listening lab"],["practice","","Practice"]];
 return (
  <section aria-label="Interactive lesson materials" style={{marginTop:18,padding:"16px 20px",background:"var(--surface)",borderRadius:14,border:"1px solid var(--border)"}}>
   <h2 style={{fontSize:17,margin:"0 0 10px"}}>Immersive studio — audio, scenes and drills generated inside the platform</h2>
   <div role="tablist" aria-label="Material types" style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
    {tabs.map(([id,icon,label])=>(
     <button key={id} type="button" role="tab" aria-selected={tab===id} className={tab===id?"button":"button secondary"} onClick={()=>setTab(id)}>{icon} {label}</button>
    ))}
   </div>
   {tab==="mission"&&mission&&(
    <div style={{display:"grid",gap:14}}>
     <p style={{margin:0}}><span className="chip" style={{fontWeight:800,background:"#6840d6",color:"white"}}>Stage · {mission.stageName}</span> <em>{mission.stageClaim}</em></p>
     <div><p className="eyebrow" style={{margin:"0 0 6px"}}>Life topics in this lesson</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{mission.topicTitles.map(t=><span key={t} className="chip">{t}</span>)}{mission.ladderExamples.map((ex,i)=><span key={i} className="chip" style={{opacity:.85}} dir="ltr">“{ex}”</span>)}</div>
     </div>
      <div><p className="eyebrow" style={{margin:"0 0 4px"}}>You&rsquo;ll meet (recurring characters)</p>
      <ul style={{margin:0,paddingLeft:20,lineHeight:1.8}}>{mission.cast.map(c=><li key={c}>{c}</li>)}</ul>
     </div>
     <div style={{padding:14,background:"#f6f2ff",borderRadius:12}}>
      <p style={{margin:"0 0 6px",fontWeight:800}}> AI role-play — {mission.roleplay.scenarioId.replace("rp-","")}</p>
      <p style={{margin:"0 0 10px",lineHeight:1.7}}>{mission.roleplay.situation}<br /><strong>You are:</strong> {mission.roleplay.yourRole} · <strong>Partner:</strong> {mission.roleplay.partnerRole}<br /><strong>Goal:</strong> {mission.roleplay.goal}</p>
      <a className="button" href={`/roleplay?scenario=${mission.roleplay.scenarioId}`}>Start the conversation →</a>
     </div>
     <div style={{padding:14,background:"#f2f7ff",borderRadius:12}}>
      <p style={{margin:"0 0 6px",fontWeight:800}}> Writing challenge ({mission.writing.genre})</p>
      <p style={{margin:0,lineHeight:1.7}}>{mission.writing.prompt} <em>({mission.writing.minWords}–{mission.writing.maxWords} words)</em></p>
     </div>
     <div style={{padding:14,background:"#fff9ef",borderRadius:12}}>
      <p style={{margin:"0 0 6px",fontWeight:800}}>🎤 Speaking challenge</p>
      <p style={{margin:"0 0 10px",lineHeight:1.7}}>{mission.speakingChallenge}</p>
      <a className="button secondary" href="/speaking">Open speaking practice →</a>
     </div>
     <div style={{padding:14,background:"#eefaf3",borderRadius:12,borderLeft:"4px solid #10b981"}}>
      <p style={{margin:"0 0 6px",fontWeight:800}}> Real-life mission</p>
      <p style={{margin:0,lineHeight:1.7}}>{mission.realLifeMission}</p>
     </div>
    </div>
   )}
   {tab==="words"&&(mats?(
    <>
     <p className="subtle" style={{margin:"0 0 10px"}}>{mats.vocab.length} words with British audio — tap 🔊 to listen.</p>
     <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
      {mats.vocab.map(w=>(
       <span key={w.word} className="chip" style={{fontSize:14,padding:"6px 10px"}}>
        {w.word} <span dir="rtl" style={{opacity:.85}}>· {w.ar}</span>
        <button type="button" onClick={()=>speakText(w.word,{lang:"en-GB",rate:0.85})} aria-label={`Listen to ${w.word}`} style={{marginLeft:6,cursor:"pointer"}}>🔊</button>
       </span>
      ))}
     </div>
    </>
   ):<p>No word list for this lesson yet.</p>)}
   {tab==="scene"&&scene&&(
    <>
     <div role="tablist" aria-label="Scene picker" style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {sceneSet.map((s,i)=>(
       <button key={s.id} type="button" role="tab" aria-selected={i===sceneIdx} className={i===sceneIdx?"button":"button secondary"} onClick={()=>setSceneIdx(i)} title={s.title}>{i+1}</button>
      ))}
     </div>
     <ScenePlayer scene={scene} />
     <p className="subtle" style={{marginTop:8,marginBottom:0}}>Scene {Math.min(sceneIdx+1,sceneSet.length)} of {sceneSet.length} — every scene, voice and visual is produced inside the platform — nothing links out.</p>
    </>
   )}
   {tab==="listen"&&<ListeningLab items={dictationForLevel(lesson.level,20,lesson.id)} />}
   {tab==="practice"&&(<><QuickPractice exercises={practiceSet} /><p className="subtle" style={{marginBottom:0}}>{practiceSet.length} exercises for your level — including {recycleFrom.length>0?"spaced review of earlier lessons":"this lesson's level band"}.</p></>)}
   </section>
 );
}
export default function LearnPage(){
 const[state,setState]=useState<LearnerState|null>(null);const[lesson,setLesson]=useState<Lesson|null>(null);const[loop,setLoop]=useState<LoopState|null>(null);const[busy,setBusy]=useState(false);const[aiBusy,setAiBusy]=useState(false);const[aiLesson,setAiLesson]=useState<AdaptiveLesson|null>(null);const[production,setProduction]=useState("");const[error,setError]=useState<string|null>(null);const[grade,setGrade]=useState<GradeBreakdown|null>(null);const[upgrade,setUpgrade]=useState<ReturnType<typeof parseUpgradePayload>>(null);
 useEffect(()=>{let cancelled=false;Promise.all([fetch("/api/learner-state",{cache:"no-store"}).then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error??"Unable to load learner state.");return p.state as LearnerState}),fetch("/api/curriculum",{cache:"no-store"}).then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error??"Unable to load curriculum.");return p.lessons as Lesson[]}),fetch("/api/learning-loop",{cache:"no-store"}).then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error??"Unable to load learning loop.");return p.loop as LoopState})]).then(([nextState,lessons,nextLoop])=>{if(cancelled)return;setState(nextState);const found=lessons.find(i=>i.id===nextState.currentLessonId)??lessons.find(i=>!nextState.completedLessonIds.includes(i.id))??null;setLesson(found??lessons[0]??null);setLoop(nextLoop)}).catch((reason:unknown)=>{if(!cancelled)setError(reason instanceof Error?reason.message:"Unable to load the lesson.")});return()=>{cancelled=true}},[]);
 const lessonMission=useMemo(()=>lesson?missionFor(lesson.id):null,[lesson]);
 const productionTask=aiLesson?.productionTask??lessonMission?.writing.prompt??lesson?.mission??"Complete the lesson mission in your own words.";
 const rationale=useMemo(()=>{if(!lesson)return null;const valueBySkill:Record<string,string>={speaking:"You will handle real conversations, interviews and presentations.",listening:"You will follow real speech in meetings, films and daily life.",reading:"You will understand articles, contracts and study material on your own.",writing:"You will write clear emails, applications and reports.",grammar:"Correct structures make every other skill reliable.",vocabulary:"The right words let you say exactly what you mean."};return buildLearningRationale(lesson.objectiveId,state?.nextAction?.reason??"it is the next objective in your learning path",valueBySkill[lesson.skill]??"This capability unlocks real communication in English.","Your production task scores at least 70% evidence strength.",loop?.phase==="TRANSFER"?"A transfer task in an unfamiliar context.":"Consolidation through spaced review.");},[lesson,state,loop]);
 const performanceScore=useMemo(()=>{const words=production.trim().split(/\s+/).filter(Boolean).length;const sentences=production.split(/[.!?]+/).filter(Boolean).length;return Math.min(100,Math.round(Math.min(words/25,1)*70+Math.min(sentences/3,1)*30));},[production]);
 async function completeCurrentLesson(){if(!lesson)return;const answer=production.trim();if(answer.length<20){setError("Complete the production task in at least 20 characters before finishing the lesson.");return}setBusy(true);setError(null);try{const evidenceId=`production-${lesson.id}-${crypto.randomUUID()}`;const practice=await fetch("/api/practice/submit",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({skill:lesson.skill,objectiveId:lesson.objectiveId,correct:performanceScore>=70,lessonId:lesson.id,evidenceId,prompt:productionTask,answer})});const practicePayload=await practice.json();if(practice.status===402){setUpgrade(parseUpgradePayload(practicePayload));setBusy(false);return}if(!practice.ok)throw new Error(practicePayload.error??"Unable to save your practice evidence.");setGrade({score:practicePayload.score,feedback:practicePayload.feedback,errorIntelligence:practicePayload.errorIntelligence,masteryState:practicePayload.masteryState});const loopResponse=await fetch("/api/learning-loop",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({phase:"PRODUCE",evidenceId,passed:performanceScore>=70,score:performanceScore})});const loopPayload=await loopResponse.json();if(!loopResponse.ok)throw new Error(loopPayload.error??"Unable to update the learning loop.");setLoop(loopPayload.loop);const response=await fetch("/api/lesson/complete",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({lessonId:lesson.id,evidenceIds:[evidenceId],performanceScore})});const payload=await response.json();if(!response.ok)throw new Error(payload.error??"Unable to complete the lesson.");setState(payload.state);if(payload.gated){setError(`You scored ${payload.performance?.score??performanceScore}% — this lesson needs ${payload.requiredScore}% to clear. Your evidence was saved; strengthen your production and submit again.`);return}setProduction("");setAiLesson(null);const curriculum=await fetch("/api/curriculum",{cache:"no-store"}).then(r=>r.json());setLesson(curriculum.lessons.find((item:Lesson)=>item.id===payload.state.currentLessonId)??null)}catch(reason){setError(reason instanceof Error?reason.message:"Unable to complete the lesson.")}finally{setBusy(false)}}
 async function generateAdaptiveLesson(){if(!lesson)return;setAiBusy(true);setError(null);try{const response=await fetch("/api/ai/lesson",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({goal:lesson.mission,skill:lesson.skill,lessonId:lesson.id})});const payload=await response.json();if(!response.ok)throw new Error(payload.error??"Unable to generate adaptive lesson.");setAiLesson(payload.lesson)}catch(reason){setError(reason instanceof Error?reason.message:"Unable to generate adaptive lesson.")}finally{setAiBusy(false)}}
 if(error&&!state)return <main id="main-content" style={{maxWidth:900,margin:"0 auto",padding:"56px 24px"}}><p role="alert">{error}</p></main>;if(!state)return <main id="main-content" style={{maxWidth:900,margin:"0 auto",padding:"56px 24px"}}><p>Loading your learner state…</p></main>;if(!lesson)return <main id="main-content" style={{maxWidth:900,margin:"0 auto",padding:"56px 24px"}}><h1>Learning path complete</h1><p>There is no unfinished lesson in the current curriculum.</p><a href="/dashboard">Back to dashboard</a></main>;
 return <main id="main-content" style={{maxWidth:900,margin:"0 auto",padding:"56px 24px"}}><p style={{fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>Today</p><h1>{lesson.title}</h1><p style={{fontSize:20,lineHeight:1.6}}>{lesson.mission}</p>{lessonBody(lesson.id)&&<section aria-label="Lesson teaching" style={{marginTop:18,padding:"18px 20px",background:"var(--surface)",borderRadius:14,border:"1px solid #e4e8f0"}}><p className="eyebrow">Teach · {loop?.phase??"TEACH"} phase</p><h2 style={{fontSize:17,margin:"6px 0"}}>How this works</h2><p style={{lineHeight:1.7}}>{lessonBody(lesson.id)!.explanation}</p><h3 style={{fontSize:15,margin:"12px 0 4px"}}>Examples</h3><ul style={{margin:"0 0 10px",paddingLeft:20,lineHeight:1.9}}>{lessonBody(lesson.id)!.examples.map(ex=><li key={ex}>{ex}</li>)}</ul><details><summary style={{cursor:"pointer",fontWeight:700,fontSize:14}}>Common mistakes to avoid</summary><ul style={{paddingLeft:20,lineHeight:1.8,marginTop:8}}>{lessonBody(lesson.id)!.commonMistakes.map(m=><li key={m}>{m}</li>)}</ul></details><p className="subtle" style={{marginTop:10}}> {lessonBody(lesson.id)!.tip}</p></section>}
{rationale&&<section aria-label="Why you are learning this" data-testid="learning-rationale" style={{marginTop:18,padding:"16px 20px",background:"#f2f0fb",borderRadius:14,borderLeft:"4px solid #6840d6"}}><h2 style={{margin:"0 0 8px",fontSize:17}}>Why you are learning this</h2><p style={{margin:"4px 0"}}>{rationale.whyNow}</p><p style={{margin:"4px 0"}}><strong>Real-world value:</strong> {rationale.realWorldValue}</p><p style={{margin:"4px 0"}}><strong>Success looks like:</strong> {rationale.successMeasure}</p></section>}{upgrade&&<UpgradePrompt info={upgrade} onClose={()=>setUpgrade(null)} />}
<section style={{marginTop:32,padding:24,background:"var(--surface)",borderRadius:18,border:"1px solid #e4e8f0"}}><h2>Lesson objective</h2><p><strong>Objective:</strong> {MVP_OBJECTIVES.find(o=>o.id===lesson.objectiveId)?.title??lesson.objectiveId}</p><p><strong>Level:</strong> {lesson.level}</p><p><strong>Skill:</strong> {lesson.skill}</p>{grade&&<section aria-label="Why this score" style={{marginTop:18,padding:"16px 20px",background:"#f0faf5",borderRadius:14,borderLeft:"4px solid #10b981"}}><h2 style={{margin:"0 0 8px",fontSize:17}}>Why this score — no black box</h2><p style={{margin:"4px 0"}}><strong>Evidence score:</strong> {grade.score}% · {grade.feedback}</p>{grade.masteryState&&<p style={{margin:"4px 0"}}><strong>Capability state:</strong> {String(grade.masteryState).toUpperCase()}</p>}{grade.errorIntelligence&&<p style={{margin:"4px 0"}}><strong>Pattern flagged:</strong> {grade.errorIntelligence.pattern} — {grade.errorIntelligence.explanation} (severity {grade.errorIntelligence.severity}, now {grade.errorIntelligence.status})</p>}<p style={{margin:"8px 0 0"}} className="subtle">Scores move by evidence rules: +30% weighted toward recent proof when correct, −20% decay when not. Same rules for everyone, always visible.</p></section>}
<p><strong>Learning loop:</strong> {loop?.phase??"TEACH"}</p><p><strong>Completed:</strong> {state.completedLessonIds.length} lesson(s)</p><div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:18}}><button disabled={busy} onClick={completeCurrentLesson} style={{padding:"13px 18px",border:0,borderRadius:10,background:"#6840d6",color:"white",fontWeight:800,cursor:busy?"wait":"pointer"}}>{busy?"Saving your real evidence…":"Submit production & complete →"}</button><button disabled={aiBusy} onClick={generateAdaptiveLesson} style={{padding:"13px 18px",border:"1px solid #dfe3ec",borderRadius:10,background:"white",fontWeight:800,cursor:aiBusy?"wait":"pointer"}}>{aiBusy?"Building your custom lesson…":"Teach me this with AI →"}</button></div><MaterialsTabs lesson={lesson} completedLessonIds={state.completedLessonIds} />
<label style={{display:"grid",gap:8,marginTop:18}}><span><strong>Your production</strong> — {productionTask}</span><textarea aria-label="Your production response" value={production} onChange={e=>setProduction(e.target.value.slice(0,5000))} rows={7} placeholder="Write or say your answer here. Your response becomes learning evidence."/><small>Evidence strength: {performanceScore}%</small></label>{error&&<p role="alert" style={{marginTop:14,color:"#a53b3b"}}>{error}</p>}</section>{aiLesson&&<section style={{marginTop:20,padding:24,background:"#fbfaff",borderRadius:18,border:"1px solid #e7defc"}}><p style={{fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>Adaptive AI Teacher</p><h2>{aiLesson.title}</h2><p>{aiLesson.objective}</p><h3>Explanation</h3><p>{aiLesson.explanation}</p>{aiLesson.examples?.length&&<><h3>Examples</h3><ul>{aiLesson.examples.map((x,i)=><li key={i}>{x}</li>)}</ul></>}{aiLesson.guidedPractice?.length&&<><h3>Guided practice</h3>{aiLesson.guidedPractice.map((x,i)=><div key={i} style={{padding:12,background:"white",borderRadius:10,marginTop:8}}><strong>{i+1}.</strong> {x.prompt}<p style={{marginBottom:0}}><strong>Model answer:</strong> {x.answer}</p></div>)}</>}{aiLesson.productionTask&&<><h3>Production</h3><p>{aiLesson.productionTask}</p></>}{aiLesson.reviewTip&&<p><strong>Review tip:</strong> {aiLesson.reviewTip}</p>}</section>}<a href="/dashboard" style={{display:"inline-block",marginTop:24}}>Back to dashboard</a></main>;
}
