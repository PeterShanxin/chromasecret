import {VisionProfile,DisplayProfile,PersonalTrial,Candidate} from '../profile/types';
import {optimize,SearchResult} from './scoring';
declare global {interface Window {CHROMASECRET_WORKER?:string;}}
let worker:Worker|undefined,nextId=0;
const pending=new Map<number,{resolve:(r:SearchResult)=>void;reject:(e:Error)=>void}>();
function getWorker():Worker|undefined {
 if(worker)return worker;
 try{
  const source=window.CHROMASECRET_WORKER;if(!source)return;
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));worker=new Worker(url);URL.revokeObjectURL(url);
  worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);if(data.error)p.reject(new Error(data.error));else p.resolve(data.result);};
  worker.onerror=()=>{for(const p of pending.values())p.reject(new Error('Optimizer worker failed'));pending.clear();worker?.terminate();worker=undefined;};return worker;
 }catch{return;}
}
export async function search(vision:VisionProfile,display:DisplayProfile|undefined,trials:PersonalTrial[],seed:number,budget=120,incumbent?:Candidate):Promise<SearchResult> {
 const w=getWorker();if(!w){await new Promise(r=>setTimeout(r,20));return optimize(vision,display,trials,seed,budget,incumbent);}
 const id=++nextId;
 return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});w.postMessage({id,vision,display,trials,seed,budget,incumbent});});
}
