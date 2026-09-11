/** Mulberry32: reproducible, NOT a cryptographic PRNG. */
export function rng(seed:number):()=>number {let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
export const hash=(text:string):number=>{let h=2166136261;for(const c of text)h=Math.imul(h^c.codePointAt(0)!,16777619);return h>>>0;};
export function newSeed():number {if(typeof crypto!=='undefined'&&crypto.getRandomValues)return crypto.getRandomValues(new Uint32Array(1))[0];return (Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;}
export function shuffle<T>(items:T[],seed:number):T[]{const a=[...items],r=rng(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function randomWord(seed:number,length=3):string {const r=rng(seed),chars='23456789ABCDEFGHJKMNPQRSTUVWXYZ';return Array.from({length},()=>chars[Math.floor(r()*chars.length)]).join('');}
