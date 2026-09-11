import {M3,V3,mat,clamp,unit,cross,Y,dot,mul,sub,norm} from './conversions';
export type VisionKind = 'normal'|'protan'|'deutan'|'tritan';
/** Machado et al. 2009 numerical tables. Authors' supplement via Colorspacious.
 * https://doi.org/10.1109/TVCG.2009.113. Row-major, LINEAR sRGB.
 * Not a percent loss of sight, nor a validated individual appearance prediction. */
const P: number[][] = [
[1,0,0,0,1,0,0,0,1],
[.856167,.182038,-.038205,.029342,.955115,.015544,-.002880,-.001563,1.004443],
[.734766,.334872,-.069637,.051840,.919198,.028963,-.004928,-.004209,1.009137],
[.630323,.465641,-.095964,.069181,.890046,.040773,-.006308,-.007724,1.014032],
[.539009,.579343,-.118352,.082546,.866121,.051332,-.007136,-.011959,1.019095],
[.458064,.679578,-.137642,.092785,.846313,.060902,-.007494,-.016807,1.024301],
[.385450,.769005,-.154455,.100526,.829802,.069673,-.007442,-.022190,1.029632],
[.319627,.849633,-.169261,.106241,.815969,.077790,-.007025,-.028051,1.035076],
[.259411,.923008,-.182420,.110296,.804340,.085364,-.006276,-.034346,1.040622],
[.203876,.990338,-.194214,.112975,.794542,.092483,-.005222,-.041043,1.046265],
[.152286,1.052583,-.204868,.114503,.786281,.099216,-.003882,-.048116,1.051998]];
const D: number[][] = [
[1,0,0,0,1,0,0,0,1],
[.866435,.177704,-.044139,.049567,.939063,.011370,-.003453,.007233,.996220],
[.760729,.319078,-.079807,.090568,.889315,.020117,-.006027,.013325,.992702],
[.675425,.433850,-.109275,.125303,.847755,.026942,-.007950,.018572,.989378],
[.605511,.528560,-.134071,.155318,.812366,.032316,-.009376,.023176,.986200],
[.547494,.607765,-.155259,.181692,.781742,.036566,-.010410,.027275,.983136],
[.498864,.674741,-.173604,.205199,.754872,.039929,-.011131,.030969,.980162],
[.457771,.731899,-.189670,.226409,.731012,.042579,-.011595,.034333,.977261],
[.422823,.781057,-.203881,.245752,.709602,.044646,-.011843,.037423,.974421],
[.392952,.823610,-.216562,.263559,.690210,.046232,-.011910,.040281,.971630],
[.367322,.860646,-.227968,.280085,.672501,.047413,-.011820,.042940,.968881]];
const T: number[][] = [
[1,0,0,0,1,0,0,0,1],
[.926670,.092514,-.019184,.021191,.964503,.014306,.008437,.054813,.936750],
[.895720,.133330,-.029050,.029997,.945400,.024603,.013027,.104707,.882266],
[.905871,.127791,-.033662,.026856,.941251,.031893,.013410,.148296,.838294],
[.948035,.089490,-.037526,.014364,.946792,.038844,.010853,.193991,.795156],
[1.017277,.027029,-.044306,-.006113,.958479,.047634,.006379,.248708,.744913],
[1.104996,-.046633,-.058363,-.032137,.971635,.060503,.001336,.317922,.680742],
[1.193214,-.109812,-.083402,-.058496,.979410,.079086,-.002346,.403492,.598854],
[1.257728,-.139648,-.118081,-.078003,.975409,.102594,-.003316,.501214,.502102],
[1.278864,-.125333,-.153531,-.084748,.957674,.127074,-.000989,.601151,.399838],
[1.255528,-.076749,-.178779,-.078411,.930809,.147602,.004733,.691367,.303900]];
export function cvdMatrix(kind: VisionKind,severity: number): M3 {
  if(!Number.isFinite(severity)) throw new Error('Non-finite severity');
  const table=kind==='protan'?P:kind==='deutan'?D:kind==='tritan'?T:P;
  const s=kind==='normal'?0:clamp(severity)*10, lo=Math.floor(s),hi=Math.min(10,lo+1),t=s-lo;
  const flat=table[lo].map((v,i)=>v*(1-t)+table[hi][i]*t);
  return [flat.slice(0,3),flat.slice(3,6),flat.slice(6,9)] as M3;
}
export const simulate = (rgb: V3,kind: VisionKind,severity=1): V3 => mat(cvdMatrix(kind,severity),rgb);
const cache=new Map<string,V3>();
/** Minimum-response direction. Constrained equal-Y and relaxed near-null compared. */
export function confusionDirection(kind: VisionKind,equalY=true): V3 {
  const key=kind+equalY;if(cache.has(key)) return cache.get(key)!;
  const m=cvdMatrix(kind==='normal'?'deutan':kind,1);
  const a=unit([1,-Y[0]/Y[1],0]), b=unit(cross(Y,a));
  let best:V3=a,loss=Infinity;
  if(equalY){
    for(let k=0;k<360;k++){
      const theta=k*Math.PI/180,v=unit(a.map((x,i)=>x*Math.cos(theta)+b[i]*Math.sin(theta)) as V3);
      const n=norm(mat(m,v));if(n<loss){loss=n;best=v;}
    }
  }else{
    const pairs=[cross(m[0],m[1]),cross(m[0],m[2]),cross(m[1],m[2])];
    best=unit(pairs.sort((a,b)=>norm(b)-norm(a))[0]);
  }
  if(best[0]<0) best=mul(best,-1);cache.set(key,best);return best;
}
export function signalDirection(kind:VisionKind,equalY=true,angle=0): V3 {
  const n=confusionDirection(kind,equalY),s=unit(cross(Y,n));
  return unit(s.map((x,i)=>Math.cos(angle)*x+Math.sin(angle)*n[i]) as V3);
}
