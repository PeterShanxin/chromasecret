import {V3,add,mul,norm,sub,rgbToOklab,clamp} from '../color/conversions';
import {confusionDirection,simulate,VisionKind} from '../color/cvdModels';
import {AssessmentTrial,VisionProfile,ModelFit,Axis,DisplayProfile} from '../profile/types';
import {rebuild,threshold} from './staircase';
import {rng} from '../stimulus/random';
export function assessmentSignal(axis:Axis,amplitude:number,kind:VisionKind,severity:number,base=.28):number {
 const d:V3=axis==='catch'?[1,1,1]:confusionDirection(axis,true),b:V3=[base,base,base];
 return norm(sub(rgbToOklab(simulate(add(b,mul(d,amplitude)),kind,severity)),rgbToOklab(simulate(b,kind,severity))));
}
/** 2AFC chance floor 0.5, 3% lapse, threshold-like saturating curve.
 * The link is an explicit modeling assumption, not a validated clinical norm. */
export function pCorrect(signal:number,noise:number):number {return .5+.47*(1-Math.exp(-.5*(signal/Math.max(.0001,noise))**2));}
export function makeAssessmentTrial(trials:AssessmentTrial[],seed:number,display?:DisplayProfile):AssessmentTrial {
 const n=trials.length,r=rng(seed),axes:Axis[]=['protan','deutan','tritan'];
 const axis:Axis=n%8===7?'catch':axes[(n-Math.floor(n/8))%3];
 const stair=rebuild(trials),amplitude=axis==='catch'?.16:stair[axis].level;
 const base=workingBase(display);
 return {id:n,seed,axis,amplitude,base,side:r()>.5?1:0,response:null,correct:false,rt:0,at:new Date().toISOString()};
}
export function workingBase(display?:DisplayProfile):number {if(!display?.confirmed)return .28;const black=display.black/255,white=display.white/255;return clamp((black**display.gamma+white**display.gamma)*.34,.20,.36);}
export function fitVision(trials:AssessmentTrial[]):VisionProfile {
 const measured=trials.filter(t=>t.axis!=='catch'),fits:(ModelFit&{ll:number})[]=[];
 const kinds:VisionKind[]=['normal','protan','deutan','tritan'];
 const noises=[.005,.008,.012,.018,.025,.036];
 for(const kind of kinds)for(const severity of kind==='normal'?[0]:Array.from({length:10},(_,i)=>(i+1)/10))for(const noise of noises){
  let ll=0;
  for(const t of measured){const p=pCorrect(assessmentSignal(t.axis,t.amplitude,kind,severity,t.base),noise);ll+=Math.log(t.correct?p:1-p);}
  // Equal prior mass by model family, not by number of severity grid points.
  ll-=Math.log(kind==='normal'?1:10);fits.push({kind,severity,noise,weight:0,ll});
 }
 const max=Math.max(...fits.map(x=>x.ll));let total=0;
 for(const f of fits){f.weight=Math.exp(f.ll-max);total+=f.weight;}for(const f of fits)f.weight/=total;
 const mass=Object.fromEntries(kinds.map(k=>[k,fits.filter(f=>f.kind===k).reduce((a,b)=>a+b.weight,0)])) as Record<VisionKind,number>;
 const bestKind=[...kinds].sort((a,b)=>mass[b]-mass[a])[0];
 const conditional=fits.filter(f=>f.kind===bestKind),weighted=(key:'severity'|'noise')=>conditional.reduce((a,b)=>a+b.weight*b[key],0)/mass[bestKind];
 const sev=weighted('severity'),noise=weighted('noise');
 const distribution=Array.from({length:11},(_,i)=>({s:i/10,w:conditional.filter(f=>Math.abs(f.severity-i/10)<1e-8).reduce((a,b)=>a+b.weight,0)/mass[bestKind]}));
 let acc=0,lo=0,hi=1,gotLo=false;for(const d of distribution){acc+=d.w;if(acc>=.025&&!gotLo){lo=d.s;gotLo=true;}if(acc>=.975){hi=d.s;break;}}
 const catches=trials.filter(t=>t.axis==='catch'),catchOk=catches.length<2||catches.filter(t=>t.correct).length/catches.length>=.75;
 const uncertain=mass[bestKind]<.6||measured.length<24||!catchOk;
 const label=!catchOk?'Uncertain: check viewing conditions':uncertain?'Uncertain / overlapping models':bestKind==='normal'?'Typical-like discrimination':bestKind==='tritan'?'Blue-yellow limitation (exploratory)':`${bestKind[0].toUpperCase()+bestKind.slice(1)}-like`;
 const stairs=rebuild(trials);
 return {label,kind:bestKind,severity:sev,severityInterval:[lo,hi],noise,confidence:mass[bestKind]>.85&&measured.length>=60&&catchOk?'moderate':'limited',thresholds:(['protan','deutan','tritan'] as const).map(a=>threshold(a,stairs[a])),fits:fits.sort((a,b)=>b.weight-a.weight).slice(0,18).map(({ll,...f})=>f),catches:{correct:catches.filter(t=>t.correct).length,total:catches.length},trials,source:'measured'};
}
