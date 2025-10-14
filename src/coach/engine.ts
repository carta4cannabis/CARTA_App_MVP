// app/src/coach/engine.ts
// Deterministic “brains” for CARTA Guide (no LLM here).
// Computes totals, applies guardrails, suggests adjustments, and builds a clinician summary (HTML).

export type ReliefKey =
  | 'Pain relief' | 'Calm' | 'Mood uplift' | 'Focus'
  | 'Mobility' | 'Digestive comfort' | 'Cognitive clarity' | 'Sleep quality';

export type DayPart = 'AM' | 'PM' | 'Bedtime';
export type InhType = 'flower' | 'vape' | 'dab';
export type Potency = 'low' | 'mid' | 'high';

export type SessionEvent = {
  id: string;
  atISO: string;
  methods: ('capsule'|'stacker'|'booster'|'inhalable'|'topical')[];
  capsules?: { name: string; count: number; when: DayPart }[];
  sprays?: { stacker: number; booster: number };
  inhalable?: { type: InhType; potency: Potency; puffs: number };
  relief: Partial<Record<ReliefKey, 1|2|3|4|5>>;
  sidefx: string[];
  comments?: string;
  totals?: { thcMg: number; nonThcMg: number };
  flags?: string[];
};

export type DosingState = {
  weightBand: '<135'|'135-200'|'>200';
  ageBand: '21-34'|'35-59'|'60+';
  tolerance: 'low'|'mid'|'high';
  intensity: 'low'|'mid'|'high';
  dayGoals: ('Calm'|'Mood'|'Mobility'|'Digestive'|'Cognitive')[];
  nightGoal: 'Rest'|'Intimacy';
  target: { thcMaxMg: number; nonThcMaxMg: number };
};

export type CoachAction =
  | { type: 'adjust_regimen'; payload: any }
  | { type: 'warn'; payload: { message: string } }
  | { type: 'educate'; payload: { message: string } };

// -------------------- Tunables (easy to adjust later) --------------------
const CAPSULE_NONTHC_MG_PER_CAP = 40; // average non-THC cannabinoids per capsule
const STACKER_THC_MG_PER_SPRAY = 1.5; // THC mg / spray
const BOOSTER_NONTHC_MG_PER_SPRAY = 5; // non-THC mg / spray

const PUFF_THC_MG: Record<InhType, Record<Potency, number>> = {
  flower: { low: 2, mid: 4, high: 7 },
  vape:   { low: 3, mid: 6, high: 10 },
  dab:    { low: 8, mid: 12, high: 18 },
};

const THC_LIMITS: Record<DosingState['tolerance'], number> = {
  low: 10, mid: 30, high: 60,
};

const NONTHC_LIMIT_DEFAULT = 300;

// -------------------- Core calculators --------------------
export function computeTotals(evt: SessionEvent): { thcMg: number; nonThcMg: number } {
  let thc = 0;
  let non = 0;

  if (evt.capsules?.length) {
    const totalCaps = evt.capsules.reduce((acc, c) => acc + (c.count || 0), 0);
    non += totalCaps * CAPSULE_NONTHC_MG_PER_CAP; // capsules modeled as non-THC only
  }

  if (evt.sprays) {
    thc += (evt.sprays.stacker || 0) * STACKER_THC_MG_PER_SPRAY;
    non += (evt.sprays.booster || 0) * BOOSTER_NONTHC_MG_PER_SPRAY;
  }

  if (evt.inhalable) {
    const perPuff = PUFF_THC_MG[evt.inhalable.type][evt.inhalable.potency];
    thc += (evt.inhalable.puffs || 0) * perPuff;
  }

  return { thcMg: round1(thc), nonThcMg: round1(non) };
}

export function applyGuardrails(
  evt: SessionEvent,
  dosing: DosingState
): { clamped: { thcMg: number; nonThcMg: number }, flags: string[] } {
  const totals = computeTotals(evt);
  const thcCap = Math.min(dosing.target.thcMaxMg, THC_LIMITS[dosing.tolerance]);
  const nonCap = Math.min(dosing.target.nonThcMaxMg, NONTHC_LIMIT_DEFAULT);

  const clamped = {
    thcMg: Math.min(totals.thcMg, thcCap),
    nonThcMg: Math.min(totals.nonThcMg, nonCap),
  };

  const flags: string[] = [];
  if (totals.thcMg > thcCap) flags.push('thc_above_limit');
  if (totals.nonThcMg > nonCap) flags.push('nonthc_above_limit');

  // Example red flag: anxiety ≥3/5 + high THC that day
  const anxiety = evt.relief['Calm'] ? 6 - (evt.relief['Calm'] as number) : 0;
  if (anxiety >= 3 && totals.thcMg >= 20) flags.push('anxiety_after_high_thc');

  return { clamped, flags };
}

