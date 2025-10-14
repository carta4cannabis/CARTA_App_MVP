// app/src/engine/chemotypeEngine.ts
export type GoalKey = 'relief' | 'anxiety' | 'mood' | 'focus' | 'sleep';

export type MethodKey =
  | 'Capsule'
  | 'Booster spray'
  | 'Stacking spray'
  | 'Inhalable'
  | 'Topical'
  | 'Edible';

export type Sensitivity = 'Low' | 'Medium' | 'High';

export type Goals = Record<GoalKey, number>; // 0..5 sliders

export type UserPrefs = {
  sensitivity: Sensitivity;
  timeOfDay?: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  avoidSedation?: boolean;
  avoidRacy?: boolean;
  localizedPain?: boolean;
};

export type Chemotype = {
  id: string;
  name: string;           // e.g., "Bright Focus"
  // normalized terp keys (0..1); keep small set for simplicity
  terps: Partial<Record<'limonene' | 'pinene' | 'linalool' | 'myrcene' | 'caryophyllene' | 'terpinolene', number>>;
};

export type MethodProfile = {
  key: MethodKey;
  onsetMin: number;  // ~minutes to feel
  peakMin: number;   // ~minutes to peak
  durationHr: number;
  // “starter” and “typical” total ranges (THC-equivalent or actives as you prefer)
  mgStart: number;   // conservative single-use start
  mgTypical: [number, number]; // general range for a session total
};

// ---- Minimal catalog (expand as you like) ----
export const METHOD_CATALOG: Record<MethodKey, MethodProfile> = {
  'Capsule':        { key: 'Capsule',        onsetMin: 45, peakMin: 90, durationHr: 6, mgStart: 2,  mgTypical: [2, 8] },
  'Edible':         { key: 'Edible',         onsetMin: 45, peakMin: 90, durationHr: 6, mgStart: 2,  mgTypical: [2, 8] },
  'Stacking spray': { key: 'Stacking spray', onsetMin: 15, peakMin: 30, durationHr: 2, mgStart: 0.5, mgTypical: [1, 4] },
  'Booster spray':  { key: 'Booster spray',  onsetMin: 10, peakMin: 20, durationHr: 1.5, mgStart: 0.5, mgTypical: [1, 3] },
  'Inhalable':      { key: 'Inhalable',      onsetMin: 1,  peakMin: 5,  durationHr: 1, mgStart: 1,  mgTypical: [1, 5] },
  'Topical':        { key: 'Topical',        onsetMin: 10, peakMin: 20, durationHr: 2, mgStart: 0,  mgTypical: [0, 0] }, // dose-less; apply-thin
};

// Rough effect directions for common terps on our goal keys.
// Positive helps that goal, negative works against it.
const TERP_EFFECTS: Record<
  NonNullable<keyof Chemotype['terps']>,
  Partial<Record<GoalKey, number>>
> = {
  limonene:     { mood: +0.9, focus: +0.4, anxiety: -0.2 },
  pinene:       { focus: +0.8, mood: +0.2, anxiety: -0.1 },
  linalool:     { anxiety: +0.9, sleep: +0.6, mood: +0.2, focus: -0.2 },
  myrcene:      { sleep: +0.8, relief: +0.4, focus: -0.4 },
  caryophyllene:{ relief: +0.8, anxiety: +0.3 },
  terpinolene:  { mood: +0.6, focus: +0.3, anxiety: -0.2 },
};

// Example chemotypes (swap with your catalog or strains):
export const CHEMOTYPES: Chemotype[] = [
  { id:'ct_bright', name:'Bright Focus', terps:{ limonene:0.4, pinene:0.35, caryophyllene:0.15 } },
  { id:'ct_calm',   name:'Calm & Steady', terps:{ linalool:0.4, caryophyllene:0.3, myrcene:0.1 } },
  { id:'ct_relief', name:'Deep Relief', terps:{ caryophyllene:0.45, myrcene:0.25, pinene:0.1 } },
  { id:'ct_rest',   name:'Rest & Restore', terps:{ myrcene:0.45, linalool:0.35 } },
];

// scale doses for sensitivity
function scaleBySensitivity(mg: number, s: Sensitivity) {
  if (s === 'High') return mg * 1.25;
  if (s === 'Low')  return Math.max(0.5, mg * 0.7);
  return mg;
}

function scoreChemotype(goals: Goals, ct: Chemotype, prefs: UserPrefs) {
  // target vector: normalize goals to 0..1 weights
  const sum = (Object.values(goals).reduce((a,b)=>a+b,0) || 1);
  const weights: Record<GoalKey, number> = {
    relief: goals.relief / sum,
    anxiety: goals.anxiety / sum,
    mood: goals.mood / sum,
    focus: goals.focus / sum,
    sleep: goals.sleep / sum,
  };

  let score = 0;
  for (const [terp, frac] of Object.entries(ct.terps)) {
    const eff = TERP_EFFECTS[terp as keyof typeof TERP_EFFECTS] || {};
    for (const g of Object.keys(weights) as GoalKey[]) {
      const contrib = (eff[g] || 0) * (weights[g] || 0) * (frac || 0);
      score += contrib;
    }
  }

  // Preferences adjustments
  if (prefs.avoidSedation) {
    // penalize high myrcene/linalool for daytime/focus use
    const sed = (ct.terps.myrcene || 0) * 0.6 + (ct.terps.linalool || 0) * 0.4;
    score -= sed * 0.35;
  }
  if (prefs.avoidRacy) {
    const racy = (ct.terps.limonene || 0) * 0.4 + (ct.terps.terpinolene || 0) * 0.4;
    score -= racy * 0.25;
  }

  return score;
}

