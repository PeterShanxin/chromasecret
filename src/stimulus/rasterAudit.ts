import {GlyphMask,insideMask} from './glyphMask';
import {decode,V3,luminance} from '../color/conversions';
export interface RasterAudit {grayscale:number;channels:V3;edge:number;multiscale:number;quantizedClipping:number;}
const sep=(a:number[],b:number[]):number=>{if(!a.length||!b.length)return 0;const mean=(v:number[])=>v.reduce((a,b)=>a+b,0)/v.length,ma=mean(a),mb=mean(b),variance=(v:number[],m:number)=>v.reduce((s,x)=>s+(x-m)**2,0)/v.length;return Math.abs(ma-mb)/Math.sqrt((variance(a,ma)+variance(b,mb))/2+.00001);};
/** Diagnostics on the *actual quantized canvas*, not just analytical palettes.
 * Mask-informed, image-level proxies; not human recognition probabilities. */
export function auditRaster(canvas:HTMLCanvasElement,mask:GlyphMask):RasterAudit {
 const ctx=canvas.getContext('2d',{willReadFrequently:true})!,w=canvas.width,h=canvas.height,data=ctx.getImageData(0,0,w,h).data;
 const fg:number[][]=[[],[],[],[]],bg:number[][]=[[],[],[],[]],edgeFg:number[]=[],edgeBg:number[]=[],coarseFg:number[]=[],coarseBg:number[]=[];
 const gray=new Float32Array(w*h);let clipping=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=decode([data[i]/255,data[i+1]/255,data[i+2]/255]);gray[y*w+x]=luminance(v);
  if(x%4===0&&y%4===0){const target=insideMask(mask,x,y)?fg:bg;for(let k=0;k<3;k++)target[k].push(v[k]);target[3].push(gray[y*w+x]);if(v.some(q=>q<=0||q>=1))clipping++;}
 }
 for(let y=8;y<h-8;y+=8)for(let x=8;x<w-8;x+=8){
  const g=gray[y*w+x],edge=Math.hypot(g-gray[y*w+x+2],g-gray[(y+2)*w+x]);(insideMask(mask,x,y)?edgeFg:edgeBg).push(edge);
  let avg=0;for(let j=-6;j<=6;j+=3)for(let i=-6;i<=6;i+=3)avg+=gray[(y+j)*w+x+i];(insideMask(mask,x,y)?coarseFg:coarseBg).push(avg/25);
 }
 return {grayscale:sep(fg[3],bg[3]),channels:[0,1,2].map(k=>sep(fg[k],bg[k])) as V3,edge:sep(edgeFg,edgeBg),multiscale:sep(coarseFg,coarseBg),quantizedClipping:clipping/(fg[0].length+bg[0].length)};
}
