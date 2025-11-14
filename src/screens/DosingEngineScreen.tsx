import React, {
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Platform,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAtiInputs, type AtiInputs } from '../addons/CARTA_CoachExtras';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = require('../../assets/bg/carta_pattern.png');

/* Theme */
const GOLD = '#C9A86A',
  DEEP = '#0E1A16',
  CARD = '#121F1A',
  INK = '#E9EFEA',
  MUTED = '#9FB0A5',
  BORDER = '#1E2B26';

/* Product images */
const IMAGES = {
  calm_focus_daytime: require('../../assets/products/calm_focus_daytime.png'),
  mood_uplift_daytime: require('../../assets/products/mood_uplift_daytime.png'),
  mobility_function: require('../../assets/products/mobility_function.png'),
  digestive_support: require('../../assets/products/digestive_support.png'),
  metabolic_wellness: require('../../assets/products/metabolic_wellness.png'),
  mind_memory: require('../../assets/products/mind_memory.png'),
  rest_restore_night: require('../../assets/products/rest_restore_nighttime.png'),
  intimacy_capsule: require('../../assets/products/intimacy_vitality_capsule.png'),
  stacker_spray: require('../../assets/products/stacker_spray.png'),
  booster_spray: require('../../assets/products/booster_spray.png'),
  flower: require('../../assets/products/flower.jpg'),
  vape_cart: require('../../assets/products/vape_cart.png'),
  rosin_jar: require('../../assets/products/rosin_jar.jpg'),
} as const;

/* Types */
type Tolerance = 'low' | 'moderate' | 'high';
type Intensity = 'low' | 'medium' | 'high';
type MajorProfile = 'thc' | 'balanced' | 'cbd';
type InhType = 'flower' | 'vape' | 'dab';
type Potency = 'low' | 'mid' | 'high';
type DayProfile =
  | 'Calm & Focus'
  | 'Mood & Uplift'
  | 'Mobility & Function'
  | 'Digestive Support'
  | 'Metabolic Wellness'
  | 'Mind & Memory';
type NightGoal = 'rest' | 'intimacy' | null;
type WeightBand = '<135' | '135-200' | '>200';
type AgeBand = '21-34' | '35-59' | '60+';

/* Clinical constants */
const THC_PER = { stackerSpray_mg: 2, capsule_mg: 0 };
const NTC_PER = { capsule_mg: 50, boosterSpray_mg: 10 };
const THC_PER_PUFF = {
  flower: { low: 0.5, mid: 1.0, high: 1.5 },
  vape: { low: 1.0, mid: 2.0, high: 3.0 },
  dab: { low: 3.0, mid: 5.0, high: 7.0 },
} as const;

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

function thcCapByTolerance(
  tol: Tolerance,
  inten: Intensity,
): [number, number] {
  const bands: Record<Tolerance, Record<Intensity, [number, number]>> = {
    low: { low: [5, 7.5], medium: [7.5, 10], high: [10, 12] },
    moderate: { low: [10, 12], medium: [12, 15], high: [15, 20] },
    high: { low: [20, 25], medium: [25, 30], high: [30, 40] },
  };
  return bands[tol][inten];
}
function computeThcCap({
  tol,
  inten,
  age,
  ati,
  major,
  weight,
}: {
  tol: Tolerance;
  inten: Intensity;
  age: AgeBand;
  ati: number;
  major: MajorProfile;
  weight: WeightBand;
}): number {
  const [lo, hi] = thcCapByTolerance(tol, inten);
  let base = age === '60+' ? lo : Math.round((lo + hi) / 2);
  const atiMod = 0.9 + (ati / 100) * 0.2; // 0.9..1.1
  const wMod =
    weight === '>200' ? 1.1 : weight === '<135' ? 0.9 : 1.0;
  base = Math.round(base * atiMod * wMod);
  if (major === 'thc') base = Math.min(40, Math.round(base * 1.1));
  if (major === 'cbd') base = Math.max(5, Math.round(base * 0.75));
  if (tol === 'low' && ati < 50) base = clamp(base, 5, 8);
  return clamp(base, 5, 40);
}

