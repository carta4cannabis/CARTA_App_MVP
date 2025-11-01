import type { CoachHint, EMACheckin, ProtocolPlan } from './types';

let SQLite: any = null;
try { SQLite = require('expo-sqlite'); } catch {}

const DB_NAME = 'carta.db';

function getDb() {
  if (!SQLite?.openDatabaseSync) return null;
  return SQLite.openDatabaseSync(DB_NAME);
}

export function initEnhanceDb() {
  const db = getDb();
  if (!db) return;
  db.execSync(`CREATE TABLE IF NOT EXISTS ema_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    energy INTEGER,
    mood INTEGER,
    pain INTEGER,
    sleep INTEGER,
    note TEXT
  );`);
  db.execSync(`CREATE TABLE IF NOT EXISTS protocols (
    id TEXT PRIMARY KEY,
    goal TEXT NOT NULL,
    durationDays INTEGER NOT NULL,
    delivery TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    json TEXT NOT NULL
  );`);
}

export async function savePlan(plan: ProtocolPlan) {
  const db = getDb();
  if (!db) return;
  db.runSync(
    'INSERT OR REPLACE INTO protocols (id, goal, durationDays, delivery, createdAt, json) VALUES (?, ?, ?, ?, ?, ?);',
    [plan.id, plan.goal, plan.durationDays, plan.delivery, plan.createdAt, JSON.stringify(plan)]
  );
}

export function loadPlan(): ProtocolPlan | null {
  const db = getDb();
  if (!db) return null;
  const row = db.getFirstSync('SELECT json FROM protocols ORDER BY createdAt DESC LIMIT 1;') as any;
  if (!row) return null;
  try { return JSON.parse(row.json); } catch { return null; }
}

export async function saveEMA(entry: EMACheckin) {
  const db = getDb();
  if (!db) return;
  db.runSync(
    'INSERT INTO ema_logs (ts, energy, mood, pain, sleep, note) VALUES (?, ?, ?, ?, ?, ?);',
    [entry.timestamp, entry.energy ?? null, entry.mood ?? null, entry.pain ?? null, entry.sleep ?? null, entry.note ?? null]
  );
}

export function loadEMAs(limit = 30): EMACheckin[] {
  const db = getDb();
  if (!db) return [];
  const rs = db.getAllSync('SELECT * FROM ema_logs ORDER BY ts DESC LIMIT ?;', [limit]) as any[];
  return rs.map(r => ({
    timestamp: r.ts,
    energy: r.energy ?? undefined,
    mood: r.mood ?? undefined,
    pain: r.pain ?? undefined,
    sleep: r.sleep ?? undefined,
    note: r.note ?? undefined,
  }));
}

export function generateCoachHints(plan: ProtocolPlan | null, ema: EMACheckin[]): CoachHint[] {
  const hints: CoachHint[] = [];
  if (!plan) {
    hints.push({ title:'No Protocol Yet', message:'Create a personalized plan with the Goal Builder to unlock adaptive coaching.', suggestion:'Open Goal Builder to start your 7/14/30-day plan.' });
    return hints;
  }
  const recent = ema.slice(0,3);
  const avg = (k: keyof EMACheckin) => {
    const vals = recent.map(r => (r[k] ?? 0)).filter(v => typeof v === 'number') as number[];
    if (!vals.length) return null;
    return vals.reduce((a,b)=>a+b,0)/vals.length;
  };
  const energyAvg = avg('energy');
  const moodAvg = avg('mood');
  const painAvg = avg('pain');
  const sleepAvg = avg('sleep');

  if (sleepAvg !== null && sleepAvg < 6 && plan.goal === 'sleep') {
    hints.push({ title:'Sleep Optimization', message:'Sleep scores run low.', suggestion:'Take Rest & Restore 60–90 min before bed + booster spray 15 min pre-lights-out.' });
  }
  if (moodAvg !== null && moodAvg < 6 && (plan.goal==='mood'||plan.goal==='calm')) {
    hints.push({ title:'Mood Support', message:'Mood trends are low.', suggestion:'Shift morning capsule earlier + add midday micro-dose via booster spray.' });
  }
  if (energyAvg !== null && energyAvg < 5 && plan.goal==='focus') {
    hints.push({ title:'Morning Focus', message:'Energy trending low.', suggestion:'Try CBD:CBG-forward within 30 min of wake + lunchtime stacker spray.' });
  }
  if (painAvg !== null && painAvg > 6 && plan.goal==='recovery') {
    hints.push({ title:'Recovery Adjustments', message:'Pain elevated.', suggestion:'Slightly increase evening dose (within label) + 2-min breathwork.' });
  }
  if (!hints.length) {
    hints.push({ title:'You’re on Track', message:'Recent trends look stable.', suggestion:'Stay consistent to refine your optimal ratio zone.' });
  }
  return hints;
}
