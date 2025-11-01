// app/src/logic/dosing/dosingRules.ts

// Narrow, explicit types used by your dosing logic
export type Tolerance = 'naive' | 'regular' | 'tolerant';
export type Route = 'oral' | 'inhaled' | 'oromucosal';

export type DosingInput = {
  route: Route;
  tolerance: Tolerance;
  thcCapMg?: number; // optional cap per day
};

export type DoseRecommendation = {
  // Keep these names stable so existing UI can read them
  startMg: number;      // suggested starting dose (non-THC eq.)
  maxPerDayMg: number;  // upper safe bound (non-THC eq.)
  notes?: string;
};

/**
 * Deterministic, React-free rule set.
 * Keep it simple & conservative; you can wire your real engine later.
 */
export function recommendDose(input: DosingInput): DoseRecommendation {
  const { route, tolerance, thcCapMg = 9 } = input;

  // Base starting point by route
  const base =
    route === 'oral' ? 10 :
    route === 'oromucosal' ? 7.5 :
    /* inhaled */ 2.5;

  // Adjust for tolerance
  const tolMul =
    tolerance === 'naive' ? 0.75 :
    tolerance === 'regular' ? 1 :
    /* tolerant */ 1.25;

  const startMg = +(base * tolMul).toFixed(1);

  // Max/day: tighter than cap and route-based guard
  const maxFromRoute = route === 'inhaled' ? 15 : 40;
  const maxPerDayMg = Math.min(maxFromRoute, Math.max(10, thcCapMg * 10));

  return {
    startMg,
    maxPerDayMg,
    notes:
      'Begin low and go slow. Titrate every 2–3 days as tolerated. Respect daily cap.',
  };
}