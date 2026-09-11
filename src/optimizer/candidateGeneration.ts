import {Candidate,VisionProfile,DisplayProfile,PersonalTrial,Family} from '../profile/types';
import {rng} from '../stimulus/random';
import {clamp} from '../color/conversions';
import {workingBase} from '../psychophysics/assessment';
export function candidate(seed:number,vision:VisionProfile,display?:DisplayProfile):Candidate {
 const r=rng(seed),families:Family[]=['dots','dots','mosaic','noise','microdots'];
 // Empirical thresholds remain relevant even when family inference is ambiguous.
 const retained=vision.thresholds.find(t=>t.axis==='tritan')?.value;
 return {id:`c-${seed.toString(16)}`,seed,family:families[Math.floor(r()*families.length)],kind:vision.kind,severity:vision.severity,
  signal:clamp(.012+r()*.105+(retained||0)*.08,.006,.16),distraction:.045+r()*.29,residualNoise:.003+r()*.027,luminanceNoise:.001+r()*.013,
  equalY:r()>.23,angle:(r()-.5)*.30,size:6+r()*7,base:workingBase(display),invert:false};
}
export function mutate(c:Candidate,seed:number):Candidate {
 const r=rng(seed),change=(v:number,lo:number,hi:number)=>clamp(v*Math.exp((r()-.5)*.8),lo,hi);
 return {...c,id:`c-${seed.toString(16)}`,seed,signal:change(c.signal,.004,.18),distraction:change(c.distraction,.02,.39),residualNoise:change(c.residualNoise,.001,.05),luminanceNoise:change(c.luminanceNoise,.0003,.025),size:change(c.size,5,15),angle:clamp(c.angle+(r()-.5)*.1,-.3,.3),equalY:r()<.08?!c.equalY:c.equalY};
}
export function candidateDistance(a:Candidate,b:Candidate):number {return ((a.signal-b.signal)/.07)**2+((a.distraction-b.distraction)/.2)**2+((a.residualNoise-b.residualNoise)/.025)**2+((a.size-b.size)/8)**2+(a.equalY===b.equalY?0:1)+(a.family===b.family?0:.6);}
export function empiricalPrediction(c:Candidate,trials:PersonalTrial[]):{p:number,n:number} {
 let k=1,n=2;
 for(const t of trials){if(t.blank||t.candidate.kind!==c.kind)continue;const w=Math.exp(-candidateDistance(c,t.candidate)*1.8);n+=w;k+=w*(t.correct?1:0);}
 return {p:k/n,n:n-2};
}
