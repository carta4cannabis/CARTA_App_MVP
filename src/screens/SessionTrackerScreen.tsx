// app/src/screens/SessionTrackerScreen.tsx
import React, {
  useMemo,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  saveSessionEntry,
  refreshAtiAndCoach,
} from '../addons/CARTA_CoachExtras';
import { KeyboardSafeScreen } from '../components/KeyboardSafeScreen';

const BG = require('../../assets/bg/carta_pattern.png');

/* theme */
const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const TEXT = '#E9EFEA';
// Brand-friendly serif without extra deps
const HEADLINE_SERIF =
  Platform.select({ ios: 'Palatino', android: 'serif' }) || 'serif';

type AnyNav = any;
/* types */
type MethodId = 'capsule' | 'inhalable' | 'stacker' | 'booster';
type CapsuleProfile =
  | 'Calm & Focus'
  | 'Mood & Uplift'
  | 'Mobility & Function'
  | 'Digestive Support'
  | 'Metabolic Wellness'
  | 'Mind & Memory'
  | 'Rest & Restore'
  | 'Intimacy & Vitality';
type DayPart = 'AM' | 'PM' | 'Bedtime';
type InhType = 'flower' | 'vape' | 'dab';
type Potency = 'low' | 'mid' | 'high';
type Outcome =
  | 'Pain relief'
  | 'Anxiety relief'
  | 'Sleep quality'
  | 'Focus'
  | 'Mood'
  | 'Nausea relief'
  | 'Appetite';
type SideEffect =
  | 'Drowsiness'
  | 'Dry mouth'
  | 'Dizziness'
  | 'Headache'
  | 'Palpitations'
  | 'Paranoia';

/* UI atoms */
const Chip = ({
  label,
  on,
  onPress,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[s.chip, on && s.chipOn]}
  >
    <Text
      style={[s.chipText, on && s.chipTextOn]}
    >
      {label}
    </Text>
  </Pressable>
);
const Seg = ({
  value,
  setValue,
  items,
}: {
  value: string;
  setValue: (v: string) => void;
  items: string[];
}) => (
  <View style={s.segRow}>
    {items.map(it => {
      const on = value === it;
      return (
        <Pressable
          key={it}
          onPress={() => setValue(it)}
          style={[
            s.segBtn,
            on && s.segBtnOn,
          ]}
        >
          <Text
            style={[
              s.segLabel,
              on && s.segLabelOn,
            ]}
          >
            {it}
          </Text>
        </Pressable>
      );
    })}
  </View>
);
const Stepper = ({
  value,
  setValue,
  min = 0,
  max = 12,
}: {
  value: number;
  setValue: (v: number) => void;
  min?: number;
  max?: number;
}) => (
  <View style={s.stepRow}>
    <Pressable
      onPress={() =>
        setValue(Math.max(min, value - 1))
      }
      style={s.stepBtn}
    >
      <Text style={s.stepTxt}>−</Text>
    </Pressable>
    <Text style={s.stepVal}>{value}</Text>
    <Pressable
      onPress={() =>
        setValue(Math.min(max, value + 1))
      }
      style={s.stepBtn}
    >
      <Text style={s.stepTxt}>＋</Text>
    </Pressable>
  </View>
);

