
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';

export const supabase = CONFIG.USE_SUPABASE
  ? createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
  : null;

export type CloudSession = {
  created_at?: string;
  product_id: string;
  batch_id: string;
  rating: number;
  note?: string | null;
};

export async function saveSessionCloud(s: CloudSession) {
  if (!supabase) return { error: 'Cloud disabled' };
  const { error } = await supabase.from('sessions').insert(s);
  return { error };
}
