export type GoalType = 'sleep' | 'focus' | 'calm' | 'recovery' | 'mood';

export type DeliveryPreference = 'capsules' | 'sprays' | 'both';

export interface ProtocolDay {
  dayIndex: number;
  morning?: { sku: string; dose: string };
  midday?: { sku: string; dose: string };
  evening?: { sku: string; dose: string };
  notes?: string;
}

export interface ProtocolPlan {
  id: string;
  goal: GoalType;
  durationDays: 7 | 14 | 30;
  delivery: DeliveryPreference;
  createdAt: number;
  days: ProtocolDay[];
}

export interface EMACheckin {
  timestamp: number;
  energy?: number;
  mood?: number;
  pain?: number;
  sleep?: number;
  note?: string;
}

export interface CoachHint {
  title: string;
  message: string;
  suggestion?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  tasks: { id: string; label: string; completed: boolean }[];
  rewardKP: number;
  badge?: string;
  unlocked: boolean;
}

export interface QuestProgress {
  kp: number;
  badges: string[];
  completedQuestIds: string[];
}