export default function SessionTrackerScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();

  useLayoutEffect(() => {
    nav.setOptions?.({ headerShown: false });
  }, [nav]);

  /* date & time */
  const [when, setWhen] = useState<Date>(
    new Date(),
  );
  const whenStr = useMemo(
    () =>
      `${when.toLocaleDateString()}  ${when.toLocaleTimeString(
        [],
        { hour: '2-digit', minute: '2-digit' },
      )}`,
    [when],
  );

  /* methods */
  const [methods, setMethods] = useState<MethodId[]>([
    'capsule',
  ]);
  const toggleMethod = (m: MethodId) =>
    setMethods(prev =>
      prev.includes(m)
        ? prev.filter(x => x !== m)
        : [...prev, m],
    );
  const useInhalable = methods.includes(
    'inhalable',
  );
  const useCapsule = methods.includes('capsule');
  const useBooster = methods.includes('booster');
  const useStacker = methods.includes('stacker');

  /* capsules */
  const CAPS: CapsuleProfile[] = [
    'Calm & Focus',
    'Mood & Uplift',
    'Mobility & Function',
    'Digestive Support',
    'Metabolic Wellness',
    'Mind & Memory',
    'Rest & Restore',
    'Intimacy & Vitality',
  ];
  const [capProfiles, setCapProfiles] =
    useState<CapsuleProfile[]>([]);
  const [capCounts, setCapCounts] =
    useState<Record<CapsuleProfile, number>>(
      {} as any,
    );
  const [capWhen, setCapWhen] =
    useState<Record<CapsuleProfile, DayPart>>(
      {} as any,
    );

  const toggleCapProfile = (p: CapsuleProfile) => {
    setCapProfiles(prev => {
      if (prev.includes(p)) {
        const next = prev.filter(x => x !== p);
        const nextCounts = {
          ...(capCounts as any),
        } as Record<CapsuleProfile, number>;
        const nextWhen = {
          ...(capWhen as any),
        } as Record<CapsuleProfile, DayPart>;
        delete nextCounts[p];
        delete nextWhen[p];
        setCapCounts(nextCounts);
        setCapWhen(nextWhen);
        return next;
      } else {
        setCapCounts({
          ...capCounts,
          [p]: 1,
        });
        setCapWhen({
          ...capWhen,
          [p]: 'AM',
        });
        return [...prev, p];
      }
    });
  };
  const bumpCount = (
    p: CapsuleProfile,
    delta: number,
  ) =>
    setCapCounts(prev => ({
      ...prev,
      [p]: Math.max(
        0,
        (prev[p] ?? 0) + delta,
      ),
    }));
  const setDaypart = (
    p: CapsuleProfile,
    v: DayPart,
  ) =>
    setCapWhen(prev => ({
      ...prev,
      [p]: v,
    }));

  /* inhalables */
  const [inhType, setInhType] =
    useState<InhType>('flower');
  const [inhPotency, setInhPotency] =
    useState<Potency>('mid');
  const [puffs, setPuffs] = useState<number>(0);

  /* sprays */
  const [stackerSprays, setStackerSprays] =
    useState<number>(0);
  const [boosterSprays, setBoosterSprays] =
    useState<number>(0);

  /* outcomes 1-5 */
  const OUTCOMES: Outcome[] = [
    'Pain relief',
    'Anxiety relief',
    'Sleep quality',
    'Focus',
    'Mood',
    'Nausea relief',
    'Appetite',
  ];
  const [scores, setScores] =
    useState<Record<Outcome, number>>(
      {} as any,
    );

  /* side effects */
  const SE: SideEffect[] = [
    'Drowsiness',
    'Dry mouth',
    'Dizziness',
    'Headache',
    'Palpitations',
    'Paranoia',
  ];
  const [sidefx, setSidefx] = useState<
    SideEffect[]
  >([]);

  /* notes */
  const [notes, setNotes] = useState<string>('');

  const resetSessionTracker = useCallback(() => {
    setWhen(new Date());
    setMethods(['capsule']);
    setCapProfiles([]);
    setCapCounts(
      {} as Record<CapsuleProfile, number>,
    );
    setCapWhen(
      {} as Record<CapsuleProfile, DayPart>,
    );
    setInhType('flower');
    setInhPotency('mid');
    setPuffs(0);
    setStackerSprays(0);
    setBoosterSprays(0);
    setScores(
      {} as Record<Outcome, number>,
    );
    setSidefx([]);
    setNotes('');
  }, []);

  const save = useCallback(async () => {
    const payload = {
      when: when.toISOString(),
      methods,
      capsules: capProfiles.map(p => ({
        profile: p,
        count: capCounts[p] ?? 0,
        daypart: capWhen[p] ?? 'AM',
      })),
      inhalable: useInhalable
        ? { type: inhType, potency: inhPotency, puffs }
        : null,
      sprays: {
        stacker: useStacker ? stackerSprays : 0,
        booster: useBooster
          ? boosterSprays
          : 0,
      },
      outcomes: scores,
      sideEffects: sidefx,
      notes,
    };

    await saveSessionEntry(payload as any);
    resetSessionTracker();
    try {
      await refreshAtiAndCoach();
    } catch {}
    alert('Session saved.');
  }, [
    when,
    methods,
    capProfiles,
    capCounts,
    capWhen,
    useInhalable,
    inhType,
    inhPotency,
    puffs,
    useStacker,
    stackerSprays,
    useBooster,
    boosterSprays,
    scores,
    sidefx,
    notes,
    resetSessionTracker,
  ]);

  return (
    <SafeAreaView style={s.safe}>
      {/* Background */}
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFillObject}
        resizeMode={
          Platform.OS === 'ios' ? 'repeat' : 'cover'
        }
        imageStyle={{
          opacity: 0.5,
          resizeMode:
            Platform.OS === 'ios'
              ? 'repeat'
              : 'cover',
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
        keyboardVerticalOffset={insets.top + 64}
      >
                  {/* Cohort-style header */}
          <View
            style={[
              s.headerWrap,
              { paddingTop: insets.top - 26 },
            ]}
          >
            <Pressable
              onPress={() => {
                if (
                  (nav as any).canGoBack?.()
                ) {
                  (nav as any).goBack();
                } else {
                  (nav as any).navigate?.(
                    'Tabs',
                    { screen: 'Tracker' },
                  );
                }
              }}
              style={({ pressed }) => [
                s.backBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={s.backText}>
                {'\u25C0'}
              </Text>
              <Text style={s.backLabel}>
                Back
              </Text>
            </Pressable>
            <Text style={s.headerTitle}>
              Session Tracker
            </Text>
            <Text style={s.sub}>
              Log what you used and how it worked.
            </Text>
          </View>
<KeyboardSafeScreen>
        <ScrollView
          contentContainerStyle={s.container}
          keyboardShouldPersistTaps="handled">
          {/* Date & Time */}
          <View style={s.card}>
            <Text style={s.cardTitle}>
              Date &amp; Time
            </Text>
            <TextInput
              value={whenStr}
              onChangeText={t => {
                const parsed = new Date(t);
                if (
                  !isNaN(parsed.getTime())
                )
                  setWhen(parsed);
              }}
              style={[s.input, { marginTop: 8 }]}
            />
          </View>

          {/* Methods */}
          <View style={s.card}>
            <Text style={s.cardTitle}>
              Methods used
            </Text>
            <View style={s.rowWrap}>
              {(
                [
                  'inhalable',
                  'capsule',
                  'booster',
                  'stacker',
                ] as MethodId[]
              ).map(m => (
                <Chip
                  key={m}
                  label={labelForMethod(m)}
                  on={methods.includes(m)}
                  onPress={() =>
                    toggleMethod(m)
                  }
                />
              ))}
            </View>
          </View>

          {/* Capsules */}
          {useCapsule && (
            <View style={s.card}>
              <Text style={s.cardTitle}>
                Capsules used
              </Text>
              <View style={s.rowWrap}>
                {CAPS.map(p => (
                  <Chip
                    key={p}
                    label={p}
                    on={capProfiles.includes(
                      p,
                    )}
                    onPress={() =>
                      toggleCapProfile(p)
                    }
                  />
                ))}
              </View>

              {capProfiles.length > 0 && (
                <View
                  style={{ marginTop: 14 }}
                >
                  {capProfiles.map(p => (
                    <View
                      key={`row-${p}`}
                      style={s.capRow}
                    >
                      <Text
                        style={s.capName}
                      >
                        {p}
                      </Text>
                      <Seg
                        value={
                          capWhen[p] ??
                          'AM'
                        }
                        setValue={v =>
                          setDaypart(
                            p,
                            v as DayPart,
                          )
                        }
                        items={[
                          'AM',
                          'PM',
                          'Bedtime',
                        ]}
                      />
                      <Stepper
                        value={
                          capCounts[p] ?? 0
                        }
                        setValue={v =>
                          bumpCount(
                            p,
                            v -
                              (capCounts[p] ??
                                0),
                          )
                        }
                        max={12}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Inhalable */}
          {useInhalable && (
            <View style={s.card}>
              <Text style={s.cardTitle}>
                Inhalable details
              </Text>
              <Text style={s.label}>
                Type
              </Text>
              <Seg
                value={inhType}
                setValue={v =>
                  setInhType(v as InhType)
                }
                items={['flower', 'vape', 'dab']}
              />
              <Text
                style={[
                  s.label,
                  { marginTop: 8 },
                ]}
              >
                Potency
              </Text>
              <Seg
                value={inhPotency}
                setValue={v =>
                  setInhPotency(
                    v as Potency,
                  )
                }
                items={['low', 'mid', 'high']}
              />
              <Text
                style={[
                  s.label,
                  { marginTop: 8 },
                ]}
              >
                Puffs (per day)
              </Text>
              <Stepper
                value={puffs}
                setValue={setPuffs}
                max={50}
              />
            </View>
          )}

          {/* Sprays */}
          {(useStacker || useBooster) && (
            <View style={s.card}>
              <Text style={s.cardTitle}>
                Sprays (per day)
              </Text>
              {useStacker && (
                <View style={s.inline}>
                  <Text
                    style={s.inlineLabel}
                  >
                    THC Stacker
                  </Text>
                  <Stepper
                    value={stackerSprays}
                    setValue={setStackerSprays}
                    max={40}
                  />
                </View>
              )}
              {useBooster && (
                <View style={s.inline}>
                  <Text
                    style={s.inlineLabel}
                  >
                    Booster (non-THC)
                  </Text>
                  <Stepper
                    value={boosterSprays}
                    setValue={setBoosterSprays}
                    max={40}
                  />
                </View>
              )}
            </View>
          )}

          {/* Outcomes */}
          <View style={s.card}>
            <Text style={s.cardTitle}>
              Relief outcomes (1–5)
            </Text>
            {OUTCOMES.map(o => (
              <View
                key={o}
                style={{ marginBottom: 8 }}
              >
                <Text style={s.outcome}>
                  {o}
                </Text>
                <Seg
                  value={String(
                    scores[o] ?? 0,
                  )}
                  setValue={v =>
                    setScores(prev => ({
                      ...prev,
                      [o]: Number(v),
                    }))
                  }
                  items={[
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Side effects */}
          <View style={s.card}>
            <Text style={s.cardTitle}>
              Side effects
            </Text>
            <View style={s.rowWrap}>
              {SE.map(o => {
                const on =
                  sidefx.includes(o);
                return (
                  <Chip
                    key={o}
                    label={o}
                    on={on}
                    onPress={() =>
                      setSidefx(prev =>
                        prev.includes(o)
                          ? prev.filter(
                              x => x !== o,
                            )
                          : [...prev, o],
                      )
                    }
                  />
                );
              })}
            </View>
          </View>

          {/* Notes */}
          <View style={s.card}>
            <Text style={s.cardTitle}>
              Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything else to remember…"
              placeholderTextColor="#9FB3A8"
              multiline
              style={[
                s.input,
                {
                  height: 120,
                  textAlignVertical: 'top',
                },
              ]}
              returnKeyType="done"
            />
          </View>

          {/* Save */}
          <Pressable
            onPress={save}
            style={s.saveBtn}
          >
            <Text style={s.saveTxt}>
              Save session
            </Text>
          </Pressable>

          <View style={{ height: 24 }} />
        </ScrollView>
        </KeyboardSafeScreen>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DEEP },
  container: { padding: 16, paddingBottom: 32 },

  headerWrap: {
    paddingHorizontal: 32,
    paddingBottom: 16,
    borderBottomColor: '#233229',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(18, 31, 26, 0.9)',
    marginHorizontal: -16,
    marginBottom: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  backText: { color: GOLD, fontWeight: '800', fontFamily: HEADLINE_SERIF, fontSize: 14, marginRight: 4 },
 backIcon: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, 
    fontSize: 14,
    marginRight: 4,
    marginBottom: 8,
  },
   backLabel: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, fontSize: 15,
    fontWeight: '500',
    marginBottom: -4,
  },

  headerTitle: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, fontSize: 32,
    fontWeight: '800',
    textAlign: 'center'
  },
  sub: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontSize: 15,
    marginTop: 10,
    textAlign: 'center'
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 12,
  },
  cardTitle: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },

  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  chip: {
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: GOLD },
  chipText: { color: TEXT, fontFamily: HEADLINE_SERIF, fontWeight: '600' },
  chipTextOn: {
    color: DEEP,
    fontFamily: HEADLINE_SERIF, fontWeight: '700',
  },

  segRow: { flexDirection: 'row', marginTop: 6 },
  segBtn: {
    borderWidth: 1,
    borderColor: '#2A3B33',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  segBtnOn: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  segLabel: { fontFamily: HEADLINE_SERIF, color: TEXT },
  segLabelOn: {
    color: DEEP,
    fontFamily: HEADLINE_SERIF, fontWeight: '700',
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1A2A24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0e1813ff',
    marginHorizontal: 10,
  },
  stepTxt: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontSize: 20,
    lineHeight: 20,
    marginTop: -2,
  },
  stepVal: {
    color: TEXT,
    width: 28,
    textAlign: 'center',
    fontFamily: HEADLINE_SERIF, fontWeight: '700',
  },

  capRow: {
    borderTopWidth: 1,
    borderTopColor: '#1F2D27',
    paddingTop: 10,
    marginTop: 10,
  },
  capName: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontWeight: '700',
    marginBottom: 6,
  },

  label: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontSize: 12,
    marginTop: 6,
  },
  outcome: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontWeight: '600',
  },

  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  inlineLabel: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontWeight: '600',
  },

  input: {
    backgroundColor: '#333a3aff',
    color: TEXT,
    fontFamily: HEADLINE_SERIF, borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical:
      Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: '#2A3B33',
  },

  saveBtn: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveTxt: {
    color: DEEP,
   fontFamily: HEADLINE_SERIF,  fontWeight: '800',
    fontSize: 16,
  },
});

function labelForMethod(m: MethodId) {
  switch (m) {
    case 'capsule':
      return 'Capsule';
    case 'inhalable':
      return 'Inhalable';
    case 'stacker':
      return 'THC Stacker';
    case 'booster':
      return 'Booster spray';
  }
  return m;
}
