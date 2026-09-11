import {Candidate} from '../profile/types';
import {drawPlate} from '../stimulus/render';
export async function png(c:Candidate,text:string,width:number,height:number):Promise<Blob> {
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<240||height<240||width>4096||height>4096||width*height>10000000)throw new Error('Use dimensions from 240 to 4096, up to 10 megapixels.');
 const canvas=document.createElement('canvas');drawPlate(canvas,c,text,'original',width,height);
 const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('The browser could not encode the image.');return blob;
}
export function download(blob:Blob,name:string):void {const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}
export async function copyPNG(blob:Blob):Promise<void> {
 if(!navigator.clipboard||typeof ClipboardItem==='undefined')throw new Error('Image copying needs a supported secure browser context. Export PNG instead.');
 await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
}