function nonThcGoalByTol(
  tol: Tolerance,
  major: MajorProfile,
): number {
  const base =
    tol === 'low' ? 100 : tol === 'moderate' ? 150 : 250;
  return major === 'cbd' ? base + 50 : base;
}
function maxCapsByTol(tol: Tolerance): number {
  return tol === 'low' ? 2 : tol === 'moderate' ? 3 : 6;
}

/* proportions (dialed back inhalables, slight preference to stacker) */
function fracInhalable(intensity: Intensity, tol: Tolerance) {
  const t: Record<Intensity, Record<Tolerance, number>> = {
    low: { low: 0.1, moderate: 0.18, high: 0.22 },
    medium: { low: 0.18, moderate: 0.3, high: 0.4 },
    high: { low: 0.25, moderate: 0.4, high: 0.5 },
  };
  return t[intensity][tol];
}
function fracStacker(intensity: Intensity, tol: Tolerance) {
  const t: Record<Intensity, Record<Tolerance, number>> = {
    low: { low: 0.07, moderate: 0.12, high: 0.18 },
    medium: { low: 0.12, moderate: 0.18, high: 0.22 },
    high: { low: 0.18, moderate: 0.22, high: 0.28 },
  };
  return t[intensity][tol];
}

function fitUnderCapProportional(params: {
  capTHC: number;
  inhType?: InhType;
  inhPotency?: Potency;
  plannedPuffs?: number;
  plannedSprays: number;
}) {
  const { capTHC, inhType, inhPotency, plannedPuffs = 0, plannedSprays } =
    params;
  const perPuff =
    inhType && inhPotency ? THC_PER_PUFF[inhType][inhPotency] : 0;
  const inhalableTHC = perPuff * plannedPuffs;
  const sprayTHC = THC_PER.stackerSpray_mg * plannedSprays;
  const total = inhalableTHC + sprayTHC;

  if (total <= capTHC)
    return {
      puffs: plannedPuffs,
      sprays: plannedSprays,
      totalTHC: total,
    };

  const scale = capTHC / Math.max(0.0001, total);
  let puffs = inhType
    ? Math.floor(plannedPuffs * scale + 1e-6)
    : 0;
  let sprays = Math.floor(plannedSprays * scale + 1e-6);
  puffs = Math.max(0, puffs);
  sprays = Math.max(0, sprays);

  let newTotal =
    perPuff * puffs + THC_PER.stackerSpray_mg * sprays;
  let guard = 40;
  while (newTotal > capTHC && guard-- > 0) {
    const dropPuff = perPuff;
    const dropSpray = THC_PER.stackerSpray_mg;
    if (puffs > 0 && (dropPuff >= dropSpray || sprays === 0))
      puffs -= 1;
    else if (sprays > 0) sprays -= 1;
    else break;
    newTotal =
      perPuff * puffs + THC_PER.stackerSpray_mg * sprays;
  }
  return { puffs, sprays, totalTHC: newTotal };
}

