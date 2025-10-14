
import { TerpMap } from './api';

export type EffectTag = 'Calm' | 'Focus' | 'Relief' | 'Rest' | 'Uplift';

// Simple heuristic: map dominant terpenes to plain-language tags.
export function deriveEffectTags(terps: TerpMap): EffectTag[] {
  const entries = Object.entries(terps).sort((a,b) => b[1]-a[1]).slice(0,3).map(([k]) => k.toLowerCase());
  const tags = new Set<EffectTag>();

  for (const t of entries) {
    if (t.includes('myrcene') || t.includes('linalool')) tags.add('Rest');
    if (t.includes('beta_caryophyllene') || t.includes('humulene')) tags.add('Relief');
    if (t.includes('limonene')) tags.add('Uplift');
    if (t.includes('pinene')) tags.add('Focus');
    if (t.includes('terpinolene')) tags.add('Calm');
  }
  return Array.from(tags);
}
