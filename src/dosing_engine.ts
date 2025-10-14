// src/dosing_engine.ts
import { UserProfile, Product, ProfilesWeights, Ruleset, DosingPlan } from './types';
const BIO = { oral_capsule: 0.12, oral_spray: 0.20, sublingual: 0.25, inhalation: 0.35, topical_transdermal: 0.30 } as const;
const SENS = { low: 1.25, average: 1.0, high: 0.7 } as const;
const TOL = { none: 0.8, low: 1.0, medium: 1.3, high: 1.6 } as const;
const EXP_FREQ = { naive: 1, occasional: 1, regular: 2, daily: 3 } as const;
export function buildDosingPlan(args: { user: UserProfile; product: Product; targetProfileKey: string; profiles: ProfilesWeights; rules: Ruleset; }): DosingPlan {
  const { user, product, targetProfileKey, profiles, rules } = args;
  const profile = profiles[targetProfileKey];
  const cautions: string[] = []; const rationale: string[] = [];
  if (user.ageBand === 'u21' || user.medFlags?.includes('pregnancy')) { throw new Error('Dosing suggestions disabled for under‑21 or pregnancy/lactation.'); }
  if (user.medFlags?.includes('history_psychosis')) { cautions.push('History of psychosis noted — keep THC minimal and clinician review is advised.'); }
  if (user.medFlags?.includes('sedatives')) { cautions.push('Sedating medications flagged — additive drowsiness possible.'); }
  if (user.medFlags?.includes('cardiac')) { cautions.push('Cardiac risk flagged — avoid rapid titration and consider non‑psychoactive options.'); }
  const intentTHCSeed = Math.max(0, 2 * profile.cannabinoidWeights.thc);
  const intentCBDSeed = Math.max(0, 10 * profile.cannabinoidWeights.cbd);
  const minorSeeds: Record<string, number> = {};
  (['cbg','cbn','thcv'] as const).forEach(k => { const w = (profile.cannabinoidWeights as any)[k] ?? 0; if (w > 0) minorSeeds[k] = (k==='cbn'?2.0:5.0)*w; });
  const SENS_FACT: any = { low: 1.25, average: 1.0, high: 0.7 }; const TOL_FACT: any = { none: 0.8, low: 1.0, medium: 1.3, high: 1.6 };
  const sens = SENS_FACT[user.sensitivity]; const tol = TOL_FACT[user.thcTolerance];
  const freq = Math.max(1, Math.min(3, { naive:1, occasional:1, regular:2, daily:3 }[user.experience]));
  let startTHC = intentTHCSeed * sens * tol; if (user.medFlags?.includes('history_psychosis')) { startTHC = Math.min(startTHC, rules.lowTHCCapMg); }
  const startCBD = intentCBDSeed * (sens > 1 ? 0.9 : 1.0);
  const range = (mg:number): [number, number] => { const lo = Math.max(0, +(mg*0.7).toFixed(1)); const hi = +(mg*1.3).toFixed(1); return [lo,hi]; };
  const titration = { stepMgTHC: startTHC>0? +(Math.max(0.2, startTHC*0.25).toFixed(1)) : undefined, stepMgCBD: startCBD>0? +(Math.max(2, startCBD*0.25).toFixed(1)) : undefined, intervalDays: 2, maxSteps: 4, maxDailyMgTHC: 25 };
  const stackSuggestions: string[] = [];
  if (targetProfileKey==='calm_focus') { stackSuggestions.push('Base Spray (low‑THC, terpene‑focused) + Calm&Focus capsule (CBD-forward, CBG support).'); }
  if (targetProfileKey==='rest_restore') { stackSuggestions.push('Night capsule (CBD + CBN support), avoid additional stimulants in evening.'); }
  if (product.form==='inhalation') { cautions.push('Inhalation acts quickly; start lower and avoid driving or machinery.'); }
  else if (product.form==='oral_capsule') { cautions.push('Oral onset is delayed (often 45–120 minutes); avoid redosing too quickly.'); }
  const minors: Record<string,[number,number]> = {}; Object.entries(minorSeeds).forEach(([k,v]) => { minors[k] = range(v as number); });
  const recommendations = { startMgTHC: startTHC? range(+startTHC.toFixed(1)) : undefined, startMgCBD: startCBD? range(+startCBD.toFixed(1)) : undefined, minors: Object.keys(minors).length? minors: undefined, frequencyPerDay: freq, route: product.form };
  rationale.push(`Sensitivity factor=${sens}, tolerance factor=${tol}, experience freq=${freq}/day.`, `Bioavailability for route (${product.form}) is ~${(BIO[product.form]*100)|0}% (educational estimate).`, `Intent weights shaped seeds: THC≈${intentTHCSeed.toFixed(1)} mg, CBD≈${intentCBDSeed.toFixed(1)} mg.`);
  return { recommendations, titration, stackSuggestions, cautions, rationale };
}
