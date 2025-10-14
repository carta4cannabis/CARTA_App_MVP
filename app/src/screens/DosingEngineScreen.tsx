// app/src/screens/DosingEngineScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/* ========= Types ========= */
type DayGoal =
  | 'Calm & Focus'
  | 'Mood & Uplift'
  | 'Mobility & Function'
  | 'Digestive Support'
  | 'Metabolic Wellness'
  | 'Mind & Memory';

type NightGoal = 'Rest' | 'Intimacy';

type MethodId = 'capsule' | 'stacker' | 'booster' | 'inhalable' | 'topical';
type InhalableKind = 'flower' | 'vape' | 'dab';
type Potency = 'low' | 'mid' | 'high';

type AgeRange = '21-34' | '35-59' | '60+';
type WeightRange = '<135' | '135-200' | '>200';

type Intensity = 'Low' | 'Moderate' | 'High';
type Tolerance = 'New' | 'Occasional' | 'Tolerant';

/* ========= Product images (update paths if needed) ========= */
const IMAGES = {
  calm_focus: require('../../assets/products/calm_focus_daytime.png'),
  mood_uplift: require('../../assets/products/mood_uplift_daytime.png'),
  mobility: require('../../assets/products/mobility_function.png'),
  digestive: require('../../assets/products/digestive_support.png'),
  metabolic: require('../../assets/products/metabolic_wellness.png'),
  mind_memory: require('../../assets/products/mind_memory.png'),
  rest_restore: require('../../assets/products/rest_restore_nighttime.png'),
  intimacy_capsule: require('../../assets/products/intimacy_vitality_capsule.png'),

  stacker: require('../../assets/products/stacker_spray.png'),
  booster: require('../../assets/products/booster_spray.png'),
  vape_cart: require('../../assets/products/vape_cart.png'),
  flower: require('../../assets/products/flower.jpg'),
  // note: no dab image yet
};

/* ========= Tunables / heuristics ========= */
// Non-THC per capsule (sum of non-THC cannabinoids)
const NON_THC_MG_PER_CAP = 85;

// Non-THC per booster spray (set to your formulation)
const NON_THC_MG_PER_BOOSTER_SPRAY = 6;

// THC per stacker spray (set to your formulation)
const THC_MG_PER_STACKER_SPRAY = 2.0;

// Inhalable potency multipliers
const POT_MULT: Record<Potency, number> = { low: 0.7, mid: 1.0, high: 1.3 };

// THC per puff baseline (mid potency). Vape > flower, Dab >> vape.
const THC_PER_PUFF_BASE: Record<InhalableKind, number> = {
  flower: 3.0,
  vape: 4.5,
  dab: 8.0,
};

// Daily planning targets
const THC_CAP_MG = 130;       // soft cap THC/day
const NON_THC_GOAL_MG = 260;  // target non-THC/day

// Demographic / session factors
const weightFactor = (w: WeightRange) =>
  w === '<135' ? 0.9 : w === '135-200' ? 1.0 : 1.2;
const ageFactor = (a: AgeRange) => (a === '60+' ? 0.92 : 1.0);
const intensityFactor = (i: Intensity) => (i === 'Low' ? 0.9 : i === 'High' ? 1.15 : 1.0);
const toleranceFactor = (t: Tolerance) => (t === 'New' ? 0.9 : t === 'Tolerant' ? 1.25 : 1.0);

/* ========= Helpers ========= */
const GOAL_TO_IMAGE: Record<DayGoal, any> = {
  'Calm & Focus': IMAGES.calm_focus,
  'Mood & Uplift': IMAGES.mood_uplift,
  'Mobility & Function': IMAGES.mobility,
  'Digestive Support': IMAGES.digestive,
  'Metabolic Wellness': IMAGES.metabolic,
  'Mind & Memory': IMAGES.mind_memory,
};

const GOAL_PRIORITY: DayGoal[] = [
  'Mood & Uplift',
  'Calm & Focus',
  'Metabolic Wellness',
  'Mobility & Function',
  'Mind & Memory',
  'Digestive Support',
];

function cap(s: string) { return s.slice(0, 1).toUpperCase() + s.slice(1); }
function plural(n: number) { return n === 1 ? '' : 's'; }
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
function fmtMg(n: number) { return `${(Math.round(n * 10) / 10).toFixed(1)} mg`; }

