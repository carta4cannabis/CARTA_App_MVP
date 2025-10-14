
export type StoreItem = {
  id: string;
  name: string;
  price: number; // USD
  image: any; // require() result
  unit?: string;
  note?: string;
  category: 'Capsules' | 'Shot' | 'Flower' | 'Vape';
};

export const STORE_ITEMS: StoreItem[] = [
  { id: 'calm-focus', name: 'Calm & Focus (Daytime)', price: 39.00, image: require('../../assets/store/calm_focus.png'), category:'Capsules' },
  { id: 'rest-restore', name: 'Rest & Restore (Nighttime)', price: 42.00, image: require('../../assets/store/rest_restore.png'), category:'Capsules' },
  { id: 'digestive-support', name: 'Digestive Support', price: 34.00, image: require('../../assets/store/digestive_support.png'), category:'Capsules' },
  { id: 'mind-memory', name: 'Mind & Memory', price: 44.00, image: require('../../assets/store/mind_memory.png'), category:'Capsules' },
  { id: 'mood-uplift', name: 'Mood & Uplift (Daytime)', price: 39.00, image: require('../../assets/store/mood_uplift.png'), category:'Capsules' },
  { id: 'mobility-function', name: 'Mobility & Function (60 Capsules)', price: 45.00, image: require('../../assets/store/mobility_function.png'), category:'Capsules' },
  { id: 'metabolic-wellness', name: 'Metabolic Wellness', price: 39.00, image: require('../../assets/store/metabolic_wellness.png'), category:'Capsules' },
  { id: 'intimacy-vitality', name: 'Intimacy & Vitality Shot (2 fl oz)', price: 9.99, image: require('../../assets/store/intimacy_vitality_shot.png'), category:'Shot' },
  { id: 'flower-eighth', name: 'CARTA Indica — 3.5 g (1/8 oz)', price: 45.00, image: require('../../assets/store/flower_35g.png'), category:'Flower' },
  { id: 'live-rosin-cart', name: 'Live Rosin — Solventless (1 g) — Cart', price: 65.00, image: require('../../assets/store/live_rosin_cart.png'), category:'Vape' },
];
