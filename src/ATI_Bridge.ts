// ATI_Bridge.ts (optional helper; mirrors the bridge in CARTA_CoachExtras if you prefer a separate module)
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CheckIn = {
  id: string; timestamp: string;
  mood?: '🙂' | '😐' | '☹️' | null;
  pain?: number; sleepHours?: number;
  tags?: string[]; notes?: string;
};
export type SessionEntry = CheckIn;

const K = {
  CHECKINS: '@carta:ati:checkins',
  SESSION_LAST: '@carta:session-tracker',
  ATI_INPUTS: '@carta:ati:inputs',
};

const avg = (arr: number[]) => (arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : null);
const clamp = (v:any, lo:number, hi:number) => {
  if (v===null||v===undefined) return undefined;
  const n=Number(v); if (Number.isNaN(n)) return undefined;
  return Math.max(lo, Math.min(hi, n));
};
const norm = (ci: Partial<CheckIn>): CheckIn => ({
  id: ci.id ?? String(Date.now()),
  timestamp: ci.timestamp ?? new Date().toISOString(),
  mood: (ci.mood==='🙂'||ci.mood==='😐'||ci.mood==='☹️') ? ci.mood : null,
  pain: clamp(ci.pain,0,10), sleepHours: clamp(ci.sleepHours,0,24),
  tags: Array.isArray(ci.tags)?ci.tags:[], notes: typeof ci.notes==='string'?ci.notes:''
});

async function getJson<T>(k:string, fb:T): Promise<T> {
  const raw = await AsyncStorage.getItem(k); if(!raw) return fb;
  try { return JSON.parse(raw) as T; } catch { return fb; }
}
async function setJson(k:string,v:any){ await AsyncStorage.setItem(k, JSON.stringify(v)); }
async function push(k:string, item:any, limit=500){
  const arr = await getJson<any[]>(k, []); arr.unshift(item); await setJson(k, arr.slice(0,limit)); return arr;
}

export async function saveSessionEntry(entry: SessionEntry){
  await setJson(K.SESSION_LAST, entry); await push(K.CHECKINS, norm(entry)); await recomputeAtiInputs();
}
export async function saveQuickCheckIn(partial: Partial<CheckIn>){
  const full = norm({ id:String(Date.now()), timestamp:new Date().toISOString(), ...partial });
  await push(K.CHECKINS, full); await setJson(K.SESSION_LAST, full); await recomputeAtiInputs();
}
export async function recomputeAtiInputs(){
  const checkins = await getJson<CheckIn[]>(K.CHECKINS, []);
  const last = await getJson<SessionEntry|null>(K.SESSION_LAST, null);
  let base:any = {};
  try{ const mod:any = require('../ati/atiFeed'); const fn = mod?.getAtiInputs ?? mod?.default?.getAtiInputs; if(typeof fn==='function'){ base = await fn(); } }catch{}
  const cutoff = Date.now()-14*24*3600*1000;
  const last14 = checkins.filter(ci => new Date(ci.timestamp).getTime() >= cutoff);
  const painVals = last14.map(ci => typeof ci.pain==='number'?ci.pain:null).filter((v):v is number=>v!==null);
  const sleepVals = last14.map(ci => typeof ci.sleepHours==='number'?ci.sleepHours:null).filter((v):v is number=>v!==null);
  const counts = {happy:0,mid:0,sad:0}; last14.forEach(ci=>{ if(ci.mood==='🙂')counts.happy++; else if(ci.mood==='😐')counts.mid++; else if(ci.mood==='☹️')counts.sad++; });
  const merged = {
    ...base,
    telemetry:{ windowDays:14, avgPain:avg(painVals), avgSleepHours:avg(sleepVals), moodHistogram:counts, lastCheckIn:last, totalCheckIns:checkins.length },
    checkins,
    signals:{ painHigh: avg(painVals)!==null && (avg(painVals) as number) >= 6, sleepLow: avg(sleepVals)!==null && (avg(sleepVals) as number) < 6, moodLowStreak: counts.sad >= counts.happy }
  };
  await setJson(K.ATI_INPUTS, merged); return merged;
}
export async function getCheckIns(){ return getJson<CheckIn[]>(K.CHECKINS, []); }
export async function getAtiInputsSnapshot(){ return getJson<any>(K.ATI_INPUTS, {}); }
