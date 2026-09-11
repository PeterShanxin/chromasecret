import {optimize} from './scoring';
import {VisionProfile,DisplayProfile,PersonalTrial,Candidate} from '../profile/types';
interface Request {id:number;vision:VisionProfile;display?:DisplayProfile;trials:PersonalTrial[];seed:number;budget:number;incumbent?:Candidate;}
const scope=globalThis as unknown as {onmessage:(e:MessageEvent<Request>)=>void;postMessage:(x:unknown)=>void};
scope.onmessage=({data})=>{try{scope.postMessage({id:data.id,result:optimize(data.vision,data.display,data.trials,data.seed,data.budget,data.incumbent)});}catch(e){scope.postMessage({id:data.id,error:String(e)});}};