/* ========= Screen ========= */
export default function DosingEngineScreen() {
  const insets = useSafeAreaInsets();

  // Goals
  const [dayGoals, setDayGoals] = useState<DayGoal[]>(['Calm & Focus']);
  const [night, setNight] = useState<NightGoal>('Rest');

  // Methods
  const [methods, setMethods] = useState<MethodId[]>(['capsule', 'stacker']);
  const [inhType, setInhType] = useState<InhalableKind>('flower');
  const [potency, setPotency] = useState<Potency>('mid');

  // Demographics
  const [age, setAge] = useState<AgeRange>('21-34');
  const [weight, setWeight] = useState<WeightRange>('135-200');

  // Session
  const [intensity, setIntensity] = useState<Intensity>('Moderate');
  const [tolerance, setTolerance] = useState<Tolerance>('Occasional');

  // Overall multiplier
  const multipliers = useMemo(
    () =>
      weightFactor(weight) *
      ageFactor(age) *
      intensityFactor(intensity) *
      toleranceFactor(tolerance),
    [weight, age, intensity, tolerance]
  );

  // Capsule picks: if only one day goal chosen, use it for BOTH AM and PM
  const amCap = useMemo(() => {
    if (dayGoals.length === 1) {
      const g = dayGoals[0];
      return { title: g, image: GOAL_TO_IMAGE[g] };
    }
    const g = dayGoals[0] ?? GOAL_PRIORITY[0];
    return { title: g, image: GOAL_TO_IMAGE[g] };
  }, [dayGoals]);

  const pmCap = useMemo(() => {
    if (dayGoals.length === 1) {
      const g = dayGoals[0];
      return { title: g, image: GOAL_TO_IMAGE[g] };
    }
    if (dayGoals[1]) {
      const g = dayGoals[1];
      return { title: g, image: GOAL_TO_IMAGE[g] };
    }
    const alt = GOAL_PRIORITY.find((g) => g !== dayGoals[0]) ?? dayGoals[0] ?? GOAL_PRIORITY[1];
    return { title: alt, image: GOAL_TO_IMAGE[alt] };
  }, [dayGoals]);

  const hsCap = useMemo(() => {
    const title = night === 'Rest' ? 'Rest Restore' : 'Intimacy Vitality';
    return { title, image: night === 'Rest' ? IMAGES.rest_restore : IMAGES.intimacy_capsule };
  }, [night]);

  // Compute regimen with cannabinoid accounting
  const plan = useMemo(() => {
    // Capsules (non-THC)
    const am = Math.max(1, Math.round(1 * multipliers));
    const pm = Math.max(1, Math.round(1 * multipliers));
    const hs = Math.max(1, Math.round(1 * multipliers));
    const nonThcFromCaps = (am + pm + hs) * NON_THC_MG_PER_CAP;

    // Booster (non-THC) toward NON_THC_GOAL — ensure we show >=1 if there's any remaining gap
    let boosterSprays = 0;
    if (methods.includes('booster')) {
      const remainingNonThc = Math.max(0, NON_THC_GOAL_MG - nonThcFromCaps);
      let est = Math.ceil((remainingNonThc / NON_THC_MG_PER_BOOSTER_SPRAY) * 0.6);
      if (remainingNonThc > 0) est = Math.max(est, 1);
      boosterSprays = clamp(est, 0, 12);
    }
    const nonThcFromBooster = boosterSprays * NON_THC_MG_PER_BOOSTER_SPRAY;

    // Stacker + Inhalable (THC) capped by THC_CAP_MG
    let wishStacker = methods.includes('stacker') ? Math.round(4 * multipliers) : 0;
    let wishPuffs =
      methods.includes('inhalable')
        ? Math.round(4 * multipliers * (inhType === 'flower' ? 1.0 : inhType === 'vape' ? 0.75 : 0.5))
        : 0;
    wishPuffs = Math.max(0, wishPuffs);

    const thcPerPuff = THC_PER_PUFF_BASE[inhType] * POT_MULT[potency];
    const wishThc = wishStacker * THC_MG_PER_STACKER_SPRAY + wishPuffs * thcPerPuff;

    let stackerSprays = wishStacker;
    let puffs = wishPuffs;
    if (wishThc > THC_CAP_MG && wishThc > 0) {
      const k = THC_CAP_MG / wishThc;
      stackerSprays = Math.round(wishStacker * k);
      puffs = Math.round(wishPuffs * k);
    }

    const thcFromStacker = stackerSprays * THC_MG_PER_STACKER_SPRAY;
    const thcFromInh = puffs * thcPerPuff;

    const thcMg = thcFromStacker + thcFromInh;
    const nonThcMg = nonThcFromCaps + nonThcFromBooster;
    const totalMg = thcMg + nonThcMg;

    const thcFrac = THC_CAP_MG > 0 ? thcMg / THC_CAP_MG : 0;
    const nonThcFrac = NON_THC_GOAL_MG > 0 ? nonThcMg / NON_THC_GOAL_MG : 0;
    const atiPercent = Math.min(100, Math.round(((thcFrac + nonThcFrac) / 2) * 100));

    return {
      // capsules & sprays/puffs
      am, pm, hs,
      stackerSprays, boosterSprays, puffs,
      // accounting
      thcMg, nonThcMg, totalMg,
      thcCap: THC_CAP_MG,
      nonThcGoal: NON_THC_GOAL_MG,
      totalGoal: THC_CAP_MG + NON_THC_GOAL_MG,
      thcPerPuff,
      // progress
      atiPercent,
    };
  }, [multipliers, methods, inhType, potency, night]);

  // Pairings: only show what is selected (dab: no image)
  const pairings = useMemo(() => {
    const list: { key: string; title: string; sub?: string; note?: string; image?: any }[] = [];
    if (methods.includes('inhalable')) {
      list.push({
        key: 'inh',
        title:
          inhType === 'flower' ? 'Balanced Chemotype Flower' :
          inhType === 'vape'   ? 'Day Uplift Cart' :
                                 'Precision Dab',
        image: inhType === 'dab' ? undefined : (inhType === 'flower' ? IMAGES.flower : IMAGES.vape_cart),
        sub: `${plan.puffs} puff${plural(plan.puffs)} • ${cap(potency)}`,
        note:
          inhType === 'flower' ? 'Full-spectrum, steadier build.' :
          inhType === 'vape'   ? 'Fast onset, precise bursts.' :
                                 'Strongest form—use sparingly.',
      });
    }
    if (methods.includes('stacker')) {
      list.push({
        key: 'stacker',
        title: 'THC Stacker Spray',
        image: IMAGES.stacker,
        sub: `${plan.stackerSprays} spray${plural(plan.stackerSprays)} • PRN`,
        note: 'Adds measured THC in small steps.',
      });
    }
    if (methods.includes('booster')) {
      list.push({
        key: 'booster',
        title: 'Universal Booster Spray',
        image: IMAGES.booster,
        sub: `${plan.boosterSprays} spray${plural(plan.boosterSprays)} • PRN`,
        note: 'Non-THC modulator to round out effects.',
      });
    }
    return list;
  }, [methods, inhType, potency, plan]);

  /* ======= UI ======= */
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={[s.container, { paddingTop: Math.max(12, insets.top * 0.25) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 8 }}>
          <Text style={s.h1}>Chemotype-Guided Dosing</Text>
          <Text style={s.sub}>
            Pick goals & methods. We’ll suggest AM / PM / Bedtime capsules and only the CARTA pairings you selected.
          </Text>
        </View>

        {/* ATI + Tracker */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Adaptive Therapeutic Index</Text>
          <Bar percent={plan.atiPercent} />
          <Text style={s.dim}>{plan.atiPercent}% of daily plan</Text>

          <View style={{ marginTop: 14 }}>
            <Text style={s.sectionHeading}>Cannabinoid Tracker</Text>
            <Text style={s.mono}>THC: {fmtMg(plan.thcMg)} / cap {fmtMg(plan.thcCap)}</Text>
            <Text style={s.mono}>Non-THC: {fmtMg(plan.nonThcMg)} / goal {fmtMg(plan.nonThcGoal)}</Text>
            <Text style={s.mono}>Total: {fmtMg(plan.totalMg)} / goal {fmtMg(plan.totalGoal)}</Text>
          </View>
        </View>

        {/* Day goals */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Intended Therapeutic Profile (Daytime)</Text>
          <Row wrap>
            {(['Calm & Focus','Mood & Uplift','Mobility & Function','Digestive Support','Metabolic Wellness','Mind & Memory'] as DayGoal[])
              .map((g) => (
                <Chip
                  key={g}
                  label={g}
                  active={dayGoals.includes(g)}
                  onPress={() =>
                    setDayGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])
                  }
                />
              ))}
          </Row>
        </View>

        {/* Night goal */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Night Goal</Text>
          <Row>
            {(['Rest','Intimacy'] as NightGoal[]).map((v) => (
              <Chip key={v} label={v} active={night === v} onPress={() => setNight(v)} />
            ))}
          </Row>
        </View>

        {/* Demographics */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Age & Weight</Text>

          <Text style={s.label}>Age</Text>
          <Row>
            {(['21-34','35-59','60+'] as AgeRange[]).map((v) => (
              <Chip key={v} label={v} active={age === v} onPress={() => setAge(v)} />
            ))}
          </Row>

          <Text style={[s.label, { marginTop: 12 }]}>Weight (lbs)</Text>
          <Row>
            {(['<135','135-200','>200'] as WeightRange[]).map((v) => (
              <Chip key={v} label={v} active={weight === v} onPress={() => setWeight(v)} />
            ))}
          </Row>
        </View>

        {/* Session */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Session Intensity</Text>
          <Row>
            {(['Low','Moderate','High'] as Intensity[]).map((v) => (
              <Chip key={v} label={v} active={intensity === v} onPress={() => setIntensity(v)} />
            ))}
          </Row>

          <Text style={[s.cardTitle, { marginTop: 12 }]}>Tolerance</Text>
          <Row>
            {(['New','Occasional','Tolerant'] as Tolerance[]).map((v) => (
              <Chip key={v} label={v} active={tolerance === v} onPress={() => setTolerance(v)} />
            ))}
          </Row>
        </View>

        {/* Methods */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Consumption Methods (select any)</Text>
          <Row wrap>
            {([
              ['capsule', 'Capsule'],
              ['stacker', 'Stacker Spray'],
              ['booster', 'Booster Spray'],
              ['inhalable', 'Inhalable'],
              ['topical', 'Topical'],
            ] as [MethodId, string][])
              .map(([id, label]) => (
                <Chip
                  key={id}
                  label={label}
                  active={methods.includes(id)}
                  onPress={() =>
                    setMethods((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
                  }
                />
              ))}
          </Row>

          {methods.includes('inhalable') && (
            <>
              <Text style={[s.label, { marginTop: 12 }]}>Inhalable Type</Text>
              <Row>
                {(['flower','vape','dab'] as InhalableKind[]).map((k) => (
                  <Chip key={k} label={cap(k)} active={inhType === k} onPress={() => setInhType(k)} />
                ))}
              </Row>

              <Text style={[s.label, { marginTop: 12 }]}>Potency</Text>
              <Row>
                {(['low','mid','high'] as Potency[]).map((p) => (
                  <Chip key={p} label={cap(p)} active={potency === p} onPress={() => setPotency(p)} />
                ))}
              </Row>
            </>
          )}
        </View>

        {/* Regimen */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Your Recommended Regimen</Text>
          <Row wrap style={{ marginTop: 6 }}>
            <RegimenCard title="AM" image={amCap.image} main={amCap.title} sub={`${plan.am} capsule${plural(plan.am)}`} />
            <RegimenCard title="PM" image={pmCap.image} main={pmCap.title} sub={`${plan.pm} capsule${plural(plan.pm)}`} />
            <RegimenCard title="Bedtime" image={hsCap.image} main={hsCap.title} sub={`${plan.hs} capsule${plural(plan.hs)}`} />
          </Row>
        </View>

        {/* Pairings — only what’s selected (dab shows no image) */}
        {(() => {
          const cards = pairings;
          if (!cards.length) return null;
          return (
            <View style={s.card}>
              <Text style={s.cardTitle}>CARTA Pairings (selected)</Text>
              <Row wrap style={{ marginTop: 6 }}>
                {cards.map((p) => (
                  <View key={p.key} style={s.mini}>
                    {!!p.image && <Image source={p.image} style={s.miniImg} resizeMode="contain" />}
                    <Text style={s.miniTitle}>{p.title}</Text>
                    {!!p.sub && <Text style={s.miniSub}>{p.sub}</Text>}
                    {!!p.note && <Text style={s.miniNote}>{p.note}</Text>}
                  </View>
                ))}
              </Row>
            </View>
          );
        })()}

        {/* Explainer */}
        <View style={[s.card, { marginBottom: 32 }]}>
          <Text style={s.cardTitle}>Why this plan?</Text>
          <Text style={s.body}>
            Capsules deliver steady, non-THC cannabinoids for daytime clarity and nightly recovery.
            Stacker adds small, measurable THC steps; Booster modulates non-THC toward your daily
            target. Puff/spray counts are balanced together so total THC stays within your cap and
            non-THC trends toward goal. Inhalable dosing accounts for form (vape &gt; flower; dab &gt; vape)
            and the chosen potency. Age, weight, intensity, and tolerance gently tune totals.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ========= Small UI bits ========= */
function Bar({ percent }: { percent: number }) {
  return (
    <View style={s.barOuter}>
      <View style={[s.barInner, { width: `${clamp(percent, 0, 100)}%` }]} />
    </View>
  );
}
function Row({ children, wrap = false, style }: { children: React.ReactNode; wrap?: boolean; style?: any; }) {
  return <View style={[{ flexDirection: 'row', gap: 8, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>{children}</View>;
}
function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void; }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipOn]}>
      <Text style={[s.chipText, active && s.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}
function RegimenCard({ title, image, main, sub }: { title: string; image: any; main: string; sub: string; }) {
  return (
    <View style={s.regimen}>
      <Text style={s.regimenTitle}>{title}</Text>
      <Image source={image} style={s.regimenImg} resizeMode="contain" />
      <Text style={s.regimenMain}>{main}</Text>
      <Text style={s.regimenSub}>{sub}</Text>
    </View>
  );
}


/* ========= Styles ========= */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1A16' },
  container: { paddingHorizontal: 16, paddingBottom: 32 },

  h1: { color: '#E9EFEA', fontSize: 28, fontWeight: '800', letterSpacing: 0.2 },
  sub: { color: '#AFC0B8', marginTop: 4, fontSize: 15, lineHeight: 20 },

  card: {
    borderWidth: 1,
    borderColor: '#334137',
    backgroundColor: '#0F1A16',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  cardTitle: { color: '#E9EFEA', fontWeight: '800', fontSize: 16, marginBottom: 8 },

  sectionHeading: { color: '#E9EFEA', fontWeight: '700', marginBottom: 6, marginTop: 2 },
  label: { color: '#AFC0B8', fontSize: 13, marginBottom: 6 },

  barOuter: {
    height: 12,
    borderRadius: 12,
    backgroundColor: '#1D2A24',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334137',
  },
  barInner: { height: '100%', backgroundColor: '#C9A86A' },
  dim: { color: '#AFC0B8', marginTop: 8 },

  mono: {
    color: '#E9EFEA',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) ?? undefined,
    marginTop: 2,
  },

  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#9FB0A8',
    marginRight: 4,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: '#C9A86A', borderColor: '#C9A86A' },
  chipText: { color: '#E9EFEA', fontWeight: '700' },
  chipTextOn: { color: '#112018' },

  regimen: {
    width: 160,
    borderWidth: 1,
    borderColor: '#334137',
    borderRadius: 12,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#0F1A16',
  },
  regimenTitle: { color: '#AFC0B8', fontWeight: '800', marginBottom: 4 },
  regimenImg: { width: '100%', height: 96, marginBottom: 6 },
  regimenMain: { color: '#E9EFEA', fontWeight: '800' },
  regimenSub: { color: '#C9A86A', fontWeight: '700', marginTop: 2 },

  mini: {
    width: 180,
    borderWidth: 1,
    borderColor: '#334137',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#0F1A16',
    marginRight: 10,
    marginBottom: 10,
  },
  miniImg: { width: '100%', height: 90, marginBottom: 8 },
  miniTitle: { color: '#E9EFEA', fontWeight: '700' },
  miniSub: { color: '#C9A86A', fontWeight: '700', marginTop: 2 },
  miniNote: { color: '#AFC0B8', fontSize: 12, marginTop: 2 },

  body: { color: '#E9EFEA', fontSize: 14, lineHeight: 20 },
});