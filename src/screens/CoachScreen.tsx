// app/src/screens/CoachScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';

const GOLD = '#C9A86A';
const INK = '#0F1A16';
const CARD = '#15221D';
const TEXT = '#E9EFEA';

type Session = {
  dateTime?: string;
  methods?: string[];
  capsules?: { profile: string; count: number; when?: 'AM'|'PM'|'Bedtime' }[];
  inhalable?: { type: 'flower'|'vape'|'dab'; puffs: number; potency?: 'low'|'mid'|'high' } | null;
  sprays?: { stacker?: number; booster?: number } | null;
  relief?: Record<string, number>;
  sideEffects?: string[];
  notes?: string;
};

export default function CoachScreen() {
  const nav = useNavigation<any>();
  const isFocused = useIsFocused();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('SESSION_TRACKER_LOGS');
        const arr = raw ? JSON.parse(raw) : [];
        setSessions(Array.isArray(arr) ? arr : []);
      } catch { setSessions([]); }
    })();
  }, [isFocused]);

  const stats = useMemo(() => {
    const last14 = sessions.slice(-14);
    let reliefSum = 0, n = 0; let sideFx: Record<string, number> = {};
    for (const s of last14) {
      if (s.relief) {
        const vs = Object.values(s.relief).map(Number).filter(v => !Number.isNaN(v));
        if (vs.length) { reliefSum += vs.reduce((a,b)=>a+b,0)/vs.length; n++; }
      }
      (s.sideEffects || []).forEach(k => sideFx[k] = (sideFx[k] || 0) + 1);
    }
    const avgRelief = n ? Number((reliefSum / n).toFixed(2)) : undefined;
    const commonSide = Object.entries(sideFx).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
    return { count: last14.length, avgRelief, commonSide, lastWhen: last14.at(-1)?.dateTime };
  }, [sessions]);

  const openTracker = useCallback(() => {
    const parent = nav.getParent?.();
    if (parent?.navigate) parent.navigate('Tracker');
    else nav.navigate('Tracker');
  }, [nav]);

  const onClinicianPdf = useCallback(async () => {
    const html = buildClinicianHtml(sessions);
    try {
      const { printToFileAsync } = await import('expo-print');
      const { uri } = await printToFileAsync({ html });
      try {
        const Sharing = await import('expo-sharing');
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
        else Alert.alert('PDF created', uri);
      } catch {
        Alert.alert('PDF created', uri);
      }
    } catch {
      // Fallback: simple in-app preview screen if you registered it
      try {
        nav.navigate('SummaryPreview', { html });
      } catch {
        Alert.alert('Install', 'To export a PDF, run: npx expo install expo-print expo-sharing');
      }
    }
  }, [nav, sessions]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: INK }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={st.h1}>CARTA - AI Coach</Text>
        <Text style={st.sub}>Smart tips based on your recent sessions.</Text>

        <View style={st.card}>
          <Text style={st.cardTitle}>Last 14 days</Text>
          <KV k="Sessions" v={String(stats.count)} />
          <KV k="Average relief" v={stats.avgRelief != null ? `${stats.avgRelief}/5` : '—'} />
          <KV k="Common side effects" v={stats.commonSide.join(', ') || '—'} />
          <KV k="Last session" v={stats.lastWhen ? new Date(stats.lastWhen).toLocaleString() : '—'} />
        </View>

        <View style={st.row}>
          <Pressable onPress={openTracker} style={({ pressed }) => [st.btn, pressed && { opacity: 0.9 }]}>
            <Text style={st.btnTxt}>Open Tracker</Text>
          </Pressable>
          <Pressable onPress={onClinicianPdf} style={({ pressed }) => [st.btn, { marginLeft: 12 }, pressed && { opacity: 0.9 }]}>
            <Text style={st.btnTxt}>Clinician PDF</Text>
          </Pressable>
        </View>

        <View style={[st.card, { marginTop: 14 }]}>
          <Text style={st.cardTitle}>Suggestions</Text>
          {makeSmartTips(sessions).map((t, i) => (
            <Text key={i} style={st.tip}>• {t}</Text>
          ))}
          {!sessions.length && <Text style={st.hint}>Log a few sessions to unlock personalized suggestions.</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------- helpers -------- */
function KV({ k, v }: { k: string; v: string }) {
  return <Text style={st.kv}><Text style={st.k}>{k}:</Text> <Text style={st.v}>{v}</Text></Text>;
}
function makeSmartTips(sessions: Session[]): string[] {
  if (!sessions.length) return [];
  const last = sessions.at(-1)!;
  const tips: string[] = [];

  const avgLast = last.relief ? avg(Object.values(last.relief).map(Number)) : 0;
  if (avgLast >= 4) tips.push('Current plan is working—repeat the best-performing regimen for a few sessions.');
  if (avgLast >= 3 && (last.sprays?.stacker || 0) < 2) tips.push('Consider +1 stacker spray earlier in the session for intensity without overdoing it.');
  if (avgLast < 3 && (last.inhalable?.puffs ?? 0) <= 2) tips.push('Relief modest—try +1 puff or step up potency to mid on next session.');
  if ((last.sideEffects || []).includes('Sedation')) tips.push('Note sedation—avoid stacking THC after 9pm; favor Booster with Bedtime capsule.');
  if (!tips.length) tips.push('Keep sessions consistent and adjust one variable at a time for clear learnings.');
  return tips;
}
function avg(ns: number[]) { return ns.length ? ns.reduce((a,b)=>a+b,0)/ns.length : 0; }

function buildClinicianHtml(sessions: Session[]) {
  const rows = sessions.slice(-10).map((s, i) => {
    const parts: string[] = [];
    if (s.capsules?.length) parts.push(s.capsules.map(c => `${c.when ?? ''} ${c.profile} ×${c.count}`).join(', '));
    if (s.sprays) parts.push(`Stacker ${s.sprays.stacker ?? 0} • Booster ${s.sprays.booster ?? 0}`);
    if (s.inhalable) parts.push(`${s.inhalable.type} ${s.inhalable.puffs} puff(s) (${s.inhalable.potency ?? '—'})`);
    const relief = s.relief ? Object.entries(s.relief).map(([k,v]) => `${k}:${v}/5`).join(', ') : '—';
    const side = (s.sideEffects || []).join(', ') || '—';
    return `<tr><td>${i+1}</td><td>${new Date(s.dateTime ?? '').toLocaleString()}</td><td>${parts.join(' • ')||'—'}</td><td>${relief}</td><td>${side}</td><td>${s.notes ?? '—'}</td></tr>`;
  }).join('');

  return `
  <html><head><meta charset="utf-8" />
  <style>
  body{font-family:-apple-system,Roboto,Helvetica,Arial;padding:16px}
  table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:6px;font-size:12px} th{background:#f5f5f5}
  </style></head><body>
  <h1>CARTA Clinician Summary</h1>
  <table><thead><tr><th>#</th><th>Date</th><th>Regimen</th><th>Relief</th><th>Side effects</th><th>Notes</th></tr></thead>
  <tbody>${rows}</tbody></table>
  </body></html>`;
}

/* -------- styles -------- */
const st = StyleSheet.create({
  h1: { color: GOLD, fontSize: 26, fontWeight: '800', marginBottom: 6, marginTop: 16 },
  sub: { color: TEXT, marginBottom: 18 },
  card: { backgroundColor: CARD, borderWidth: 1, borderColor: GOLD, borderRadius: 14, padding: 12 },
  cardTitle: { color: GOLD, fontWeight: '800', marginBottom: 8 },
  kv: { color: TEXT, marginBottom: 6 },
  k: { color: '#BFC7C2' },
  v: { color: GOLD, fontWeight: '700' },
  row: { flexDirection: 'row', marginTop: 12 },
  btn: { borderWidth: 1, borderColor: GOLD, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#1C2B25' },
  btnTxt: { color: TEXT, fontWeight: '700' },
  tip: { color: TEXT, marginTop: 6, lineHeight: 20 },
  hint: { color: '#9FB0A8', marginTop: 8, fontStyle: 'italic' },
});