"use client";

import { useEffect, useRef, useState } from "react";
import { assessAcousticPronunciation } from "@/src/domain/pronunciation-acoustic";

const phrases=["My name is Mahmoud.","I work in education.","I would like to improve my English.","Can you tell me where the station is?"];

type PrivacyState = { voice_processing?: boolean; voice_retention_days?: number };
type ProfileState = { targetLevel?: string; englishDna?: { overallLevel?: string } };

type Metrics = ReturnType<typeof assessAcousticPronunciation> & { durationMs:number; speechLikeRatio:number; silenceRatio:number; rmsMean:number; zeroCrossingRate:number; wordsPerMinuteEstimate:number|null };

async function analyzeRecording(blob: Blob, expectedWordCount: number): Promise<Metrics> {
  const context = new AudioContext();
  const buffer = await context.decodeAudioData(await blob.arrayBuffer());
  const data = buffer.getChannelData(0);
  const frameSize = 2048;
  let speechFrames = 0;
  let rmsSum = 0;
  let zeroCrossings = 0;
  let frameCount = 0;
  for (let offset = 0; offset < data.length; offset += frameSize) {
    const end = Math.min(offset + frameSize, data.length);
    if (end <= offset) continue;
    let energy = 0;
    let crossings = 0;
    for (let i = offset; i < end; i += 1) {
      const sample = data[i];
      energy += sample * sample;
      if (i > offset && (data[i - 1] < 0) !== (sample < 0)) crossings += 1;
    }
    const rms = Math.sqrt(energy / (end - offset));
    rmsSum += rms;
    zeroCrossings += crossings;
    if (rms > 0.015) speechFrames += 1;
    frameCount += 1;
  }
  const durationMs = buffer.duration * 1000;
  const speechLikeRatio = frameCount ? speechFrames / frameCount : 0;
  const silenceRatio = 1 - speechLikeRatio;
  const rmsMean = frameCount ? rmsSum / frameCount : 0;
  const zeroCrossingRate = data.length ? zeroCrossings / data.length : 0;
  await context.close();
  const wordsPerMinuteEstimate = buffer.duration > 0 ? (expectedWordCount / buffer.duration) * 60 : null;
  return { ...assessAcousticPronunciation({ durationMs, speechLikeRatio, silenceRatio, rmsMean, zeroCrossingRate, wordsPerMinuteEstimate }, expectedWordCount), durationMs, speechLikeRatio, silenceRatio, rmsMean, zeroCrossingRate, wordsPerMinuteEstimate };
}

