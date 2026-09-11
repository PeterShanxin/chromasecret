import {Candidate} from '../profile/types';
import {V3,add,mul,clip,gamutPenalty} from '../color/conversions';
import {confusionDirection,signalDirection} from '../color/cvdModels';
import {rng} from './random';
export interface ColorSample {rgb:V3; inside:boolean; clip:number;}
/** Geometry and nuisance fields must not be a function of inside/outside status. */
export function makeColor(c:Candidate,inside:boolean,a:number,b:number,l:number):ColorSample {
 const n=confusionDirection(c.kind,c.equalY),s=signalDirection(c.kind,c.equalY,c.angle);
 const sign=(inside?1:-1)*(c.invert?-1:1);
 const rgb=add(add([c.base,c.base,c.base],mul(n,c.distraction*a)),add(mul(s,c.signal*sign+c.residualNoise*b),[l*c.luminanceNoise,l*c.luminanceNoise,l*c.luminanceNoise]));
 return {rgb:clip(rgb),inside,clip:gamutPenalty(rgb)};
}
export function paletteSamples(c:Candidate,n=640):ColorSample[] {
 const r=rng(c.seed^0x73ae19),out:ColorSample[]=[];
 // Paired noise draws remove nuisance imbalance from design-level statistics.
 for(let i=0;i<n/2;i++){const a=r()*2-1,b=r()*2-1,l=r()*2-1;out.push(makeColor(c,true,a,b,l),makeColor(c,false,a,b,l));}return out;
}
