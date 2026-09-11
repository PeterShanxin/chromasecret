export interface GlyphMask {width:number;height:number;data:Uint8ClampedArray;fontSize:number;lines:string[];clipped:boolean;}
export const STIMULUS_FONT='Arial, "Noto Sans CJK SC", "Microsoft YaHei", "PingFang SC", sans-serif';
export function glyphMask(text:string,width:number,height:number):GlyphMask {
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true})!;
 const source=text.normalize('NFC').slice(0,280).split('\n').slice(0,8);let size=Math.min(height*.46,width*.35),lines=source;
 function wrap(fontSize:number):string[] {
  ctx.font=`700 ${fontSize}px ${STIMULUS_FONT}`;const out:string[]=[];
  for(const line of source){let part='';for(const ch of Array.from(line)){if(ctx.measureText(part+ch).width>width*.82&&part){out.push(part);part=ch;}else part+=ch;}out.push(part);}return out;
 }
 while(size>12){lines=wrap(size);if(lines.length*size*1.16<height*.77)break;size-=2;}
 ctx.font=`700 ${size}px ${STIMULUS_FONT}`;ctx.fillStyle='white';ctx.textAlign='center';ctx.textBaseline='middle';
 const y=height/2-(lines.length-1)*size*1.16/2;
 lines.forEach((line,i)=>ctx.fillText(line,width/2,y+i*size*1.16,width*.84));
 return {width,height,data:ctx.getImageData(0,0,width,height).data,fontSize:size,lines,clipped:lines.length*size*1.16>height*.82||text.length>280};
}
export const insideMask=(mask:GlyphMask,x:number,y:number):boolean=>mask.data[(Math.max(0,Math.min(mask.height-1,Math.floor(y)))*mask.width+Math.max(0,Math.min(mask.width-1,Math.floor(x))))*4+3]>127;
