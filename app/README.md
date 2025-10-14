
# CARTA App MVP (Expo + TypeScript)

Features in this MVP:
- **QR → COA:** scan package QR, resolve to a batch ID (e.g., `BATCH123`), and load COA + product.
- **Chemotype card:** show THC/CBD and top 3 terpenes with plain‑language effect tags.
- **Session log:** save 1–5 ratings locally (SQLite) per product/batch.
- **Retailer finder (list):** simple list of retailers (replace with live data later).
- **Privacy/A11y:** local data, accessible labels, readable text.

## Quick start
1. Install Node 18+ and `npm i -g expo-cli` (or use `npx expo`).
2. `cd app && npm install`
3. `npm start` and choose iOS/Android/Web.

## Editing mock data
- `src/data/mock_coas.json` — batch → COA mapping
- `src/data/products.json` — product catalog
- `src/data/retailers.json` — retailer list

## Code map
- `src/screens/ScanScreen.tsx` — QR scan flow
- `src/screens/ProductScreen.tsx` — COA, chemotype, rating
- `src/screens/LogScreen.tsx` — session history
- `src/screens/RetailerScreen.tsx` — retailer list
- `src/services/api.ts` — mocked data access
- `src/services/chemotype.ts` — terpene → tags heuristic
- `src/services/storage.ts` — SQLite storage

## Next steps
- Replace mock API with your backend (see `../server/`), or use cloud (Supabase/Firebase).
- Add staff mode, map view, and account login if needed.
- Hook real COA PDFs (parse to JSON) and COA landing pages per batch.


## Run on iPhone (plain language)
**Fastest way (Expo Go):**
1) Install **Expo Go** from the App Store on your iPhone.
2) On your Mac/PC: install Node 18+; then in Terminal run:
   ```bash
   cd app
   npm install
   npm start
   ```
3) In the Expo dev tools page that opens, choose **Tunnel** (works across networks).
4) On your iPhone, open **Expo Go**, tap **Scan QR**, and scan the QR from your screen.
5) The app loads on your phone. Point the scanner at a code containing `BATCH123` to demo.

**If QR doesn’t work:**
- Make sure your phone and computer are on the **same Wi‑Fi**, or select **Tunnel** in Expo.
- Or in Expo Go, press **Projects → Enter URL** and paste the developer URL shown in Terminal.

**Build a TestFlight install (optional):**
1) Create an **Apple Developer** account and an **Expo** account.
2) Install EAS CLI: `npm i -g eas-cli` then `eas login`.
3) In `/app`, run:
   ```bash
   npx expo prebuild --clean # only if you plan to use native modules later
   eas build:configure
   eas build -p ios --profile preview
   ```
4) When the build finishes, follow the link to submit to **TestFlight**:
   ```bash
   eas submit -p ios
   ```
5) Fill in App Store metadata/screenshots; invite testers in App Store Connect.


## Theming & Dark Mode
- The app auto-detects iOS light/dark mode via `useColorScheme()`.
- Brand tokens live in `src/styles/theme.ts` (light/dark). Adjust accent/text/gradients there.
- Global spacing & styles come from `src/styles/styles.ts` and the reusable components in `src/components/`.
