// app/src/addons/types.ts
export type EMACheckin = {
  timestamp: number;
  energy?: number;
  mood?: number;
  pain?: number;
  sleep?: number;
  note?: string;
};

export type ProtocolPlan = {
  id: string;
  goal: 'sleep' | 'mood' | 'calm' | 'focus' | 'recovery' | string;
  durationDays: number;
  delivery: 'capsule' | 'spray' | 'tincture' | 'mixed' | string;
  createdAt: number;
  [k: string]: any;
};

export type CoachHint = {
  title: string;
  message: string;
  suggestion: string;
};
