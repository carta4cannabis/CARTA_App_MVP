// src/utils/reliefMetrics.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * TODO: adjust these to match the actual storage keys
 * you are using for Session Tracker and Quick Check-In.
 */
const SESSION_TRACKER_KEY = 'CARTA_SESSION_TRACKER_LOGS';
const QUICK_CHECKIN_KEY = 'CARTA_QUICK_CHECKINS';

export type ReliefMetricKey =
  | 'painRelief'
  | 'anxietyRelief'
  | 'sleepQuality'
  | 'focus'
  | 'mood'
  | 'nauseaRelief'
  | 'appetite';

export const RELIEF_METRICS: ReliefMetricKey[] = [
  'painRelief',
  'anxietyRelief',
  'sleepQuality',
  'focus',
  'mood',
  'nauseaRelief',
  'appetite',
];

export const RELIEF_METRIC_LABELS: Record<ReliefMetricKey, string> = {
  painRelief: 'Pain relief',
  anxietyRelief: 'Anxiety relief',
  sleepQuality: 'Sleep quality',
  focus: 'Focus',
  mood: 'Mood',
  nauseaRelief: 'Nausea relief',
  appetite: 'Appetite',
};

export type ReliefEntry = {
  timestamp: string; // ISO string
  source: 'session' | 'checkIn';
  painRelief?: number;
  anxietyRelief?: number;
  sleepQuality?: number;
  focus?: number;
  mood?: number;
  nauseaRelief?: number;
  appetite?: number;
};

export type ReliefSeriesPoint = {
  x: Date;   // date/time for X axis
  y: number; // 1–5 rating
};

export type ReliefSeries = Record<ReliefMetricKey, ReliefSeriesPoint[]>;

export type ReliefSummary = {
  average: number | null; // mean across all entries (1–5)
  count: number;          // how many ratings contributed
};

export type ReliefSummaryMap = Record<ReliefMetricKey, ReliefSummary>;

export type ReliefMetricsForPdf = {
  entries: ReliefEntry[];        // normalized entries (after filtering)
  series: ReliefSeries;          // time-series data for graph
  summary: ReliefSummaryMap;     // averages for top-of-PDF snapshot
};

/**
 * Safely convert an arbitrary value into a 1–5 rating, or undefined.
 */
function toRating(value: any): number | undefined {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  if (n < 1 || n > 5) return undefined;
  return n;
}

/**
 * Pull the best-guess timestamp from a stored object.
 * Adjust this to match how you’re storing dates (e.g. createdAt, date, etc).
 */
function getTimestamp(raw: any): string | null {
  return (
    raw?.timestamp ??
    raw?.createdAt ??
    raw?.date ??
    null
  );
}

/**
 * Map a Session Tracker entry (whatever shape it is in storage) into a ReliefEntry.
 * Adjust the field names in here to match your real stored structure.
 */
function mapSessionToReliefEntry(raw: any): ReliefEntry | null {
  const timestamp = getTimestamp(raw);
  if (!timestamp) return null;

  // Many people store the ratings under something like raw.relief, raw.outcomes, or raw.reliefOutcomes.
  const r = raw?.relief ?? raw?.outcomes ?? raw?.reliefOutcomes ?? raw;

  const entry: ReliefEntry = {
    timestamp,
    source: 'session',
    painRelief: toRating(r.painRelief ?? r.pain),
    anxietyRelief: toRating(r.anxietyRelief ?? r.anxiety),
    sleepQuality: toRating(r.sleepQuality ?? r.sleep),
    focus: toRating(r.focus),
    mood: toRating(r.mood),
    nauseaRelief: toRating(r.nauseaRelief ?? r.nausea),
    appetite: toRating(r.appetite),
  };

  // If absolutely nothing is defined, skip it.
  const hasAny = RELIEF_METRICS.some(
    key => typeof entry[key] === 'number',
  );
  return hasAny ? entry : null;
}

/**
 * Map a Quick Check-In entry to a ReliefEntry.
 * In many setups Quick Check-In uses the same fields, but if not,
 * adjust the mapping here.
 */
