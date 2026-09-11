'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {demoVision,defaultDisplay,finishDisplay}=require('../build/profile/storage');
const {makeAssessmentTrial,assessmentSignal,pCorrect,fitVision}=require('../build/psychophysics/assessment');
const {candidate,empiricalPrediction}=require('../build/optimizer/candidateGeneration');
const {evaluate,optimize}=require('../build/optimizer/scoring');
const {rng}=require('../build/stimulus/random');
const {paletteSamples}=require('../build/stimulus/palette');
const users=[['Normal','normal',0],['Mild deutan','deutan',.3],['Strong deutan','deutan',.9],['Mild protan','protan',.3],['Strong protan','protan',.9]];
const display=finishDisplay({...defaultDisplay(),filtersOff:true,zoomConfirmed:true,midpoints:[186,186,186]});
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length,round=x=>Math.round(x*1000)/1000;
const all=[];
for(const [name,kind,severity] of users){
 const runs=[];
 for(let seed=1;seed<=6;seed++){
  const random=rng(531907+seed*7919),truth={...demoVision(),kind,severity,noise:.018,source:'demo'},trials=[];
  for(let n=0;n<72;n++){
   const t=makeAssessmentTrial(trials,Math.floor(random()*0xffffffff),display);
   const correct=random()<pCorrect(assessmentSignal(t.axis,t.amplitude,kind,severity,t.base),truth.noise);
   trials.push({...t,response:correct?t.side:1-t.side,correct,rt:800,at:'synthetic'});
  }
  const fitted=fitVision(trials);
  const baseline={...candidate(seed*541,fitted,display),signal:.012,distraction:.085,residualNoise:.018,luminanceNoise:.008,equalY:true,angle:0,family:'dots'};
  const before=evaluate(baseline,fitted,display),result=optimize(fitted,display,[],seed*911,96,baseline);
  // Hold out the ground-truth simulator from fitting. Still same model family: circular validation.
  const heldoutBefore=evaluate({...baseline,kind,severity},truth,display,paletteSamples(baseline)),heldoutAfter=evaluate({...result.candidate,kind,severity},truth,display,paletteSamples(result.candidate));
  const nearNull=evaluate({...result.candidate,equalY:false},fitted,display),isoY=evaluate({...result.candidate,equalY:true},fitted,display);
  // Test response influence with a synthetic success kernel; this is NOT a human participant.
  const history=Array.from({length:12},(_,i)=>({id:`sim-${i}`,candidate:result.candidate,expected:'A',response:i<9?'A':'',correct:i<9,blank:false,rt:800,at:'synthetic',metrics:result.metrics}));
  const posterior=empiricalPrediction(result.candidate,history);
  runs.push({seed,fit:fitted.kind,label:fitted.label,severity:round(fitted.severity),interval:fitted.severityInterval,confidence:fitted.confidence,
   fitObjectiveBefore:round(before.score),fitObjectiveAfter:round(result.metrics.score),fitDiffBefore:round(before.differential),fitDiffAfter:round(result.metrics.differential),
   trueDiffBefore:round(heldoutBefore.differential),trueDiffAfter:round(heldoutAfter.differential),targetAfter:round(heldoutAfter.target),typicalAfter:round(heldoutAfter.typical),
   filterAttack:round(heldoutAfter.filterAttack),channelAttack:round(Math.max(...heldoutAfter.channels)),grayAttack:round(heldoutAfter.luminance),equalY:result.candidate.equalY,
   isoY:{score:round(isoY.score),diff:round(isoY.differential),gray:round(isoY.luminance)},nearNull:{score:round(nearNull.score),diff:round(nearNull.differential),gray:round(nearNull.luminance)},
   syntheticPosterior:round(posterior.p),candidate:result.candidate});
 }
 const summary={name,kind,severity,n:runs.length,familyMatches:runs.filter(r=>r.fit===kind).length,uncertain:runs.filter(r=>r.label.startsWith('Uncertain')).length,
 meanSeverity:round(mean(runs.map(r=>r.severity))),objectiveBefore:round(mean(runs.map(r=>r.fitObjectiveBefore))),objectiveAfter:round(mean(runs.map(r=>r.fitObjectiveAfter))),
 trueDiffBefore:round(mean(runs.map(r=>r.trueDiffBefore))),trueDiffAfter:round(mean(runs.map(r=>r.trueDiffAfter))),
 improvedRuns:runs.filter(r=>r.trueDiffAfter>r.trueDiffBefore+.001).length,targetAfter:round(mean(runs.map(r=>r.targetAfter))),typicalAfter:round(mean(runs.map(r=>r.typicalAfter))),
 filterAttack:round(mean(runs.map(r=>r.filterAttack))),channelAttack:round(mean(runs.map(r=>r.channelAttack)))};
 all.push({summary,runs});console.log(JSON.stringify(summary));
}
const output={protocol:'72 synthetic 2AFC trials; 6 seeds per phenotype; 96 search candidates; same-family model checks only. No human data. Indices are not recognition percentages.',results:all};
fs.writeFileSync(path.join(root,'docs/synthetic-results.json'),JSON.stringify(output,null,2));
let md='# Synthetic-user results\n\n'+output.protocol+'\n\n';
md+='The baseline is a weak, fixed camouflage candidate (signal 0.012, distractor 0.085). “True” means the synthetic generating simulator, not ground-truth human vision. The optimizer sees only fitted responses. The fitted and generating models still belong to the same family, so this is circular model validation.\n\n';
md+='| Synthetic observer | Fitted-family matches | Uncertain runs | Held-out model difference, before → after | Improved runs | Target index after | Filter attack |\n|---|---:|---:|---:|---:|---:|---:|\n';
for(const {summary:s} of all)md+=`| ${s.name} | ${s.familyMatches}/${s.n} | ${s.uncertain}/${s.n} | ${s.trueDiffBefore} → ${s.trueDiffAfter} | ${s.improvedRuns}/${s.n} | ${s.targetAfter} | ${s.filterAttack} |\n`;
md+='\nA filter attack equals the target index by construction. No result here demonstrates invisible text, successful human recognition, or a diagnostic test. Protan/deutan identification failures and negative improvements are retained in the JSON. The search maximizes a saturating, leakage-penalized objective, not raw target-minus-typical separation; the two can move in different directions.\n';
fs.writeFileSync(path.join(root,'docs/SYNTHETIC_RESULTS.md'),md);
