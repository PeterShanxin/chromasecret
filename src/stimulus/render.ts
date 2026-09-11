import {Candidate,AssessmentTrial,Condition} from '../profile/types';
import {V3,css,add,mul,clip,luminance,linearToSrgb,decode,encode,clamp} from '../color/conversions';
import {simulate,confusionDirection,VisionKind} from '../color/cvdModels';
import {rng} from './random';
import {glyphMask,insideMask,GlyphMask} from './glyphMask';
import {makeColor,ColorSample} from './palette';
export type View='original'|'target'|'protan'|'deutan'|'tritan'|'grayscale'|'red'|'green'|'blue'|'saturation'|'contrast';
export interface RenderResult {mask:GlyphMask;samples:ColorSample[];fontWarning:boolean;}
export function transform(v:V3,view:View,c:Candidate):V3 {
 if(view==='target')return clip(simulate(v,c.kind,c.severity));
 if(['protan','deutan','tritan'].includes(view))return clip(simulate(v,view as VisionKind,1));
 if(view==='grayscale'){const y=luminance(v);return [y,y,y];}
 if(['red','green','blue'].includes(view)){const q=v[{red:0,green:1,blue:2}[view as 'red']];return [q,q,q];}
 if(view==='saturation'){const y=luminance(v);return clip(v.map(x=>y+2*(x-y)) as V3);}
 if(view==='contrast')return clip(v.map(x=>(x-.28)*2+.28) as V3);
 return v;
}
export function drawPlate(canvas:HTMLCanvasElement,c:Candidate,text:string,view:View='original',width=1000,height=620):RenderResult {
 canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true})!;
 const mask=glyphMask(text,width,height),r=rng(c.seed),samples:ColorSample[]=[];
 ctx.fillStyle='#f3f1eb';ctx.fillRect(0,0,width,height);
 const step=Math.max(3,c.size*(width/900)*(c.family==='microdots'?.55:1)),cols=Math.ceil(width/step),rows=Math.ceil(height/step);
 const get=(x:number,y:number,a:number,b:number,l:number):ColorSample=>makeColor(c,insideMask(mask,x,y),a,b,l);
 if(c.family==='dots'||c.family==='microdots'){
  for(let iy=0;iy<=rows;iy++)for(let ix=0;ix<=cols;ix++){
   const x=(ix+.5+(iy%2)*.45+(r()-.5)*.23)*step,y=(iy+.5+(r()-.5)*.23)*step;
   const radius=step*(.30+r()*.14),a=r()*2-1,b=r()*2-1,l=r()*2-1;
   const s=get(x,y,a,b,l);samples.push(s);ctx.fillStyle=css(transform(s.rgb,view,c));ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
  }
 }else if(c.family==='mosaic'){
  const sites:{x:number;y:number;a:number;b:number;l:number}[]=[];
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)sites.push({x:(x+.2+r()*.6)*step,y:(y+.2+r()*.6)*step,a:r()*2-1,b:r()*2-1,l:r()*2-1});
  const siteColors=sites.map(p=>get(p.x,p.y,p.a,p.b,p.l));samples.push(...siteColors);
  const pixels=ctx.createImageData(width,height),colors=siteColors.map(s=>encode(clip(transform(s.rgb,view,c))).map(x=>Math.round(x*255)));
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const gx=Math.floor(x/step),gy=Math.floor(y/step);let best=0,dist=Infinity;
   for(let j=Math.max(0,gy-1);j<=Math.min(rows-1,gy+1);j++)for(let i=Math.max(0,gx-1);i<=Math.min(cols-1,gx+1);i++){
    const idx=j*cols+i,p=sites[idx],d=(x-p.x)**2+(y-p.y)**2;if(d<dist){dist=d;best=idx;}
   }
   const index=(y*width+x)*4,color=colors[best];pixels.data[index]=color[0];pixels.data[index+1]=color[1];pixels.data[index+2]=color[2];pixels.data[index+3]=255;
  }ctx.putImageData(pixels,0,0);
 }else{
  // Correlated two-scale colored noise; no glyph-dependent geometry or density.
  const coarse=Math.max(8,step*3),nc=Math.ceil(width/coarse)+2,nr=Math.ceil(height/coarse)+2,field=Array.from({length:nc*nr},()=>r()*2-1);
  const block=Math.max(2,Math.round(step*.30));
  for(let y=0;y<height;y+=block)for(let x=0;x<width;x+=block){
   const gx=x/coarse,gy=y/coarse,ix=Math.floor(gx),iy=Math.floor(gy),fx=gx-ix,fy=gy-iy;
   const top=field[iy*nc+ix]*(1-fx)+field[iy*nc+ix+1]*fx,bot=field[(iy+1)*nc+ix]*(1-fx)+field[(iy+1)*nc+ix+1]*fx;
   const a=.68*(top*(1-fy)+bot*fy)+.32*(r()*2-1),s=get(x+block/2,y+block/2,a,r()*2-1,r()*2-1);
   samples.push(s);ctx.fillStyle=css(transform(s.rgb,view,c));ctx.fillRect(x,y,block,block);
  }
 }
 return {mask,samples,fontWarning:mask.fontSize<step*5||mask.clipped};
}
export function drawAssessment(canvas:HTMLCanvasElement,t:AssessmentTrial,width=920,height=400):void {
 canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d')!,r=rng(t.seed^0x82174);
 ctx.fillStyle='#f3f1eb';ctx.fillRect(0,0,width,height);const step=12;
 for(let y=6;y<height;y+=step)for(let x=6;x<width;x+=step){
  const xx=x+(r()-.5)*3,yy=y+(r()-.5)*3,rad=3+r()*2;
  const center=t.side===0?width*.26:width*.74;
  const shape=Math.abs(xx-center)<width*.115&&Math.abs(yy-height*.5)<height*.23;
  // Twelve nominal luminance noise levels, independent of location and glyph.
  const l=(Math.floor(r()*12)/11-.5)*.055;
  const direction:V3=t.axis==='catch'?[1,1,1]:confusionDirection(t.axis,true);
  const noise=(r()-.5)*.002;
  const v=clip(add([t.base+l,t.base+l,t.base+l],mul(direction,(shape?t.amplitude:0)+noise)));
  ctx.fillStyle=css(v);ctx.beginPath();ctx.arc(xx,yy,rad,0,Math.PI*2);ctx.fill();
 }
}
export function drawDither(canvas:HTMLCanvasElement,value:number,channel:number=-1):void {
 const parent=canvas.parentElement!,style=getComputedStyle(parent),available=parent.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);const cssW=Math.min(320,Math.floor(available)),cssH=cssW/2,dpr=Math.max(1,window.devicePixelRatio||1);canvas.width=Math.round(cssW*dpr);canvas.height=Math.round(cssH*dpr);canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';
 const ctx=canvas.getContext('2d')!,pixels=ctx.createImageData(canvas.width,canvas.height);
 for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
  const i=(y*canvas.width+x)*4,v=x<canvas.width/2?((x+y)%2?255:0):value;
  for(let k=0;k<3;k++)pixels.data[i+k]=channel===-1||channel===k?v:0;pixels.data[i+3]=255;
 }ctx.putImageData(pixels,0,0);
}
export async function degrade(canvas:HTMLCanvasElement,condition:Condition):Promise<void> {
 if(condition==='original')return;const ctx=canvas.getContext('2d',{willReadFrequently:true})!,w=canvas.width,h=canvas.height;
 if(condition==='jpeg'){
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',.42));if(!blob)return;
  const url=URL.createObjectURL(blob);try{const img=new Image();img.src=url;await img.decode();ctx.drawImage(img,0,0,w,h);}finally{URL.revokeObjectURL(url);}return;
 }
 if(condition==='small'){
  const copy=document.createElement('canvas');copy.width=Math.floor(w*.5);copy.height=Math.floor(h*.5);copy.getContext('2d')!.drawImage(canvas,0,0,copy.width,copy.height);ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.drawImage(copy,0,0,w,h);return;
 }
 const data=ctx.getImageData(0,0,w,h);
 for(let i=0;i<data.data.length;i+=4)for(let k=0;k<3;k++){
  let v=data.data[i+k]/255;if(condition==='brightness+')v*=1.12;if(condition==='brightness-')v*=.88;if(condition==='contrast+')v=(v-.5)*1.15+.5;if(condition==='contrast-')v=(v-.5)*.85+.5;data.data[i+k]=clamp(v)*255;
 }ctx.putImageData(data,0,0);
}
