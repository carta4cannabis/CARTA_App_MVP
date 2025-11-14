// app/src/addons/CARTA_CoachExtras.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ---------------- keys & types ---------------- */

const KEYS = {
  SESSIONS: 'SESSION_TRACKER_LOGS',     // array of SessionEntry
  EMA:      'CARTA_EMA',                // array of EMACheckin
  ATI:      'ATI_INPUTS',               // computed inputs for dosing engine
} as const;

export type SessionEntry = {
  when: string; // ISO
  methods: string[];
  capsules: { profile: string; count: number; daypart?: 'AM'|'PM'|'Bedtime' }[];
  inhalable: null | { type: 'flower'|'vape'|'dab'; potency?: 'low'|'mid'|'high'; puffs: number };
  sprays: { stacker?: number; booster?: number };
  outcomes?: Record<string, number>;
  sideEffects?: string[];
  notes?: string;
};

export type EMACheckin = {
  timestamp: number;
  mood?: number;        // 0–10 (higher = better)
  pain?: number;        // 0–10 (higher = worse)
  sleepHours?: number;  // approx hours 0–10
  note?: string;
};

export type AtiInputs = {
  sessions14: number;
  avgRelief: number | null;
  avgPuffs: number | null;
  avgSprays: number | null;
  lastUpdated: number;
};

/* ---------------- tiny storage helpers ---------------- */

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, v: any) {
  try { await AsyncStorage.setItem(key, JSON.stringify(v)); } catch {}
}

/* ---------------- public helpers (used by screens) ---------------- */

/**
 * Save a Quick Check-In AND append a lightweight "virtual session"
 * so Coach Last-14 & Clinician PDF include it immediately.
 * - Maps mood/pain/sleepHours into outcomes (Relief column), not Notes.
 * - Leaves sprays empty to avoid "Stacker 0 • Booster 0" in Regimen.
 */
export async function saveQuickCheckIn(args: { mood?: number; pain?: number; sleepHours?: number; note?: string }) {
  const now = Date.now();

  // 1) Persist to EMA log
  const ema = await readJson<EMACheckin[]>(KEYS.EMA, []);
  ema.unshift({
    timestamp: now,
    mood: args.mood,
    pain: args.pain,
    sleepHours: args.sleepHours,
    note: args.note,
  });
  await writeJson(KEYS.EMA, ema);

  // 2) Create a lightweight "virtual session" so Coach/PDF picks it up
  // Normalize to 0–5 outcome scores:
  const clamp5 = (n: number) => Math.max(0, Math.min(5, Math.round(n)));
  const outcomes: Record<string, number> = {};

  if (typeof args.mood === 'number' && !Number.isNaN(args.mood)) {
    // Mood 0–10 -> 0–5
    outcomes['Mood'] = clamp5(args.mood / 2);
  }
  if (typeof args.pain === 'number' && !Number.isNaN(args.pain)) {
    // Pain 0–10 (higher=worse) -> Pain relief 0–5 (higher=better)
    outcomes['Pain relief'] = clamp5(5 - args.pain / 2);
  }
  if (typeof args.sleepHours === 'number' && !Number.isNaN(args.sleepHours)) {
    // Sleep hours ~0–10 -> Sleep quality 0–5
    outcomes['Sleep quality'] = clamp5(args.sleepHours / 2);
  }

  const sessions = await readJson<SessionEntry[]>(KEYS.SESSIONS, []);
  const virtualSession: SessionEntry = {
    when: new Date(now).toISOString(),
    methods: ['checkin'],      // distinguishable if needed later
    capsules: [],
    inhalable: null,
    sprays: {},                // leave empty: avoids "Stacker 0 • Booster 0"
    outcomes: Object.keys(outcomes).length ? outcomes : undefined,
    notes: args.note?.trim() || undefined, // optional; relief lives in outcomes
  };

  sessions.unshift(virtualSession);
  await writeJson(KEYS.SESSIONS, sessions);

  // 3) Recompute ATI + notify listeners to refresh immediately
  await recomputeAtiInputs();
  DeviceEventEmitter.emit('CARTA_DATA_UPDATED');
}

export async function saveSessionEntry(entry: SessionEntry) {
  const arr = await readJson<SessionEntry[]>(KEYS.SESSIONS, []);
  arr.unshift(entry);
  await writeJson(KEYS.SESSIONS, arr);

  await recomputeAtiInputs();

  // Notify all listeners (Coach screen, etc.) to refresh immediately
  DeviceEventEmitter.emit('CARTA_DATA_UPDATED');
}

