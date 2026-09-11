import {VisionKind} from '../color/cvdModels';
import {V3} from '../color/conversions';
export type Family='dots'|'mosaic'|'noise'|'microdots';
export interface DisplayProfile {
  id:string; created:string; label:string; signature:string; brightness:string;
  environment:'dim'|'moderate'|'bright'; filtersOff:boolean; zoomConfirmed:boolean; monitor:'built-in'|'external';
  black:number; white:number; midpoints:number[]; channelMidpoints:V3; gamma:number;
  gammaSpread:number; gamutDistinct:boolean; quality:'limited'|'reasonable'; confirmed:boolean;
}
export interface Staircase { level:number; streak:number; direction:number; reversals:number[]; trials:number; }
export type Axis='protan'|'deutan'|'tritan'|'catch';
export interface AssessmentTrial {
  id:number; seed:number; axis:Axis; amplitude:number; side:0|1; response:0|1|null;
  correct:boolean; rt:number; base:number; at:string;
}
export interface Threshold {axis:Axis; value:number|null; n:number; reversals:number; censored:boolean;}
export interface ModelFit { kind:VisionKind; severity:number; noise:number; weight:number; }
export interface VisionProfile {
  label:string; kind:VisionKind; severity:number; severityInterval:[number,number];
  confidence:'limited'|'moderate'; noise:number; thresholds:Threshold[]; fits:ModelFit[];
  catches:{correct:number,total:number}; trials:AssessmentTrial[]; source:'measured'|'demo';
}
export interface Candidate {
  id:string; seed:number; family:Family; kind:VisionKind; severity:number;
  signal:number; distraction:number; residualNoise:number; luminanceNoise:number;
  equalY:boolean; angle:number; size:number; base:number; invert:boolean;
}
export interface Metrics {
  target:number; typical:number; differential:number; luminance:number;
  channels:V3; saturation:number; oracle:number; filterAttack:number; clipping:number;
  score:number; edgeLeak:number; targetSignal:number; typicalSignal:number;
}
export interface PersonalTrial {
  id:string; candidate:Candidate; expected:string; response:string; correct:boolean;
  blank:boolean; rt:number; at:string; metrics:Metrics;
}
export type Condition='original'|'brightness+'|'brightness-'|'contrast+'|'contrast-'|'small'|'jpeg';
export interface VerifyTrial {
  id:string; seed:number; expected:string; response:string; correct:boolean; absent:boolean;
  role:'target'|'control'; condition:Condition; rt:number; confidence:number; at:string;
}
export interface Challenge { id:string; expected:string; candidate:Candidate; condition:Condition; absent:boolean; }
export interface StoredProfile {
  version:1; deviceId:string; display?:DisplayProfile; vision?:VisionProfile;
  personal:PersonalTrial[]; verified:VerifyTrial[]; challenges:Challenge[];
  selected?:Candidate; savedAt:string;
}
