import React, { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';

type MethodId = 'capsule' | 'stacker' | 'booster' | 'inhalable' | 'topical';
type DayPart = 'AM' | 'PM' | 'Bedtime';
type InhType = 'flower' | 'vape' | 'dab';
type Potency = 'low' | 'mid' | 'high';

export type CapsuleProfile =
  | 'Calm & Focus'
  | 'Mood & Uplift'
  | 'Mobility & Function'
  | 'Digestive Support'
  | 'Metabolic Wellness'
  | 'Mind & Memory'
  | 'Intimacy & Vitality'
  | 'Rest & Restore';

const CAPSULES: CapsuleProfile[] = [
  'Calm & Focus',
  'Mood & Uplift',
  'Mobility & Function',
  'Digestive Support',
  'Metabolic Wellness',
  'Mind & Memory',
  'Intimacy & Vitality',
  'Rest & Restore',
];

const RELIEF_OUTCOMES = [
  'Pain relief',
  'Calm',
  'Mood uplift',
  'Focus',
  'Mobility',
  'Digestive comfort',
  'Cognitive clarity',
  'Sleep quality',
] as const;
type ReliefKey = (typeof RELIEF_OUTCOMES)[number];

const SIDE_EFFECTS = [
  'Dry mouth',
  'Drowsiness',
  'Anxiety',
  'Paranoia',
  'Dizziness',
  'Nausea',
  'Rapid heart rate',
  'Red eyes',
  'Hunger',
] as const;
type SideEffect = (typeof SIDE_EFFECTS)[number];

// --- helpers for date/time text inputs (no extra deps) ---
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const formatTime = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const toISOorNull = (dateStr: string, timeStr: string) => {
  // Expect YYYY-MM-DD and HH:mm (24h). Return ISO string or null if invalid.
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!m || !t) return null;
  const [_, y, mo, da] = m;
  const [__, hh, mm] = t;
  const dt = new Date(
    Number(y),
    Number(mo) - 1,
    Number(da),
    Number(hh),
    Number(mm),
    0,
    0
  );
  return isNaN(dt.getTime()) ? null : dt.toISOString();
};

// Use Partial so {} is valid initial state in TS:
type CountMap = Partial<Record<CapsuleProfile, number>>;
type WhenMap = Partial<Record<CapsuleProfile, DayPart>>;
type ReliefMap = Partial<Record<ReliefKey, 1 | 2 | 3 | 4 | 5>>;
type SideMap = Partial<Record<SideEffect, boolean>>;

