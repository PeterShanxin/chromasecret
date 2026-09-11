import {Staircase,Threshold,AssessmentTrial,Axis} from '../profile/types';
import {clamp} from '../color/conversions';
export function createStaircase(level=.09):Staircase{return {level,streak:0,direction:0,reversals:[],trials:0};}
/** Two consecutive correct -> down, one wrong -> up. Log-amplitude steps.
 * Long stationary series approach ~70.7% correct, not guaranteed by a short run. */
export function advance(s:Staircase,correct:boolean):Staircase {
 let streak=correct?s.streak+1:0,direction=correct?(streak>=2?-1:0):1;
 if(streak>=2)streak=0;
 const reversals=[...s.reversals];
 if(direction&&s.direction&&direction!==s.direction)reversals.push(s.level);
 const step=reversals.length<2?1.55:1.25;
 return {level:clamp(s.level*(direction===1?step:direction===-1?1/step:1),.002,.28),streak,direction:direction||s.direction,reversals,trials:s.trials+1};
}
export function threshold(axis:Axis,s:Staircase):Threshold {
 const samples=s.reversals.slice(2);const values=samples.length?samples:s.reversals;
 return {axis,value:values.length?Math.exp(values.reduce((a,b)=>a+Math.log(b),0)/values.length):null,n:s.trials,reversals:s.reversals.length,censored:s.level<=.0021||s.level>=.279};
}
export function rebuild(trials:AssessmentTrial[]):Record<'protan'|'deutan'|'tritan',Staircase>{
 const s={protan:createStaircase(),deutan:createStaircase(),tritan:createStaircase()};
 for(const t of trials)if(t.axis!=='catch')s[t.axis]=advance(s[t.axis],t.correct);return s;
}
export function wilson(k:number,n:number):[number,number] {if(!n)return [0,1];const z=1.96,p=k/n,den=1+z*z/n,center=(p+z*z/(2*n))/den,spread=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den;return [Math.max(0,center-spread),Math.min(1,center+spread)];}
export function normalizeResponse(s:string):string {return s.normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/gu,' ');}
export const exactMatch=(a:string,b:string):boolean=>normalizeResponse(a)===normalizeResponse(b);
export function editSimilarity(a:string,b:string):number {
 const x=Array.from(normalizeResponse(a)),y=Array.from(normalizeResponse(b));let prev=Array.from({length:y.length+1},(_,i)=>i);
 for(let i=1;i<=x.length;i++){const cur=[i];for(let j=1;j<=y.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(x[i-1]===y[j-1]?0:1));prev=cur;}
 return 1-prev[y.length]/Math.max(1,x.length,y.length);
}
