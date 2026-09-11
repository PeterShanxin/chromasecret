import {V3,M3,add,sub,mul,dot,norm,inverse,mat,rgbToOklab,luminance,clip} from '../color/conversions';
import {simulate} from '../color/cvdModels';
import {Candidate,Metrics,VisionProfile,DisplayProfile,PersonalTrial} from '../profile/types';
import {paletteSamples,ColorSample} from '../stimulus/palette';
import {candidate,mutate,empiricalPrediction} from './candidateGeneration';
import {rng} from '../stimulus/random';
interface Summary {d:V3;cov:M3;proxy:number;signal:number;}
export function summarize(samples:ColorSample[],map:(v:V3)=>V3,noise:number):Summary {
 const a=samples.filter(s=>s.inside).map(s=>map(s.rgb)),b=samples.filter(s=>!s.inside).map(s=>map(s.rgb));
 if(!a.length||!b.length)return {d:[0,0,0],cov:[[1,0,0],[0,1,0],[0,0,1]],proxy:0,signal:0};
 const mean=(vs:V3[])=>mul(vs.reduce((v,x)=>add(v,x),[0,0,0] as V3),1/vs.length),ma=mean(a),mb=mean(b),d=sub(ma,mb);
 const cov:M3=[[0,0,0],[0,0,0],[0,0,0]];
 for(const [vs,m] of [[a,ma],[b,mb]] as [V3[],V3][]){for(const v of vs){const q=sub(v,m);for(let i=0;i<3;i++)for(let j=0;j<3;j++)cov[i][j]+=q[i]*q[j]/(a.length+b.length);}}
 const signal=norm(d),trace=cov[0][0]+cov[1][1]+cov[2][2];
 return {d,cov,proxy:signal/Math.sqrt(trace+noise**2),signal};
}
function channelSeparation(samples:ColorSample[],map:(v:V3)=>number,noise=.003):number {
 const s=summarize(samples,v=>[map(v),0,0],noise);return s.proxy;
}
export function evaluate(c:Candidate,vision:VisionProfile,display?:DisplayProfile,provided?:ColorSample[]):Metrics {
 const samples=provided||paletteSamples(c),noise=vision.noise||.018;
 const normal=summarize(samples,rgbToOklab,.018),target=summarize(samples,v=>rgbToOklab(simulate(v,c.kind,c.severity)),noise);
 const y=channelSeparation(samples,luminance),channels=[0,1,2].map(i=>channelSeparation(samples,v=>v[i])) as V3;
 const saturation=summarize(samples,v=>{const y=luminance(v);return rgbToOklab(clip(v.map(x=>y+2*(x-y)) as V3));},noise).proxy;
 const covariance=normal.cov.map((row,i)=>row.map((x,j)=>x+(i===j?noise*noise/3:0))) as M3;
 const oracle=Math.sqrt(Math.max(0,dot(normal.d,mat(inverse(covariance),normal.d))));
 const clipping=samples.reduce((a,b)=>a+b.clip,0)/samples.length;
 const screenRisk=display?.confirmed?(display.quality==='reasonable'?.015:.06):.09;
 const edgeLeak=0; // Actual raster diagnostics are computed separately, not inferred here.
 const attack=Math.max(...channels,saturation);
 // Saturating utility avoids rewarding an already obvious glyph indefinitely.
 // This is an explicit heuristic, NOT an empirically calibrated recognition link.
 const utility=(x:number)=>1-Math.exp(-.85*x);
 const score=3*utility(target.proxy)-3.2*utility(normal.proxy)-.16*Math.min(attack,7)-.9*Math.min(y,8)-14*clipping-screenRisk*c.signal*10;
 return {target:target.proxy,typical:normal.proxy,differential:target.proxy-normal.proxy,luminance:y,channels,saturation,oracle,filterAttack:target.proxy,clipping,score,edgeLeak,targetSignal:target.signal,typicalSignal:normal.signal};
}
export interface SearchResult {candidate:Candidate;metrics:Metrics;empirical:{p:number,n:number};evaluated:number;}
/** Small deterministic random search plus local refinement, not black-box AI. */
export function optimize(vision:VisionProfile,display:DisplayProfile|undefined,trials:PersonalTrial[],seed:number,budget=100,incumbent?:Candidate):SearchResult {
 const r=rng(seed);let best:SearchResult|null=null,bestScore=-Infinity;
 for(let i=0;i<budget;i++){
  const s=Math.floor(r()*0xffffffff);const c:Candidate=i===0&&incumbent?{...incumbent,seed:s,id:`c-${s.toString(16)}`}:(i>budget*.5&&best&&r()>.25?mutate(best.candidate,s):candidate(s,vision,display));
  const metrics=evaluate(c,vision,display),empirical=empiricalPrediction(c,trials);
  const evidenceWeight=Math.min(.85,empirical.n/6),score=metrics.score+evidenceWeight*4*(empirical.p-.5);
  if(score>bestScore){bestScore=score;best={candidate:c,metrics,empirical,evaluated:budget};}
 }
 return best!;
}
