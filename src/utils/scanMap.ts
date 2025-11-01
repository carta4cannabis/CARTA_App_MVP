// @ts-nocheck
import { PRODUCTS } from '../data/products';

// Optional hard-coded label→id mappings
const HARD = new Map<string,string>([
  // ['0123456789012', 'calm_focus_caps'],
  // ['carta://product/mood-uplift', 'mood_uplift_caps'],
]);

export function lookupProductIdFromScan(raw: string): string | undefined {
  const data = (raw || '').trim();

  if (HARD.has(data)) return HARD.get(data)!;

  try {
    if (data.startsWith('http') || data.startsWith('carta:') || data.startsWith('carta://')) {
      const url = new URL(data.replace(/^carta:/, 'carta://'));
      const slug = url.pathname.split('/').filter(Boolean).pop();
      const fromSlug = PRODUCTS.find(p => p.slug === slug || p.detailsKey === slug);
      if (fromSlug) return fromSlug.id;
    }
  } catch {}

  const numeric = data.replace(/\D/g, '');
  if (numeric.length >= 8) {
    const byCode = PRODUCTS.find(p => p.barcodes?.includes(numeric));
    if (byCode) return byCode.id;
  }

  const byId = PRODUCTS.find(p => p.id === data || p.detailsKey === data || p.key === data);
  return byId?.id;
}