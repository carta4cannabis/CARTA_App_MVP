// src/screens/CohortViewScreen.tsx
import React, { useCallback, useState, useLayoutEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';
import { useProfiles } from '../context/ProfileContext';
import { loadCultivars, CultivarRecord } from '../utils/CultivarStorage';

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const BORDER = '#233229';
const TEXT = '#F5F5F5';
const MUTED = '#9BA6A0';
// Brand-friendly serif without extra deps
const HEADLINE_SERIF =
  Platform.select({ ios: 'Palatino', android: 'serif' }) || 'serif';

type AnyNav = any;
const BG: ImageSourcePropType = require('../assets/bg/carta_pattern.png');

type Nav = NavigationProp<any>;

const PROFILE_NAMES = [
  'Calm & Focus',
  'Mood & Uplift',
  'Mobility & Function',
  'Digestive Support',
  'Metabolic Wellness',
  'Mind & Memory',
  'Rest & Restore',
  'Intimacy & Vitality',
];

type ProfileSummary = {
  name: string;
  sampleSize: number;
  avgPain: number | null;
  avgSleep: number | null;
  avgAnxiety: number | null;
  avgMood: number | null;
  avgFocus: number | null;
  avgOverall: number | null;
};

function avg(values: (number | undefined)[]): number | null {
  const nums = values.filter(
    v => typeof v === 'number' && !isNaN(v as number),
  ) as number[];
  if (!nums.length) return null;
  const sum = nums.reduce((acc, v) => acc + v, 0);
  return +(sum / nums.length).toFixed(1);
}

function buildSummaries(cultivars: CultivarRecord[]): ProfileSummary[] {
  const summaries: ProfileSummary[] = [];

  PROFILE_NAMES.forEach(profileName => {
    const relevant = cultivars.filter(c =>
      c.bestFitProfiles?.includes(profileName),
    );
    if (!relevant.length) return;

    const sampleSize = relevant.length;
    const avgPain = avg(relevant.map(c => c.ratings?.painRelief));
    const avgSleep = avg(relevant.map(c => c.ratings?.sleepQuality));
    const avgAnxiety = avg(relevant.map(c => c.ratings?.anxietyReduction));
    const avgMood = avg(relevant.map(c => c.ratings?.moodUplift));
    const avgFocus = avg(relevant.map(c => c.ratings?.focusClarity));
    const avgOverall = avg(relevant.map(c => c.ratings?.overall));

    if (
      avgPain === null &&
      avgSleep === null &&
      avgAnxiety === null &&
      avgMood === null &&
      avgFocus === null &&
      avgOverall === null
    ) {
      return;
    }

    summaries.push({
      name: profileName,
      sampleSize,
      avgPain,
      avgSleep,
      avgAnxiety,
      avgMood,
      avgFocus,
      avgOverall,
    });
  });

  return summaries.sort((a, b) => {
    const ao = a.avgOverall ?? 0;
    const bo = b.avgOverall ?? 0;
    return bo - ao;
  });
}

const CohortViewScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { activeProfile } = useProfiles();
  const profileId = activeProfile?.id ?? null;

  const [cultivars, setCultivars] = useState<CultivarRecord[]>([]);
  const [summaries, setSummaries] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Hide default stack header (no double back/title)
  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const run = async () => {
        setLoading(true);
        const list = await loadCultivars(profileId);
        if (cancelled) return;
        setCultivars(list);
        setSummaries(buildSummaries(list));
        setLoading(false);
      };
      run();
      return () => {
        cancelled = true;
      };
    }, [profileId]),
  );

  return (
    <ImageBackground
      source={BG}
      style={{ flex: 1 }}
      resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
      imageStyle={{ opacity: 0.5 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>{'\u25C0'}</Text>
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Cohort View</Text>
          <Text style={styles.subTitle}>
            See how your saved cultivars are performing across CARTA therapeutic
            profiles for this user.
          </Text>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View style={styles.summaryStrip}>
            <Text style={styles.summaryText}>
              Saved cultivars:{' '}
              <Text style={styles.summaryNumber}>{cultivars.length}</Text>
            </Text>
            <Text style={styles.summaryText}>
              Profiles with data:{' '}
              <Text style={styles.summaryNumber}>{summaries.length}</Text>
            </Text>
          </View>

          {loading ? (
            <Text style={styles.placeholder}>Loading cohort data…</Text>
          ) : summaries.length === 0 ? (
            <Text style={styles.placeholder}>
              No ratings yet. Rate a few cultivars in My Cultivars to unlock
              cohort insights.
            </Text>
          ) : (
            summaries.map(summary => (
              <View key={summary.name} style={styles.card}>
                <Text style={styles.cardTitle}>{summary.name}</Text>
                <Text style={styles.cardMeta}>
                  Based on {summary.sampleSize} saved cultivar
                  {summary.sampleSize === 1 ? '' : 's'}.
                </Text>

                <View style={styles.row}>
                  <Metric label="Pain relief" value={summary.avgPain} />
                  <Metric label="Sleep" value={summary.avgSleep} />
                </View>
                <View style={styles.row}>
                  <Metric label="Anxiety" value={summary.avgAnxiety} />
                  <Metric label="Mood" value={summary.avgMood} />
                </View>
                <View style={styles.row}>
                  <Metric label="Focus" value={summary.avgFocus} />
                  <Metric label="Overall" value={summary.avgOverall} />
                </View>

                <Text style={styles.hint}>
                  Scores are 0–5 averages from your cultivar ratings for this
                  profile.
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const Metric: React.FC<{ label: string; value: number | null }> = ({
  label,
  value,
}) => {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {value === null ? '—' : value.toFixed(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
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
  subTitle: { color: TEXT, fontFamily: HEADLINE_SERIF, fontSize: 16, marginTop: 14, marginBottom: 2, textAlign: 'center' },
  body: { flex: 1, fontFamily: HEADLINE_SERIF, paddingHorizontal: 16, paddingTop: 8 },
  summaryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  summaryText: { color: TEXT, fontFamily: HEADLINE_SERIF, fontSize: 15 },
  summaryNumber: { color: GOLD, fontFamily: HEADLINE_SERIF, fontWeight: '600' },
  placeholder: {
    color: MUTED,
    fontFamily: HEADLINE_SERIF, 
    fontSize: 15,
    marginTop: 12,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 10,
  },
  cardTitle: { color: TEXT, fontFamily: HEADLINE_SERIF, fontSize: 15, fontWeight: '600' },
  cardMeta: { color: MUTED, fontFamily: HEADLINE_SERIF, fontSize: 14, marginBottom: 8, marginTop: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metric: { width: '48%' },
  metricLabel: { color: MUTED, fontFamily: HEADLINE_SERIF, fontSize: 13, marginBottom: 2 },
  metricValue: { color: TEXT, fontFamily: HEADLINE_SERIF, fontSize: 15, fontWeight: '600' },
  hint: { color: MUTED, fontFamily: HEADLINE_SERIF, fontSize: 13, marginTop: 8 },
});

export default CohortViewScreen;
