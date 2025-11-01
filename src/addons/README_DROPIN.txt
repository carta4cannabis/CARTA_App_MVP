CARTA Additive Features (No-Replacement Drop-In)
================================================

This pack *does not replace* your existing files. It adds new components you can mount with ONE line.

What you get:
- AI-Guided Protocols (Goal Builder integrated into Coach) — minimal UI
- CARTA Quest (missions, KP, badges) — separate screen you can register when ready
- EMA Quick Check-ins — tiny widget for your Coach screen

Files:
- src/addons/CARTA_CoachExtras.tsx
- src/addons/CARTA_QuestScreen.tsx
- src/addons/CARTA_GoalBuilderScreen.tsx
- src/addons/quests.ts
- src/addons/coachEnhance.ts
- src/addons/types.ts
- src/addons/README_DROPIN.txt

ONE-LINE INTEGRATION (keeps everything you already have):
---------------------------------------------------------
1) Open your current CoachScreen.tsx.
2) Add:
   import CoachExtras from '../src/addons/CARTA_CoachExtras';
3) Render <CoachExtras /> near the bottom of your existing JSX.
