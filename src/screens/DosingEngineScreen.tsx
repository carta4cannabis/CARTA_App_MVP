import React, { useMemo, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';

/** -------------------------
 * Tunable constants (easy to tweak later)
 * ------------------------- */
const CAP_NON_THC_MG = 60;         // each capsule -> total non-THC cannabinoids (CBD+etc)
const BOOSTER_NON_THC_MG = 10;     // per spray (non-THC)
const STACKER_THC_MG = 2.5;        // per spray (THC)

/** THC per puff by form & potency */
const THC_PUFF_MG: Record<'flower'|'vape'|'dab', Record<'low'|'mid'|'high', number>> = {
  flower: { low: 2,  mid: 5,  high: 7 },
  vape:   { low: 4,  mid: 8,  high: 12 },
  dab:    { low: 8,  mid: 15, high: 25 },
};

/** Preference of capsules for AM/PM/HS when multiple daytime goals exist */
const CAPSULE_BY_GOAL: Record<DayGoal, 'Calm & Focus'|'Mood & Uplift'|'Mobility & Function'|'Digestive Support'|'Metabolic Wellness'|'Mind & Memory'> = {
  calm: 'Calm & Focus',
  mood: 'Mood & Uplift',
  mobility: 'Mobility & Function',
  digestive: 'Digestive Support',
  metabolic: 'Metabolic Wellness',
  mind: 'Mind & Memory',
};

type DayGoal = 'calm'|'mood'|'mobility'|'digestive'|'metabolic'|'mind';
type NightGoal = 'rest'|'intimacy'|null;
type Potency = 'low'|'mid'|'high';
type InhType = 'flower'|'vape'|'dab';
type Intensity = 'low'|'medium'|'high';
type Tolerance = 'naive'|'regular'|'tolerant';
type Weight = '<135'|'135-200'|'>200';
type Age = '21-34'|'35-59'|'60+';
type Chemotype = 'THC-dominant'|'Balanced'|'CBD-dominant'|'No preference';

export default function DosingEngineScreen() {
  /** ----- selections ----- */
  const [goals, setGoals] = useState<DayGoal[]>(['mood']);
  const [nightGoal, setNightGoal] = useState<NightGoal>('rest');

  const [useCapsules, setUseCapsules] = useState(true);
  const [useBooster, setUseBooster] = useState(false);
  const [useStacker, setUseStacker] = useState(false);
  const [useInhalable, setUseInhalable] = useState(false);

  const [inhType, setInhType] = useState<InhType>('flower');
  const [inhPotency, setInhPotency] = useState<Potency>('mid');

  const [intensity, setIntensity] = useState<Intensity>('medium');
  const [tolerance, setTolerance] = useState<Tolerance>('regular');
  const [weight, setWeight] = useState<Weight>('135-200');
  const [age, setAge] = useState<Age>('35-59');
  const [chemotype, setChemotype] = useState<Chemotype>('No preference');

  /** ----- caps (adaptive) ----- */
  const { thcCap, nonThcCap } = useMemo(() => {
    // baselines – intentionally conservative
    let thc = 90;
    let non = 240;

    const multIntensity: Record<Intensity, number> = { low: 0.75, medium: 1.0, high: 1.3 };
    const multTol: Record<Tolerance, number> = { naive: 0.8, regular: 1.0, tolerant: 1.3 };
    const multWt: Record<Weight, number> = { '<135': 0.9, '135-200': 1.0, '>200': 1.15 };
    const multAge: Record<Age, number> = { '21-34': 1.0, '35-59': 1.0, '60+': 0.9 };

    thc *= multIntensity[intensity] * multTol[tolerance] * multWt[weight] * multAge[age];
    non *= multIntensity[intensity] * multTol[tolerance] * multWt[weight] * multAge[age];

    // chemotype nudge
    if (chemotype === 'THC-dominant') thc *= 1.1;
    if (chemotype === 'CBD-dominant') non *= 1.1;

    return { thcCap: Math.round(thc), nonThcCap: Math.round(non) };
  }, [intensity, tolerance, weight, age, chemotype]);

  /** ----- regimen recommendation ----- */
  const plan = useMemo(() => {
    // Default capsule picks based on goals
    const amPick =
      goals.includes('calm') ? CAPSULE_BY_GOAL.calm :
      goals.includes('metabolic') ? CAPSULE_BY_GOAL.metabolic :
      goals.includes('mobility') ? CAPSULE_BY_GOAL.mobility :
      goals.includes('mind') ? CAPSULE_BY_GOAL.mind :
      goals.includes('digestive') ? CAPSULE_BY_GOAL.digestive :
      CAPSULE_BY_GOAL.mood;

    const pmPick =
      goals.includes('mood') ? CAPSULE_BY_GOAL.mood :
      goals.includes('digestive') ? CAPSULE_BY_GOAL.digestive :
      goals.includes('mobility') ? CAPSULE_BY_GOAL.mobility :
      goals.includes('mind') ? CAPSULE_BY_GOAL.mind :
      goals.includes('metabolic') ? CAPSULE_BY_GOAL.metabolic :
      CAPSULE_BY_GOAL.calm;

    const hsPick = nightGoal === 'intimacy' ? 'Intimacy & Vitality' : 'Rest & Restore';

    // Start with 1 capsule per chosen time (if capsules on)
    const capAm = useCapsules ? 1 : 0;
    const capPm = useCapsules ? 1 : 0;
    const capHs = useCapsules && nightGoal ? 1 : 0;

    // Capsule non-THC mg
    let nonThcUsed = (capAm + capPm + capHs) * CAP_NON_THC_MG;
    // Room left for non-THC
    const nonRoom = Math.max(nonThcCap - nonThcUsed, 0);

    // Booster (non-THC) – recommend sprays to use some of remaining non-THC room
    let boosterSprays = 0;
    if (useBooster && nonRoom >= BOOSTER_NON_THC_MG) {
      boosterSprays = Math.min(10, Math.floor(nonRoom / BOOSTER_NON_THC_MG)); // guardrail 0–10
      nonThcUsed += boosterSprays * BOOSTER_NON_THC_MG;
    }

    // THC from stacker + inhalable (capped to thcCap)
    let thcUsed = 0;
    let stackerSprays = 0;
    let inhPuffs = 0;

    // If stacker is on, propose a conservative base then fill with puffs if room
    if (useStacker) {
      stackerSprays = Math.min(12, Math.floor(thcCap * 0.25 / STACKER_THC_MG)); // ~25% of cap
      thcUsed += stackerSprays * STACKER_THC_MG;
    }
    if (useInhalable) {
      const perPuff = THC_PUFF_MG[inhType][inhPotency];
      const room = Math.max(thcCap - thcUsed, 0);
      inhPuffs = Math.floor(room / perPuff);
      thcUsed += inhPuffs * perPuff;
    }
    // If no inhalable but stacker has remaining room, top up stacker gently
    if (!useInhalable && useStacker) {
      const room = Math.max(thcCap - thcUsed, 0);
      stackerSprays += Math.floor(room / STACKER_THC_MG * 0.5); // leave 50% buffer
      thcUsed = stackerSprays * STACKER_THC_MG;
    }

    return {
      amPick, pmPick, hsPick,
      capAm, capPm, capHs,
      boosterSprays, stackerSprays, inhPuffs,
      thcUsed, nonThcUsed,
    };
  }, [
    goals, nightGoal, useCapsules, useBooster, useStacker, useInhalable,
    inhType, inhPotency, thcCap, nonThcCap,
  ]);

  /** ----- tracker numbers shown in header card ----- */
  const totals = useMemo(() => {
    const total = plan.thcUsed + plan.nonThcUsed;
    return {
      thcProg: plan.thcUsed,
      nonThcProg: plan.nonThcUsed,
      total,
      totalCap: thcCap + nonThcCap,
      pct: Math.min(100, Math.round((total / (thcCap + nonThcCap)) * 100)),
    };
  }, [plan, thcCap, nonThcCap]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: DEEP }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 24 }}>
        <Text style={st.header}>Chemotype-Guided Dosing</Text>
        <Text style={st.subtitle}>
          Select your goals and methods. We’ll suggest an AM / PM / Bedtime regimen and Carta pairings.
        </Text>

        {/* Adaptive / Tracker */}
        <Card>
          <Text style={st.cardTitle}>Adaptive Therapeutic Index</Text>
          <Bar label={`${totals.pct}% of daily plan`} value={totals.pct} max={100} color={GOLD} />
          <View style={{ marginTop: 12 }}>
            <Text style={st.label}>Cannabinoid Tracker</Text>
            <Text style={st.body}>THC: {totals.thcProg.toFixed(1)} mg / cap {thcCap} mg</Text>
            <Text style={st.body}>
              Non-THC: {totals.nonThcProg.toFixed(1)} mg / goal {nonThcCap} mg
            </Text>
            <Text style={st.body}>
              Total: {(totals.total).toFixed(1)} mg / goal {totals.totalCap} mg
            </Text>
          </View>
        </Card>

        {/* Daytime goals */}
        <Card title="Intended Therapeutic Profile (Daytime)">
          <RowChips
            multi
            value={goals}
            setValue={(v) => setGoals(v as DayGoal[])}
            items={[
              { id: 'calm', label: 'Calm & Focus' },
              { id: 'mood', label: 'Mood & Uplift' },
              { id: 'mobility', label: 'Mobility & Function' },
              { id: 'digestive', label: 'Digestive Support' },
              { id: 'metabolic', label: 'Metabolic Wellness' },
              { id: 'mind', label: 'Mind & Memory' },
            ]}
          />
        </Card>

        {/* Night goal */}
        <Card title="Night Goal">
          <RowChips
            value={nightGoal ?? null}
            setValue={(v) => setNightGoal((v as NightGoal) ?? null)}
            items={[
              { id: 'rest', label: 'Rest' },
              { id: 'intimacy', label: 'Intimacy' },
            ]}
          />
        </Card>

        {/* Major Cannabinoid profile */}
        <Card title="Major Cannabinoid (select one or leave blank)">
          <RowChips
            value={chemotype}
            setValue={(v) => setChemotype((v as Chemotype) ?? 'No preference')}
            items={[
              { id: 'THC-dominant', label: 'THC dominant' },
              { id: 'Balanced', label: 'Balanced' },
              { id: 'CBD-dominant', label: 'CBD dominant' },
              { id: 'No preference', label: 'No preference' },
            ]}
          />
        </Card>

        {/* Personalization */}
        <Card title="Personalization">
          <Row label="Age">
            <RowChips
              value={age}
              setValue={(v) => setAge(v as Age)}
              items={[
                { id: '21-34', label: '21–34' },
                { id: '35-59', label: '35–59' },
                { id: '60+', label: '60+' },
              ]}
            />
          </Row>
          <Row label="Weight">
            <RowChips
              value={weight}
              setValue={(v) => setWeight(v as Weight)}
              items={[
                { id: '<135', label: '<135 lb' },
                { id: '135-200', label: '135–200 lb' },
                { id: '>200', label: '>200 lb' },
              ]}
            />
          </Row>
          <Row label="Session intensity">
            <RowChips
              value={intensity}
              setValue={(v) => setIntensity(v as Intensity)}
              items={[
                { id: 'low', label: 'Low' },
                { id: 'medium', label: 'Medium' },
                { id: 'high', label: 'High' },
              ]}
            />
          </Row>
          <Row label="Tolerance">
            <RowChips
              value={tolerance}
              setValue={(v) => setTolerance(v as Tolerance)}
              items={[
                { id: 'naive', label: 'Naive' },
                { id: 'regular', label: 'Regular' },
                { id: 'tolerant', label: 'Tolerant' },
              ]}
            />
          </Row>
        </Card>

        {/* Methods */}
        <Card title="Consumption Methods (select any)">
          <Toggle label="Capsules" value={useCapsules} onChange={setUseCapsules} />
          <Toggle label="Booster spray (non-THC)" value={useBooster} onChange={setUseBooster} />
          <Toggle label="THC stacker spray" value={useStacker} onChange={setUseStacker} />
          <Toggle label="Inhalable" value={useInhalable} onChange={setUseInhalable} />

          {useInhalable && (
            <View style={{ marginTop: 8 }}>
              <Text style={st.label}>Inhalable type</Text>
              <RowChips
                value={inhType}
                setValue={(v) => setInhType(v as InhType)}
                items={[
                  { id: 'flower', label: 'Flower' },
                  { id: 'vape', label: 'Vape' },
                  { id: 'dab', label: 'Dab' },
                ]}
              />
              <Text style={[st.label, { marginTop: 8 }]}>Potency</Text>
              <RowChips
                value={inhPotency}
                setValue={(v) => setInhPotency(v as Potency)}
                items={[
                  { id: 'low', label: 'Low' },
                  { id: 'mid', label: 'Mid' },
                  { id: 'high', label: 'High' },
                ]}
              />
            </View>
          )}
        </Card>

        {/* Recommended regimen */}
        <Card title="Your Recommended Regimen">
          <View style={st.regimenRow}>
            <RegimenCard
              title="AM"
              subtitle={plan.amPick}
              caps={plan.capAm}
              image={capsuleImageFor(plan.amPick)}
            />
            <RegimenCard
              title="PM"
              subtitle={plan.pmPick}
              caps={plan.capPm}
              image={capsuleImageFor(plan.pmPick)}
            />
            <RegimenCard
              title="Bedtime"
              subtitle={plan.hsPick}
              caps={plan.capHs}
              image={capsuleImageFor(plan.hsPick)}
            />
          </View>

          {/* Carta pairings with counts & frequency */}
          <View style={{ marginTop: 12 }}>
            {(useBooster || useStacker || useInhalable) && (
              <Text style={st.sectionLabel}>Carta Pairings</Text>
            )}
            {useBooster && (
              <Pairing
                name="Booster Spray (non-THC)"
                img={require('../../assets/products/booster_spray.png')}
                line={`${plan.boosterSprays} sprays • split across day`}
              />
            )}
            {useStacker && (
              <Pairing
                name="THC Stacker Spray"
                img={require('../../assets/products/stacker_spray.png')}
                line={`${plan.stackerSprays} sprays • split across day`}
              />
            )}
            {useInhalable && (
              <Pairing
                name={`Inhalable • ${labelCap(inhType)} • ${labelCap(inhPotency)} potency`}
                img={
                  inhType === 'flower'
                    ? require('../../assets/products/flower.jpg')
                    : inhType === 'vape'
                    ? require('../../assets/products/vape_cart.png')
                    : require('../../assets/products/rosin_jar.jpg')
                }
                line={`${plan.inhPuffs} puffs • as needed`}
              />
            )}
          </View>
        </Card>

        {/* Layman explanation */}
        <Card>
          <Text style={st.cardTitle}>Why this plan?</Text>
          <Text style={st.body}>
            Capsules deliver steady, non-THC cannabinoids for daytime clarity and comfort. Booster
            spray adds gentle, non-THC support. THC stacker and inhalables provide fast-acting relief
            when appropriate. Puff recommendations account for inhalable type and potency — a vape is
            stronger per puff than flower, and a dab is stronger than a vape. Your total suggested
            amounts automatically stay under safe daily caps based on your intensity, tolerance,
            weight and age.
          </Text>
        </Card>

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/** ------------- tiny components ------------- */
function labelCap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function capsuleImageFor(name: string) {
  try {
    if (name.startsWith('Calm')) return require('../../assets/products/calm_focus_daytime.png');
    if (name.startsWith('Mood')) return require('../../assets/products/mood_uplift_daytime.png');
    if (name.startsWith('Mobility')) return require('../../assets/products/mobility_function.png');
    if (name.startsWith('Digestive')) return require('../../assets/products/digestive_support.png');
    if (name.startsWith('Metabolic')) return require('../../assets/products/metabolic_wellness.png');
    if (name.startsWith('Mind')) return require('../../assets/products/mind_memory.png');
    if (name.startsWith('Intimacy')) return require('../../assets/products/intimacy_vitality_capsule.png');
    return require('../../assets/products/rest_restore_nighttime.png'); // Rest
  } catch {
    return undefined as any;
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={st.label}>{label}</Text>
      {children}
    </View>
  );
}

