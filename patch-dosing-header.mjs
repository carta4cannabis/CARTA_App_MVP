// patch-dosing-header.mjs
// Usage:
//   node patch-dosing-header.mjs [relative/path/to/DosingEngineScreen.tsx]
// Defaults to: app/src/screens/DosingEngineScreen.tsx
//
// What it does (surgical, idempotent):
// 1) Inserts a header block (title + subtitle) just after the first <ScrollView ...> open tag.
// 2) Removes the FIRST occurrence of the title+subtitle <Text> nodes INSIDE the first card.
// 3) Makes a .bak copy before editing.
//
// It won't touch anything else.

import fs from 'fs';

const targetPath = process.argv[2] || 'app/src/screens/DosingEngineScreen.tsx';
if (!fs.existsSync(targetPath)) {
  console.error('File not found:', targetPath);
  process.exit(1);
}

const src = fs.readFileSync(targetPath, 'utf8');
fs.writeFileSync(targetPath + '.bak', src, 'utf8'); // backup

let out = src;

// --- 1) Inject header right after first <ScrollView ...> opening tag ---
(() => {
  // If we've already inserted once, skip
  if (out.includes('/* ===== Page header ===== */')) return;

  const scrollIdx = out.indexOf('<ScrollView');
  if (scrollIdx === -1) return;

  // find the end of the opening tag '>'
  const gtIdx = out.indexOf('>', scrollIdx);
  if (gtIdx === -1) return;

  const headerBlock = `
  {/* ===== Page header ===== */}
  <View style={{ paddingHorizontal: 16, paddingTop: 16, marginBottom: 12 }}>
    <Text style={s.h1}>Chemotype-Guided Dosing</Text>
    <Text style={s.body}>Pick your goals & methods. We’ll build an AM / PM / Bedtime plan and Carta pairings.</Text>
  </View>
`;

  out = out.slice(0, gtIdx + 1) + headerBlock + out.slice(gtIdx + 1);
})();

// --- 2) Remove first title/subtitle <Text> nodes inside the first card ---
(() => {
  // Remove the first occurrence of the page title line
  const titleRegex = new RegExp(
    String.raw`<Text\s+style=\{s\.h1\}>\s*Chemotype-Guided Dosing\s*<\/Text>\s*`,
    'm'
  );
  out = out.replace(titleRegex, (m) => {
    // only remove the first match
    return '';
  });

  // Remove the first occurrence of the subtitle (Pick your goals...)
  const subRegex = new RegExp(
    String.raw`<Text\s+style=\{s\.(?:body|sub)\}>\s*Pick your goals[^<]*<\/Text>\s*`,
    'm'
  );
  out = out.replace(subRegex, (m) => {
    return '';
  });
})();

fs.writeFileSync(targetPath, out, 'utf8');
console.log('✅ DosingEngineScreen updated. A backup was saved as', targetPath + '.bak');
