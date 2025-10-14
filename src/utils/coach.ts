// Minimal utils used by the Coach. No external deps.
export type DayPart = 'AM' | 'PM' | 'Bedtime';

export type Session = {
  dateISO: string; // e.g. new Date().toISOString()
  methods: ('capsule' | 'stacker' | 'booster' | 'inhalable' | 'topical')[];
  capsules?: { profile: string; count: number; when: DayPart }[];
  inhalable?: { type: 'flower' | 'vape' | 'dab'; puffs: number; potency: 'low' | 'mid' | 'high' };
  sprays?: { stacker?: number; booster?: number };
  relief?: Record<string, number>;      // { pain: 3, anxiety: 4, ... } 1–5
  sideEffects?: string[];               // ['dry mouth', ...]
  comments?: string;
};

export type CoachSnapshot = {
  periodDays: number;
  sessionCount: number;
  lastSession?: string; // nice date
  avgRelief?: number;   // 1–5
  commonSideEffects: string[];
};

export function makeSnapshot(sessions: Session[], periodDays = 14): CoachSnapshot {
  const cutoff = Date.now() - periodDays * 24 * 60 * 60 * 1000;
  const recent = sessions.filter(s => new Date(s.dateISO).getTime() >= cutoff);

  const reliefVals: number[] = [];
  recent.forEach(s => {
    if (s.relief) {
      const vals = Object.values(s.relief);
      if (vals.length) reliefVals.push(vals.reduce((a, b) => a + b, 0) / vals.length);
    }
  });

  const sideFx: Record<string, number> = {};
  recent.forEach(s => (s.sideEffects || []).forEach(k => { sideFx[k] = (sideFx[k] || 0) + 1; }));

  const commonSideEffects = Object.entries(sideFx)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  const lastSession = recent.length ? new Date(recent[recent.length - 1].dateISO).toLocaleString() : undefined;

  return {
    periodDays,
    sessionCount: recent.length,
    lastSession,
    avgRelief: reliefVals.length ? Number((reliefVals.reduce((a, b) => a + b, 0) / reliefVals.length).toFixed(2)) : undefined,
    commonSideEffects,
  };
}

export type SmartTip = { id: string; text: string };

export function makeSmartTips(sessions: Session[]): SmartTip[] {
  const tips: SmartTip[] = [];
  if (!sessions.length) {
    tips.push({ id: 'start', text: 'Log a few sessions in Tracker so I can tailor suggestions.' });
    return tips;
  }

  const last = sessions[sessions.length - 1];
  if (last.inhalable && (last.relief && average(Object.values(last.relief)) < 3)) {
    tips.push({ id: 'puff-step-up', text: 'Relief was modest with inhalable last time — consider one extra puff or a medium potency product next session.' });
  }
  if (last.sprays?.booster && (last.sideEffects || []).includes('dry mouth')) {
    tips.push({ id: 'booster-hydration', text: 'Experiencing dry mouth with booster sprays? Sip water before and after, and try spacing sprays by a few minutes.' });
  }

  // Gentle default
  if (!tips.length) tips.push({ id: 'steady', text: 'Consistency wins: repeat the best-performing regimen for 3–4 sessions before adjusting.' });

  return tips;
}

function average(ns: number[]) { return ns.reduce((a, b) => a + b, 0) / ns.length; }

// Simple clinician summary HTML
export function buildClinicianHtml(sessions: Session[]): string {
  const snap = makeSnapshot(sessions, 30);
  const rows = sessions.slice(-10).map(s => {
    const parts: string[] = [];
    if (s.capsules?.length) parts.push(`${s.capsules.map(c => `${c.count}× ${c.profile} (${c.when})`).join(', ')}`);
    if (s.sprays?.stacker) parts.push(`Stacker: ${s.sprays.stacker} sprays`);
    if (s.sprays?.booster) parts.push(`Booster: ${s.sprays.booster} sprays`);
    if (s.inhalable) parts.push(`Inhalable: ${s.inhalable.type} ${s.inhalable.puffs} puffs (${s.inhalable.potency})`);
    const relief = s.relief ? Object.entries(s.relief).map(([k, v]) => `${k}:${v}/5`).join(', ') : '—';
    const sidefx = s.sideEffects?.join(', ') || '—';
    return `<tr><td>${new Date(s.dateISO).toLocaleString()}</td><td>${parts.join(' • ') || '—'}</td><td>${relief}</td><td>${sidefx}</td></tr>`;
  }).join('');

  return /* html */`
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;padding:24px}
        h1{margin:0 0 8px}
        h2{margin:24px 0 8px}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #ddd;padding:8px;font-size:12px}
        th{background:#f5f5f5}
        small{color:#666}
      </style>
    </head>
    <body>
      <h1>CARTA Clinician Summary</h1>
      <small>Auto-generated: ${new Date().toLocaleString()}</small>
      <h2>30-day Snapshot</h2>
      <ul>
        <li>Sessions: ${snap.sessionCount}</li>
        <li>Avg relief: ${snap.avgRelief ?? '—'} / 5</li>
        <li>Common side effects: ${snap.commonSideEffects.join(', ') || '—'}</li>
      </ul>
      <h2>Recent Sessions</h2>
      <table>
        <thead><tr><th>Date</th><th>Regimen</th><th>Relief</th><th>Side effects</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
  </html>`;
}