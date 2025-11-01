// app/src/ati/atiFeed.ts
import type { QuickCheckin, SessionEntry } from '../storage/tracker';

export type ATISnapshot = {
  // Simple, stable feed your ATI/engine can consume
  updatedAt: number;
  sampleCount: number;
  avgRelief?: number;
  lastQuick?: {
    ts: number;
    energy?: number;
    mood?: number;
    pain?: number;
    sleep?: number;
  };
};

function mean(nums: number[]): number | undefined {
  const arr = nums.filter(n => typeof n === 'number' && !Number.isNaN(n)) as number[];
  if (!arr.length) return undefined;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
}

/**
 * Build a minimal, robust feed from stored sessions + quick check-ins.
 * Pure function; no React, no platform APIs.
 */
export function buildATIFeed(
  sessions: SessionEntry[],
  quick: QuickCheckin[]
): ATISnapshot {
  const reliefs = sessions
    .map(s => (typeof s.relief === 'number' ? s.relief : undefined))
    .filter((v): v is number => typeof v === 'number');

  // Most recent quick check-in (if any)
  const lastQ = [...quick].sort((a, b) => b.ts - a.ts)[0];

  return {
    updatedAt: Date.now(),
    sampleCount: sessions.length,
    avgRelief: mean(reliefs),
    lastQuick: lastQ
      ? {
          ts: lastQ.ts,
          energy: lastQ.energy,
          mood: lastQ.mood,
          pain: lastQ.pain,
          sleep: lastQ.sleep,
        }
      : undefined,
  };
}