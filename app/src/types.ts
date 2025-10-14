// src/types.ts
export type AgeBand = 'u21' | '21_39' | '40_64' | '65_plus';
export type Experience = 'naive' | 'occasional' | 'regular' | 'daily';
export type Sensitivity = 'low' | 'average' | 'high';
export type Route = 'oral_capsule' | 'oral_spray' | 'sublingual' | 'inhalation' | 'topical_transdermal';
export type DayPart = 'day' | 'evening' | 'night';
export type TerpeneCluster = 'calming' | 'focusing' | 'uplifting' | 'soothing' | 'restorative' | 'metabolic';
export interface UserProfile { ageBand: AgeBand; experience: Experience; sensitivity: Sensitivity; thcTolerance: 'none'|'low'|'medium'|'high'; goals: DayPart[]; medFlags?: string[]; weightKg?: number; }
export interface Chemotype { key: string; thcPct: number; cbdPct: number; minors?: { cbg?: 'low'|'mod'|'high'; cbn?: 'low'|'mod'|'high'; thcv?: 'low'|'mod'|'high'; d8?: 'none'|'trace'|'low'; }; terpeneCluster: TerpeneCluster; }
export interface Product { name: string; form: Route; unitMgTHC?: number; unitMgCBD?: number; minorsPerUnit?: { cbg?: number; cbn?: number; thcv?: number; }; chemotypeKey: string; tags?: string[]; }
export interface ProfilesWeights { [key: string]: { label: string; daypart: DayPart; terpenePreference: TerpeneCluster[]; cannabinoidWeights: { thc: number; cbd: number; cbg?: number; cbn?: number; thcv?: number; }; notes?: string; }; }
export interface Ruleset { hardStops: string[]; warnings: { key: string; message: string }[]; lowTHCCapMg: number; }
export interface DosingPlan { recommendations: { startMgTHC?: [number, number]; startMgCBD?: [number, number]; minors?: Record<string, [number, number]>; frequencyPerDay: number; route: Route; }; titration: { stepMgTHC?: number; stepMgCBD?: number; intervalDays: number; maxSteps: number; maxDailyMgTHC?: number; }; stackSuggestions: string[]; cautions: string[]; rationale: string[]; }
