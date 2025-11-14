// src/screens/EntryScreen.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ImageBackground,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useProfiles, UserProfile } from '../context/ProfileContext';

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const BORDER = '#233229';
const TEXT = '#F5F5F5';
const MUTED = '#9BA6A0';
const BG: ImageSourcePropType = require('../assets/bg/carta_pattern.png');

type Nav = NavigationProp<any>;

const EntryScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { profiles, loading, addProfile } = useProfiles();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const handleSelectProfile = (profile: UserProfile) => {
    // If age unknown or denied, go to AgeGateScreen
    if (profile.ageStatus === 'unknown' || profile.ageStatus === 'denied') {
      nav.navigate('AgeGate', { profileId: profile.id, isGuest: false });
    } else {
      // age already verified, go directly into Tabs
      nav.reset({
        index: 0,
        routes: [{ name: 'Tabs' }],
      });
    }
  };

  const handleGuest = () => {
    // guest must always go through age gate and is not persisted as profile
    nav.navigate('AgeGate', { profileId: 'guest', isGuest: true });
  };

  const handleCreateProfile = async () => {
    if (!name.trim()) return;
    const profile = await addProfile(name.trim());
    setName('');
    setCreating(false);
    // new profile: push AgeGate for that profile
    nav.navigate('AgeGate', { profileId: profile.id, isGuest: false });
  };

  return (
    <ImageBackground
      source={BG}
      style={{ flex: 1 }}
      resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
      imageStyle={{ opacity: 0.5 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Centered header */}
          <View style={styles.headerBlock}>
            <Text style={styles.logo}>Welcome to</Text>
            <Text style={styles.title}>CARTA Stack</Text>
            <Text style={styles.subtitle}>
              Choose who’s using the app today so we can keep your sessions, favorites,
              and cultivars organized.
            </Text>
          </View>

          {loading ? (
            <Text style={styles.loading}>Loading profiles…</Text>
          ) : profiles.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create your first profile</Text>
              <Text style={styles.cardText}>
                Set up a profile to start tracking sessions and building your
                personalized CARTA stack.
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Name, nickname, or initials"
                placeholderTextColor={MUTED}
              />
              <Pressable style={styles.primaryBtn} onPress={handleCreateProfile}>
                <Text style={styles.primaryBtnText}>Continue</Text>
              </Pressable>

              <Pressable style={styles.secondaryBtn} onPress={handleGuest}>
                <Text style={styles.secondaryBtnText}>Continue as guest</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Select a profile</Text>

                <FlatList
                  data={profiles}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.profileRow}
                      onPress={() => handleSelectProfile(item)}
                    >
                      <View style={styles.profileAvatar}>
                        <Text style={styles.profileInitial}>
                          {item.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.profileName}>{item.displayName}</Text>
                        <Text style={styles.profileMeta}>
                          {item.role === 'clinician'
                            ? 'Clinician profile'
                            : 'Personal profile'}
                        </Text>
                      </View>
                    </Pressable>
                  )}
                />

                {creating ? (
                  <View style={styles.createRow}>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      style={styles.input}
                      placeholder="New profile name"
                      placeholderTextColor={MUTED}
                    />
                    <Pressable
                      style={styles.primaryBtnSmall}
                      onPress={handleCreateProfile}
                    >
                      <Text style={styles.primaryBtnText}>Save</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => setCreating(true)}
                  >
                    <Text style={styles.secondaryBtnText}>Add another profile</Text>
                  </Pressable>
                )}

                <Pressable style={styles.ghostBtn} onPress={handleGuest}>
                  <Text style={styles.ghostBtnText}>Use guest profile</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 70,
    alignItems: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  logo: {
    color: TEXT,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  title: {
    color: GOLD,
    fontSize: 42,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 14,
    textAlign: 'center',
  },
  subtitle: {
    color: TEXT,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    textAlign: 'center',
  },
  loading: {
    color: MUTED,
    marginTop: 16,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: GOLD,
    flex: 1,
    width: '90%',
    
  },
  cardTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardText: {
    color: TEXT,
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1B2922',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    color: TEXT,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    
  },
  primaryBtn: {
    backgroundColor: GOLD,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnSmall: {
    backgroundColor: GOLD,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
   
    marginLeft: 14,
  },
  primaryBtnText: {
    color: DEEP,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  secondaryBtnText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '500',
  },
  ghostBtn: {
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  ghostBtnText: {
    color: MUTED,
    fontSize: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: BORDER,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  profileInitial: {
    color: GOLD,
    fontWeight: '700',
  },
  profileName: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '500',
  },
  profileMeta: {
    color: MUTED,
    fontSize: 12,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default EntryScreen;