/* Small UI helpers */
function Chip({
  label,
  on,
  onPress,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.chip,
        on && s.chipOn,
        pressed && s.pressed,
      ]}
    >
      <Text style={[s.chipText, on && s.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}
function RowChips<T extends string>({
  value,
  setValue,
  items,
}: {
  value: T;
  setValue: (v: T) => void;
  items: { id: T; label: string }[];
}) {
  return (
    <View style={s.row}>
      {items.map(it => (
        <Chip
          key={String(it.id)}
          label={it.label}
          on={value === it.id}
          onPress={() => setValue(it.id)}
        />
      ))}
    </View>
  );
}
function RowChipsNullable<T extends string>({
  value,
  setValue,
  items,
}: {
  value: T | null;
  setValue: (v: T | null) => void;
  items: { id: T; label: string }[];
}) {
  return (
    <View style={s.row}>
      {items.map(it => {
        const active = value === it.id;
        return (
          <Chip
            key={String(it.id)}
            label={it.label}
            on={active}
            onPress={() => setValue(active ? null : it.id)}
          />
        );
      })}
    </View>
  );
}
function MultiRowChips<T extends string>({
  values,
  setValues,
  items,
}: {
  values: T[];
  setValues: (v: T[]) => void;
  items: { id: T; label: string }[];
}) {
  const toggle = (id: T) =>
    setValues(
      values.includes(id)
        ? values.filter(x => x !== id)
        : [...values, id],
    );
  return (
    <View style={s.rowWrap}>
      {items.map(it => (
        <Chip
          key={it.id}
          label={it.label}
          on={values.includes(it.id)}
          onPress={() => toggle(it.id)}
        />
      ))}
    </View>
  );
}
function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(
    0,
    Math.min(100, (value / Math.max(1, max)) * 100),
  );
  return (
    <View style={s.barWrap}>
      <Text style={s.hint}>
        {label} {Math.round(value)} mg / {Math.round(max)} mg
      </Text>
      <View style={s.barBg}>
        <View
          style={[s.barFg, { width: `${pct}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

export default function DosingEngineScreen() {
  const [atiInputs, setAtiInputs] = useState<AtiInputs | null>(
    null,
  );
  const [ati, setAti] = useState<number>(75);

  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    nav.setOptions?.({ headerShown: false });
  }, [nav]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('ATI_SCORE');
        if (raw)
          setAti(clamp(Number(raw), 0, 100));
      } catch {}
      try {
        const inputs = await getAtiInputs();
        setAtiInputs(inputs);
      } catch {
        setAtiInputs(null);
      }
    })();
  }, []);

  const [useCapsule, setUseCapsule] = useState(true);
  const [useBooster, setUseBooster] = useState(false);
  const [useStacker, setUseStacker] = useState(false);
  const [useInhalable, setUseInhalable] = useState(false);

  const [dayProfiles, setDayProfiles] = useState<DayProfile[]>([
    'Calm & Focus',
  ]);
  const [nightGoal, setNightGoal] = useState<NightGoal>('rest');
  const [major, setMajor] =
    useState<MajorProfile>('balanced');

  const [inhType, setInhType] =
    useState<InhType>('flower');
  const [inhPotency, setInhPotency] =
    useState<Potency>('mid');

  const [age, setAge] = useState<AgeBand>('21-34');
  const [weight, setWeight] =
    useState<WeightBand>('135-200');
  const [intensity, setIntensity] =
    useState<Intensity>('medium');
  const [tolerance, setTolerance] =
    useState<Tolerance>('low');

  const capTHC = useMemo(
    () =>
      computeThcCap({
        tol: tolerance,
        inten: intensity,
        age,
        ati,
        major,
        weight,
      }),
    [tolerance, intensity, age, ati, major, weight],
  );

  const nonThcGoal = useMemo(
    () => nonThcGoalByTol(tolerance, major),
    [tolerance, major],
  );
  const capsMax = maxCapsByTol(tolerance);
  const capsMin = 1;

  const baseCaps = Math.round(
    nonThcGoal / NTC_PER.capsule_mg,
  );
  const conservativeStart =
    tolerance === 'low'
      ? ati < 50
        ? 1
        : 2
      : baseCaps; // naïve: 1–2/day
  const capsTotalTarget = useCapsule
    ? clamp(conservativeStart, capsMin, capsMax)
    : 0;

  function chooseProfileForSlot(
    slot: 'AM' | 'PM',
    selected: DayProfile[],
    used: Set<DayProfile>,
  ): DayProfile | null {
    const prefAM: DayProfile[] = [
      'Calm & Focus',
      'Mood & Uplift',
      'Mind & Memory',
      'Metabolic Wellness',
      'Mobility & Function',
      'Digestive Support',
    ];
    const prefPM: DayProfile[] = [
      'Mobility & Function',
      'Digestive Support',
      'Mood & Uplift',
      'Calm & Focus',
      'Metabolic Wellness',
      'Mind & Memory',
    ];
    const pref = slot === 'AM' ? prefAM : prefPM;
    for (const p of pref)
      if (selected.includes(p) && !used.has(p)) return p;
    for (const p of pref)
      if (selected.includes(p)) return p;
    return null;
  }
  const selectedSet = new Set<DayProfile>(dayProfiles);
  const usedProfiles = new Set<DayProfile>();
  const amProfile = chooseProfileForSlot(
    'AM',
    [...selectedSet],
    usedProfiles,
  );
  if (amProfile) usedProfiles.add(amProfile);
  const pmProfile = chooseProfileForSlot(
    'PM',
    [...selectedSet],
    usedProfiles,
  );

  const profileToImage: Record<DayProfile, any> = {
    'Calm & Focus': IMAGES.calm_focus_daytime,
    'Mood & Uplift': IMAGES.mood_uplift_daytime,
    'Mobility & Function': IMAGES.mobility_function,
    'Digestive Support': IMAGES.digestive_support,
    'Metabolic Wellness': IMAGES.metabolic_wellness,
    'Mind & Memory': IMAGES.mind_memory,
  };
  const amCapImage = amProfile
    ? profileToImage[amProfile]
    : IMAGES.calm_focus_daytime;
  const pmCapImage = pmProfile
    ? profileToImage[pmProfile]
    : IMAGES.mobility_function;
  const bedCapImage =
    (nightGoal === 'rest' && IMAGES.rest_restore_night) ||
    (nightGoal === 'intimacy' &&
      IMAGES.intimacy_capsule) ||
    IMAGES.rest_restore_night;

  const mgPerPuff =
    THC_PER_PUFF[inhType][inhPotency];
  const inhalableAllowed = !(
    tolerance === 'low' && intensity === 'low'
  );

  const baseFastFrac =
    (inhalableAllowed
      ? fracInhalable(intensity, tolerance)
      : 0) +
    (useStacker
      ? fracStacker(intensity, tolerance)
      : 0);
  const fastBudgetMg = Math.round(
    capTHC * Math.min(0.9, baseFastFrac),
  );

  const wInh =
    useInhalable && inhalableAllowed ? 1 : 0;
  const wStack = useStacker ? 2 : 0;
  const wTot = Math.max(1, wInh + wStack);

  const inhTHCTarget = wInh
    ? Math.round(fastBudgetMg * (wInh / wTot))
    : 0;
  const stackerTHCTarget = wStack
    ? Math.round(fastBudgetMg * (wStack / wTot))
    : 0;

  const plannedPuffsRaw = wInh
    ? Math.max(
        0,
        Math.round(
          inhTHCTarget / Math.max(0.1, mgPerPuff),
        ),
      )
    : 0;
  const plannedSpraysRaw = wStack
    ? Math.max(
        0,
        Math.round(
          stackerTHCTarget /
            THC_PER.stackerSpray_mg,
        ),
      )
    : 0;

  const {
    puffs: fittedPuffs,
    sprays: fittedSprays,
    totalTHC: thcUsed,
  } = useMemo(
    () =>
      fitUnderCapProportional({
        capTHC,
        inhType: wInh ? inhType : undefined,
        inhPotency: wInh ? inhPotency : undefined,
        plannedPuffs: wInh ? plannedPuffsRaw : 0,
        plannedSprays: plannedSpraysRaw,
      }),
    [
      capTHC,
      wInh,
      inhType,
      inhPotency,
      plannedPuffsRaw,
      plannedSpraysRaw,
    ],
  );

  // Base capsule split
  let capsAm = Math.round(capsTotalTarget * 0.4);
  let capsPm = Math.round(capsTotalTarget * 0.4);
  let capsBed = Math.max(
    0,
    capsTotalTarget - capsAm - capsPm,
  );

  // Low-tolerance rule: if they only get 2 capsules/day,
  // allocate AM then Bedtime (AM=1, Bedtime=1, PM=0).
  if (
    useCapsule &&
    tolerance === 'low' &&
    capsTotalTarget === 2
  ) {
    capsAm = 1;
    capsBed = 1;
    capsPm = 0;
  }

  // If Booster is selected along with capsules, favor Booster over
  // a second PM capsule as the regimen scales (AM → Bedtime → PM → Booster → AM → PM).
  if (useCapsule && useBooster && capsPm > 1) {
    capsPm -= 1;
  }

  const capsNonThc =
    (capsAm + capsPm + capsBed) *
    NTC_PER.capsule_mg;

  const nonThcRemaining = Math.max(
    0,
    nonThcGoal - capsNonThc,
  );
  const BOOSTER_MAX_PER_DAY = 8;
  const boosterBaseSprays = Math.min(
    BOOSTER_MAX_PER_DAY,
    Math.round(
      nonThcRemaining / NTC_PER.boosterSpray_mg,
    ),
  );
  const boosterFactor =
    useInhalable && thcUsed > 0 ? 0.85 : 1.0;
  const boosterSuggested = useBooster
    ? Math.max(
        1,
        Math.round(
          boosterBaseSprays * boosterFactor,
        ),
      )
    : 0;
  const nonThcUsed =
    capsNonThc +
    (useBooster
      ? boosterSuggested * NTC_PER.boosterSpray_mg
      : 0);

  const inhImage =
    !(
      useInhalable && inhalableAllowed
    ) || !useInhalable
      ? undefined
      : inhType === 'flower'
      ? IMAGES.flower
      : inhType === 'vape'
      ? IMAGES.vape_cart
      : IMAGES.rosin_jar;

  return (
    <SafeAreaView style={s.safe}>
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

 {/* Cohort-style header */}
        <View
          style={[
            s.header,
            { paddingTop: insets.top - 26 },
          ]}
        >
          <Pressable
            onPress={() => nav.goBack()}
            style={({ pressed }) => [
              s.backBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={s.backIcon}>{'\u25C0'}</Text>
            <Text style={s.backLabel}>Back</Text>
          </Pressable>
          <Text style={s.title}>
            Dosing Engine
          </Text>
          <Text style={s.subTitle}>
            Build a chemotype-guided AM, PM, and
            Bedtime plan within your guardrails.
          </Text>
        </View>


      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
       <View
          style={{
            paddingTop: 12,
            marginBottom: 40,
          }}>
        
          <Text style={s.h1}>
            Chemotype-Guided Dosing
          </Text>
          <Text style={s.body}>
            Select your goals & preferred methods.
            We’ll create a personalized AM, PM, and
            Bedtime plan with CARTA pairings and
            real-time insights.
          </Text>
          <Text style={s.body}> </Text>
          <Text style={s.body}>
            Once you make a few selections you will
            see your wellness journey mapped out
            with the cannabinoid tracker. The
            Adaptive Therapeutic Index (ATI) will
            pull in data from your Session Tracker
            and Quick Check-in to tailor the regimen
            over time. The more you log, the more
            personalized your regimen becomes.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            Consumption Methods (select one or more)
          </Text>
          <View style={s.rowWrap}>
            <Chip
              label="Inhalable"
              on={useInhalable}
              onPress={() =>
                setUseInhalable(!useInhalable)
              }
            />
            <Chip
              label="Capsule"
              on={useCapsule}
              onPress={() =>
                setUseCapsule(!useCapsule)
              }
            />
            <Chip
              label="Booster Spray"
              on={useBooster}
              onPress={() =>
                setUseBooster(!useBooster)
              }
            />
            <Chip
              label="THC Stacker"
              on={useStacker}
              onPress={() =>
                setUseStacker(!useStacker)
              }
            />
          </View>

          {useInhalable && (
            <View
              style={{
                marginTop: 10,
                marginBottom: 4,
              }}
            >
              <Text
                style={[
                  s.label,
                  { marginBottom: 8 },
                ]}
              >
                Inhalable Type
              </Text>
              <RowChips<InhType>
                value={inhType}
                setValue={setInhType}
                items={[
                  {
                    id: 'flower',
                    label: 'Flower',
                  },
                  {
                    id: 'vape',
                    label: 'Vape',
                  },
                  { id: 'dab', label: 'Dab' },
                ]}
              />
              <Text
                style={[
                  s.label,
                  {
                    marginTop: 8,
                    marginBottom: 8,
                  },
                ]}
              >
                Potency
              </Text>
              <RowChips<Potency>
                value={inhPotency}
                setValue={setInhPotency}
                items={[
                  { id: 'low', label: 'Low' },
                  { id: 'mid', label: 'Mid' },
                  { id: 'high', label: 'High' },
                ]}
              />
              {tolerance === 'low' &&
                intensity === 'low' && (
                  <Text
                    style={[
                      s.hint,
                      { marginTop: 6 },
                    ]}
                  >
                    For naïve users,
                    inhalables are disabled
                    by default. Increase
                    intensity or tolerance
                    over time to enable.
                  </Text>
                )}
            </View>
          )}
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            Day-time Profile (select one or more)
          </Text>
          <MultiRowChips<DayProfile>
            values={dayProfiles}
            setValues={setDayProfiles}
            items={[
              {
                id: 'Calm & Focus',
                label: 'Calm & Focus',
              },
              {
                id: 'Mood & Uplift',
                label: 'Mood & Uplift',
              },
              {
                id: 'Mobility & Function',
                label: 'Mobility & Function',
              },
              {
                id: 'Digestive Support',
                label: 'Digestive Support',
              },
              {
                id: 'Metabolic Wellness',
                label: 'Metabolic Wellness',
              },
              {
                id: 'Mind & Memory',
                label: 'Mind & Memory',
              },
            ]}
          />
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            Night-time Profile (select one)
          </Text>
          <RowChipsNullable<'rest' | 'intimacy'>
            value={nightGoal}
            setValue={setNightGoal}
            items={[
              {
                id: 'rest',
                label: 'Rest & Restore',
              },
              {
                id: 'intimacy',
                label: 'Intimacy & Vitality',
              },
            ]}
          />
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            Major Cannabinoid Profile
          </Text>
          <RowChips<MajorProfile>
            value={major}
            setValue={setMajor}
            items={[
              {
                id: 'thc',
                label: 'THC-dominant',
              },
              {
                id: 'balanced',
                label: 'Balanced',
              },
              {
                id: 'cbd',
                label: 'CBD-dominant',
              },
            ]}
          />
        </View>

        <View style={s.card}>
          <Text style={s.section}>Personalization</Text>
          <Text
            style={[
              s.label,
              {
                marginTop: 10,
                marginBottom: 8,
              },
            ]}
          >
            Age
          </Text>
          <RowChips<AgeBand>
            value={age}
            setValue={setAge}
            items={[
              {
                id: '21-34',
                label: '21–40',
              },
              {
                id: '35-59',
                label: '40–60',
              },
              {
                id: '60+',
                label: '60+',
              },
            ]}
          />
          <Text
            style={[
              s.label,
              {
                marginTop: 10,
                marginBottom: 8,
              },
            ]}
          >
            Weight
          </Text>
          <RowChips<WeightBand>
            value={weight}
            setValue={setWeight}
            items={[
              {
                id: '<135',
                label: '<140 lb',
              },
              {
                id: '135-200',
                label: '140–200 lb',
              },
              {
                id: '>200',
                label: '>200 lb',
              },
            ]}
          />
          <Text
            style={[
              s.label,
              {
                marginTop: 10,
                marginBottom: 8,
              },
            ]}
          >
            Session intensity
          </Text>
          <RowChips<Intensity>
            value={intensity}
            setValue={setIntensity}
            items={[
              { id: 'low', label: 'Low' },
              {
                id: 'medium',
                label: 'Medium',
              },
              { id: 'high', label: 'High' },
            ]}
          />
          <Text
            style={[
              s.label,
              {
                marginTop: 10,
                marginBottom: 8,
              },
            ]}
          >
            Tolerance
          </Text>
          <RowChips<Tolerance>
            value={tolerance}
            setValue={setTolerance}
            items={[
              { id: 'low', label: 'Low' },
              {
                id: 'moderate',
                label: 'Moderate',
              },
              { id: 'high', label: 'High' },
            ]}
          />
        </View>

        <View style={[s.card, { marginTop: 12 }]}>
          <Text
            style={[s.section, { marginTop: 8 }]}
          >
            Adaptive Therapeutic Index
          </Text>
          <View style={s.barBg}>
            <View
              style={[
                s.barFg,
                {
                  width: `${ati}%`,
                  backgroundColor: '#7d9aea',
                },
              ]}
            />
          </View>
          <Text style={s.hint}>
            {ati}% of daily plan
          </Text>

          <Text
            style={[
              s.section,
              { marginTop: 12 },
            ]}
          >
            Cannabinoid Tracker
          </Text>
          <Bar
            label="THC"
            value={Math.max(
              0,
              Math.round(thcUsed),
            )}
            max={capTHC}
            color={'#3c9d43'}
          />
          <Bar
            label="Non-THC"
            value={Math.max(
              0,
              Math.round(nonThcUsed),
            )}
            max={nonThcGoal}
            color={'#f79f58'}
          />
          <Text style={s.hint}>
            Total:{' '}
            {Math.round(thcUsed + nonThcUsed)} mg /
            goal{' '}
            {Math.round(
              capTHC + nonThcGoal,
            )}{' '}
            mg
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            Your Recommended Regimen
          </Text>
          <View style={s.rowCards}>
            <View style={s.regimenCard}>
              <Text style={s.regimenTitle}>
                AM
              </Text>
              {useCapsule && (
                <Image
                  source={amCapImage}
                  style={s.bottle}
                  resizeMode="contain"
                />
              )}
              {useCapsule && (
                <Text style={s.body}>
                  Capsules:{' '}
                  <Text style={s.bold}>
                    {Math.max(0, capsAm)}
                  </Text>
                </Text>
              )}
            </View>
            <View style={s.regimenCard}>
              <Text style={s.regimenTitle}>
                PM
              </Text>
              {useCapsule && (
                <Image
                  source={pmCapImage}
                  style={s.bottle}
                  resizeMode="contain"
                />
              )}
              {useCapsule && (
                <Text style={s.body}>
                  Capsules:{' '}
                  <Text style={s.bold}>
                    {Math.max(0, capsPm)}
                  </Text>
                </Text>
              )}
            </View>
            <View style={s.regimenCard}>
              <Text style={s.regimenTitle}>
                Bedtime
              </Text>
              {useCapsule && nightGoal && (
                <Image
                  source={bedCapImage}
                  style={s.bottle}
                  resizeMode="contain"
                />
              )}
              {useCapsule && (
                <Text style={s.body}>
                  Capsules:{' '}
                  <Text style={s.bold}>
                    {Math.max(0, capsBed)}
                  </Text>
                </Text>
              )}
            </View>
          </View>
          <Text
            style={[s.hint, { marginTop: 8 }]}
          >
            Fast-acting methods (sprays & puffs)
            are fit under your daily THC cap, and
            are listed in pairing section below.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            Recommended CARTA Pairings
          </Text>
          <View style={s.pairRow}>
            {useBooster && (
              <View style={s.pairItem}>
                <Image
                  source={IMAGES.booster_spray}
                  style={s.pairImg}
                  resizeMode="contain"
                />
                <Text style={s.pairLabel}>
                  Booster (non-THC)
                </Text>
                <Text style={s.pairMeta}>
                  {Math.max(
                    0,
                    boosterSuggested,
                  )}{' '}
                  sprays / day
                </Text>
              </View>
            )}
            {useStacker && (
              <View style={s.pairItem}>
                <Image
                  source={IMAGES.stacker_spray}
                  style={s.pairImg}
                  resizeMode="contain"
                />
                <Text style={s.pairLabel}>
                  THC Stacker
                </Text>
                <Text style={s.pairMeta}>
                  {Math.max(
                    0,
                    fittedSprays,
                  )}{' '}
                  sprays / day
                </Text>
              </View>
            )}
            {useInhalable &&
              inhalableAllowed && (
                <View style={s.pairItem}>
                  {inhImage && (
                    <Image
                      source={inhImage}
                      style={s.pairImg}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={s.pairLabel}>
                    {inhType
                      .charAt(0)
                      .toUpperCase() +
                      inhType.slice(1)}{' '}
                    ({inhPotency})
                  </Text>
                  <Text style={s.pairMeta}>
                    {Math.max(
                      0,
                      fittedPuffs,
                    )}{' '}
                    puffs{' '}
                    {nightGoal ? '(bedtime)' : ''}
                  </Text>
                </View>
              )}
          </View>
        </View>

        <View
          style={[s.card, { marginBottom: 32 }]}
        >
          <Text style={s.section}>
            Why this plan?
          </Text>
          <Text style={s.body}>
            Capsules provide steady, non-THC
            support for daytime clarity and evening
            wind-down. Stacker (THC) and
            inhalables add quick onset relief when
            needed. We begin conservatively
            (especially for naïve users), limit
            capsules to a clinician-set maximum by
            tolerance, and fit all fast-acting THC
            under a daily cap. As your Adaptive
            Therapeutic Index (ATI) increases with
            stable, well-tolerated sessions, the
            plan can scale within those guardrails.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DEEP },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomColor: BORDER,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(18, 31, 26, 0.9)',
    marginBottom: 0,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
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
    marginBottom: 4,
  },
  title: {
    color: GOLD,
    fontSize: 26,
    fontWeight: '800',
  },
  subTitle: {
    color: INK,
    fontSize: 14,
    marginTop: 10,
  },

  content: { padding: 16, paddingBottom: 32 },
  h1: {
    color: GOLD,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 12,
    marginTop: 8,
  },
  body: {
    color: INK,
    fontSize: 14,
    lineHeight: 20,
    ...(Platform.select({
      ios: { fontFamily: 'Inter_400Regular' },
      android: { fontFamily: 'monospace' },
    }) as object),
  },
  card: {
    backgroundColor: CARD,
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  section: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  label: { color: INK, fontSize: 14, fontWeight: '600' },
  hint: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  bold: { fontWeight: '700', color: INK },

  row: { flexDirection: 'row', gap: 8 },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderColor: GOLD,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  chipOn: { backgroundColor: GOLD },
  chipText: { color: INK, fontSize: 14 },
  chipTextOn: { color: '#0E1A16', fontWeight: '700' },
  pressed: { opacity: 0.7 },

  barWrap: {
    marginTop: 4,
    marginBottom: 6,
  },
  barBg: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#1D2A25',
    overflow: 'hidden',
  },
  barFg: {
    height: 10,
    borderRadius: 6,
    backgroundColor: GOLD,
  },

  rowCards: { flexDirection: 'row', gap: 10 },
  regimenCard: {
    flex: 1,
    backgroundColor: '#0C1612',
    borderRadius: 12,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  regimenTitle: {
    color: GOLD,
    fontWeight: '800',
    marginBottom: 6,
    fontSize: 14,
  },
  bottle: {
    width: '100%',
    height: 96,
    marginBottom: 6,
  },

  pairRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  pairItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0C1612',
    borderRadius: 12,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  pairImg: {
    width: '100%',
    height: 84,
    marginBottom: 6,
  },
  pairLabel: {
    color: INK,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  pairMeta: {
    color: MUTED,
    fontSize: 12,
    textAlign: 'center',
  },
});
