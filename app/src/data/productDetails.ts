// src/data/productDetails.ts
// Static product specs used by ProductDetailsScreen.
// No dosages shown (per your request). Cannabinoids first, then terpenes, botanicals, nutrients.

import imgMobility from '../../assets/products/mobility_function.png';
import imgCalm from '../../assets/products/calm_focus_daytime.png';
import imgMood from '../../assets/products/mood_uplift_daytime.png';
import imgRest from '../../assets/products/rest_restore_nighttime.png';
import imgDigestive from '../../assets/products/digestive_support.png';
import imgMetabolic from '../../assets/products/metabolic_wellness.png';
import imgMind from '../../assets/products/mind_memory.png';
import imgIntimacy from '../../assets/products/intimacy_capsules.png';

export type ProductSpec = {
  key: string;               // detailsKey
  title: string;
  blurb: string;             // short consumer-friendly copy
  image: any;                // require(...) image
  cannabinoids: string[];    // listed (no amounts)
  terpenes: string[];
  botanicals: string[];
  nutrients: string[];
};

export const PRODUCT_DETAILS: Record<string, ProductSpec> = {
  calm_focus_capsules: {
    key: 'calm_focus_capsules',
    title: 'Calm & Focus — Capsules (Daytime)',
    blurb:
      'A CBD-forward formula aimed at steady focus with a calm baseline. THC-free capsules; pair with Stacker Spray or an inhalable if THC is desired.',
    image: imgCalm,
    cannabinoids: ['CBD', 'CBG', 'CBC'],
    terpenes: ['Limonene', 'α-Pinene', 'β-Caryophyllene'],
    botanicals: ['L-Theanine', 'Ashwagandha'],
    nutrients: ['Magnesium', 'B-Complex'],
  },

  mood_uplift_capsules: {
    key: 'mood_uplift_capsules',
    title: 'Mood & Uplift — Capsules (Daytime)',
    blurb:
      'Bright, daytime support intended for motivation and outlook. THC-free; add Stacker Spray or an inhalable for THC as needed.',
    image: imgMood,
    cannabinoids: ['CBD', 'CBG'],
    terpenes: ['Limonene', 'β-Caryophyllene'],
    botanicals: ['Rhodiola', 'Saffron'],
    nutrients: ['Vitamin B6'],
  },

  rest_restore_capsules: {
    key: 'rest_restore_capsules',
    title: 'Rest & Restore — Capsules (Bedtime)',
    blurb:
      'Nighttime baseline support. THC-free capsule that can be paired with an optional inhalable for sleep onset when appropriate.',
    image: imgRest,
    cannabinoids: ['CBD', 'CBN'],
    terpenes: ['Linalool', 'Myrcene'],
    botanicals: ['Chamomile', 'Passionflower'],
    nutrients: ['Magnesium (Glycinate)', 'L-Theanine'],
  },

  mobility_capsules: {
    key: 'mobility_capsules',
    title: 'Mobility & Function — Capsules',
    blurb:
      'Daily baseline support for movement and activity. THC-free and designed to be stacked with Stacker Spray or inhalables if needed.',
    image: imgMobility,
    cannabinoids: ['CBD', 'CBG'],
    terpenes: ['β-Caryophyllene', 'Humulene'],
    botanicals: ['Turmeric (Curcumin)', 'Boswellia'],
    nutrients: ['Omega-3s'],
  },

  digestive_capsules: {
    key: 'digestive_capsules',
    title: 'Digestive Support — Capsules',
    blurb:
      'Formulated for a settled, comfortable gut baseline (THC-free).',
    image: imgDigestive,
    cannabinoids: ['CBD', 'CBG'],
    terpenes: ['Terpinolene', 'β-Caryophyllene'],
    botanicals: ['Ginger', 'Peppermint'],
    nutrients: ['Zinc (Carnosine)'],
  },

  metabolic_capsules: {
    key: 'metabolic_capsules',
    title: 'Metabolic Wellness — Capsules',
    blurb:
      'Daily baseline support aligned with metabolic goals. THC-free.',
    image: imgMetabolic,
    cannabinoids: ['CBD', 'CBG'],
    terpenes: ['Limonene', 'Humulene'],
    botanicals: ['Berberine', 'Cinnamon'],
    nutrients: ['Chromium', 'Alpha-Lipoic Acid'],
  },

  mind_memory_capsules: {
    key: 'mind_memory_capsules',
    title: 'Mind & Memory — Capsules',
    blurb:
      'Focus on clarity and recall with a THC-free baseline.',
    image: imgMind,
    cannabinoids: ['CBD', 'CBG'],
    terpenes: ['α-Pinene', 'Limonene'],
    botanicals: ['Bacopa', 'Ginkgo'],
    nutrients: ['Choline', 'Omega-3s'],
  },

  intimacy_capsules: {
    key: 'intimacy_capsules',
    title: 'Intimacy Support — Capsules',
    blurb:
      'THC-free baseline support designed for connection and comfort.',
    image: imgIntimacy,
    cannabinoids: ['CBD', 'CBG'],
    terpenes: ['Nerolidol', 'Linalool'],
    botanicals: ['Maca', 'Damiana'],
    nutrients: ['L-Arginine'],
  },
};
