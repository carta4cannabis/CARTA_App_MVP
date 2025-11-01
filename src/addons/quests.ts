// src/addons/quests.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Quest, QuestProgress } from './types';

const QUESTS_KEY = 'carta_quests';
const PROGRESS_KEY = 'carta_quest_progress';

export async function initQuestDb(): Promise<void> {
  // no-op with AsyncStorage (kept for API parity)
}

export function getSeedQuests(): Quest[] {
  return [
    { id:'q1', title:'Entourage Explorer I', description:'Learn chemotype basics and log your first session.',
      tasks:[{ id:'t1', label:'Read: What is a chemotype?', completed:false },
             { id:'t2', label:'Log 1 dosing session', completed:false }],
      rewardKP:50, badge:'Explorer I', unlocked:true },
    { id:'q2', title:'Stack Consistency I', description:'Follow your plan for three consecutive days.',
      tasks:[{ id:'t3', label:'Day 1 complete', completed:false },
             { id:'t4', label:'Day 2 complete', completed:false },
             { id:'t5', label:'Day 3 complete', completed:false }],
      rewardKP:100, badge:'Consistency I', unlocked:true },
  ];
}

export async function loadQuests(): Promise<Quest[]> {
  const raw = await AsyncStorage.getItem(QUESTS_KEY);
  if (!raw) {
    const seed = getSeedQuests();
    await AsyncStorage.setItem(QUESTS_KEY, JSON.stringify(seed));
    return seed;
  }
  try { return JSON.parse(raw) as Quest[]; }
  catch { const seed = getSeedQuests(); await AsyncStorage.setItem(QUESTS_KEY, JSON.stringify(seed)); return seed; }
}

export async function saveQuests(q: Quest[]) {
  await AsyncStorage.setItem(QUESTS_KEY, JSON.stringify(q));
}

export async function loadProgress(): Promise<QuestProgress> {
  const raw = await AsyncStorage.getItem(PROGRESS_KEY);
  if (raw) {
    try { return JSON.parse(raw) as QuestProgress; } catch {}
  }
  const fresh: QuestProgress = { kp: 0, badges: [], completedQuestIds: [] };
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(fresh));
  return fresh;
}

export async function saveProgress(p: QuestProgress) {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

export async function completeTask(questId: string, taskId: string) {
  const quests = await loadQuests();
  const q = quests.find(x => x.id === questId);
  if (!q) return;
  const t = q.tasks.find(t => t.id === taskId);
  if (!t || t.completed) return;

  t.completed = true;
  await saveQuests(quests);

  const allDone = q.tasks.every(t => t.completed);
  if (allDone) {
    const p = await loadProgress();
    if (!p.completedQuestIds.includes(q.id)) {
      p.kp += q.rewardKP;
      if (q.badge) p.badges.push(q.badge);
      p.completedQuestIds.push(q.id);
      await saveProgress(p);
    }
  }
}