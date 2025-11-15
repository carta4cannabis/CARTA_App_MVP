// src/screens/CultivarProfileMatchingScreen.tsx

import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  ImageBackground,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import {
  useNavigation,
  NavigationProp,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { useProfiles } from '../context/ProfileContext';
import {
  loadCultivars,
  saveCultivars,
  createCultivarId,
  CultivarRecord,
} from '../utils/CultivarStorage';

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const TEXT = '#F5F5F5';
const MUTED = '#9BA6A0';
const BORDER = '#233229';
// Brand-friendly serif without extra deps
const HEADLINE_SERIF =
  Platform.select({ ios: 'Palatino', android: 'serif' }) || 'serif';

type AnyNav = any;
const BG: ImageSourcePropType = require('../assets/bg/carta_pattern.png');

type Nav = NavigationProp<any>;

type CoaForm = {
  thc: string;
  thca: string;
  cbd: string;
  cbda: string;
  cbg: string;
  cbn: string;
  thcv: string;
  cbc: string;
  limonene: string;
  myrcene: string;
  betaCaryophyllene: string;
  linalool: string;
  alphaPinene: string;
  betaPinene: string;
  humulene: string;
  terpinolene: string;
  ocimene: string;
};

type CoaNumbers = Partial<{
  thc: number;
  thca: number;
  cbd: number;
  cbda: number;
  cbg: number;
  cbn: number;
  thcv: number;
  cbc: number;
  limonene: number;
  myrcene: number;
  betaCaryophyllene: number;
  linalool: number;
  alphaPinene: number;
  betaPinene: number;
  humulene: number;
  terpinolene: number;
  ocimene: number;
}>;

type MatchingRoute = RouteProp<
  { CultivarProfileMatching: { initialCoa?: CoaNumbers } },
  'CultivarProfileMatching'
>;

type ProfileScore = {
  name: string;
  score: number;
};

type ChemotypeResult = {
  cannabinoidType: string;
  terpeneArchetype: string;
  bestFitProfile: string | null;
  topProfiles: ProfileScore[];
  rationale: string;
};

const TERP_TAGS: Record<string, string[]> = {
  limonene: ['uplift', 'mood', 'energy', 'social'],
  myrcene: ['sedation', 'body', 'rest', 'sleep'],
  'beta-caryophyllene': ['pain', 'inflammation', 'gut'],
  linalool: ['calm', 'anxiety', 'sleep'],
  'alpha-pinene': ['focus', 'clarity', 'memory'],
  'beta-pinene': ['focus', 'clarity'],
  humulene: ['appetite-control', 'inflammation'],
  terpinolene: ['stimulating', 'creative', 'energy'],
  ocimene: ['social', 'bright', 'uplift'],
};

const PROFILES: Record<
  string,
  { tags: string[]; cannabinoidPreference: string[] }
> = {
  'Calm & Focus': {
    tags: ['calm', 'anxiety', 'focus', 'clarity'],
    cannabinoidPreference: ['CBD-dominant', 'Balanced'],
  },
  'Mood & Uplift': {
    tags: ['uplift', 'mood', 'social', 'energy', 'creative'],
    cannabinoidPreference: ['THC-dominant', 'Balanced'],
  },
  'Mobility & Function': {
    tags: ['pain', 'inflammation', 'body', 'mobility'],
    cannabinoidPreference: ['THC-dominant', 'Balanced', 'CBD-dominant'],
  },
  'Digestive Support': {
    tags: ['gut', 'digestive', 'nausea', 'inflammation'],
    cannabinoidPreference: ['CBD-dominant', 'Balanced'],
  },
  'Metabolic Wellness': {
    tags: ['metabolic', 'appetite-control', 'energy'],
    cannabinoidPreference: ['CBD-dominant', 'THCV-rich', 'CBG-rich'],
  },
  'Mind & Memory': {
    tags: ['focus', 'clarity', 'memory'],
    cannabinoidPreference: ['CBD-dominant', 'CBG-rich', 'Balanced'],
  },
  'Rest & Restore': {
    tags: ['sleep', 'rest', 'sedation', 'body'],
    cannabinoidPreference: ['THC-dominant', 'Balanced', 'CBN-rich'],
  },
  'Intimacy & Vitality': {
    tags: ['social', 'mood', 'body', 'circulation'],
    cannabinoidPreference: ['THC-dominant', 'Balanced'],
  },
};

const initialForm: CoaForm = {
  thc: '',
  thca: '',
  cbd: '',
  cbda: '',
  cbg: '',
  cbn: '',
  thcv: '',
  cbc: '',
  limonene: '',
  myrcene: '',
  betaCaryophyllene: '',
  linalool: '',
  alphaPinene: '',
  betaPinene: '',
  humulene: '',
  terpinolene: '',
  ocimene: '',
};

function toNum(v: string): number {
  const n = parseFloat(v.replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function classifyChemotype(form: CoaForm): ChemotypeResult {
  const thca = toNum(form.thca);
  const thc = toNum(form.thc);
  const cbda = toNum(form.cbda);
  const cbd = toNum(form.cbd);
  const cbg = toNum(form.cbg);
  const cbn = toNum(form.cbn);
  const thcv = toNum(form.thcv);
  const cbc = toNum(form.cbc);

  const totalTHC = thca * 0.877 + thc;
  const totalCBD = cbda * 0.877 + cbd;
  const ratioTHCtoCBD = totalTHC / Math.max(totalCBD, 0.01);

  let cannabinoidType = 'Unclassified';
  if (totalTHC >= 5 && ratioTHCtoCBD >= 3) {
    cannabinoidType = 'THC-dominant (Type I)';
  } else if (
    totalTHC >= 3 &&
    totalCBD >= 3 &&
    ratioTHCtoCBD >= 0.3 &&
    ratioTHCtoCBD <= 3
  ) {
    cannabinoidType = 'Balanced THC:CBD (Type II)';
  } else if (totalCBD >= 5 && ratioTHCtoCBD <= 0.3) {
    cannabinoidType = 'CBD-dominant (Type III)';
  }

  const modifiers: string[] = [];
  if (cbg >= 2) modifiers.push('CBG-rich');
  if (cbn >= 1) modifiers.push('CBN-rich');
  if (thcv >= 0.5) modifiers.push('THCV-rich');
  if (cbc >= 1) modifiers.push('CBC-rich');

  if (modifiers.length > 0 && cannabinoidType !== 'Unclassified') {
    cannabinoidType = `${cannabinoidType}, ${modifiers.join(', ')}`;
  } else if (modifiers.length > 0) {
    cannabinoidType = modifiers.join(', ');
  }

  const terpList = [
    { key: 'limonene', label: 'Limonene', value: toNum(form.limonene) },
    { key: 'myrcene', label: 'Myrcene', value: toNum(form.myrcene) },
    {
      key: 'beta-caryophyllene',
      label: 'β-Caryophyllene',
      value: toNum(form.betaCaryophyllene),
    },
    { key: 'linalool', label: 'Linalool', value: toNum(form.linalool) },
    {
      key: 'alpha-pinene',
      label: 'α-Pinene',
      value: toNum(form.alphaPinene),
    },
    {
      key: 'beta-pinene',
      label: 'β-Pinene',
      value: toNum(form.betaPinene),
    },
    { key: 'humulene', label: 'Humulene', value: toNum(form.humulene) },
    {
      key: 'terpinolene',
      label: 'Terpinolene',
      value: toNum(form.terpinolene),
    },
    { key: 'ocimene', label: 'Ocimene', value: toNum(form.ocimene) },
  ];

  const terpThreshold = 0.15;
  const activeTerps = terpList
    .filter(t => t.value >= terpThreshold)
    .sort((a, b) => b.value - a.value);

  let terpeneArchetype = 'No dominant terpene archetype detected';
  if (activeTerps.length >= 2) {
    terpeneArchetype = `${activeTerps[0].label}–${activeTerps[1].label} archetype`;
  } else if (activeTerps.length === 1) {
    terpeneArchetype = `${activeTerps[0].label}-forward archetype`;
  }

  const effectTags: string[] = [];

  const baseType =
    cannabinoidType.indexOf('THC-dominant') >= 0
      ? 'THC-dominant'
      : cannabinoidType.indexOf('CBD-dominant') >= 0
      ? 'CBD-dominant'
      : cannabinoidType.indexOf('Balanced') >= 0
      ? 'Balanced'
      : '';

  if (baseType === 'THC-dominant') {
    effectTags.push('pain', 'inflammation', 'sleep', 'body', 'euphoria');
  }
  if (baseType === 'CBD-dominant') {
    effectTags.push('calm', 'anxiety', 'inflammation', 'gut');
  }
  if (baseType === 'Balanced') {
    effectTags.push('pain', 'inflammation', 'calm', 'mood');
  }

  if (cannabinoidType.includes('CBG-rich')) {
    effectTags.push('focus', 'clarity', 'metabolic');
  }
  if (cannabinoidType.includes('CBN-rich')) {
    effectTags.push('sleep', 'rest', 'sedation');
  }
  if (cannabinoidType.includes('THCV-rich')) {
    effectTags.push('energy', 'appetite-control', 'metabolic');
  }

  activeTerps.forEach(t => {
    const tags = TERP_TAGS[t.key] || [];
    tags.forEach(tag => {
      if (!effectTags.includes(tag)) effectTags.push(tag);
    });
  });

  const topProfiles: ProfileScore[] = Object.entries(PROFILES)
    .map(([name, def]) => {
      const tagMatches = def.tags.filter(t => effectTags.includes(t)).length;
      const cannabinoidBonus = def.cannabinoidPreference.some(pref =>
        cannabinoidType.includes(pref),
      )
        ? 2
        : 0;
      return { name, score: tagMatches + cannabinoidBonus };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const bestFitProfile = topProfiles.length ? topProfiles[0].name : null;

  let rationale = '';
  if (bestFitProfile) {
    const topTerpText =
      activeTerps.length >= 2
        ? `${activeTerps[0].label.toLowerCase()} + ${activeTerps[1].label.toLowerCase()}`
        : activeTerps.length === 1
        ? activeTerps[0].label.toLowerCase()
        : 'its terpene balance';

    rationale = `This cultivar is ${cannabinoidType.toLowerCase()} with a ${terpeneArchetype
      .toLowerCase()
      .replace(' archetype', '')} profile. The combination of ${topTerpText} and its cannabinoid mix aligns most strongly with CARTA’s ${bestFitProfile} therapeutic profile, with secondary relevance for ${
      topProfiles[1]?.name ?? 'other profiles'
    }.`;
  } else {
    rationale =
      'Insufficient dominant signals from the COA to confidently match this cultivar to a specific CARTA therapeutic profile. Consider re-checking the COA values or using this cultivar more flexibly across profiles.';
  }

  return {
    cannabinoidType,
    terpeneArchetype,
    bestFitProfile,
    topProfiles,
    rationale,
  };
}

const CultivarProfileMatchingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<MatchingRoute>();
  const { activeProfile } = useProfiles();
  const profileId = activeProfile?.id ?? null;

  const [form, setForm] = useState<CoaForm>(initialForm);
  const [touched, setTouched] = useState(false);

  // save-as-cultivar state
  const [saveName, setSaveName] = useState('');
  const [saveBrand, setSaveBrand] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const result = useMemo(
    () => (touched ? classifyChemotype(form) : null),
    [form, touched],
  );

  const initialCoa = route.params?.initialCoa;

  // Hide the default stack header so we don't get double title/back
  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  // When navigated to with an initial COA (e.g. from Scanner), prefill fields
  useEffect(() => {
    if (!initialCoa) return;

    setForm(prev => ({
      ...prev,
      thc: initialCoa.thc !== undefined ? String(initialCoa.thc) : prev.thc,
      thca: initialCoa.thca !== undefined ? String(initialCoa.thca) : prev.thca,
      cbd: initialCoa.cbd !== undefined ? String(initialCoa.cbd) : prev.cbd,
      cbda: initialCoa.cbda !== undefined ? String(initialCoa.cbda) : prev.cbda,
      cbg: initialCoa.cbg !== undefined ? String(initialCoa.cbg) : prev.cbg,
      cbn: initialCoa.cbn !== undefined ? String(initialCoa.cbn) : prev.cbn,
      thcv: initialCoa.thcv !== undefined ? String(initialCoa.thcv) : prev.thcv,
      cbc: initialCoa.cbc !== undefined ? String(initialCoa.cbc) : prev.cbc,
      limonene:
        initialCoa.limonene !== undefined
          ? String(initialCoa.limonene)
          : prev.limonene,
      myrcene:
        initialCoa.myrcene !== undefined
          ? String(initialCoa.myrcene)
          : prev.myrcene,
      betaCaryophyllene:
        initialCoa.betaCaryophyllene !== undefined
          ? String(initialCoa.betaCaryophyllene)
          : prev.betaCaryophyllene,
      linalool:
        initialCoa.linalool !== undefined
          ? String(initialCoa.linalool)
          : prev.linalool,
      alphaPinene:
        initialCoa.alphaPinene !== undefined
          ? String(initialCoa.alphaPinene)
          : prev.alphaPinene,
      betaPinene:
        initialCoa.betaPinene !== undefined
          ? String(initialCoa.betaPinene)
          : prev.betaPinene,
      humulene:
        initialCoa.humulene !== undefined
          ? String(initialCoa.humulene)
          : prev.humulene,
      terpinolene:
        initialCoa.terpinolene !== undefined
          ? String(initialCoa.terpinolene)
          : prev.terpinolene,
      ocimene:
        initialCoa.ocimene !== undefined
          ? String(initialCoa.ocimene)
          : prev.ocimene,
    }));
    setTouched(true);
  }, [initialCoa]);

  const handleChange = (key: keyof CoaForm, value: string) => {
    if (!touched) setTouched(true);
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveCultivar = async () => {
    if (!result) {
      Alert.alert('No result yet', 'Enter COA values to generate a chemotype first.');
      return;
    }
    if (!saveName.trim()) {
      Alert.alert('Name required', 'Give this cultivar a name before saving.');
      return;
    }

    try {
      setSaving(true);
      const list = await loadCultivars(profileId);
      const now = new Date().toISOString();
      const record: CultivarRecord = {
        id: createCultivarId(),
        name: saveName.trim(),
        breederOrBrand: saveBrand.trim() || undefined,
        createdAt: now,
        updatedAt: now,
        cannabinoidType: result.cannabinoidType,
        terpeneArchetype: result.terpeneArchetype,
        bestFitProfiles: result.topProfiles.map(p => p.name),
        notes: saveNotes.trim() || undefined,
      };

      const next = [record, ...list];
      await saveCultivars(profileId, next);

      setSaveName('');
      setSaveBrand('');
      setSaveNotes('');
      Alert.alert('Saved', 'Cultivar saved to My Cultivars.');
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Could not save this cultivar. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ImageBackground
      source={BG}
      style={{ flex: 1 }}
      resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
      imageStyle={{ opacity: 0.5 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{'\u25C0'}</Text>
            <Text style={styles.backLabel}> Back</Text>
          </Pressable>
          <Text style={styles.title}>Cultivar Profile Matching</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Turn COAs into therapeutic insight</Text>
            <Text style={styles.introText}>
              Paste in cannabinoid and terpene values from a cultivar/strain’s COA and CARTA
              will classify its chemotype and match it to our therapeutic profiles — so you
              can see where it best fits in Calm &amp; Focus, Rest &amp; Restore,
              Mobility &amp; Function, and more.
            </Text>
            <Text style={styles.hint}>
              Tip: Use % by weight (e.g., 22.4 for THCa, 0.45 for limonene). Leave
              anything you don’t have at 0.
            </Text>
            <Pressable
              style={styles.scanBtn}
              onPress={() => navigation.navigate('Scanner' as never)}
            >
              <Text style={styles.scanBtnText}>Scan COA QR instead</Text>
            </Pressable>
          </View>

          {/* Cannabinoids */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cannabinoids (%)</Text>
            <View style={styles.grid}>
              <CoaInput
                label="THCa"
                value={form.thca}
                onChange={v => handleChange('thca', v)}
              />
              <CoaInput
                label="THC"
                value={form.thc}
                onChange={v => handleChange('thc', v)}
              />
              <CoaInput
                label="CBDa"
                value={form.cbda}
                onChange={v => handleChange('cbda', v)}
              />
              <CoaInput
                label="CBD"
                value={form.cbd}
                onChange={v => handleChange('cbd', v)}
              />
              <CoaInput
                label="CBG"
                value={form.cbg}
                onChange={v => handleChange('cbg', v)}
              />
              <CoaInput
                label="CBN"
                value={form.cbn}
                onChange={v => handleChange('cbn', v)}
              />
              <CoaInput
                label="THCV"
                value={form.thcv}
                onChange={v => handleChange('thcv', v)}
              />
              <CoaInput
                label="CBC"
                value={form.cbc}
                onChange={v => handleChange('cbc', v)}
              />
            </View>
          </View>

          {/* Terpenes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terpenes (%)</Text>
            <View style={styles.grid}>
              <CoaInput
                label="Limonene"
                value={form.limonene}
                onChange={v => handleChange('limonene', v)}
              />
              <CoaInput
                label="Myrcene"
                value={form.myrcene}
                onChange={v => handleChange('myrcene', v)}
              />
              <CoaInput
                label="β-Caryophyllene"
                value={form.betaCaryophyllene}
                onChange={v => handleChange('betaCaryophyllene', v)}
              />
              <CoaInput
                label="Linalool"
                value={form.linalool}
                onChange={v => handleChange('linalool', v)}
              />
              <CoaInput
                label="α-Pinene"
                value={form.alphaPinene}
                onChange={v => handleChange('alphaPinene', v)}
              />
              <CoaInput
                label="β-Pinene"
                value={form.betaPinene}
                onChange={v => handleChange('betaPinene', v)}
              />
              <CoaInput
                label="Humulene"
                value={form.humulene}
                onChange={v => handleChange('humulene', v)}
              />
              <CoaInput
                label="Terpinolene"
                value={form.terpinolene}
                onChange={v => handleChange('terpinolene', v)}
              />
              <CoaInput
                label="Ocimene"
                value={form.ocimene}
                onChange={v => handleChange('ocimene', v)}
              />
            </View>
          </View>

          {/* Result + Save */}
          {result ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>CARTA Interpretation</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Chemotype</Text>
                <Text style={styles.resultValue}>
                  {result.cannabinoidType || '—'}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Terpene Archetype</Text>
                <Text style={styles.resultValue}>
                  {result.terpeneArchetype || '—'}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Best-fit Profile</Text>
                <Text style={styles.resultValue}>
                  {result.bestFitProfile ?? 'No dominant profile'}
                </Text>
              </View>

              {result.topProfiles.length > 1 && (
                <View style={styles.subSection}>
                  <Text style={styles.subTitle}>Top CARTA Profiles</Text>
                  {result.topProfiles.map(p => (
                    <Text key={p.name} style={styles.profileLine}>
                      • {p.name} (score {p.score})
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.subSection}>
                <Text style={styles.subTitle}>CARTA Rationale</Text>
                <Text style={styles.rationale}>{result.rationale}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Save to My Cultivars</Text>
                <Text style={styles.saveHint}>
                  Give this cultivar a name and optional brand/notes to add it to your
                  COA library for this profile.
                </Text>
                <TextInput
                  style={styles.input}
                  value={saveName}
                  onChangeText={setSaveName}
                  placeholder="Cultivar / strain name"
                  placeholderTextColor={MUTED}
                />
                <TextInput
                  style={styles.input}
                  value={saveBrand}
                  onChangeText={setSaveBrand}
                  placeholder="Grower / brand (optional)"
                  placeholderTextColor={MUTED}
                />
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={saveNotes}
                  onChangeText={setSaveNotes}
                  placeholder="Quick notes (optional)"
                  placeholderTextColor={MUTED}
                  multiline
                />
                <Pressable
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSaveCultivar}
                  disabled={saving}
                >
                  <Text style={styles.saveBtnText}>
                    {saving ? 'Saving…' : 'Save cultivar to library'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Start entering COA values above—or scan a COA QR—to see chemotype
                classification and CARTA profile matching in real time, then save
                cultivars into your library.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const CoaInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.smallInput}
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={MUTED}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderBottomColor: BORDER,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(18, 31, 26, 0.9)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  backText: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, 
    fontSize: 14,
    marginRight: 4,
    marginBottom: 4
  },
  backLabel: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, fontSize: 15,
    fontWeight: '500',
    marginBottom: 0,
  },

  title: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, fontSize: 32,
    fontWeight: '800',
    textAlign: 'center'
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  introCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 16,
    marginTop: 20
  },
  introTitle: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  introText: {
    color: TEXT,
   fontFamily: HEADLINE_SERIF,  fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  hint: {
    color: MUTED,
    fontFamily: HEADLINE_SERIF, fontSize: 13,
    marginBottom: 14,
  },
  scanBtn: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  scanBtnText: {
    color: GOLD,
   fontFamily: HEADLINE_SERIF,  fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: GOLD,
   fontFamily: HEADLINE_SERIF,  fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
    marginTop: 12
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as any,
  inputWrapper: {
    width: '48%',
  },
  inputLabel: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontSize: 15,
    marginBottom: 4,
  },
  smallInput: {
    backgroundColor: CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontSize: 14,
  },
  resultCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 16,
  },
  resultTitle: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultRow: {
    marginBottom: 8,
  },
  resultLabel: {
    color: MUTED,
    fontFamily: HEADLINE_SERIF, fontSize: 12,
    marginBottom: 2,
  },
  resultValue: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontSize: 14,
    fontWeight: '500',
  },
  subSection: {
    marginTop: 10,
  },
  subTitle: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileLine: {
    color: TEXT,
   fontFamily: HEADLINE_SERIF,  fontSize: 13,
    marginBottom: 2,
  },
  rationale: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontSize: 13,
    lineHeight: 20,
  },
  placeholder: {
    marginTop: 8,
    padding: 12,
  },
  placeholderText: {
    color: MUTED,
   fontFamily: HEADLINE_SERIF,  fontSize: 15,
    lineHeight: 18,
  },
  input: {
    backgroundColor: CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: TEXT,
    fontFamily: HEADLINE_SERIF, fontSize: 14,
    marginBottom: 8,
  },
  notesInput: {
    height: 70,
    textAlignVertical: 'top',fontFamily: HEADLINE_SERIF, 
  },
  divider: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  saveHint: {
    color: MUTED,
   fontFamily: HEADLINE_SERIF,  fontSize: 12,
    marginBottom: 6,
  },
  saveBtn: {
    marginTop: 6,
    backgroundColor: GOLD,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: DEEP,
    fontFamily: HEADLINE_SERIF, fontSize: 14,
    fontWeight: '600',
  },
});

export default CultivarProfileMatchingScreen;
