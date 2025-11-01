import { EMACheckin, CoachHint, ProtocolPlan } from '../types';
import { storage } from './storage';

const PLAN_KEY = 'carta_protocol_plan';
const EMA_KEY = 'carta_ema_logs';

export async function savePlan(plan: ProtocolPlan) {
  await storage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export async function loadPlan(): Promise<ProtocolPlan | null> {
  const raw = await storage.getItem(PLAN_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveEMA(entry: EMACheckin) {
  const existing = await loadEMAs();
  existing.push(entry);
  await storage.setItem(EMA_KEY, JSON.stringify(existing));
}

export async function loadEMAs(): Promise<EMACheckin[]> {
  const raw = await storage.getItem(EMA_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Simple rules engine for hints
export function generateCoachHints(plan: ProtocolPlan | null, ema: EMACheckin[]): CoachHint[] {
  const hints: CoachHint[] = [];
  if (!plan) {
    hints.push({
      title: 'No Protocol Yet',
      message: 'Create a personalized plan with the Goal Builder to unlock adaptive coaching.',
      suggestion: 'Open Goal Builder to start your 7/14/30-day plan.',
    });
    return hints;
  }

  // last 3 EMA entries
  const recent = ema.slice(-3);
  const avg = (k: keyof EMACheckin) => {
    const vals = recent.map(r => (r[k] ?? 0)).filter(v => typeof v === 'number') as number[];
    if (!vals.length) return null;
    return vals.reduce((a,b) => a + b, 0) / vals.length;
  };

  const energyAvg = avg('energy');
  const moodAvg = avg('mood');
  const painAvg = avg('pain');
  const sleepAvg = avg('sleep');

  if (sleepAvg !== null && sleepAvg < 6 && plan.goal === 'sleep') {
    hints.push({
      title: 'Sleep Optimization',
      message: 'Sleep scores have been below target. Consider adjusting timing for evening dose.',
      suggestion: 'Take Rest & Restore 60–90 minutes before bedtime and add a booster spray 15 minutes before lights out.',
    });
  }

  if (moodAvg !== null && moodAvg < 6 && (plan.goal === 'mood' || plan.goal === 'calm')) {
    hints.push({
      title: 'Mood Support',
      message: 'Mood trends are low this week.',
      suggestion: 'Shift the morning capsule earlier and add midday micro-dosing via booster spray.',
    });
  }

  if (energyAvg !== null && energyAvg < 5 && plan.goal === 'focus') {
    hints.push({
      title: 'Morning Focus',
      message: 'Energy is trending low.',
      suggestion: 'Try a CBD:CBG-forward combo within 30 minutes of wake and a lunchtime stacker spray.',
    });
  }

  if (painAvg !== null && painAvg > 6 && plan.goal === 'recovery') {
    hints.push({
      title: 'Recovery Adjustments',
      message: 'Pain remains elevated.',
      suggestion: 'Increase evening dose slightly (within label limits) and add a breath/reflection timer post-dosing.',
    });
  }

  if (!hints.length) {
    hints.push({
      title: 'You’re on Track',
      message: 'Your recent trends look stable. Keep following your plan.',
      suggestion: 'Maintain consistency to refine your optimal ratio zone.',
    });
  }

  return hints;
}