/** Returns { last14: {items: SessionEntry[]} , suggestions: string[] } */
export async function refreshAtiAndCoach() {
  const sessions = await readJson<SessionEntry[]>(KEYS.SESSIONS, []);
  const last14 = { items: sessions.slice(0, 14) }; // newest first
  return { last14, suggestions: makeSuggestions(last14.items) };
}

export async function getCoachLast14() {
  const sessions = await readJson<SessionEntry[]>(KEYS.SESSIONS, []);
  return { items: sessions.slice(0, 14) };
}

export async function getCoachSuggestions() {
  const { items } = await getCoachLast14();
  return makeSuggestions(items);
}

/** For DosingEngineScreen */
export async function getAtiInputs(): Promise<AtiInputs> {
  // ensure up to date (best-effort; ignore errors)
  try { await recomputeAtiInputs(); } catch {}
  return readJson<AtiInputs>(KEYS.ATI, {
    sessions14: 0,
    avgRelief: null,
    avgPuffs: null,
    avgSprays: null,
    lastUpdated: Date.now(),
  });
}

/**
 * Build the Clinician Summary HTML (inline CSS + inline SVG) used by ToolsHub
 * and Coach screens. Accepts { items } (newest first) and groups entries by day.
 */
export function buildClinicianSummaryHTML(last14: { items: SessionEntry[] }): string {
  const OUT_KEYS: Array<[key: string, label: string]> = [
    ['Pain relief', 'Pain relief'],
    ['focus', 'Focus'],
    ['Sleep quality', 'Sleep quality'],
    ['Mood', 'Mood'],
    ['Nausea relief', 'Nausea relief'],
    ['Anxiety relief', 'Anxiety relief'],
    ['Appetite', 'Appetite'],
  ];

  // Group by day (YYYY-MM-DD)
  const byDay = new Map<string, SessionEntry[]>();
  for (const it of (last14?.items ?? [])) {
    const day = it.when ? it.when.slice(0, 10) : 'unknown';
    const arr = byDay.get(day) ?? [];
    arr.push(it);
    byDay.set(day, arr);
  }

  // Build rows (one per day) showing a compact regimen/relief summary
  const rowDays = Array.from(byDay.keys()).sort(); // oldest->newest for table
  const tableRows: string[] = [];

  for (const d of rowDays) {
    const entries = byDay.get(d)!;

    // Regimen summary (capsules/inhalables/sprays)
    const regimenParts: string[] = [];
    for (const s of entries) {
      const caps = (s.capsules ?? [])
        .map(c => `${c.daypart ? `${c.daypart} ` : ''}${c.profile} x${c.count}`)
        .join(', ');
      if (caps) regimenParts.push(caps);

      if (s.inhalable) {
        regimenParts.push(`${s.inhalable.type} ${s.inhalable.potency ?? ''} ${s.inhalable.puffs} puff${s.inhalable.puffs === 1 ? '' : 's'}`.trim());
      }
      const sprays: string[] = [];
      if ((s.sprays?.stacker ?? 0) > 0) sprays.push(`Stacker ${s.sprays!.stacker}`);
      if ((s.sprays?.booster ?? 0) > 0) sprays.push(`Booster ${s.sprays!.booster}`);
      if (sprays.length) regimenParts.push(sprays.join(' • '));
    }
    const regimen = regimenParts.join(' | ');

    // Relief summary: average each outcome for the day (0–5)
    const sums = new Map<string, { n: number; sum: number }>();
    const add = (k: string, v: number) => {
      const cur = sums.get(k) ?? { n: 0, sum: 0 };
      cur.n += 1; cur.sum += v; sums.set(k, cur);
    };
    for (const s of entries) {
      const o = s.outcomes ?? {};
      for (const [k, v] of Object.entries(o)) {
        if (typeof v === 'number' && !Number.isNaN(v)) add(k, v);
      }
    }
    const relParts: string[] = [];
    for (const [k, label] of OUT_KEYS) {
      const m = sums.get(k);
      if (m && m.n > 0) relParts.push(`${label}:${(m.sum / m.n).toFixed(1)}/5`);
    }
    const reliefSummary = relParts.join(', ');

    const sidefx = Array.from(
      new Set(
        entries.flatMap(e => e.sideEffects ?? [])
      )
    ).join(', ');

    const notes = entries
      .map(e => (e.notes ?? '').trim())
      .filter(Boolean)
      .join(' • ');

    const prettyDate = new Date(d).toLocaleString();

    tableRows.push(`
      <tr>
        <td>${prettyDate}</td>
        <td>${escapeHtml(regimen || '—')}</td>
        <td>${escapeHtml(reliefSummary || '—')}</td>
        <td>${escapeHtml(sidefx || '—')}</td>
        <td>${escapeHtml(notes || '—')}</td>
      </tr>
    `);
  }

  // Series for inline SVG trend (0–5). Oldest->newest across days.
  const labels = rowDays;
  const series: Record<string, number[]> = {};
  for (const [, lbl] of OUT_KEYS) series[lbl] = [];

  for (const day of rowDays) {
    const entries = byDay.get(day)!;
    const collect: Record<string, number[]> = {};
    for (const s of entries) {
      const o = s.outcomes ?? {};
      for (const [k, v] of Object.entries(o)) {
        if (typeof v !== 'number' || Number.isNaN(v)) continue;
        const label = mapOutcomeKey(k);
        collect[label] = collect[label] ?? [];
        collect[label].push(v);
      }
    }
    for (const [, lbl] of OUT_KEYS) {
      const arr = collect[lbl] ?? [];
      const avg = arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : NaN;
      series[lbl].push(Number.isNaN(avg) ? NaN : Math.max(0, Math.min(5, avg)));
    }
  }

  const svg = buildTinySvg(labels, series);

  // Final HTML
  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>CARTA Clinician Summary</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#111; }
  h1 { margin: 0 0 12px; }
  table { border-collapse: collapse; width:100%; font-size: 12px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; vertical-align: top; }
  th { background:#f4f4f4; text-align:left; }
  .chartWrap { margin-top: 14px; border:1px solid #ddd; padding:8px; }
  .legend { font-size: 11px; margin-bottom: 6px; display:flex; flex-wrap: wrap; gap:10px; }
  .legend span { display:inline-flex; align-items:center; gap:6px; }
  .sw { width:10px; height:10px; display:inline-block; }
  .muted { color:#666; font-size:11px; text-align:center; }
</style>
</head>
<body>
  <h1>CARTA Clinician Summary</h1>
  <table>
    <thead>
      <tr><th>Date</th><th>Regimen</th><th>Relief</th><th>Side effects</th><th>Notes</th></tr>
    </thead>
    <tbody>
      ${tableRows.join('')}
    </tbody>
  </table>

  <div class="chartWrap">
    <div class="legend">
      ${Object.keys(series).map((lbl,i)=>`<span><span class="sw" style="background:${lineColor(i)}"></span>${lbl}</span>`).join('')}
    </div>
    ${svg}
    <div class="muted">Oldest (left) → Newest (right). Values scaled to 0–5.</div>
  </div>
</body>
</html>
  `;
}

/* ---------------- internals ---------------- */

function mean(nums: number[]) {
  const ns = nums.filter(n => typeof n === 'number' && !Number.isNaN(n));
  if (!ns.length) return null;
  return ns.reduce((a,b)=>a+b,0) / ns.length;
}

function makeSuggestions(items: SessionEntry[]): string[] {
  if (!items.length) return [];
  const last = items[0];
  const reliefVals = last.outcomes ? Object.values(last.outcomes).map(Number) : [];
  const avgRelief = mean(reliefVals) ?? 0;

  const tips: string[] = [];
  if (avgRelief >= 4) tips.push('Great relief — consider repeating the best-performing regimen.');
  if (avgRelief >= 3 && (last.sprays?.stacker ?? 0) < 2) tips.push('Try +1 stacker spray earlier to boost effect without overdoing it.');
  if (avgRelief < 3 && (last.inhalable?.puffs ?? 0) <= 2) tips.push('Relief modest — try +1 puff or step up potency to mid next time.');
  if ((last.sideEffects ?? []).includes('Drowsiness')) tips.push('Note drowsiness — avoid stacking THC late; prefer Booster with Bedtime capsule.');

  if (!tips.length) tips.push('Keep sessions consistent and adjust one variable at a time.');
  return tips;
}

async function recomputeAtiInputs() {
  const sessions = await readJson<SessionEntry[]>(KEYS.SESSIONS, []);
  const recent = sessions.slice(0, 14);

  const avgRelief =
    mean(
      recent.flatMap(s =>
        s.outcomes ? Object.values(s.outcomes).map(Number) : []
      )
    );

  const avgPuffs = mean(
    recent
      .map(s => s.inhalable?.puffs)
      .filter((v): v is number => typeof v === 'number')
  );

  const avgSprays = mean(
    recent.map(s => (s.sprays?.stacker ?? 0) + (s.sprays?.booster ?? 0))
  );

  const payload: AtiInputs = {
    sessions14: recent.length,
    avgRelief,
    avgPuffs,
    avgSprays,
    lastUpdated: Date.now(),
  };
  await writeJson(KEYS.ATI, payload);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as any)[c]
  );
}

function mapOutcomeKey(k: string): string {
  // normalize a few keys used in your app
  if (/pain/i.test(k)) return 'Pain relief';
  if (/sleep/i.test(k)) return 'Sleep quality';
  if (/mood/i.test(k)) return 'Mood';
  if (/nausea/i.test(k)) return 'Nausea relief';
  if (/anxiety/i.test(k)) return 'Anxiety relief';
  if (/appetite/i.test(k)) return 'Appetite';
  if (/focus/i.test(k)) return 'Focus';
  return k;
}

function lineColor(i: number) {
  // 7 distinct, readable colors (SVG inline)
  const palette = ['#3366cc','#dc3912','#ff9900','#109618','#990099','#0099c6','#dd4477'];
  return palette[i % palette.length];
}

function buildTinySvg(labels: string[], series: Record<string, number[]>): string {
  // Simple polylines in 0–5 space onto a 300x120 viewbox
  const W = 620, H = 140, pad = 24;
  const innerW = W - pad*2, innerH = H - pad*2;
  const n = Math.max(1, labels.length);
  const xFor = (i: number) => pad + (n === 1 ? innerW/2 : (innerW * i) / (n - 1));
  const yFor = (v: number) => pad + innerH - (isNaN(v) ? 0 : (innerH * Math.max(0, Math.min(5, v))) / 5);

  const grid = Array.from({ length: 6 }, (_,i) => {
    const y = pad + (innerH * i) / 5;
    return `<line x1="${pad}" y1="${y}" x2="${W-pad}" y2="${y}" stroke="#eee" stroke-width="1"/>`;
  }).join('');

  const lines = Object.entries(series).map(([label, vals], idx) => {
    const pts = vals.map((v,i) => `${xFor(i)},${yFor(v)}`).join(' ');
    return `<polyline fill="none" stroke="${lineColor(idx)}" stroke-width="2" points="${pts}" />`;
  }).join('');

  return `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>
    ${grid}
    ${lines}
  </svg>`;
}

/* ---------------- minimal UI component (unchanged look) ---------------- */

function Field({
  label, value, onChangeText, keyboardType='numeric',
}: { label: string; value: string; onChangeText: (s:string)=>void; keyboardType?: 'default'|'numeric' }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color:'#E9EFEA' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#777"
        style={{ backgroundColor:'#333a3a', color:'#E9EFEA', padding:12, borderRadius:10, borderColor:'#2A2F2F', borderWidth:1 }}
      />
    </View>
  );
}

/** Small, brand-matching block that lets users log a “Quick Check-In”. */
function CoachExtras(props: { onSaved?: () => void }) {
  const [mood, setMood] = useState('');
  const [pain, setPain] = useState('');
  const [sleep, setSleep] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSave() {
    setBusy(true);
    try {
      await saveQuickCheckIn({
        mood: mood ? Number(mood) : undefined,
        pain: pain ? Number(pain) : undefined,
        sleepHours: sleep ? Number(sleep) : undefined,
        note: note || undefined,
      });
      setMood(''); setPain(''); setSleep(''); setNote('');
      props.onSaved?.(); // tell CoachScreen to reload immediately
    } finally { setBusy(false); }
  }

  return (
    <View style={{ backgroundColor:'#121F1A', borderWidth:1, borderColor:'#C9A86A', borderRadius:12, padding:16, marginTop:14 }}>
      <Text style={{ color:'#C9A86A', fontSize:16, fontWeight:'700', marginBottom:10 }}>Quick Check-In</Text>
      <Field label="Mood (0 terrible – 10 fantastic)" value={mood} onChangeText={setMood} />
      <Field label="Pain (0 none – 10 worst ever)" value={pain} onChangeText={setPain} />
      <Field label="Sleep (hours)" value={sleep} onChangeText={setSleep} />
      <Text style={{ color:'#C9C9C9', marginTop:4 }}>Note (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="e.g., Took Calm capsule at 8:15 AM"
        placeholderTextColor="#a8a6a6"
        style={{ backgroundColor:'#333a3a', color:'#E9EFEA', padding:12, borderRadius:10, borderColor:'#2A2F2F', borderWidth:1, marginBottom:10 }}
      />
      <TouchableOpacity
        onPress={onSave}
        disabled={busy}
        style={{ backgroundColor:'#C9A86A', borderRadius:10, paddingVertical:12, alignItems:'center', opacity: busy ? 0.7 : 1 }}
      >
        <Text style={{ color:'#111', fontWeight:'800' }}>{busy ? 'Saving…' : 'Log Check-In'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Export both ways so either import style works:
export default CoachExtras;
export { CoachExtras };
