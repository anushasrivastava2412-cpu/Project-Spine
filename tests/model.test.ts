import {describe,it,expect} from 'vitest';
import {assess,sampleAnswers,blankAnswers,validateStep,localDay} from '../src/lib/model';
describe('educational assessment',()=>{
 it('requires complete answers and guardian involvement',()=>{expect(()=>assess(blankAnswers)).toThrow();expect(validateStep({...sampleAnswers,guardianConsent:false},0)).not.toBeNull();});
 it('calculates the backpack ratio accurately',()=>{expect(assess({...sampleAnswers,weight:45,bag:7}).ratio).toBe(15.6);});
 it('prioritizes urgent symptoms regardless of habits',()=>{expect(assess({...sampleAnswers,redFlags:'yes'}).category).toBe('urgent');});
 it('escalates persistent symptoms without a high overall score',()=>{expect(assess({...sampleAnswers,pain:'lower',frequency:'sometimes',duration:'weeks',severity:'mild'}).category).toBe('elevated');});
 it('escalates severe symptoms',()=>{expect(assess({...sampleAnswers,pain:'neck',frequency:'sometimes',duration:'days',severity:'severe'}).category).toBe('elevated');});
 it('ignores stale pain details when no symptoms selected',()=>{expect(assess({...sampleAnswers,severity:'severe',duration:'weeks'}).category).toBe('low');});
 it('rejects impossible and missing values',()=>{expect(()=>assess({...sampleAnswers,weight:0})).toThrow();expect(()=>assess({...sampleAnswers,sleep:NaN})).toThrow();expect(()=>assess({...sampleAnswers,age:17})).toThrow();});
 it('uses age-specific sleep thresholds',()=>{expect(assess({...sampleAnswers,age:12,sleep:8}).domains.find(d=>d.key==='sleep')?.value).toBe(2);expect(assess({...sampleAnswers,age:13,sleep:8}).domains.find(d=>d.key==='sleep')?.value).toBe(0);});
 it('never produces a percentage disease probability',()=>{const p=assess(sampleAnswers);expect(p).not.toHaveProperty('probability');expect(p.modelVersion).toContain('exploratory');});
 it('uses local day keys for habit tracking',()=>{expect(localDay(new Date(2026,0,2,0,5))).toBe('2026-01-02');});
});
