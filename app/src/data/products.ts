// Central product catalog used by the Products list and Product Details.

export type ProductId =
  | 'calm_focus_caps'
  | 'mood_uplift_caps'
  | 'mobility_function_caps'
  | 'digestive_support_caps'
  | 'metabolic_wellness_caps'
  | 'mind_memory_caps'
  | 'rest_restore_caps'
  | 'intimacy_vitality_caps'   // ← renamed
  | 'thc_stacker_spray'        // ← new
  | 'universal_booster_spray'; // ← new

export type ProductKind = 'capsule' | 'spray';

export interface Product {
  id: ProductId;
  kind: ProductKind;
  title: string;
  subtitle?: string;
  price: string;
  image: number;           // require(...) numeric id
  description: string;
  cannabinoids: string[];  // names only (no dosages)
  terpenes: string[];
  botanicals: string[];
  nutrients: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'calm_focus_caps',
    kind: 'capsule',
    title: 'Calm & Focus – capsules',
    price: '$39',
    image: require('../../assets/products/calm_focus_daytime.png'),
    description:
      'Daytime support for calm, clarity, and task focus without sedation.',
    cannabinoids: ['CBD', 'CBG'],
    terpenes: ['Limonene', 'Pinene', 'Linalool'],
    botanicals: ['Rhodiola', 'Bacopa'],
    nutrients: ['B-Complex'],
  },
  {
    id: 'mood_uplift_caps',
    kind: 'capsule',
    title: 'Mood & Uplift – capsules',
    price: '$39',
    image: require('../../assets/products/mood_uplift_daytime.png'),
    description:
      'Brightens mood and motivation while keeping a clear head.',
    cannabinoids: ['CBD', 'CBC'],
    terpenes: ['Limonene', 'Beta-Caryophyllene'],
    botanicals: ['Saffron', 'Green tea (EGCG)'],
    nutrients: ['Magnesium'],
  },
  {
    id: 'mobility_function_caps',
    kind: 'capsule',
    title: 'Mobility & Function – capsules',
    price: '$39',
    image: require('../../assets/products/mobility_function.png'),
    description:
      'For daily physical comfort and ease of movement.',
    cannabinoids: ['CBD', 'CBDA'],
    terpenes: ['Myrcene', 'Humulene'],
    botanicals: ['Boswellia', 'Turmeric (curcuminoids)'],
    nutrients: ['Omega-3 blend'],
  },
  {
    id: 'digestive_support_caps',
    kind: 'capsule',
    title: 'Digestive Support – capsules',
    price: '$39',
    image: require('../../assets/products/digestive_support.png'),
    description:
      'Soothes the gut and supports digestive comfort.',
    cannabinoids: ['CBD'],
    terpenes: ['Beta-Caryophyllene', 'Linalool'],
    botanicals: ['Ginger', 'Peppermint'],
    nutrients: ['Electrolytes'],
  },
  {
    id: 'metabolic_wellness_caps',
    kind: 'capsule',
    title: 'Metabolic Wellness – capsules',
    price: '$39',
    image: require('../../assets/products/metabolic_wellness.png'),
    description:
      'Balanced daily support for appetite, glycemic, and energy rhythm.',
    cannabinoids: ['CBD', 'THCV (trace)'],
    terpenes: ['Limonene', 'Terpinolene'],
    botanicals: ['Berberine', 'Cinnamon'],
    nutrients: ['Chromium'],
  },
  {
    id: 'mind_memory_caps',
    kind: 'capsule',
    title: 'Mind & Memory – capsules',
    price: '$39',
    image: require('../../assets/products/mind_memory.png'),
    description:
      'Cognitive clarity and recall support for sustained mental work.',
    cannabinoids: ['CBD'],
    terpenes: ['Pinene', 'Limonene'],
    botanicals: ['Ginkgo', 'Lion’s Mane'],
    nutrients: ['Choline'],
  },
  {
    id: 'rest_restore_caps',
    kind: 'capsule',
    title: 'Rest & Restore – capsules',
    price: '$39',
    image: require('../../assets/products/rest_restore_nighttime.png'),
    description:
      'Nighttime wind-down to ease into restful sleep and recovery.',
    cannabinoids: ['CBD', 'CBN'],
    terpenes: ['Linalool', 'Myrcene'],
    botanicals: ['Valerian', 'Passionflower'],
    nutrients: ['Magnesium bisglycinate'],
  },
  {
    id: 'intimacy_vitality_caps', // ← renamed display
    kind: 'capsule',
    title: 'Intimacy & Vitality – capsules',
    price: '$39',
    image: require('../../assets/products/intimacy_vitality_capsule.png'),
    description:
      'Circulation and mood support for connection, stamina, and confidence.',
    cannabinoids: ['CBD', 'CBC'],
    terpenes: ['Limonene', 'Ocimene'],
    botanicals: ['Maca', 'Ginseng'],
    nutrients: ['Zinc', 'B-vitamins'],
  },

  // ---------- New Sprays ----------
  {
    id: 'thc_stacker_spray',
    kind: 'spray',
    title: 'THC Stacker Spray',
    price: '$49',
    image: require('../../assets/products/thc_stacker_spray.png'),
    description:
      'Fast-acting buccal spray to layer THC onto your base regimen.',
    cannabinoids: ['THC'],
    terpenes: ['Limonene', 'Beta-Caryophyllene'],
    botanicals: [],
    nutrients: [],
  },
  {
    id: 'universal_booster_spray',
    kind: 'spray',
    title: 'Universal Booster Spray',
    price: '$39',
    image: require('../../assets/products/universal_booster_spray.png'),
    description:
      'Non-THC buccal spray to gently boost benefits without intoxication.',
    cannabinoids: ['CBD'],
    terpenes: ['Linalool'],
    botanicals: [],
    nutrients: [],
  },
];

// Quick lookup
export const PRODUCT_BY_ID: Record<ProductId, Product> = PRODUCTS.reduce(
  (acc, p) => ((acc[p.id] = p), acc),
  {} as Record<ProductId, Product>
);
