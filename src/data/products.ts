// src/data/products.ts
export type RouteKind = 'capsule' |'softgels' | 'spray' | 'inhalable';

export interface Product {
  id: string;
  name: string;
  route: RouteKind;
  tag: 'Capsule' | 'Softgel' |'Spray' | 'Inhalable';
  imageKey: keyof typeof IMG;     // hero/list image key
  blurb?: string;                 // short list blurb (optional)
}

export interface ProductDetail {
  hero: keyof typeof IMG;
  description: string;

  cannabinoids?: string[];
  terpenes?: string[];
  botanicals?: string[];
  nutrients?: string[];

  dosing: {
    time: 'AM' | 'PM' | 'Bedtime' | 'PRN';
    start: string;
    titration: string;
    notes?: string;
  };

  precautions: string[];
  interactions?: string[];
  allergies?: string[];
}

/** Images bundled with the app.
 *  NOTE: path is from this file (src/data) up to assets.
 */
export const IMG = {
  calm_focus_daytime:      require('../../assets/products/calm_focus_daytime.png'),
  mood_uplift_daytime:     require('../../assets/products/mood_uplift_daytime.png'),
  mobility_function:       require('../../assets/products/mobility_function.png'),
  digestive_support:       require('../../assets/products/digestive_support.png'),
  metabolic_wellness:      require('../../assets/products/metabolic_wellness.png'),
  mind_memory:             require('../../assets/products/mind_memory.png'),
  rest_restore_nighttime:  require('../../assets/products/rest_restore_nighttime.png'),
  intimacy_capsule:        require('../../assets/products/intimacy_vitality_capsule.png'),

  booster_spray:           require('../../assets/products/booster_spray.png'),
  stacker_spray:           require('../../assets/products/stacker_spray.png'),

  flower:                  require('../../assets/products/flower.jpg'),
  vape_cart:               require('../../assets/products/vape_cart.png'),
  rosin_jar:               require('../../assets/products/rosin_jar.png'),
} as const;

/** Product list for the grid (Products screen). */
export const PRODUCTS: Product[] = [
  { id: 'calm_focus_capsule',       name: 'Calm & Focus',       route: 'capsule',   tag: 'Capsule',   imageKey: 'calm_focus_daytime' },
  { id: 'mood_uplift_capsule',      name: 'Mood & Uplift',      route: 'capsule',   tag: 'Capsule',   imageKey: 'mood_uplift_daytime' },
  { id: 'mobility_function_capsule',name: 'Mobility & Function',route: 'capsule',   tag: 'Capsule',   imageKey: 'mobility_function' },
  { id: 'digestive_support_softgel',name: 'Digestive Support',  route: 'softgels',   tag: 'Softgel',   imageKey: 'digestive_support' },
  { id: 'metabolic_capsules',       name: 'Metabolic Wellness', route: 'capsule',   tag: 'Capsule',   imageKey: 'metabolic_wellness' },
  { id: 'mind_memory_capsules',     name: 'Mind & Memory',      route: 'capsule',   tag: 'Capsule',   imageKey: 'mind_memory' },
  { id: 'rest_restore_capsule',     name: 'Rest & Restore',     route: 'capsule',   tag: 'Capsule',   imageKey: 'rest_restore_nighttime' },
  { id: 'intimacy_vitality_capsule',name: 'Intimacy & Vitality',route: 'capsule',   tag: 'Capsule',   imageKey: 'intimacy_capsule' },

  { id: 'universal_booster_spray',  name: 'Universal Booster',               route: 'spray',     tag: 'Spray',     imageKey: 'booster_spray' },
  { id: 'thc_stacker_spray',        name: 'THC Stacker',           route: 'spray',     tag: 'Spray',     imageKey: 'stacker_spray' },

  { id: 'carta_flower',             name: 'CARTA Flower (assorted)',       route: 'inhalable', tag: 'Inhalable', imageKey: 'flower' },
  { id: 'carta_vape_cart',          name: 'CARTA Vape Cart',               route: 'inhalable', tag: 'Inhalable', imageKey: 'vape_cart' },
  { id: 'carta_rosin',              name: 'CARTA Rosin (dab)',             route: 'inhalable', tag: 'Inhalable', imageKey: 'rosin_jar' },
];

/** Fast lookup map for details & list. */
export const PRODUCTS_BY_ID: Record<string, Product> =
  Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