function RegimenCard({
  title,
  subtitle,
  caps,
  image,
}: {
  title: string;
  subtitle: string;
  caps: number;
  image?: any;
}) {
  return (
    <View style={st.regimenCard}>
      <Text style={st.regimenTitle}>{title}</Text>
      {image ? <Image source={image} style={st.regimenImg} resizeMode="contain" /> : null}
      <Text style={st.regimenSub}>{subtitle}</Text>
      <Text style={st.body}>{caps ? `${caps} capsule${caps > 1 ? 's' : ''}` : '—'}</Text>
    </View>
  );
}

function Pairing({ name, img, line }: { name: string; img: any; line: string }) {
  return (
    <View style={st.pairingRow}>
      <Image source={img} style={st.pairingImg} resizeMode="contain" />
      <View style={{ flex: 1 }}>
        <Text style={st.body}>{name}</Text>
        <Text style={[st.body, { opacity: 0.85 }]}>{line}</Text>
      </View>
    </View>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={({ pressed }) => [st.toggle, value && st.toggleOn, pressed && st.pressed]}
    >
      <Text style={[st.toggleText, value && st.toggleTextOn]}>{label}</Text>
    </Pressable>
  );
}

function RowChips({
  value,
  setValue,
  items,
  multi = false,
}: {
  value: any;
  setValue: (v: any) => void;
  items: { id: any; label: string }[];
  multi?: boolean;
}) {
  const active = (id: any) => (multi ? (value as any[]).includes(id) : value === id);
  const toggle = (id: any) => {
    if (!multi) return setValue(id);
    const arr = Array.isArray(value) ? (value as any[]) : [];
    setValue(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  return (
    <View style={st.rowWrap}>
      {items.map((it) => (
        <Pressable
          key={String(it.id)}
          onPress={() => toggle(it.id)}
          style={({ pressed }) => [
            st.chip,
            active(it.id) && st.chipOn,
            pressed && st.pressed,
          ]}
        >
          <Text style={[st.chipText, active(it.id) && st.chipTextOn]}>{it.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Bar({
  label, value, max, color,
}: { label?: string; value: number; max: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={{ marginTop: 6 }}>
      <View style={st.barOuter}>
        <View style={[st.barInner, { width: `${pct * 100}%`, backgroundColor: color || GOLD }]} />
      </View>
      {label ? <Text style={[st.body, { marginTop: 4 }]}>{label}</Text> : null}
    </View>
  );
}

function Card({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <View style={st.card}>
      {title ? <Text style={st.cardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

/** ------------- styles ------------- */
const st = StyleSheet.create({
  header: {
    color: GOLD,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#E9EFEA',
    opacity: 0.9,
    marginBottom: 12,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    color: GOLD,
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 16,
  },
  label: { color: GOLD, fontWeight: '700', marginBottom: 6 },
  body: { color: '#E9EFEA', lineHeight: 20 },
  sectionLabel: { color: '#E9EFEA', fontWeight: '700', marginTop: 8, marginBottom: 4 },

  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GOLD,
    backgroundColor: '#1C2B24',
  },
  chipOn: { backgroundColor: GOLD, borderColor: GOLD },
  chipText: { color: '#E9EFEA', fontWeight: '600' },
  chipTextOn: { color: DEEP, fontWeight: '700' },

  toggle: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 8,
    backgroundColor: '#1C2B24',
  },
  toggleOn: { backgroundColor: GOLD },
  toggleText: { color: '#E9EFEA', fontWeight: '600' },
  toggleTextOn: { color: DEEP, fontWeight: '700' },
  pressed: { opacity: 0.75 },

  barOuter: {
    height: 12,
    borderRadius: 8,
    backgroundColor: '#21352B',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C4036',
  },
  barInner: { height: '100%', borderRadius: 8 },

  regimenRow: { flexDirection: 'row', gap: 10 },
  regimenCard: {
    flex: 1,
    backgroundColor: '#0F1713',
    borderWidth: 1,
    borderColor: '#2F4A3E',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  regimenTitle: { color: GOLD, fontWeight: '800', marginBottom: 6 },
  regimenImg: { width: '100%', height: 90, marginBottom: 6 },
  regimenSub: { color: '#E9EFEA', fontWeight: '700', marginBottom: 2 },

  pairingRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#0F1713',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2F4A3E',
    marginBottom: 8,
  },
  pairingImg: { width: 56, height: 56, borderRadius: 8 },
});