function mapQuickCheckInToReliefEntry(raw: any): ReliefEntry | null {
  const timestamp = getTimestamp(raw);
  if (!timestamp) return null;

  const r = raw?.relief ?? raw?.outcomes ?? raw;

  const entry: ReliefEntry = {
    timestamp,
    source: 'checkIn',
    painRelief: toRating(r.painRelief ?? r.pain),
    anxietyRelief: toRating(r.anxietyRelief ?? r.anxiety),
    sleepQuality: toRating(r.sleepQuality ?? r.sleep),
    focus: toRating(r.focus),
    mood: toRating(r.mood),
    nauseaRelief: toRating(r.nauseaRelief ?? r.nausea),
    appetite: toRating(r.appetite),
  };

  const hasAny = RELIEF_METRICS.some(
    key => typeof entry[key] === 'number',
  );
  return hasAny ? entry : null;
}

/**
 * Main helper to use from the Clinician PDF flow.
 *
 * - Loads Session Tracker + Quick Check-In entries.
 * - Keeps only the last `maxDays` and `maxEntries`.
 * - Returns:
 *   - `entries`: normalized data
 *   - `series`: chart data (one series per metric)
 *   - `summary`: averages per metric for the “snapshot” at the top of the PDF
 */
export async function getReliefMetricsForPdf(options?: {
  maxDays?: number;    // default 30 days
  maxEntries?: number; // default 60 combined entries
}): Promise<ReliefMetricsForPdf> {
  const maxDays = options?.maxDays ?? 30;
  const maxEntries = options?.maxEntries ?? 60;

  const [sessionJson, quickJson] = await Promise.all([
    AsyncStorage.getItem(SESSION_TRACKER_KEY),
    AsyncStorage.getItem(QUICK_CHECKIN_KEY),
  ]);

  const sessionRaw: any[] = sessionJson ? JSON.parse(sessionJson) : [];
  const quickRaw: any[] = quickJson ? JSON.parse(quickJson) : [];

  const sessionEntries = sessionRaw
    .map(mapSessionToReliefEntry)
    .filter((e): e is ReliefEntry => e !== null);

  const quickEntries = quickRaw
    .map(mapQuickCheckInToReliefEntry)
    .filter((e): e is ReliefEntry => e !== null);

  let allEntries = [...sessionEntries, ...quickEntries];

  // Sort newest → oldest
  allEntries.sort((a, b) => {
    const ta = new Date(a.timestamp).getTime();
    const tb = new Date(b.timestamp).getTime();
    return tb - ta;
  });

  // Trim to maxEntries first
  if (allEntries.length > maxEntries) {
    allEntries = allEntries.slice(0, maxEntries);
  }

  // Filter to last maxDays
  const now = Date.now();
  const cutoff = now - maxDays * 24 * 60 * 60 * 1000;

  allEntries = allEntries.filter(entry => {
    const t = new Date(entry.timestamp).getTime();
    if (!Number.isFinite(t)) return false;
    return t >= cutoff;
  });

  // For charting, we usually want oldest → newest on the X axis
  allEntries.sort((a, b) => {
    const ta = new Date(a.timestamp).getTime();
    const tb = new Date(b.timestamp).getTime();
    return ta - tb;
  });

  const series: ReliefSeries = {
    painRelief: [],
    anxietyRelief: [],
    sleepQuality: [],
    focus: [],
    mood: [],
    nauseaRelief: [],
    appetite: [],
  };

  const summary: ReliefSummaryMap = {
    painRelief: { average: null, count: 0 },
    anxietyRelief: { average: null, count: 0 },
    sleepQuality: { average: null, count: 0 },
    focus: { average: null, count: 0 },
    mood: { average: null, count: 0 },
    nauseaRelief: { average: null, count: 0 },
    appetite: { average: null, count: 0 },
  };

  // Build series and collect values for averages
  const valueBuckets: Record<ReliefMetricKey, number[]> = {
    painRelief: [],
    anxietyRelief: [],
    sleepQuality: [],
    focus: [],
    mood: [],
    nauseaRelief: [],
    appetite: [],
  };

  for (const entry of allEntries) {
    const t = new Date(entry.timestamp);

    RELIEF_METRICS.forEach(key => {
      const value = entry[key];
      if (typeof value === 'number') {
        series[key].push({ x: t, y: value });
        valueBuckets[key].push(value);
      }
    });
  }

  // Compute averages
  RELIEF_METRICS.forEach(key => {
    const bucket = valueBuckets[key];
    if (!bucket.length) {
      summary[key] = { average: null, count: 0 };
      return;
    }
    const total = bucket.reduce((sum, v) => sum + v, 0);
    summary[key] = {
      average: Number((total / bucket.length).toFixed(2)),
      count: bucket.length,
    };
  });

  return { entries: allEntries, series, summary };
}
