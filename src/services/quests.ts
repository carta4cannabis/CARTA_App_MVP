import { Quest, QuestProgress } from '../types';
import { storage } from './storage';

const QUESTS_KEY = 'carta_quests';
const PROGRESS_KEY = 'carta_quest_progress';

export function getSeedQuests(): Quest[] {
  return [
    {
      id: 'q1',
      title: 'Entourage Explorer I',
      description: 'Learn chemotype basics and log your first session.',
      tasks: [
        { id: 't1', label: 'Read: What is a chemotype?', completed: false },
        { id: 't2', label: 'Log 1 dosing session', completed: false },
      ],
      rewardKP: 50,
      badge: 'Explorer I',
      unlocked: true,
    },
    {
      id: 'q2',
      title: 'Stack Consistency I',
      description: 'Follow your plan for three consecutive days.',
      tasks: [
        { id: 't3', label: 'Day 1 complete', completed: false },
        { id: 't4', label: 'Day 2 complete', completed: false },
        { id: 't5', label: 'Day 3 complete', completed: false },
      ],
      rewardKP: 100,
      badge: 'Consistency I',
      unlocked: true,
    },
    {
      id: 'q3',
      title: 'Calm & Focus Deep Dive',
      description: 'Try Calm & Focus pairing and reflect twice.',
      tasks: [
        { id: 't6', label: 'Use Calm & Focus capsule', completed: false },
        { id: 't7', label: 'Complete 2 reflection check-ins', completed: false },
      ],
      rewardKP: 120,
      badge: 'Pathfinder',
      unlocked: false,
    },
  ];
}

export async function loadQuests(): Promise<Quest[]> {
  const raw = await storage.getItem(QUESTS_KEY);
  if (raw) return JSON.parse(raw);
  const seed = getSeedQuests();
  await storage.setItem(QUESTS_KEY, JSON.stringify(seed));
  return seed;
}

export async function saveQuests(quests: Quest[]) {
  await storage.setItem(QUESTS_KEY, JSON.stringify(quests));
}

export async function loadProgress(): Promise<QuestProgress> {
  const raw = await storage.getItem(PROGRESS_KEY);
  if (raw) return JSON.parse(raw);
  const fresh: QuestProgress = { kp: 0, badges: [], completedQuestIds: [] };
  await storage.setItem(PROGRESS_KEY, JSON.stringify(fresh));
  return fresh;
}

export async function saveProgress(p: QuestProgress) {
  await storage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

export async function completeTask(questId: string, taskId: string) {
  const quests = await loadQuests();
  const q = quests.find(x => x.id === questId);
  if (!q) return;
  const t = q.tasks.find(t => t.id === taskId);
  if (!t) return;
  t.completed = true;
  await saveQuests(quests);

  const allDone = q.tasks.every(t => t.completed);
  if (allDone) {
    const progress = await loadProgress();
    if (!progress.completedQuestIds.includes(q.id)) {
      progress.kp += q.rewardKP;
      if (q.badge) progress.badges.push(q.badge);
      progress.completedQuestIds.push(q.id);
      await saveProgress(progress);
    }
  }
}
