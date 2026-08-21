export type SkillScore={skill:string;score:number;evidence:string;confidence:number};
export function calculateOverall(scores:SkillScore[]){return scores.length?Math.round(scores.reduce((a,b)=>a+b.score,0)/scores.length):0;}
export function suggestLevel(overall:number){if(overall<20)return "Pre-A1";if(overall<35)return "A1";if(overall<50)return "A2";if(overall<65)return "B1";if(overall<80)return "B2";if(overall<92)return "C1";return "C2";}