export default function PronunciationPage(){
  const [active,setActive]=useState(0);
  const [privacy,setPrivacy]=useState<PrivacyState|null>(null);
  const [level,setLevel]=useState("B1");
  const [recording,setRecording]=useState(false);
  const [status,setStatus]=useState("");
  const [metrics,setMetrics]=useState<Metrics|null>(null);
  const recorderRef=useRef<MediaRecorder|null>(null);
  const chunksRef=useRef<Blob[]>([]);

  useEffect(()=>{
    void Promise.all([fetch("/api/privacy").then((r)=>r.json()),fetch("/api/profile").then((r)=>r.json())]).then(([privacyPayload,profilePayload])=>{
      setPrivacy(privacyPayload.preferences ?? null);
      const profile = profilePayload.profile as ProfileState|undefined;
      setLevel(profile?.englishDna?.overallLevel ?? profile?.targetLevel ?? "B1");
    }).catch(()=>setStatus("Sign in to use pronunciation recording."));
  },[]);

  function speak(){const u=new SpeechSynthesisUtterance(phrases[active]);u.lang="en-US";window.speechSynthesis?.speak(u)}

  async function startRecording(){
    if(!privacy?.voice_processing){setStatus("Voice processing is off. Enable it in Settings → Privacy before recording.");return;}
    if(!navigator.mediaDevices?.getUserMedia){setStatus("This browser does not support microphone recording.");return;}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      chunksRef.current=[];
      const recorder=new MediaRecorder(stream);
      recorder.ondataavailable=(event)=>{if(event.data.size>0) chunksRef.current.push(event.data)};
      recorder.onstop=async()=>{
        stream.getTracks().forEach((track)=>track.stop());
        try{
          const blob=new Blob(chunksRef.current,{type:recorder.mimeType || "audio/webm"});
          const expectedWordCount=phrases[active].trim().split(/\s+/).length;
          const result=await analyzeRecording(blob,expectedWordCount);
          setMetrics(result);
          const errorTags=[
            ...(result.silenceRatio>0.45?["acoustic_pausing"]:[]),
            ...(result.wordsPerMinuteEstimate!==null && result.wordsPerMinuteEstimate<70?["slow_rhythm"]:[]),
            ...(result.wordsPerMinuteEstimate!==null && result.wordsPerMinuteEstimate>170?["fast_rhythm"]:[]),
          ];
          const response=await fetch("/api/evidence",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
            sessionType:"QUICK_QUEST",
            missionId:"pronunciation-practice",
            objectiveId:"a1-self-introduction-speaking",
            capabilityIds:["speaking.pronunciation"],
            modality:"PRONUNCIATION",
            outcome:"PARTIAL",
            score:result.score,
            confidence:0.55,
            level,
            context:"FAMILIAR",
            errorTags,
          })});
          if(!response.ok) throw new Error("evidence");
          setStatus("Acoustic practice evidence saved. No raw audio was uploaded.");
        }catch{setStatus("The acoustic analysis could not be completed. Try again.");}
      };
      recorder.start();
      recorderRef.current=recorder;
      setMetrics(null);setStatus("Recording… speak the phrase naturally.");setRecording(true);
    }catch{setStatus("Microphone access was not granted.");}
  }

  function stopRecording(){recorderRef.current?.stop();recorderRef.current=null;setRecording(false);}

  return <main id="main-content" style={{maxWidth:800,margin:"0 auto",padding:48}}>
    <p className="eyebrow">Pronunciation coach</p>
    <h1>Listen. Repeat. Measure the signals.</h1>
    <section className="panel">
      <p>Hear the model phrase, repeat it, and optionally record a consented local self-check. English Wizard measures timing, energy, pauses and rhythm as practice signals; it does not claim phoneme-level pronunciation accuracy.</p>
      <h2 style={{fontSize:28}}>{phrases[active]}</h2>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button className="button secondary" onClick={speak}>Play phrase</button>
        {!recording ? <button className="button" onClick={startRecording}>Record local self-check</button> : <button className="button" onClick={stopRecording}>Stop recording</button>}
      </div>
      {status && <p role="status" style={{marginTop:16}}>{status}</p>}
      {metrics && <div className="panel" style={{marginTop:20}}>
        <h3>Acoustic practice signals</h3>
        <p><strong>Proxy score:</strong> {metrics.score}/100</p>
        <ul>
          {metrics.signals.map((signal)=> <li key={signal}>{signal}</li>)}
        </ul>
        <p style={{fontSize:14,opacity:.8}}>Duration {Math.round(metrics.durationMs)} ms · speech-like {Math.round(metrics.speechLikeRatio*100)}% · silence {Math.round(metrics.silenceRatio*100)}% · estimated rhythm {metrics.wordsPerMinuteEstimate===null?"—":`${Math.round(metrics.wordsPerMinuteEstimate)} WPM`}</p>
        <p style={{fontSize:13,opacity:.75}}>These are acoustic proxies only. Exact phoneme accuracy and accent quality are not assessed.</p>
      </div>}
      <div style={{display:"flex",gap:8,marginTop:22}}>{phrases.map((_,i)=><button key={i} onClick={()=>{setActive(i);setMetrics(null);setStatus("")}}>{i+1}</button>)}</div>
    </section>
  </main>
}