export type PlanStep = {
  phase: 'Baseline' | 'Booster' | 'Rescue' | 'Topical';
  method: MethodKey;
  mg: number | null;           // null for topical
  when: string;                // "Now", "Every 30–45 min", etc.
  note?: string;
};

export type DosePlan = {
  chemotypePrimary: Chemotype;
  chemotypeAlt: Chemotype;
  steps: PlanStep[];
  sessionTotalMg: number;
  justificationPlain: string[];
};

export function buildPlan(
  goals: Goals,
  selectedMethods: MethodKey[],
  prefs: UserPrefs
): DosePlan {
  // Rank chemotypes
  const ranked = [...CHEMOTYPES].sort((a,b) =>
    scoreChemotype(goals, b, prefs) - scoreChemotype(goals, a, prefs)
  );
  const primary = ranked[0];
  const alt = ranked[1] || ranked[0];

  const m = METHOD_CATALOG;
  const has = (k: MethodKey) => selectedMethods.includes(k);

  // Baseline pick prefers Capsule/Edible if available; otherwise Stacking spray.
  let baselineKey: MethodKey | null = null;
  if (has('Capsule')) baselineKey = 'Capsule';
  else if (has('Edible')) baselineKey = 'Edible';
  else if (has('Stacking spray')) baselineKey = 'Stacking spray';

  const steps: PlanStep[] = [];
  let total = 0;

  // Baseline
  if (baselineKey) {
    const baseStart = scaleBySensitivity(m[baselineKey].mgStart, prefs.sensitivity);
    const base = Math.round(baseStart * 10) / 10;
    steps.push({
      phase:'Baseline',
      method: baselineKey,
      mg: base,
      when: 'Now',
      note: 'Sets a steady foundation; adjust next time if too light/heavy.',
    });
    total += base;
  }

  // Booster (if chosen)
  if (has('Stacking spray') || has('Booster spray')) {
    const key: MethodKey = has('Stacking spray') ? 'Stacking spray' : 'Booster spray';
    const micro = scaleBySensitivity(0.5, prefs.sensitivity);
    steps.push({
      phase:'Booster',
      method: key,
      mg: Math.round(micro * 10) / 10,
      when: 'Every 20–40 min as needed',
      note: 'Small “steerable” layers; stop when you reach desired effect.',
    });
    total += Math.round(micro * 10) / 10;
  }

  // Rescue (fast)
  if (has('Inhalable')) {
    const res = scaleBySensitivity(m['Inhalable'].mgStart, prefs.sensitivity);
    steps.push({
      phase:'Rescue',
      method:'Inhalable',
      mg: Math.round(res * 10) / 10,
      when:'Only if symptoms spike',
      note:'Fast onset; wait 10 minutes before repeating.',
    });
  }

  // Topical for localized pain
  if (prefs.localizedPain && has('Topical')) {
    steps.push({
      phase:'Topical',
      method:'Topical',
      mg: null,
      when:'Apply thin layer to affected area',
      note:'Non-intoxicating; reapply every 2–3 hours as needed.',
    });
  }

  // If user didn’t pick any of the above, suggest at least one
  if (steps.length === 0 && selectedMethods.length) {
    const first = selectedMethods[0];
    const start = scaleBySensitivity(m[first].mgStart, prefs.sensitivity);
    steps.push({ phase:'Baseline', method:first, mg: Math.round(start*10)/10, when:'Now' });
    total += Math.round(start*10)/10;
  }

  // Friendly justification
  const why: string[] = [];
  const goalTop = Object.entries(goals)
    .sort((a,b)=>b[1]-a[1])
    .filter(([_,v])=>v>0)
    .slice(0,2)
    .map(([k]) => k);

  if (goalTop.length) {
    why.push(`You prioritized ${goalTop.join(' and ')}. ${primary.name} aligns with that profile.`);
  } else {
    why.push(`${primary.name} provides a balanced profile based on your inputs.`);
  }

  if (baselineKey) {
    why.push(`${baselineKey} sets a steady base so effects are predictable.`);
  }
  if (has('Stacking spray') || has('Booster spray')) {
    const label = has('Stacking spray') ? 'stacking sprays' : 'booster sprays';
    why.push(`Small ${label} let you fine-tune without overdoing it.`);
  }
  if (has('Inhalable')) {
    why.push(`An inhalable is included for quick relief during spikes.`);
  }
  if (prefs.avoidSedation) {
    why.push(`We avoided heavier sedating profiles to keep you functional.`);
  }
  if (prefs.avoidRacy) {
    why.push(`We leaned away from racy, up-tempo profiles to keep things calm.`);
  }

  return {
    chemotypePrimary: primary,
    chemotypeAlt: alt,
    steps,
    sessionTotalMg: Math.round(total * 10) / 10,
    justificationPlain: why,
  };
}
