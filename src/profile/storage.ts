import {StoredProfile,DisplayProfile,VisionProfile} from './types';
import {clamp} from '../color/conversions';
import {newSeed} from '../stimulus/random';
const KEY='chromasecret.v1';
export function screenSignature():string {return typeof screen==='undefined'?'node-test':`${screen.width}x${screen.height}@${devicePixelRatio}|${screen.colorDepth}|${matchMedia('(color-gamut: p3)').matches?'p3':'srgb'}`;}
export function emptyProfile():StoredProfile{return {version:1,deviceId:`local-${newSeed().toString(16)}`,personal:[],verified:[],challenges:[],savedAt:new Date().toISOString()};}
export function serialize(p:StoredProfile):string {return JSON.stringify({...p,personal:p.personal.slice(-240),verified:p.verified.slice(-500),savedAt:new Date().toISOString()});}
export function deserialize(s:string):StoredProfile {
 const p=JSON.parse(s);if(p?.version!==1||typeof p.deviceId!=='string'||!Array.isArray(p.personal)||!Array.isArray(p.verified)||!Array.isArray(p.challenges))throw new Error('Unsupported or damaged profile');
 if(p.vision&&(!Number.isFinite(p.vision.severity)||p.vision.severity<0||p.vision.severity>1||!Array.isArray(p.vision.trials)))throw new Error('Invalid vision data');
 if(p.display&&(!Number.isFinite(p.display.gamma)||p.display.gamma<=0||!Array.isArray(p.display.midpoints)))throw new Error('Invalid display profile');
 return p as StoredProfile;
}
export function load():StoredProfile {try{const raw=localStorage.getItem(KEY);return raw?deserialize(raw):emptyProfile();}catch{return emptyProfile();}}
export function save(p:StoredProfile):boolean {try{localStorage.setItem(KEY,serialize(p));return true;}catch{return false;}}
export function erase():void {try{localStorage.removeItem(KEY);}catch{/* private/blocked storage */}}
export function defaultDisplay():DisplayProfile {return {id:`setup-${newSeed()}`,created:new Date().toISOString(),label:'My current display',signature:screenSignature(),brightness:'50',environment:'moderate',filtersOff:false,zoomConfirmed:false,monitor:'built-in',black:8,white:247,midpoints:[],channelMidpoints:[186,186,186],gamma:2.2,gammaSpread:0,gamutDistinct:true,quality:'limited',confirmed:false};}
export function finishDisplay(d:DisplayProfile):DisplayProfile {
 const estimates=d.midpoints.map(v=>Math.log(.5)/Math.log(clamp(v/255,.1,.98))),g=estimates.length?estimates.reduce((a,b)=>a+b,0)/estimates.length:2.2;
 const spread=estimates.length>1?Math.max(...estimates)-Math.min(...estimates):1;
 return {...d,gamma:g,gammaSpread:spread,signature:screenSignature(),confirmed:true,quality:d.filtersOff&&d.zoomConfirmed&&d.environment!=='bright'&&spread<.35&&d.black<=16&&d.white>=239&&d.gamutDistinct?'reasonable':'limited'};
}
export function demoVision():VisionProfile {return {label:'Demo: strong deutan model',kind:'deutan',severity:.9,severityInterval:[0,1],confidence:'limited',noise:.018,thresholds:[],fits:[],catches:{correct:0,total:0},trials:[],source:'demo'};}
export function mismatch(d?:DisplayProfile):boolean {return !!d&&d.signature!==screenSignature();}
