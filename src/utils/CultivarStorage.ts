// src/utils/cultivarStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export type RatingScale = 0 | 1 | 2 | 3 | 4 | 5;

export type CultivarRatings = {
  painRelief?: RatingScale;
  sleepQuality?: RatingScale;
  anxietyReduction?: RatingScale;
  moodUplift?: RatingScale;
  focusClarity?: RatingScale;
  overall?: RatingScale;
};

export type CultivarImage = {
  uri: string;
  addedAt: string;
};

export type CultivarRecord = {
  id: string;
  name: string;
  breederOrBrand?: string;
  createdAt: string;
  updatedAt: string;
  cannabinoidType?: string;
  terpeneArchetype?: string;
  bestFitProfiles?: string[];
  ratings?: CultivarRatings;
  notes?: string;
  images?: CultivarImage[];
};

function keyForProfile(profileId: string | null) {
  const id = profileId ?? 'guest';
  return `carta:cultivars:${id}`;
}

export async function loadCultivars(profileId: string | null): Promise<CultivarRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(keyForProfile(profileId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load cultivars', e);
    return [];
  }
}

export async function saveCultivars(
  profileId: string | null,
  cultivars: CultivarRecord[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(keyForProfile(profileId), JSON.stringify(cultivars));
  } catch (e) {
    console.warn('Failed to save cultivars', e);
  }
}

export function createCultivarId() {
  return `cultivar-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}
