// src/screens/CultivarDetailScreen.tsx

import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ImageBackground,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from '@react-navigation/native';
import {
  CultivarRecord,
  loadCultivars,
  saveCultivars,
  CultivarImage,
} from '../utils/CultivarStorage';
import { useProfiles } from '../context/ProfileContext';
import * as ImagePicker from 'expo-image-picker';

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const BORDER = '#233229';
const TEXT = '#F5F5F5';
const MUTED = '#9BA6A0';
const BG: ImageSourcePropType = require('../assets/bg/carta_pattern.png');

type Nav = NavigationProp<any>;

type DetailRoute = RouteProp<
  {
    CultivarDetail: { cultivarId: string };
  },
  'CultivarDetail'
>;

const ratingOptions = [0, 1, 2, 3, 4, 5];

const CultivarDetailScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { cultivarId } = route.params;
  const { activeProfile } = useProfiles();
  const profileId = activeProfile?.id ?? null;

  const [cultivar, setCultivar] = useState<CultivarRecord | null>(null);
  const [all, setAll] = useState<CultivarRecord[]>([]);
  const [notes, setNotes] = useState('');

  // Hide default stack header
  useLayoutEffect(() => {
    nav.setOptions?.({ headerShown: false });
  }, [nav]);

  useEffect(() => {
    const load = async () => {
      const list = await loadCultivars(profileId);
      const found = list.find(c => c.id === cultivarId) ?? null;
      setAll(list);
      setCultivar(found);
      setNotes(found?.notes ?? '');
    };
    load();
  }, [cultivarId, profileId]);

  const persistUpdated = async (updated: CultivarRecord) => {
    const next = all.map(c => (c.id === updated.id ? updated : c));
    setCultivar(updated);
    setAll(next);
    await saveCultivars(profileId, next);
  };

  const updateRating = async (
    field: keyof NonNullable<CultivarRecord['ratings']>,
    value: number,
  ) => {
    if (!cultivar) return;
    const updated: CultivarRecord = {
      ...cultivar,
      ratings: {
        ...(cultivar.ratings ?? {}),
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    };
    await persistUpdated(updated);
  };

  const saveNotes = async () => {
    if (!cultivar) return;
    const updated: CultivarRecord = {
      ...cultivar,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    await persistUpdated(updated);
  };

  const addImageToCultivar = async (uri: string) => {
    if (!cultivar) return;
    const img: CultivarImage = {
      uri,
      addedAt: new Date().toISOString(),
    };
    const updated: CultivarRecord = {
      ...cultivar,
      images: [...(cultivar.images ?? []), img],
      updatedAt: new Date().toISOString(),
    };
    await persistUpdated(updated);
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera permission needed',
        'Please grant camera access in your device settings to take cultivar photos.',
      );
      return false;
    }
    return true;
  };

  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photos permission needed',
        'Please grant photo library access to attach cultivar images.',
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const ok = await requestCameraPermission();
    if (!ok) return;
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await addImageToCultivar(result.assets[0].uri);
    }
  };

  const handlePickFromGallery = async () => {
    const ok = await requestMediaPermission();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await addImageToCultivar(result.assets[0].uri);
    }
  };

  if (!cultivar) {
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
              onPress={() => nav.goBack()}
              style={styles.backBtn}
            >
              <Text style={styles.backText}>{'\u25C0'}</Text>
              <Text style={styles.backLabel}>Back</Text>
            </Pressable>
            <Text style={styles.title}>Cultivar details</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.placeholder}>Cultivar not found.</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={BG}
      style={{ flex: 1 }}
      resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
      imageStyle={{ opacity: 0.5 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{'\u25C0'}</Text>
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.title}>{cultivar.name}</Text>
          {cultivar.breederOrBrand && (
            <Text style={styles.subTitle}>{cultivar.breederOrBrand}</Text>
          )}
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Images */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Photos</Text>
            {cultivar.images && cultivar.images.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cultivar.images.map(img => (
                  <Image
                    key={img.addedAt}
                    source={{ uri: img.uri }}
                    style={styles.image}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.placeholderSmall}>
                No images yet. Add a photo of the flower, jar, or package.
              </Text>
            )}

            <View style={styles.imageButtonsRow}>
              <Pressable style={styles.secondaryBtn} onPress={handleTakePhoto}>
                <Text style={styles.secondaryBtnText}>Take photo</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryBtn}
                onPress={handlePickFromGallery}
              >
                <Text style={styles.secondaryBtnText}>
                  Choose from gallery
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Info card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Chemotype</Text>
            <Text style={styles.infoValue}>
              {cultivar.cannabinoidType ?? 'Not linked yet'}
            </Text>
            <Text style={styles.infoLabel}>Terpene archetype</Text>
            <Text style={styles.infoValue}>
              {cultivar.terpeneArchetype ?? 'Not linked yet'}
            </Text>
            {cultivar.bestFitProfiles && cultivar.bestFitProfiles.length > 0 && (
              <>
                <Text style={styles.infoLabel}>CARTA profiles</Text>
                <View style={styles.chipRow}>
                  {cultivar.bestFitProfiles.map(p => (
                    <View key={p} style={styles.chip}>
                      <Text style={styles.chipText}>{p}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Ratings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ratings</Text>
            <RatingRow
              label="Pain relief"
              value={cultivar.ratings?.painRelief ?? 0}
              onChange={v => updateRating('painRelief', v)}
            />
            <RatingRow
              label="Sleep quality"
              value={cultivar.ratings?.sleepQuality ?? 0}
              onChange={v => updateRating('sleepQuality', v)}
            />
            <RatingRow
              label="Anxiety reduction"
              value={cultivar.ratings?.anxietyReduction ?? 0}
              onChange={v => updateRating('anxietyReduction', v)}
            />
            <RatingRow
              label="Mood / uplift"
              value={cultivar.ratings?.moodUplift ?? 0}
              onChange={v => updateRating('moodUplift', v)}
            />
            <RatingRow
              label="Focus / clarity"
              value={cultivar.ratings?.focusClarity ?? 0}
              onChange={v => updateRating('focusClarity', v)}
            />
            <RatingRow
              label="Overall"
              value={cultivar.ratings?.overall ?? 0}
              onChange={v => updateRating('overall', v)}
            />
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Context, dose, route, effects, side effects…"
              placeholderTextColor={MUTED}
              onBlur={saveNotes}
            />
            <Text style={styles.notesHint}>
              Notes save automatically when you leave this field.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const RatingRow: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
}> = ({ label, value, onChange }) => {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.ratingDots}>
        {ratingOptions.map(opt => (
          <Pressable
            key={opt}
            style={[styles.dot, opt <= value && styles.dotActive]}
            onPress={() => onChange(opt)}
          >
            <Text style={[styles.dotText, opt <= value && styles.dotTextActive]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
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
    fontSize: 14,
    marginRight: 4,
    marginBottom: 8
  },
  backLabel: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8
  },
  title: {
    color: GOLD,
    fontSize: 26,
    fontWeight: '700',
  },
  subTitle: { color: TEXT, fontSize: 16, marginTop: 14, marginBottom: 2 },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  placeholder: { color: MUTED, marginTop: 16 },
  placeholderSmall: { color: MUTED, fontSize: 14, marginTop: 4 },
  imageSection: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 12,
    marginTop: 16
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 8,
  },
  imageButtonsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  } as any,
  infoCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 12,
  },
  infoLabel: {
    color: TEXT,
    fontSize: 18,
    marginTop: 4,
    marginBottom: 6
  },
  infoValue: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 6,
  } as any,
  chip: {
    backgroundColor: CARD,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: { color: GOLD, fontSize: 13, fontWeight: '500' },

  secondaryBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    marginRight: 8,
  },
  secondaryBtnText: { color: TEXT, fontSize: 14, fontWeight: '500' },
  section: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 12,
  },
  sectionTitle: { color: TEXT, fontSize: 18, fontWeight: '600', marginBottom: 12 },
  ratingRow: {
    marginBottom: 20,
  },
  ratingLabel: { color: TEXT, fontSize: 14, marginBottom: 4 },
  ratingDots: {
    flexDirection: 'row',
    gap: 4,
  } as any,
  dot: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 4,
  },
  dotActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  dotText: {
    color: MUTED,
    fontSize: 13,
  },
  dotTextActive: {
    color: DEEP,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: '#1B2922',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    color: TEXT,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
  },
  notesHint: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },
});

export default CultivarDetailScreen;
