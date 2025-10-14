// scripts/generate-handouts.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');                 // app/
const HANDOUTS_DIR = path.join(ROOT, 'assets', 'handouts'); // app/assets/handouts
const OUT_FILE = path.join(ROOT, 'src', 'data', 'handouts.generated.ts');

const toPosix = (p) => p.split(path.sep).join('/');

function listPdfFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const abs = path.join(d, entry.name);
      if (entry.isDirectory()) stack.push(abs);
      else if (entry.isFile() && /\.pdf$/i.test(entry.name)) out.push(abs);
    }
  }
  return out;
}

const titleFrom = (name) =>
  name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();

// “Front Matter” = PDFs that sit directly in assets/handouts (same folder as TOC/Front Cover)
function sectionNameFor(absFile) {
  const rel = path.relative(HANDOUTS_DIR, absFile);
  const relDir = path.dirname(rel);
  return relDir === '.' ? 'Front Matter' : relDir.split(path.sep)[0];
}

(function main() {
  if (!fs.existsSync(HANDOUTS_DIR)) {
    console.error(`❌ Missing folder: ${HANDOUTS_DIR}`);
    process.exit(1);
  }

  const files = listPdfFiles(HANDOUTS_DIR);

  // Group by first folder segment (or Front Matter)
  const groups = new Map();
  for (const abs of files) {
    const rel = path.relative(HANDOUTS_DIR, abs); // e.g. "1 Company & Philosophy/About CARTA.pdf"
    const section = sectionNameFor(abs);
    const relPosix = toPosix(path.join('..', '..', 'assets', 'handouts', rel)); // "../../assets/handouts/<sub>/<file>.pdf"

    if (!groups.has(section)) groups.set(section, []);
    groups.get(section).push({ title: titleFrom(path.basename(abs)), relPosix });
  }

  // Sort sections: Front Matter first, then numeric/alpha
  const sectionKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === 'Front Matter' && b !== 'Front Matter') return -1;
    if (b === 'Front Matter' && a !== 'Front Matter') return 1;
    const na = parseInt(a, 10), nb = parseInt(b, 10);
    if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  // Sort items within each section
  for (const k of sectionKeys) {
    groups.get(k).sort((x, y) => x.title.localeCompare(y.title, undefined, { numeric: true }));
  }

  // Emit TS with static requires (Metro needs string literals)
  const lines = [];
  lines.push(`// AUTO-GENERATED. Do not edit by hand.`);
  lines.push(`export type Handout = { title: string; asset: number };`);
  lines.push(`export type HandoutSection = { title: string; items: Handout[] };`);
  lines.push(`export const HANDOUT_SECTIONS: HandoutSection[] = [`);
  for (const k of sectionKeys) {
    lines.push(`  {`);
    lines.push(`    title: ${JSON.stringify(k)},`);
    lines.push(`    items: [`);
    for (const it of groups.get(k)) {
      lines.push(`      { title: ${JSON.stringify(it.title)}, asset: require(${JSON.stringify(it.relPosix)}) },`);
    }
    lines.push(`    ],`);
    lines.push(`  },`);
  }
  lines.push(`];`);
  lines.push(``);

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, lines.join('\n'));
  console.log(`✅ Wrote ${toPosix(path.relative(ROOT, OUT_FILE))}`);
  console.log(`📄 Found ${files.length} PDFs. Examples:`);
  for (const ex of files.slice(0, 5)) {
    console.log('   -', toPosix(path.relative(HANDOUTS_DIR, ex)));
  }
})();
