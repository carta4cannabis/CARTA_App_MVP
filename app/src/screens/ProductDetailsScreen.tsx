import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { PRODUCT_BY_ID } from '../data/products';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  ProductDetails: { id: keyof typeof PRODUCT_BY_ID };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

type Meta = {
  intended: string;
  suggestedUse: string[];
  bestTime: string;
  pairings: string[];
  notes?: string[];
};

function getProfileMeta(id: keyof typeof PRODUCT_BY_ID): Meta {
  switch (id) {
    case 'calm_focus_caps':
      return {
        intended: 'Promotes calm alertness, focus, and task persistence without sedation.',
        suggestedUse: [
          'Begin with 1 capsule; assess after 60–90 minutes.',
          'Consider pairing with non-THC Booster Spray for added steadiness if needed.',
        ],
        bestTime: 'Daytime / work blocks',
        pairings: ['Universal Booster Spray', 'Uplifting inhalable (low–mid THC) if desired'],
        notes: ['Avoid combining with strong sedatives during work tasks.'],
      };
    case 'mood_uplift_caps':
      return {
        intended: 'Brightened mood, motivation, and social ease while maintaining clarity.',
        suggestedUse: ['Start with 1 capsule; increase if needed on subsequent days.'],
        bestTime: 'Daytime / social occasions',
        pairings: ['Universal Booster Spray', 'Uplifting inhalable (low–mid THC) as needed'],
      };
    case 'mobility_function_caps':
      return {
        intended: 'Daily physical comfort and ease of movement.',
        suggestedUse: [
          'Use 1 capsule in the morning; add PM dose on higher-demand days.',
        ],
        bestTime: 'AM; optional PM on active days',
        pairings: ['Universal Booster Spray', 'Balanced inhalable (mid THC) if tolerated'],
      };
    case 'digestive_support_caps':
      return {
        intended: 'Soothes GI reactivity and supports digestive comfort.',
        suggestedUse: ['Use with or after meals as needed; begin with 1 capsule.'],
        bestTime: 'With meals',
        pairings: ['Universal Booster Spray'],
      };
    case 'metabolic_wellness_caps':
      return {
        intended: 'Supports appetite rhythm and metabolic balance without stimulation.',
        suggestedUse: ['Take in the morning; consistent daily use preferred.'],
        bestTime: 'Morning',
        pairings: ['Universal Booster Spray'],
      };
    case 'mind_memory_caps':
      return {
        intended: 'Cognitive clarity, working memory, and sustained attention.',
        suggestedUse: ['Take 1 capsule 45–60 minutes before demanding tasks.'],
        bestTime: 'Daytime / study or deep work',
        pairings: ['Universal Booster Spray', 'Very low THC inhalable only if well tolerated'],
      };
    case 'rest_restore_caps':
      return {
        intended: 'Wind-down and sleep continuity support.',
        suggestedUse: ['Take 30–60 minutes before bedtime; keep routine consistent.'],
        bestTime: 'Bedtime',
        pairings: ['Universal Booster Spray', 'Relaxing inhalable (low THC) if appropriate'],
        notes: ['Avoid driving or operating machinery after use.'],
      };
    case 'intimacy_vitality_caps':
      return {
        intended: 'Circulation, confidence, and mood support for intimacy and vitality.',
        suggestedUse: ['Take 45–60 minutes prior to planned activity.'],
        bestTime: 'Flexible (pre-activity)',
        pairings: ['Universal Booster Spray', 'Optional low-dose THC Stacker Spray if desired'],
      };
    case 'thc_stacker_spray':
      return {
        intended: 'Fast-acting buccal THC layer to elevate intensity.',
        suggestedUse: [
          'Start with 1–2 sprays; wait 15–20 minutes before adding.',
          'Use to fine-tune intensity on top of a capsule base.',
        ],
        bestTime: 'Flexible',
        pairings: ['Any capsule base aligned to your goal', 'Inhalable as tolerated'],
        notes: ['Avoid driving; scale slowly to avoid over-intoxication.'],
      };
    case 'universal_booster_spray':
      return {
        intended: 'Non-THC buccal booster to gently enhance benefits without intoxication.',
        suggestedUse: ['1–4 sprays as needed; may repeat after 20–30 minutes.'],
        bestTime: 'Flexible / daytime friendly',
        pairings: ['All capsule profiles', 'Any inhalable where non-THC boost is preferred'],
      };
    default:
      return {
        intended: 'Support aligned to product goal.',
        suggestedUse: ['Use as directed on label.'],
        bestTime: 'As indicated',
        pairings: ['Compatible with capsule base and sprays'],
      };
  }
}

export default function ProductDetailsScreen({ route }: Props) {
  const product = PRODUCT_BY_ID[route.params.id];
  if (!product) {
    return (
      <View style={[s.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#E9EFEA' }}>Product not found.</Text>
      </View>
    );
  }

  const meta = getProfileMeta(route.params.id);

  return (
    <ScrollView style={s.safe} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Image source={product.image} style={s.hero} resizeMode="contain" />

      <Text style={s.title}>{product.title}</Text>
      {!!product.subtitle && <Text style={s.sub}>{product.subtitle}</Text>}

      {/* Overview */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Overview</Text>
        <Text style={s.body}>{product.description}</Text>
      </View>

      {/* Intended Effects */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Intended Effects</Text>
        <Text style={s.body}>{meta.intended}</Text>
      </View>

      {/* Composition */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Cannabinoids</Text>
        <Text style={s.body}>{product.cannabinoids.join(' • ') || '—'}</Text>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Terpenes</Text>
        <Text style={s.body}>{product.terpenes.join(' • ') || '—'}</Text>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Botanicals</Text>
        <Text style={s.body}>{product.botanicals.join(' • ') || '—'}</Text>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Nutrients</Text>
        <Text style={s.body}>{product.nutrients.join(' • ') || '—'}</Text>
      </View>

      {/* Suggested Use / Timing / Pairings */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Suggested Use</Text>
        {meta.suggestedUse.map((t, i) => (
          <Text key={i} style={s.body}>• {t}</Text>
        ))}
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Best Time of Day</Text>
        <Text style={s.body}>{meta.bestTime}</Text>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Pairings</Text>
        {meta.pairings.map((t, i) => (
          <Text key={i} style={s.body}>• {t}</Text>
        ))}
      </View>

      {!!meta.notes?.length && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Notes</Text>
          {meta.notes.map((t, i) => (
            <Text key={i} style={s.body}>• {t}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C1512' },
  hero: { width: '100%', height: 220, marginBottom: 10 },
  title: { color: '#E9EFEA', fontSize: 22, fontWeight: '700' },
  sub: { color: '#9FB0A8', marginTop: 4 },

  card: {
    backgroundColor: '#0F1E1A',
    borderWidth: 1,
    borderColor: '#1F2C27',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  cardTitle: { color: '#E9EFEA', fontWeight: '700', marginBottom: 6 },
  body: { color: '#BFD3CC', lineHeight: 20 },
});