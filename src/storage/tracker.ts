
import AsyncStorage from '@react-native-async-storage/async-storage';

export type QuickCheckin = {
  id: string;
  ts: number;
  energy?: number; // 0–10
  mood?: number;   // 0–10
  pain?: number;   // 0–10
  sleep?: number;  // 0–10
  note?: string;
};

export type SessionEntry = {
  id: string;
  ts: number;
  relief?: number;         // 0–10
  sideEffects?: string[];  // optional tags
  notes?: string;
};

const QK = '@tracker.quick';
const SK = '@tracker.sessions';

// lightweight in-app change listeners (no Node 'events')
const listeners = new Set<() => void>();
function notify() { listeners.forEach(fn => { try { fn(); } catch {} }); }

export function onTrackerChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------- Quick Check-ins ----------
export async function loadQuickCheckins(): Promise<QuickCheckin[]> {
  try {
    const raw = await AsyncStorage.getItem(QK);
    return raw ? (JSON.parse(raw) as QuickCheckin[]) : [];
  } catch {
    return [];
  }
}

export async function saveQuickCheckin(
  input: Omit<QuickCheckin, 'id' | 'ts'> & { ts?: number }
) {
  const list = await loadQuickCheckins();
  const entry: QuickCheckin = {
    id: String(Date.now()),
    ts: input.ts ?? Date.now(),
    energy: input.energy,
    mood: input.mood,
    pain: input.pain,
    sleep: input.sleep,
    note: input.note?.trim() || undefined,
  };
  const next = [entry, ...list].slice(0, 200);
  await AsyncStorage.setItem(QK, JSON.stringify(next));
  notify();
}

// ---------- Sessions ----------
export async function loadSessions(): Promise<SessionEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(SK);
    return raw ? (JSON.parse(raw) as SessionEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveSession(
  input: Omit<SessionEntry, 'id' | 'ts'> & { ts?: number }
) {
  const list = await loadSessions();
  const entry: SessionEntry = {
    id: String(Date.now()),
    ts: input.ts ?? Date.now(),
    relief: input.relief,
    sideEffects: input.sideEffects?.slice(),
    notes: input.notes?.trim() || undefined,
  };
  const next = [entry, ...list].slice(0, 200);
  await AsyncStorage.setItem(SK, JSON.stringify(next));
  notify();
}