// app/src/state/feedbackStore.ts
import { useSyncExternalStore } from 'react';

export type ReliefKey =
  | 'Pain relief'
  | 'Reduced anxiety'
  | 'Lifted mood'
  | 'Improved focus'
  | 'Better sleep'
  | 'Less nausea'
  | 'Improved appetite'
  | 'Reduced inflammation';

export type SessionEntry = {
  when: string;
  methods: string[]; // ['Capsule','Inhalable',...]
  reliefScores: Partial<Record<ReliefKey, number>>; // 0..5
  sideFx: string[];  // ['Anxiety','Grogginess',...]
  inhalable?: { type: 'Flower' | 'Vape cart' | 'Dab'; puffs: number };
};

type StoreState = {
  entries: SessionEntry[];
};

const _store: StoreState = { entries: [] };
const subs = new Set<() => void>();
const emit = () => subs.forEach((s) => s());

export function addEntry(e: SessionEntry) {
  _store.entries.push(e);
  emit();
}

// ---- Adaptive signals computed from history ----
export type ATI = {
  profileHint: 'CBD-dominant' | 'Balanced' | 'THC-dominant';
  intensityMul: number;     // 0.9 .. 1.1
  bedtimeBias: number;      // 0..1 (higher => push Bedtime capsule importance)
  inhaleBias: number;       // 0..1 (higher => allow more puffs)
};

function avg(nums: number[]) {
  const arr = nums.filter((n) => Number.isFinite(n));
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function computeATI(entries: SessionEntry[]): ATI {
  if (!entries.length) {
    return { profileHint: 'Balanced', intensityMul: 1.0, bedtimeBias: 0.3, inhaleBias: 0.3 };
  }

  const sleep = avg(entries.map(e => e.reliefScores['Better sleep'] ?? 0));
  const mood  = avg(entries.map(e => e.reliefScores['Lifted mood'] ?? 0));
  const pain  = avg(entries.map(e => e.reliefScores['Pain relief'] ?? 0));
  const anxietyRelief = avg(entries.map(e => e.reliefScores['Reduced anxiety'] ?? 0));
  const focus = avg(entries.map(e => e.reliefScores['Improved focus'] ?? 0));

  const anyAnxietySE = entries.some(e => e.sideFx.includes('Anxiety') || e.sideFx.includes('Paranoia'));
  const anyGroggySE  = entries.some(e => e.sideFx.includes('Grogginess'));

  // Profile hint:
  // - if anxiety SE shows up, bias toward CBD
  // - if mood/pain high and no anxiety SE, allow THC-dominant
  // - else balanced
  let profileHint: ATI['profileHint'] = 'Balanced';
  if (anyAnxietySE) profileHint = 'CBD-dominant';
  else if ((mood > 3.4 || pain > 3.4) && anxietyRelief >= 3) profileHint = 'THC-dominant';

  // Intensity nudges: overall success across primary relief keys
  const overall = avg([sleep, mood, pain, focus, anxietyRelief].filter(Boolean));
  // If success low, nudge up; if high with SE (groggy), nudge down a bit
  let intensityMul = overall < 2.2 ? 1.08 : overall > 3.8 ? 0.95 : 1.0;
  if (anyGroggySE) intensityMul = Math.min(intensityMul, 0.95);

  // Bedtime bias: from sleep score
  const bedtimeBias = Math.min(1, sleep / 5);

  // Inhalation bias: more puffs across history -> permit a bit more
  const puffs = entries
    .map(e => (e.inhalable?.puffs ?? 0))
    .filter(n => n > 0);
  const avgPuffs = avg(puffs);
  const inhaleBias = Math.max(0, Math.min(1, avgPuffs / 6));

  return { profileHint, intensityMul, bedtimeBias, inhaleBias };
}

function getSnap() {
  return { entries: _store.entries, ati: computeATI(_store.entries) };
}

function subscribe(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}

export function useFeedback() {
  return useSyncExternalStore(subscribe, getSnap, getSnap);
}