// -------------------- Suggestions --------------------
export function suggestAdjustments(
  recent: SessionEvent[],
  dosing: DosingState
): { reply: string; actions: CoachAction[]; rationale_tags: string[] } {
  const last7 = recent.slice(-7);
  const avg = averageExposures(last7);
  const tags: string[] = [];
  const actions: CoachAction[] = [];

  // Heuristic: if Calm scores are weak (<3 median) AND THC exposure is high → suggest non-THC first
  const calmScores = last7.map(s => s.relief['Calm']).filter(Boolean) as number[];
  const calmMed = median(calmScores) ?? 0;

  if (calmMed < 3 && avg.thcAvg >= 20) {
    tags.push('prefer_nonTHC_first');
    actions.push({
      type: 'adjust_regimen',
      payload: {
        tonight: {
          stackerSpray: 0,
          boosterSpray: 2,
          inhalable: { type: 'flower', potency: 'low', puffs: 1 }
        }
      }
    });
  } else if (avg.nonthcAvg < 120) {
    tags.push('increase_base_nonTHC');
    actions.push({
      type: 'adjust_regimen',
      payload: {
        today: {
          capsule: 'Calm & Focus',
          capsuleCount: 1,
          boosterSpray: 1
        }
      }
    });
  }

  // Guard: high THC days with “anxiety” / “paranoia” in sidefx
  const risk = last7.some(s => s.sidefx.some(x =>
    /anxiety|paranoia/i.test(x)) && (s.totals?.thcMg ?? 0) > 20);
  if (risk) {
    tags.push('anxiety_high_thc');
    actions.push({
      type: 'warn',
      payload: { message: 'Recent sessions show anxiety with higher THC. Prefer non-THC boosts and keep THC low.' }
    });
  }

  const reply =
    tags.includes('anxiety_high_thc')
      ? 'I noticed anxiety with higher THC on recent nights. Tonight, keep THC low (≤2 puffs of low-potency flower) and add 2 non-THC booster sprays if needed.'
      : 'To fine-tune benefits, consider a stronger non-THC base first. Add 1 booster spray after 20–30 minutes if needed. Keep THC modest and build gradually.';

  return { reply, actions, rationale_tags: tags };
}

