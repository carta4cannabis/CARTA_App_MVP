// @ts-nocheck
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
} from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CoachExtras from '../addons/CARTA_CoachExtras';

const BG = require('../../assets/bg/carta_pattern.png');

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const TEXT = '#E9EFEA';
const MUTED = '#9FB0A8';

type Session = {
  dateTime?: string;
  methods?: string[];
  capsules?: {
    profile: string;
    count: number;
    when?: 'AM' | 'PM' | 'Bedtime';
  }[];
  inhalable?:
    | { type: 'flower' | 'vape' | 'dab'; puffs: number; potency?: 'low' | 'mid' | 'high' }
    | null;
  sprays?: { stacker?: number; booster?: number } | null;
  relief?: Record<string, number>;
  sideEffects?: string[];
  notes?: string;
};

type EMA = {
  timestamp: number;
  energy?: number;
  mood?: number;
  pain?: number;
  sleep?: number;
  note?: string;
};

export default function CoachScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    (nav as any).setOptions?.({ headerShown: false });
  }, [nav]);

  const [sessionsOnly, setSessionsOnly] = useState<Session[]>([]);
  const [ema, setEma] = useState<EMA[]>([]);

  const refresh = useCallback(async () => {
    try {
      const rawS = await AsyncStorage.getItem('SESSION_TRACKER_LOGS');
      setSessionsOnly(
        Array.isArray(JSON.parse(rawS || '[]')) ? JSON.parse(rawS || '[]') : [],
      );
    } catch {
      setSessionsOnly([]);
    }
    try {
      const rawE = await AsyncStorage.getItem('EMA_LOGS');
      setEma(
        Array.isArray(JSON.parse(rawE || '[]')) ? JSON.parse(rawE || '[]') : [],
      );
    } catch {
      setEma([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mergedForStats: Session[] = useMemo(() => {
    const asSession: Session[] = ema.map(e => ({
      dateTime: new Date(e.timestamp).toISOString(),
      methods: [],
      sprays: null,
      inhalable: null,
      capsules: [],
      relief: {
        ...(typeof e.energy === 'number' ? { Energy: e.energy } : {}),
        ...(typeof e.mood === 'number' ? { Mood: e.mood } : {}),
        ...(typeof e.pain === 'number' ? { Pain: e.pain } : {}),
        ...(typeof e.sleep === 'number' ? { Sleep: e.sleep } : {}),
      },
      notes: e.note,
    }));
    return [...sessionsOnly, ...asSession].sort(
      (a, b) =>
        new Date(a.dateTime || 0).getTime() -
        new Date(b.dateTime || 0).getTime(),
    );
  }, [sessionsOnly, ema]);

  const stats = useMemo(() => {
    const last14 = mergedForStats.slice(-14);
    let reliefSum = 0,
      n = 0;
    let sideFx: Record<string, number> = {};
    for (const s of last14) {
      if (s.relief) {
        const vs = Object.values(s.relief)
          .map(Number)
          .filter(v => !Number.isNaN(v));
        if (vs.length) {
          reliefSum += vs.reduce((a, b) => a + b, 0) / vs.length;
          n++;
        }
      }
      (s.sideEffects || []).forEach(
        k => (sideFx[k] = (sideFx[k] || 0) + 1),
      );
    }
    const avgRelief = n ? Number((reliefSum / n).toFixed(2)) : undefined;
    const commonSide = Object.entries(sideFx)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k);
    return {
      count: last14.length,
      avgRelief,
      commonSide,
      lastWhen: last14.at(-1)?.dateTime,
    };
  }, [mergedForStats]);

  const onClinicianPdf = useCallback(async () => {
    const html = buildClinicianHtml(mergedForStats);
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
      try {
        (nav as any).navigate?.('SummaryPreview', { html });
      } catch {
        Alert.alert(
          'Install',
          'To export a PDF, run: npx expo install expo-print expo-sharing',
        );
      }
    }
  }, [mergedForStats, nav]);

  return (
    <ImageBackground
      source={BG}
      style={{ flex: 1 }}
      resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
      imageStyle={{ opacity: 0.5 }}
    >
      <SafeAreaView style={st.safe}>
        <View
          style={[
            st.header,
            { paddingTop: insets.top - 26 },
          ]}
        >
          <Pressable
            onPress={() => (nav as any)?.goBack?.()}
            style={st.backBtn}
          >
            <Text style={st.backTxt}>{'\u25C0'}</Text>
            <Text style={st.backLabel}>Back</Text>
          </Pressable>
          <Text style={st.title}>Check-in with AI Coach</Text>
          <Text style={st.sub}>
            Smart tips based on your recent sessions.
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
          <CoachExtras />

          <View style={[st.card, { marginTop: 14 }]}>
            <Text style={st.cardTitle}>Last 14 (Sessions + Quick Check-in)</Text>
            <KV k="Entries" v={String(stats.count)} />
            <KV
              k="Average relief"
              v={
                stats.avgRelief != null ? `${stats.avgRelief}/5` : '—'
              }
            />
            <KV
              k="Common side effects"
              v={stats.commonSide.join(', ') || '—'}
            />
            <KV
              k="Last entry"
              v={
                stats.lastWhen
                  ? new Date(stats.lastWhen).toLocaleString()
                  : '—'
              }
            />
          </View>

          <View style={st.row}>
            <Pressable
              onPress={() => (nav as any).navigate?.('Tracker')}
              style={({ pressed }) => [
                st.btn,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={st.btnTxt}>Open Tracker</Text>
            </Pressable>
            <Pressable
              onPress={onClinicianPdf}
              style={({ pressed }) => [
                st.btn,
                { marginLeft: 12 },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={st.btnTxt}>Clinician PDF</Text>
            </Pressable>
          </View>

          <View style={[st.card, { marginTop: 14 }]}>
            <Text style={st.cardTitle}>Suggestions</Text>
            {makeSmartTips(mergedForStats).map((t, i) => (
              <Text key={i} style={st.tip}>
                • {t}
              </Text>
            ))}
            {!mergedForStats.length && (
              <Text style={st.hint}>
                Log a few sessions or quick check-ins to unlock personalized
                suggestions.
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <Text style={st.kv}>
      <Text style={st.k}>{k}:</Text> <Text style={st.v}>{v}</Text>
    </Text>
  );
}

function makeSmartTips(sessions: Session[]): string[] {
  if (!sessions.length) return [];
  const last = sessions.at(-1)!;
  const tips: string[] = [];

  const avgLast = last.relief ? avg(Object.values(last.relief).map(Number)) : 0;
  if (avgLast >= 4)
    tips.push(
      'Current plan is working—repeat the best-performing regimen for a few sessions.',
    );
  if (
    avgLast >= 3 &&
    (last.sprays?.stacker || 0) < 2
  )
    tips.push(
      'Consider +1 stacker spray earlier in a session for intensity without overdoing it.',
    );
  if (
    avgLast < 3 &&
    (last.inhalable?.puffs ?? 0) <= 2
  )
    tips.push(
      'Relief modest—try +1 puff or step up potency to mid next session.',
    );
  if ((last.sideEffects || []).includes('Sedation'))
    tips.push(
      'Note sedation—avoid stacking THC after 9pm; favor Booster with Bedtime capsule.',
    );
  if (!tips.length)
    tips.push(
      'Keep sessions consistent and adjust one variable at a time for clear learnings.',
    );
  return tips;
}

function avg(ns: number[]) {
  return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0;
}

function buildClinicianHtml(sessions: Session[]) {
  const byDay = new Map<string, Session[]>();
  for (const s of sessions) {
    const d = new Date(s.dateTime ?? Date.now());
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, [...(byDay.get(key) || []), s]);
  }
  const rows = [...byDay.entries()]
    .slice(-10)
    .map(([day, list], i) => {
      const reliefPairs: string[] = [];
      for (const s of list) {
        if (s.relief) {
          for (const [k, v] of Object.entries(s.relief))
            reliefPairs.push(`${k}:${v}/5`);
        }
      }
      const relief = reliefPairs.length ? reliefPairs.join(', ') : '—';

      const regParts: string[] = [];
      for (const s of list) {
        if (s.capsules?.length)
          regParts.push(
            s.capsules
              .map(
                c => `${c.when ?? ''} ${c.profile} ×${c.count}`,
              )
              .join(', '),
          );
        if (
          s.sprays &&
          ((s.sprays.stacker ?? 0) > 0 ||
            (s.sprays.booster ?? 0) > 0)
        ) {
          regParts.push(
            `Stacker ${s.sprays.stacker ?? 0} • Booster ${
              s.sprays.booster ?? 0
            }`,
          );
        }
        if (s.inhalable && s.inhalable.puffs > 0)
          regParts.push(
            `${s.inhalable.type} ${s.inhalable.puffs} puff(s) (${s.inhalable.potency ?? '—'})`,
          );
      }
      const regimen = regParts.length ? regParts.join(' • ') : '—';
      const notes =
        list
          .map(s => s.notes)
          .filter(Boolean)
          .join(' | ') || '—';

      return `<tr><td>${i + 1}</td><td>${day}</td><td>${regimen}</td><td>${relief}</td><td>${notes}</td></tr>`;
    })
    .join('');

  return `
  <html><head><meta charset="utf-8" />
  <style>
  body{font-family:-apple-system,Roboto,Helvetica,Arial;padding:16px}
  table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:6px;font-size:12px} th{background:#f5f5f5}
  </style></head><body>
  <h1>CARTA Clinician Summary</h1>
  <table><thead><tr><th>#</th><th>Date</th><th>Regimen</th><th>Relief</th><th>Notes</th></tr></thead>
  <tbody>${rows}</tbody></table>
  </body></html>`;
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomColor: '#233229',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(18, 31, 26, 0.9)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backTxt: { color: GOLD, fontWeight: '800', fontSize: 16, marginRight: 4 },
 backIcon: {
    color: GOLD,
    fontSize: 16,
    marginRight: 4,
    marginBottom: 4,
  },
  backLabel: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },

  title: {
    color: GOLD,
    fontSize: 26,
    fontWeight: '800',
    
  },
  sub: { color: TEXT, marginTop: 10 },

  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 14,
    padding: 10,
  },
  cardTitle: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  kv: { color: TEXT, marginBottom: 6 },
  k: { color: '#BFC7C2' },
  v: { color: GOLD, fontWeight: '700' },
  row: { flexDirection: 'row', marginTop: 16 },
  btn: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#1C2B25',
  },
  btnTxt: { color: TEXT, fontWeight: '700' },
  tip: { color: TEXT, marginTop: 12, lineHeight: 20 },
  hint: { color: MUTED, marginTop: 4, fontStyle: 'italic' },
});
