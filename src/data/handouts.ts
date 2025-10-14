// app/src/data/handouts.ts
// Types + static catalog for the Education screen

export type HandoutItem = {
  title: string;
  /** The numeric module id returned by require('...pdf') */
  asset: number;
};

export type Handout = { title: string; asset: number };
export type HandoutSection = { id: string; title: string; items: Handout[] };
/**
 * Folder layout this expects (you can add more PDFs any time):
 *
 * app/
 * └─ assets/
 *    └─ handouts/
 *       ├─ Front Cover and TOC.pdf
 *       ├─ 1 Company & Philosophy/
 *       ├─ 2 Cannabis Basics/
 *       ├─ 3 Product Education/
 *       ├─ 4 Safe & Responsible Use/
 *       ├─ 5 Wellness & Lifestyle/
 *       ├─ 6 Community & Social Equity/
 *       └─ 7 Retail & App Tie-In/
 *
 * ⚠️ Metro (React Native bundler) needs static `require(...)` calls.
 * That means each PDF you want to show must be listed here with a `require`.
 * You can start with this file and keep appending items as you add PDFs.
 */

export const HANDOUT_SECTIONS: HandoutSection[] = [
  {
    id: 'front',
    title: 'Front Matter',
    items: [
      {
        title: 'Front Cover',
        asset: require('../../assets/handouts/Front Cover and TOC.pdf'),
      },
    ],
  },

  {
    id: 'company',
    title: '1 Company & Philosophy',
    items: [
      // { title: 'About CARTA', asset: require('../../assets/handouts/1 Company & Philosophy/About CARTA.pdf') },
      // { title: 'CARTA Patient Handout', asset: require('../../assets/handouts/1 Company & Philosophy/CARTA Patient Handout.pdf') },
      // { title: 'CARTA Stack App Guide', asset: require('../../assets/handouts/1 Company & Philosophy/CARTA Stack App Guide.pdf') },
      // { title: 'PhytoLogic Platform Overview', asset: require('../../assets/handouts/1 Company & Philosophy/PhytoLogic Platform Overview.pdf') },
    ],
  },

  {
    id: 'basics',
    title: '2 Cannabis Basics',
    items: [
      // { title: 'Cannabis 101', asset: require('../../assets/handouts/2 Cannabis Basics/Cannabis 101.pdf') },
      // { title: 'Chemotypes vs Indica-Sativa', asset: require('../../assets/handouts/2 Cannabis Basics/Chemotypes vs Indica-Sativa.pdf') },
      // { title: 'History of Cannabis', asset: require('../../assets/handouts/2 Cannabis Basics/History of Cannabis.pdf') },
      // { title: 'Microdosing Guide', asset: require('../../assets/handouts/2 Cannabis Basics/Microdosing Guide.pdf') },
      // { title: 'Terpene and Cannabinoid Effect Profiles', asset: require('../../assets/handouts/2 Cannabis Basics/Terpene and Cannabinoid Effect Profiles.pdf') },
      // { title: 'Terpenes Explained', asset: require('../../assets/handouts/2 Cannabis Basics/Terpenes Explained.pdf') },
    ],
  },

  {
    id: 'product',
    title: '3 Product Education',
    items: [
      // { title: 'Capsule Guide', asset: require('../../assets/handouts/3 Product Education/Capsule Guide.pdf') },
      // { title: 'CARTA Therapeutic Stacks Rationale', asset: require('../../assets/handouts/3 Product Education/CARTA Therapeutic Stacks Rationale.pdf') },
      // { title: 'Inhalation Products', asset: require('../../assets/handouts/3 Product Education/Inhalation Products.pdf') },
      // { title: 'Phase 2 Product Teasers', asset: require('../../assets/handouts/3 Product Education/Phase 2 Product Teasers') },
      // { title: 'Sprays Guide', asset: require('../../assets/handouts/3 Product Education/Sprays Guide.pdf') },
    ],
  },

  {
    id: 'safe',
    title: '4 Safe & Responsible Use',
    items: [
      // { title: 'Avoid When', asset: require('../../assets/handouts/4 Safe & Responsible Use/Avoid When.pdf') },
      // { title: 'Dosing Safety', asset: require('../../assets/handouts/4 Safe & Responsible Use/Dosing Safety.pdf') },
      // { title: 'Interactions and Contraindications', asset: require('../../assets/handouts/4 Safe & Responsible Use/Interactions and Contraindications.pdf') },
      // { title: 'Safe Storage', asset: require('../../assets/handouts/4 Safe & Responsible Use/Safe Storage.pdf') },
      // { title: 'SKU Warning Inserts', asset: require('../../assets/handouts/4 Safe & Responsible Use/SKU Warning Inserts.pdf') },
    ],
  },

  {
    id: 'wellness',
    title: '5 Wellness & Lifestyle',
    items: [
      // { title: 'Botanicals and Nutrient Synergy', asset: require('../../assets/handouts/5 Wellness & Lifestyle/Botanicals and Nutrient Synergy.pdf') },
      // { title: 'Recreational Use', asset: require('../../assets/handouts/5 Wellness & Lifestyle/Recreational Use.pdf') },
      // { title: 'Wellness Integration', asset: require('../../assets/handouts/5 Wellness & Lifestyle/Wellness Integration.pdf') },
    ],
  },

  {
    id: 'community',
    title: '6 Community & Social Equity',
    items: [
      // { title: 'CARTA Gives Back', asset: require('../../assets/handouts/6 Community & Social Equity/CARTA Gives Back.pdf') },
      // { title: 'Social Equity Commitment', asset: require('../../assets/handouts/6 Community & Social Equity/Social Equity Commitment.pdf') },
      // { title: 'Sustainability Practices', asset: require('../../assets/handouts/6 Community & Social Equity/Sustainability Practices.pdf') },
    ],
  },

  {
    id: 'retail',
    title: '7 Retail & App Tie-In',
    items: [
      // { title: 'Choosing Your Path', asset: require('../../assets/handouts/7 Retail & App Tie-In/Choosing Your Path.pdf') },
      // { title: 'FAQ', asset: require('../../assets/handouts/7 Retail & App Tie-In/FAQ.pdf') },
      // { title: 'QR Code Flyers', asset: require('../../assets/handouts/7 Retail & App Tie-In/QR Code Flyers.pdf') },
    ],
  },
];