// -------------------- Clinician summary (HTML) --------------------
export function buildClinicianSummaryHTML(
  sessions: SessionEvent[],
  dosing: DosingState,
  startISO?: string,
  endISO?: string
): string {
  const range = filterByRange(sessions, startISO, endISO);
  const expo = summarizeExposures(range);
  const relief = summarizeRelief(range);

  const css = `
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#0C1512;margin:24px;}
    h1{font-size:20px;margin:0 0 4px;}
    h2{font-size:16px;margin:16px 0 8px;}
    table{border-collapse:collapse;width:100%;}
    td,th{border:1px solid #CCD5CF;padding:8px;font-size:13px;text-align:left;}
    .muted{color:#5a6b64}
    .box{border:1px solid #CCD5CF;border-radius:8px;padding:12px;margin:12px 0;}
    .pill{display:inline-block;border:1px solid #CCD5CF;border-radius:999px;padding:4px 8px;margin-right:6px;font-size:12px;}
  `;

  const goalPills = `
    ${dosing.dayGoals.map(g=>`<span class="pill">${g}</span>`).join('')}
    <span class="pill">${dosing.nightGoal}</span>
  `;

  return `
  <html><head><meta charset="utf-8"/><style>${css}</style></head><body>
    <h1>CARTA Clinician Summary</h1>
    <div class="muted">Range: ${startISO ?? '—'} → ${endISO ?? '—'}</div>

    <div class="box">
      <h2>Current Goals & Guardrails</h2>
      <div>Day goals: ${goalPills}</div>
      <div class="muted">Tolerance: ${dosing.tolerance}, Intensity: ${dosing.intensity}, Age: ${dosing.ageBand}, Weight: ${dosing.weightBand}</div>
      <div>Targets: THC ≤ ${dosing.target.thcMaxMg} mg/day, Non-THC ≤ ${dosing.target.nonThcMaxMg} mg/day</div>
    </div>

    <div class="box">
      <h2>Exposure Summary</h2>
      <table>
        <tr><th></th><th>Mean</th><th>Max</th></tr>
        <tr><td>THC (mg)</td><td>${expo.thc.mean.toFixed(1)}</td><td>${expo.thc.max.toFixed(1)}</td></tr>
        <tr><td>Non-THC (mg)</td><td>${expo.non.mean.toFixed(1)}</td><td>${expo.non.max.toFixed(1)}</td></tr>
        <tr><td>Puffs</td><td>${expo.puffs.mean.toFixed(1)}</td><td>${expo.puffs.max.toFixed(0)}</td></tr>
        <tr><td>Sprays (total)</td><td>${expo.sprays.mean.toFixed(1)}</td><td>${expo.sprays.max.toFixed(0)}</td></tr>
      </table>
    </div>

    <div class="box">
      <h2>Outcomes (Avg 1–5)</h2>
      <table>
        ${Object.keys(relief).map(k=>{
          const v = (relief as any)[k];
          return `<tr><td>${k}</td><td>${(v as number).toFixed(2)}</td></tr>`;
        }).join('')}
      </table>
    </div>

    <div class="box">
      <h2>Notes</h2>
      <div class="muted">This non-diagnostic summary aggregates self-reported outcomes and exposure. Consider gradual titration and monitoring for side-effects.</div>
    </div>
  </body></html>`;
}

// -------------------- helpers --------------------
function round1(n: number) { return Math.round(n * 10) / 10; }

function averageExposures(s: SessionEvent[]) {
  const n = Math.max(1, s.length);
  const thcAvg = s.reduce((a,b)=>a+(b.totals?.thcMg ?? computeTotals(b).thcMg),0)/n;
  const nonAvg = s.reduce((a,b)=>a+(b.totals?.nonThcMg ?? computeTotals(b).nonThcMg),0)/n;
  return { thcAvg, nonthcAvg: nonAvg };
}

function summarizeExposures(s: SessionEvent[]) {
  const arr = s.map(x => ({
    thc: x.totals?.thcMg ?? computeTotals(x).thcMg,
    non: x.totals?.nonThcMg ?? computeTotals(x).nonThcMg,
    puffs: x.inhalable?.puffs ?? 0,
    sprays: (x.sprays?.stacker ?? 0) + (x.sprays?.booster ?? 0),
  }));
  const mean = (k: keyof typeof arr[number]) => arr.reduce((a,b)=>a+(b[k] as number),0)/Math.max(1,arr.length);
  const mx   = (k: keyof typeof arr[number]) => arr.reduce((m,b)=>Math.max(m,b[k] as number),0);
  return {
    thc:   { mean: mean('thc'),   max: mx('thc') },
    non:   { mean: mean('non'),   max: mx('non') },
    puffs: { mean: mean('puffs'), max: mx('puffs') },
    sprays:{ mean: mean('sprays'),max: mx('sprays') },
  };
}

function summarizeRelief(s: SessionEvent[]) {
  const keys: ReliefKey[] = [
    'Pain relief','Calm','Mood uplift','Focus','Mobility','Digestive comfort','Cognitive clarity','Sleep quality'
  ];
  const out: Partial<Record<ReliefKey, number>> = {};
  keys.forEach(k=>{
    const vals = s.map(x=>x.relief[k]).filter(Boolean) as number[];
    out[k] = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
  });
  return out;
}

function median(a: number[]): number | undefined {
  if (!a.length) return undefined;
  const b = [...a].sort((x,y)=>x-y);
  const mid = Math.floor(b.length/2);
  return b.length % 2 ? b[mid] : (b[mid-1]+b[mid])/2;
}

function filterByRange(s: SessionEvent[], startISO?: string, endISO?: string) {
  return s.filter(x=>{
    const t = Date.parse(x.atISO);
    if (isNaN(t)) return false;
    if (startISO && t < Date.parse(startISO)) return false;
    if (endISO && t > Date.parse(endISO)) return false;
    return true;
  });
}