export default function SessionTrackerScreen() {
  // Pre-fill with now (local)
  const now = useMemo(() => new Date(), []);
  const [dateStr, setDateStr] = useState<string>(formatDate(now));
  const [timeStr, setTimeStr] = useState<string>(formatTime(now));
  const resetNow = useCallback(() => {
    const d = new Date();
    setDateStr(formatDate(d));
    setTimeStr(formatTime(d));
  }, []);

  // Optional product label
  const [productName, setProductName] = useState<string>('');

  // Methods used
  const [methods, setMethods] = useState<MethodId[]>(['capsule']);
  const methodOn = useCallback((m: MethodId) => methods.includes(m), [methods]);
  const toggleMethod = useCallback(
    (m: MethodId) =>
      setMethods(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])),
    []
  );

  // Capsules
  const [selectedCaps, setSelectedCaps] = useState<CapsuleProfile[]>([]);
  const [capCounts, setCapCounts] = useState<CountMap>({});
  const [capWhen, setCapWhen] = useState<WhenMap>({});
  const toggleCapsule = useCallback(
    (c: CapsuleProfile) => {
      setSelectedCaps(prev => {
        if (prev.includes(c)) {
          const nxt = prev.filter(x => x !== c);
          const nextCounts: CountMap = { ...capCounts };
          const nextWhen: WhenMap = { ...capWhen };
          delete nextCounts[c];
          delete nextWhen[c];
          setCapCounts(nextCounts);
          setCapWhen(nextWhen);
          return nxt;
        } else {
          setCapCounts({ ...capCounts, [c]: 1 });
          setCapWhen({ ...capWhen, [c]: 'AM' });
          return [...prev, c];
        }
      });
    },
    [capCounts, capWhen]
  );

  // Inhalable
  const [inhType, setInhType] = useState<InhType | null>(null);
  const [inhPotency, setInhPotency] = useState<Potency>('mid');
  const [puffs, setPuffs] = useState<number>(0);

  // Sprays
  const [stackerSprays, setStackerSprays] = useState<number>(0);
  const [boosterSprays, setBoosterSprays] = useState<number>(0);

  // Relief + side effects
  const [relief, setRelief] = useState<ReliefMap>({});
  const [sidefx, setSidefx] = useState<SideMap>({});
  const setReliefScore = useCallback(
    (k: ReliefKey, v: 1 | 2 | 3 | 4 | 5) => setRelief(prev => ({ ...prev, [k]: v })),
    []
  );
  const toggleSide = useCallback(
    (k: SideEffect) => setSidefx(prev => ({ ...prev, [k]: !prev[k] })),
    []
  );

  // Notes
  const [comments, setComments] = useState<string>('');

  // ------- tiny UI helpers -------
  const Chip = ({
    label,
    on,
    onPress,
    style,
  }: {
    label: string;
    on?: boolean;
    onPress?: () => void;
    style?: any;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        on && styles.chipOn,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );

  const Stepper = ({
    value,
    setValue,
    min = 0,
    max = 99,
  }: {
    value: number;
    setValue: (n: number) => void;
    min?: number;
    max?: number;
  }) => (
    <View style={styles.stepperRow}>
      <Pressable onPress={() => setValue(Math.max(min, value - 1))} style={styles.stepBtn}>
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <Text style={styles.stepVal}>{value}</Text>
      <Pressable onPress={() => setValue(Math.min(max, value + 1))} style={styles.stepBtn}>
        <Text style={styles.stepBtnText}>＋</Text>
      </Pressable>
    </View>
  );

  const DayPartRow = ({
    value,
    setValue,
  }: {
    value: DayPart;
    setValue: (d: DayPart) => void;
  }) => (
    <View style={styles.row}>
      {(['AM', 'PM', 'Bedtime'] as DayPart[]).map(d => (
        <Chip key={d} label={d} on={value === d} onPress={() => setValue(d)} />
      ))}
    </View>
  );

  const ScaleRow = ({ k }: { k: ReliefKey }) => {
    const v = relief[k] ?? 0;
    return (
      <View style={styles.scaleRow}>
        <Text style={styles.scaleLabel}>{k}</Text>
        <View style={styles.row}>
          {[1, 2, 3, 4, 5].map(n => (
            <Chip
              key={n}
              label={String(n)}
              on={v === n}
              onPress={() => setReliefScore(k, n as 1 | 2 | 3 | 4 | 5)}
            />
          ))}
        </View>
      </View>
    );
  };

  // ------- save (stub) -------
  const saveSession = useCallback(() => {
    const whenISO = toISOorNull(dateStr, timeStr);
    const payload = {
      sessionAtISO: whenISO, // may be null if manually cleared/invalid
      productName,
      methods,
      capsules: selectedCaps.map(c => ({ name: c, count: capCounts[c] ?? 1, when: capWhen[c] ?? 'AM' })),
      inhalable: methods.includes('inhalable')
        ? { type: inhType, potency: inhPotency, puffs }
        : undefined,
      sprays: {
        stacker: methods.includes('stacker') ? stackerSprays : 0,
        booster: methods.includes('booster') ? boosterSprays : 0,
      },
      relief,
      sidefx: Object.keys(sidefx).filter(k => sidefx[k as SideEffect]) as SideEffect[],
      comments,
    };
    console.log('Session saved:', payload);
    // TODO: persist to storage / context if desired
  }, [
    dateStr,
    timeStr,
    productName,
    methods,
    selectedCaps,
    capCounts,
    capWhen,
    inhType,
    inhPotency,
    puffs,
    stackerSprays,
    boosterSprays,
    relief,
    sidefx,
    comments,
  ]);

  const headerHint = useMemo(
    () => 'Log what you used and how it felt. This powers the Adaptive Therapeutic Index in the Dosing Engine.',
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>Session Tracker</Text>
        <Text style={styles.sub}>{headerHint}</Text>

        {/* Session meta */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session Details</Text>

          <Text style={styles.cardHint}>Date &amp; Time</Text>
          <View style={styles.dtRow}>
            <TextInput
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#7D9189"
              keyboardType="numbers-and-punctuation"
              style={[styles.input, styles.dtInput]}
            />
            <TextInput
              value={timeStr}
              onChangeText={setTimeStr}
              placeholder="HH:MM"
              placeholderTextColor="#7D9189"
              keyboardType="numbers-and-punctuation"
              style={[styles.input, styles.dtInput]}
            />
            <Pressable style={styles.nowBtn} onPress={resetNow}>
              <Text style={styles.nowText}>Now</Text>
            </Pressable>
          </View>

          <Text style={[styles.cardHint, { marginTop: 12 }]}>Product name / brand (optional)</Text>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="e.g., Carta Flower – Blue Dream"
            placeholderTextColor="#7D9189"
            style={styles.input}
          />
        </View>

        {/* Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Methods Used</Text>
          <View style={styles.rowWrap}>
            {(['capsule', 'stacker', 'booster', 'inhalable', 'topical'] as MethodId[]).map(m => (
              <Chip
                key={m}
                label={titleCase(m)}
                on={methodOn(m)}
                onPress={() => toggleMethod(m)}
              />
            ))}
          </View>
        </View>

        {/* Capsules */}
        {methodOn('capsule') && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Capsules Taken</Text>
            <Text style={styles.cardHint}>Select profile(s), time of day, and count</Text>

            <View style={styles.rowWrap}>
              {CAPSULES.map(c => (
                <Chip
                  key={c}
                  label={c}
                  on={selectedCaps.includes(c)}
                  onPress={() => toggleCapsule(c)}
                />
              ))}
            </View>

            {selectedCaps.length > 0 && (
              <View style={{ marginTop: 12 }}>
                {selectedCaps.map(c => {
                  const cnt = capCounts[c] ?? 1;
                  const when = capWhen[c] ?? 'AM';
                  return (
                    <View key={c} style={styles.capRow}>
                      <Text style={styles.capLabel}>{c}</Text>
                      <DayPartRow value={when} setValue={d => setCapWhen({ ...capWhen, [c]: d })} />
                      <View style={{ height: 6 }} />
                      <Text style={styles.cardHint}>Count</Text>
                      <Stepper
                        value={cnt}
                        setValue={n => setCapCounts({ ...capCounts, [c]: n })}
                        min={0}
                        max={12}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Inhalable */}
        {methodOn('inhalable') && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Inhalable</Text>
            <Text style={styles.cardHint}>Type</Text>
            <View style={styles.row}>
              {(['flower', 'vape', 'dab'] as InhType[]).map(t => (
                <Chip key={t} label={titleCase(t)} on={inhType === t} onPress={() => setInhType(t)} />
              ))}
            </View>
            <Text style={[styles.cardHint, { marginTop: 12 }]}>Potency</Text>
            <View style={styles.row}>
              {(['low', 'mid', 'high'] as Potency[]).map(p => (
                <Chip key={p} label={titleCase(p)} on={inhPotency === p} onPress={() => setInhPotency(p)} />
              ))}
            </View>
            <Text style={[styles.cardHint, { marginTop: 12 }]}>Puffs</Text>
            <Stepper value={puffs} setValue={setPuffs} min={0} max={40} />
          </View>
        )}

        {/* Sprays */}
        {methodOn('stacker') && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Stacker Spray</Text>
            <Stepper value={stackerSprays} setValue={setStackerSprays} min={0} max={60} />
          </View>
        )}
        {methodOn('booster') && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Booster Spray</Text>
            <Stepper value={boosterSprays} setValue={setBoosterSprays} min={0} max={60} />
          </View>
        )}

        {/* Relief outcomes (1–5) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Relief Outcomes (1–5)</Text>
          <Text style={styles.cardHint}>Choose a score for each area you care about</Text>
          {RELIEF_OUTCOMES.map(k => (
            <ScaleRow key={k} k={k} />
          ))}
        </View>

        {/* Side effects */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Side Effects</Text>
          <Text style={styles.cardHint}>Select any that occurred</Text>
          <View style={styles.rowWrap}>
            {SIDE_EFFECTS.map(k => (
              <Chip key={k} label={k} on={!!sidefx[k]} onPress={() => toggleSide(k)} />
            ))}
          </View>
        </View>

        {/* Comments */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comments</Text>
          <TextInput
            value={comments}
            onChangeText={setComments}
            placeholder="Notes about timing, setting, food, etc."
            placeholderTextColor="#7D9189"
            multiline
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
          />
        </View>

        <Pressable style={styles.primaryBtn} onPress={saveSession}>
          <Text style={styles.primaryText}>Save Session</Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// -------- styles --------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C1512' },
  container: { padding: 16, paddingBottom: 32 },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E9EFEA',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  sub: { color: '#9FB0A8', marginBottom: 12, lineHeight: 20 },

  card: {
    backgroundColor: '#0F1E1A',
    borderWidth: 1,
    borderColor: '#1F2C27',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  cardTitle: {
    color: '#E9EFEA',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  cardHint: { color: '#9FB0A8', marginBottom: 8 },

  input: {
    backgroundColor: '#0C1B17',
    borderWidth: 1,
    borderColor: '#243730',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: '#E9EFEA',
    fontSize: 15,
  },

  dtRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dtInput: { flex: 1, minWidth: 120 },
  nowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#132822',
    borderWidth: 1,
    borderColor: '#29433A',
  },
  nowText: { color: '#E9EFEA', fontWeight: '600' },

  row: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  rowWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#29433A',
    backgroundColor: '#132822',
  },
  chipOn: { borderColor: '#C9A86A', backgroundColor: 'rgba(201,168,106,0.18)' },
  chipText: { color: '#BFD3CC', fontSize: 14 },
  chipTextOn: { color: '#E9EFEA', fontWeight: '600' },
  pressed: { opacity: 0.75 },

  capRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1F2C27',
    paddingTop: 12,
    marginTop: 12,
    gap: 8,
  },
  capLabel: { color: '#E9EFEA', fontWeight: '600', marginBottom: 2 },

  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#132822',
    borderWidth: 1,
    borderColor: '#29433A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    color: '#E9EFEA',
    fontSize: 18,
    lineHeight: Platform.OS === 'ios' ? 18 : 20,
  },
  stepVal: { minWidth: 34, textAlign: 'center', color: '#E9EFEA', fontVariant: ['tabular-nums'] },

  scaleRow: { marginBottom: 10 },
  scaleLabel: { color: '#E9EFEA', marginBottom: 6, fontWeight: '600' },

  primaryBtn: {
    marginTop: 16,
    backgroundColor: '#C9A86A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#0C1512', fontWeight: '700', letterSpacing: 0.3 },
});

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}