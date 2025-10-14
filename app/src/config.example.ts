
// Copy to `src/config.ts` and fill in values to enable cloud features.
export const CONFIG = {
  USE_REMOTE_API: false,            // switch to true to use server instead of local JSON
  REMOTE_BASE_URL: "http://localhost:3001", // or your deployed URL
  USE_SUPABASE: false,              // switch to true to store sessions in cloud
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-ANON-KEY"
} as const;
