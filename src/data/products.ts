// src/data/products.ts
export type RouteKind = 'capsule' | 'spray' | 'inhalable';

export interface Product {
  id: string;
  name: string;
  route: RouteKind;
  image?: any; // require('...') if you’re bundling images
  description: string;

  cannabinoids?: string[];
  terpenes?: string[];
  botanicals?: string[];
  nutrients?: string[];

  dosing: {
    time: 'AM' | 'PM' | 'Bedtime' | 'PRN';
    start: string;      // plain-language starting dose
    titration: string;  // how to step up safely
    notes?: string;     // onset/duration or route notes
  };

  precautions: string[];     // high-level cautions
  interactions?: string[];   // drug / condition interactions
  allergies?: string[];      // potential allergens
}

export const PRODUCTS: Product[] = [
  {
    id: 'calm_focus_capsule',
    name: 'Calm & Focus — Capsules',
    route: 'capsule',
    description:
      'Daytime clarity with calm alertness. Non-intoxicating cannabinoids paired with nootropic cofactors to support attentional stability and ease.',
    cannabinoids: ['CBDA', 'CBG', 'CBD'],
    terpenes: ['α-pinene', 'limonene', 'linalool'],
    botanicals: ['Lion’s Mane (fruiting body)', 'L-theanine', 'Green tea (low-caffeine EGCG)', 'Bacopa monnieri'],
    nutrients: ['Vitamin B12', 'Magnesium (L-threonate)'],
    dosing: {
      time: 'AM',
      start: '1 capsule with food in the morning.',
      titration: 'If needed after 3–5 uses, increase to 2 capsules/day.',
      notes: 'Daytime profile; avoid excess caffeine for best effect synergy.',
    },
    precautions: [
      'May cause mild nausea on an empty stomach.',
    ],
    interactions: [
      'Use caution with high daily CBD from other products (CYP interactions possible).',
    ],
    allergies: [
      'Mushroom allergy (Lion’s Mane).',
    ],
  },

  {
    id: 'mood_uplift_capsule',
    name: 'Mood & Uplift — Capsules',
    route: 'capsule',
    description:
      'Daytime tone/energy support. Cannabinoids balanced with adaptogens for anti-fatigue and stress resilience.',
    cannabinoids: ['CBD', 'CBC', 'CBG', 'THCV (low dose)'],
    terpenes: ['limonene', 'α-pinene'],
    botanicals: ['Cordyceps', 'Rhodiola (3% rosavins/1% salidroside)'],
    nutrients: ['Vitamin B6 (P5P)'],
    dosing: {
      time: 'AM',
      start: '1 capsule with breakfast.',
      titration: 'Increase to 2 capsules/day if needed after several uses; avoid late-day use.',
      notes: 'Designed for morning/day; activating profile.',
    },
    precautions: [
      'May feel activating; avoid late-day use.',
      'Rhodiola has serotonergic activity—use caution with serotonergic medicines.',
    ],
    interactions: [
      'SSRIs/SNRIs/MAOIs, triptans, stimulant medications; bipolar disorder (mania risk).',
    ],
    allergies: ['Mushroom allergy (Cordyceps).'],
  },

  {
    id: 'mobility_function_capsule',
    name: 'Mobility & Function — Capsules',
    route: 'capsule',
    description:
      'Daytime comfort and ease-of-movement support with ginger/botanicals plus calming cannabinoids.',
    cannabinoids: ['CBD', 'CBG', 'CBDA'],
    terpenes: ['β-caryophyllene', 'humulene'],
    botanicals: ['Ginger', 'White willow bark', 'Devil’s claw', 'Reishi'],
    nutrients: ['Vitamin D3', 'Vitamin K2-MK7', 'Boron'],
    dosing: {
      time: 'AM',
      start: '1 capsule with a meal.',
      titration: 'Advance to 2 capsules/day only if needed; stop 1–2 weeks pre-op.',
      notes: '“Comfort” stack; daytime use.',
    },
    precautions: [
      'May increase bleeding risk (ginger, willow bark, devil’s claw).',
      'Vitamin K2 may affect warfarin dosing.',
    ],
    interactions: [
      'Anticoagulants/antiplatelets (e.g., warfarin, clopidogrel).',
      'Gallbladder disease/bile duct obstruction—ginger caution.',
    ],
    allergies: ['Mushroom allergy (Reishi).', 'Aspirin/salicylate sensitivity (white willow).'],
  },

  {
    id: 'digestive_support_softgel',
    name: 'Digestive Support — Softgels (PRN)',
    route: 'capsule',
    description:
      'As-needed digestive comfort using CBDA/THC synergy with peppermint/ginger and microbiome support.',
    cannabinoids: ['CBDA', 'THC (low)'],
    terpenes: ['menthol/menthone (from peppermint)', 'limonene'],
    botanicals: ['Ginger extract (≥5% gingerols)', 'Peppermint oil', 'Turkey Tail'],
    nutrients: ['Bacillus coagulans (1–2B CFU)', 'Vitamin B6'],
    dosing: {
      time: 'PRN',
      start: '1 softgel with food as needed for nausea/comfort.',
      titration: 'May repeat per label; avoid exceeding daily limits.',
      notes: 'Peppermint helps cramping; CBDA provides strong 5-HT1A anti-nausea signaling.',
    },
    precautions: [
      'Peppermint can aggravate reflux/GERD.',
      'Probiotics: caution in severely immunocompromised or central-line patients.',
    ],
    interactions: ['See clinician if using strong anticoagulants or complex GI regimens.'],
    allergies: ['Mushroom allergy (Turkey Tail).'],
  },

  {
    id: 'rest_restore_capsule',
    name: 'Rest & Restore — Capsules',
    route: 'capsule',
    description:
      'Night support for relaxation and sleep quality with CBN/CBD plus gentle GABAergic botanicals.',
    cannabinoids: ['CBN', 'CBD', 'CBDA (optional)'],
    terpenes: ['linalool', 'myrcene'],
    botanicals: ['Reishi', 'Chamomile', 'L-theanine', 'Taurine'],
    nutrients: ['Melatonin (low dose)', 'Glycine', 'pharmaGABA®'],
    dosing: {
      time: 'Bedtime',
      start: '1 capsule 30–60 minutes before bed.',
      titration: 'If needed, increase after several nights. Do not combine with alcohol or sedatives.',
      notes: 'Night capsule; supports sleep onset and maintenance.',
    },
    precautions: [
      'May cause drowsiness—no driving or machinery after use.',
      'Reishi may increase bleeding risk; stop 1–2 weeks before surgery.',
      'Chamomile may trigger ragweed-family allergy.',
    ],
    interactions: ['Sedatives/hypnotics; alcohol.'],
    allergies: ['Mushroom allergy (Reishi).', 'Asteraceae allergy (Chamomile/ragweed).'],
  },

  {
    id: 'intimacy_vitality_capsule',
    name: 'Intimacy & Vitality — Capsules',
    route: 'capsule',
    description:
      'Evening-toned intimacy support. Formulated to relax without heavy sedation and to pair with event-based boosters if desired.',
    cannabinoids: ['CBD (base)', 'minor cannabinoids per COA'],
    terpenes: ['balanced aromatics per archetype'],
    botanicals: ['Evening-friendly adaptogen blend (see label/COA)'],
    nutrients: [],
    dosing: {
      time: 'PM',
      start: '1 capsule 30–60 minutes before desired effect.',
      titration: 'If needed, pair with Universal Booster or THC Stacker per plan; respect daily upper bounds.',
      notes: 'Use event-based stacking rules rather than repeated dose-adding.',
    },
    precautions: [
      'Follow label guardrails; avoid driving if any THC is layered.',
    ],
    interactions: ['Review with clinician if using serotonergic or stimulant medicines.'],
    allergies: ['Review label if mushroom-averse (some channels omit mushrooms entirely).'],
  },

  {
    id: 'universal_booster_spray',
    name: 'Universal Booster — Spray',
    route: 'spray',
    description:
      'Fast, non-intoxicating cannabinoid booster (sublingual/buccal) to reinforce daytime effect without changing the base plan.',
    dosing: {
      time: 'PRN',
      start: '1–2 sprays mid-day as needed.',
      titration: 'May repeat per plan; respect per-package caps and daily totals.',
      notes: 'Mid-day reinforcement; non-intoxicating.',
    },
    precautions: ['Observe total daily cannabinoid caps when stacking.'],
    interactions: [],
    allergies: [],
  },

  {
    id: 'thc_stacker_spray',
    name: 'THC Stacker — Spray',
    route: 'spray',
    description:
      'Event-based THC layering on top of a baseline regimen for short windows of added effect.',
    dosing: {
      time: 'PRN',
      start: 'Start with 1 spray; wait full onset window before repeating.',
      titration: 'Use only within the time-boxed stacking rules; never drive or operate machinery.',
      notes: 'Event-based layering; respect package cap and personal tolerance.',
    },
    precautions: [
      'Intoxicating—no driving or hazardous tasks.',
      'Respect personal tolerance and legal limits; keep away from children.',
    ],
    interactions: ['Alcohol and sedatives increase impairment risk.'],
    allergies: [],
  },
];