/** Nominal sRGB/D65, not measured monitor colorimetry. No hidden gamut clamping. */
export type V3 = [number, number, number];
export type M3 = [V3, V3, V3];
export const clamp = (v: number, lo = 0, hi = 1): number => Math.max(lo, Math.min(hi, v));
export const dot = (a: V3, b: V3): number => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const add = (a: V3,b: V3): V3 => a.map((x,i)=>x+b[i]) as V3;
export const sub = (a: V3,b: V3): V3 => a.map((x,i)=>x-b[i]) as V3;
export const mul = (a: V3,s: number): V3 => a.map(x=>x*s) as V3;
export const norm = (a: V3): number => Math.sqrt(dot(a,a));
export const unit = (a: V3): V3 => mul(a,1/Math.max(1e-12,norm(a)));
export const cross = (a: V3,b: V3): V3 => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const mat = (m: M3,v: V3): V3 => m.map(r=>dot(r,v)) as V3;
export function inverse(m: M3): M3 {
  const a=cross(m[1],m[2]), b=cross(m[2],m[0]), c=cross(m[0],m[1]), det=dot(m[0],a);
  if (Math.abs(det)<1e-14) throw new Error('Singular color matrix');
  return [0,1,2].map(i=>[a[i]/det,b[i]/det,c[i]/det]) as M3;
}
export function srgbToLinear(c: number): number { const s=Math.sign(c),x=Math.abs(c); return s*(x<=.04045?x/12.92:((x+.055)/1.055)**2.4); }
export function linearToSrgb(c: number): number { const s=Math.sign(c),x=Math.abs(c); return s*(x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055); }
export const decode = (v: V3): V3 => v.map(srgbToLinear) as V3;
export const encode = (v: V3): V3 => v.map(linearToSrgb) as V3;
export const Y: V3 = [.2126390058715104,.715168678767756,.0721923153607337];
export const RGB_XYZ: M3 = [[.4123907992659595,.35758433938387796,.1804807884018343],Y,[.01933081871559185,.11919477979462599,.9505321522496606]];
const XYZ_RGB=inverse(RGB_XYZ);
export const rgbToXyz = (v: V3): V3 => mat(RGB_XYZ,v);
export const xyzToRgb = (v: V3): V3 => mat(XYZ_RGB,v);
export const D65: V3 = [.9504559270516716,1,1.0890577507598784];
export function xyzToLab(v: V3,white: V3=D65): V3 {
  const e=216/24389,k=24389/27,f=v.map((x,i)=>x/white[i]>e?Math.cbrt(x/white[i]):(k*x/white[i]+16)/116);
  return [116*f[1]-16,500*(f[0]-f[1]),200*(f[1]-f[2])];
}
export function labToXyz(v: V3,white: V3=D65): V3 {
  const fy=(v[0]+16)/116,f=[fy+v[1]/500,fy,fy-v[2]/200];
  return f.map((x,i)=>white[i]*(x**3>216/24389?x**3:(116*x-16)/(24389/27))) as V3;
}
const RGB_OKLMS: M3 = [[.4122214708,.5363325363,.0514459929],[.2119034982,.6806995451,.1073969566],[.0883024619,.2817188376,.6299787005]];
const OKLMS_OK: M3 = [[.2104542553,.7936177850,-.0040720468],[1.9779984951,-2.4285922050,.4505937099],[.0259040371,.7827717662,-.8086757660]];
const OK_OKLMS=inverse(OKLMS_OK), OKLMS_RGB=inverse(RGB_OKLMS);
export const rgbToOklab = (v: V3): V3 => mat(OKLMS_OK,mat(RGB_OKLMS,v).map(Math.cbrt) as V3);
export const oklabToRgb = (v: V3): V3 => mat(OKLMS_RGB,mat(OK_OKLMS,v).map(x=>x**3) as V3);
// Hunt-Pointer-Estevez LMS approximation, distinct from OKLab's fitted LMS-like space.
const XYZ_LMS: M3 = [[.4002,.7075,-.0807],[-.228,1.15,.0612],[0,0,.9184]];
const LMS_XYZ=inverse(XYZ_LMS);
export const rgbToLms = (v: V3): V3 => mat(XYZ_LMS,rgbToXyz(v));
export const lmsToRgb = (v: V3): V3 => xyzToRgb(mat(LMS_XYZ,v));
export const deltaE76 = (a: V3,b: V3): number => norm(sub(a,b));
export const deltaEOK = deltaE76;
export const inGamut = (v: V3): boolean => v.every(x=>Number.isFinite(x)&&x>=0&&x<=1);
export const clip = (v: V3): V3 => v.map(x=>clamp(x)) as V3;
export const gamutPenalty = (v: V3): number => v.reduce((s,x)=>s+(x<0?-x:x>1?x-1:0),0);
export const css = (v: V3): string => `rgb(${encode(clip(v)).map(x=>Math.round(x*255)).join(',')})`;
export const luminance = (v: V3): number => dot(v,Y);
