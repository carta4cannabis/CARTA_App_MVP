// src/screens/MyCultivarsScreen.tsx

import React, { useState, useLayoutEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  ImageBackground,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from '@react-navigation/native';
import {
  CultivarRecord,
  loadCultivars,
  saveCultivars,
  createCultivarId,
} from '../utils/CultivarStorage';
import { useProfiles } from '../context/ProfileContext';

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const BORDER = '#233229';
const TEXT = '#F5F5F5';
const MUTED = '#9BA6A0';
const BG: ImageSourcePropType = require('../assets/bg/carta_pattern.png');

type Nav = NavigationProp<any>;

const MyCultivarsScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { activeProfile } = useProfiles();
  const [cultivars, setCultivars] = useState<CultivarRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const profileId = activeProfile?.id ?? null;

  // Hide default stack header
  useLayoutEffect(() => {
    nav.setOptions?.({ headerShown: false });
  }, [nav]);

  const loadData = async () => {
    setLoading(true);
    const data = await loadCultivars(profileId);
    setCultivars(data.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [profileId]),
  );

  const handleAddCultivar = async () => {
    if (!newName.trim()) return;
    const now = new Date().toISOString();
    const record: CultivarRecord = {
      id: createCultivarId(),
      name: newName.trim(),
      breederOrBrand: newBrand.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      notes: newNotes.trim() || undefined,
    };
    const next = [record, ...cultivars];
    setCultivars(next);
    await saveCultivars(profileId, next);
    setNewName('');
    setNewBrand('');
    setNewNotes('');
    setAdding(false);
  };

  const openDetail = (cultivar: CultivarRecord) => {
    nav.navigate('CultivarDetail', { cultivarId: cultivar.id });
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
          <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{'\u25C0'}</Text>
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.title}>My Cultivars</Text>
          <Text style={styles.subTitle}>
            Save cultivars with COAs, notes, and ratings, then see how they map
            into your CARTA profiles over time.
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => setAdding(v => !v)}
          >
            <Text style={styles.primaryBtnText}>
              {adding ? 'Cancel' : 'Add cultivar'}
            </Text>
          </Pressable>
        </View>

        {adding && (
          <View style={styles.addCard}>
            <Text style={styles.sectionTitle}>New cultivar</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Cultivar / strain name"
              placeholderTextColor={MUTED}
            />
            <TextInput
              style={styles.input}
              value={newBrand}
              onChangeText={setNewBrand}
              placeholder="Grower / brand (optional)"
              placeholderTextColor={MUTED}
            />
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={newNotes}
              onChangeText={setNewNotes}
              placeholder="Quick notes (optional)"
              placeholderTextColor={MUTED}
              multiline
            />

            <Pressable style={styles.primaryBtn} onPress={handleAddCultivar}>
              <Text style={styles.primaryBtnText}>Save cultivar</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.listContainer}>
          {loading ? (
            <Text style={styles.placeholder}>Loading…</Text>
          ) : cultivars.length === 0 ? (
            <Text style={styles.placeholder}>
              No cultivars saved yet. Add your first cultivar above to start
              building your COA library.
            </Text>
          ) : (
            <FlatList
              data={cultivars}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.card}
                  onPress={() => openDetail(item)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    {item.bestFitProfiles?.[0] && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>
                          {item.bestFitProfiles[0]}
                        </Text>
                      </View>
                    )}
                  </View>
                  {item.breederOrBrand && (
                    <Text style={styles.cardBrand}>{item.breederOrBrand}</Text>
                  )}
                  {item.cannabinoidType && (
                    <Text style={styles.cardMeta}>{item.cannabinoidType}</Text>
                  )}
                  {item.notes && (
                    <Text
                      style={styles.cardNotes}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.notes}
                    </Text>
                  )}
                </Pressable>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
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
  backText: { color: GOLD, fontSize: 14, marginRight: 4, marginBottom: 8 },
  backLabel: { color: GOLD, fontSize: 14, fontWeight: '500', marginBottom: 8 },
  title: { color: GOLD, fontSize: 26, fontWeight: '700' },
  subTitle: { color: TEXT, fontSize: 16, marginTop: 14, marginBottom: 2  },
  actionsRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  primaryBtn: {
    backgroundColor: GOLD,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12, 
    marginBottom: 12
  },
  primaryBtnText: { color: DEEP, fontSize: 13, fontWeight: '600' },
  addCard: {
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: GOLD,
  },
  sectionTitle: { color: TEXT, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#1B2922',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    color: TEXT,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  notesInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  placeholder: {
    color: MUTED,
    fontSize: 13,
    marginTop: 12,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: GOLD,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { color: TEXT, fontSize: 15, fontWeight: '600' },
  cardBrand: { color: MUTED, fontSize: 12, marginTop: 2 },
  cardMeta: { color: MUTED, fontSize: 11, marginTop: 4 },
  cardNotes: { color: TEXT, fontSize: 12, marginTop: 6 },
  chip: {
    backgroundColor: '#1F2B24',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: { color: GOLD, fontSize: 11, fontWeight: '500' },
});

export default MyCultivarsScreen;