/** Rich details for the Product Details screen. */
export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  calm_focus_capsule: {
    hero: 'calm_focus_daytime',
    description:
      'Daytime clarity with calm alertness. Non-intoxicating cannabinoids paired with nootropic cofactors to support attentional stability and ease.',
    cannabinoids: ['CBDA', 'CBG', 'CBD'],
    terpenes: ['α-pinene', 'limonene', 'linalool'],
    botanicals: ['Lion’s Mane (fruiting body)', 'L-theanine', 'Green tea (low-caffeine EGCG)', 'Bacopa monnieri'],
    nutrients: ['Vitamin B12', 'Magnesium (L-threonate)'],
    dosing: { time: 'AM', start: '1 capsule with food in the morning.', titration: 'If needed after 3–5 uses, increase to 2/day.', notes: 'Avoid excess caffeine for best synergy.' },
    precautions: ['May cause mild nausea on an empty stomach.'],
    interactions: ['High daily CBD from other products (CYP interactions possible).'],
    allergies: ['Mushroom allergy (Lion’s Mane).'],
  },

  mood_uplift_capsule: {
    hero: 'mood_uplift_daytime',
    description: 'Daytime tone/energy support with cannabinoids and adaptogens for anti-fatigue and stress resilience.',
    cannabinoids: ['CBD', 'CBC', 'CBG', 'THCV (low dose)'],
    terpenes: ['limonene', 'α-pinene'],
    botanicals: ['Cordyceps', 'Rhodiola (3% rosavins/1% salidroside)'],
    nutrients: ['Vitamin B6 (P5P)'],
    dosing: { time: 'AM', start: '1 capsule with breakfast.', titration: 'Increase to 2/day if needed; avoid late-day use.' },
    precautions: ['Activating; avoid late-day use.', 'Rhodiola has serotonergic activity.'],
    interactions: ['SSRIs/SNRIs/MAOIs, triptans, stimulant medications; bipolar disorder (mania risk).'],
    allergies: ['Mushroom allergy (Cordyceps).'],
  },

  mobility_function_capsule: {
    hero: 'mobility_function',
    description: 'Comfort & ease-of-movement support with ginger/botanicals plus calming cannabinoids.',
    cannabinoids: ['CBD', 'CBG', 'CBDA'],
    terpenes: ['β-caryophyllene', 'humulene'],
    botanicals: ['Ginger', 'White willow bark', 'Devil’s claw', 'Reishi'],
    nutrients: ['Vitamin D3', 'Vitamin K2-MK7', 'Boron'],
    dosing: { time: 'AM', start: '1 capsule with a meal.', titration: 'Advance to 2/day only if needed; stop 1–2 weeks pre-op.' },
    precautions: ['May increase bleeding risk.', 'Vitamin K2 may affect warfarin.'],
    interactions: ['Anticoagulants/antiplatelets; gallbladder disease caution (ginger).'],
    allergies: ['Mushroom allergy (Reishi).', 'Aspirin/salicylate sensitivity (white willow).'],
  },

  digestive_support_softgel: {
    hero: 'digestive_support',
    description: 'As-needed digestive comfort using CBDA/THC synergy with peppermint/ginger and microbiome support.',
    cannabinoids: ['CBDA', 'THC (low)'],
    terpenes: ['menthol/menthone', 'limonene'],
    botanicals: ['Ginger extract (≥5% gingerols)', 'Peppermint oil', 'Turkey Tail'],
    nutrients: ['B. coagulans (1–2B CFU)', 'Vitamin B6'],
    dosing: { time: 'PRN', start: '1 softgel with food as needed.', titration: 'May repeat per label; respect daily limits.', notes: 'Peppermint helps cramping; CBDA aids anti-nausea.' },
    precautions: ['Peppermint can aggravate reflux/GERD.', 'Probiotics: caution if severely immunocompromised.'],
    interactions: ['See clinician with strong anticoagulants or complex GI regimens.'],
    allergies: ['Mushroom allergy (Turkey Tail).'],
  },

  metabolic_capsules: {
    hero: 'metabolic_wellness',
    description: 'Daily baseline support aligned with metabolic goals. THC-free.',
    cannabinoids: ['CBD', 'CBG'],
    terpenes: ['limonene', 'humulene'],
    botanicals: ['Berberine', 'Cinnamon'],
    nutrients: ['Chromium', 'Alpha-lipoic acid'],
    dosing: { time: 'AM', start: '1 capsule with breakfast.', titration: 'Increase to 2/day if needed after 1–2 weeks.', notes: 'Coordinate with clinician if on hypoglycemics.' },
    precautions: ['Berberine may lower blood sugar.'],
    interactions: ['Diabetes medicines (dose adjustments may be required).'],
    allergies: [],
  },

  mind_memory_capsules: {
    hero: 'mind_memory',
    description: 'Clarity and recall with a THC-free baseline.',
    cannabinoids: ['CBD', 'CBG'],
    terpenes: ['α-pinene', 'limonene'],
    botanicals: ['Bacopa', 'Ginkgo'],
    nutrients: ['Choline', 'Omega-3s'],
    dosing: { time: 'AM', start: '1 capsule in the morning.', titration: 'Advance to 2/day if needed after several uses.' },
    precautions: ['Ginkgo may increase bleeding risk.'],
    interactions: ['Anticoagulants/antiplatelets.'],
    allergies: [],
  },

  rest_restore_capsule: {
    hero: 'rest_restore_nighttime',
    description: 'Night support for relaxation and sleep quality with CBN/CBD plus gentle GABAergic botanicals.',
    cannabinoids: ['CBN', 'CBD', 'CBDA (optional)'],
    terpenes: ['linalool', 'myrcene'],
    botanicals: ['Reishi', 'Chamomile', 'L-theanine', 'Taurine'],
    nutrients: ['Melatonin (low dose)', 'Glycine', 'pharmaGABA®'],
    dosing: { time: 'Bedtime', start: '1 capsule 30–60 min before bed.', titration: 'Increase after several nights if needed. No alcohol/sedatives.', notes: 'Supports onset and maintenance.' },
    precautions: ['Drowsiness; no driving.', 'Reishi/bleeding risk; stop pre-op.', 'Chamomile ragweed-family allergy.'],
    interactions: ['Sedatives/hypnotics; alcohol.'],
    allergies: ['Mushroom allergy (Reishi).', 'Asteraceae allergy (chamomile).'],
  },

  intimacy_vitality_capsule: {
    hero: 'intimacy_capsule',
    description: 'Evening-toned intimacy support. Relaxing without heavy sedation; pairs with event-based boosters if desired.',
    cannabinoids: ['CBD (base)', 'minor cannabinoids per COA'],
    terpenes: ['balanced aromatics per archetype'],
    botanicals: ['Evening-friendly adaptogen blend'],
    nutrients: [],
    dosing: { time: 'PM', start: '1 capsule 30–60 min before desired effect.', titration: 'Pair with Booster/Stacker per plan; respect daily bounds.', notes: 'Use event-based stacking rules.' },
    precautions: ['Avoid driving if any THC is layered.'],
    interactions: ['Review with clinician if using serotonergic or stimulant meds.'],
    allergies: [],
  },

  universal_booster_spray: {
    hero: 'booster_spray',
    description: 'Fast, non-intoxicating cannabinoid booster (sublingual/buccal) to reinforce daytime effect.',
    dosing: { time: 'PRN', start: '1–2 sprays mid-day as needed.', titration: 'May repeat per plan; respect package caps.', notes: 'Non-intoxicating.' },
    precautions: ['Observe total daily cannabinoid caps when stacking.'],
    interactions: [],
    allergies: [],
  },

  thc_stacker_spray: {
    hero: 'stacker_spray',
    description: 'Event-based THC layering for short windows of added effect.',
    dosing: { time: 'PRN', start: 'Start with 1 spray; wait full onset before repeating.', titration: 'Use within time-boxed rules; never drive.', notes: 'Intoxicating; respect tolerance.' },
    precautions: ['No driving or hazardous tasks.', 'Keep away from children.'],
    interactions: ['Alcohol/sedatives increase impairment.'],
    allergies: [],
  },

  // Inhalables (simple detail blocks, can expand with cultivar/COA data later)
  carta_flower: {
    hero: 'flower',
    description: 'Premium CARTA flower. Cultivar-specific dosing per label/COA.',
    dosing: { time: 'PRN', start: '1–2 puffs; wait full onset.', titration: 'Increase by 1 puff only as needed.', notes: 'Onset minutes; duration 2–4 h.' },
    precautions: ['Intoxicating; no driving.'],
    interactions: [],
    allergies: [],
  },
  carta_vape_cart: {
    hero: 'vape_cart',
    description: 'CARTA live rosin vape cart.',
    dosing: { time: 'PRN', start: '1 short inhalation; wait several minutes.', titration: 'Increase slowly; respect tolerance.', notes: 'Onset rapid; duration 1–3 h.' },
    precautions: ['Intoxicating; no driving.'],
    interactions: [],
    allergies: [],
  },
  carta_rosin: {
    hero: 'rosin_jar',
    description: 'CARTA solventless rosin concentrate.',
    dosing: { time: 'PRN', start: 'Rice-grain size amount; wait full onset.', titration: 'Small increases only; high-potency product.', notes: 'For experienced users.' },
    precautions: ['High potency; impairment risk.', 'No driving.'],
    interactions: [],
    allergies: [],
  },
};
