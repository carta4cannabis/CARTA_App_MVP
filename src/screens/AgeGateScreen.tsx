// src/screens/AgeGateScreen.tsx

import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import {
  RouteProp,
  useNavigation,
  useRoute,
  NavigationProp,
} from '@react-navigation/native';
import { useProfiles } from '../context/ProfileContext';

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

type AgeGateRoute = RouteProp<
  {
    AgeGate: { profileId: string; isGuest: boolean };
  },
  'AgeGate'
>;

const AgeGateScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const route = useRoute<AgeGateRoute>();
  const { profileId, isGuest } = route.params;
  const { updateProfileAgeStatus, setActiveProfileById } = useProfiles();

  const proceedVerified = async (type: '21' | '18-med') => {
    if (!isGuest) {
      await updateProfileAgeStatus(
        profileId,
        type === '21' ? 'verified21' : 'verified18Med',
      );
      setActiveProfileById(profileId);
    } else {
      // guest: not persisted, but we can temporarily mark active profile as null
      setActiveProfileById(null);
    }

    // Reset to the existing Tabs screen
    nav.reset({
      index: 0,
      routes: [{ name: 'Tabs' }],
    });
  };

  const handleDenied = async () => {
    if (!isGuest) {
      await updateProfileAgeStatus(profileId, 'denied');
    }
    // Show info and go back to entry
    nav.reset({
      index: 0,
      routes: [{ name: 'Entry' }],
    });
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
          <Text style={styles.title}>Age verification</Text>
          <Text style={styles.subtitle}>
            To use CARTA, you must confirm that you meet your local legal requirements
            for cannabis or cannabinoid use.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardText}>
              By continuing, you confirm that you are of legal age in your jurisdiction
              and understand that this app does not replace medical advice or care from
              your own clinician.
            </Text>

            <Pressable
              style={styles.primaryBtn}
              onPress={() => proceedVerified('21')}
            >
              <Text style={styles.primaryBtnText}>I am 21 or older</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryBtn}
              onPress={() => proceedVerified('18-med')}
            >
              <Text style={styles.secondaryBtnText}>
                I am 18–20 and using medical cannabis under supervision
              </Text>
            </Pressable>

            <Pressable style={styles.ghostBtn} onPress={handleDenied}>
              <Text style={styles.ghostBtnText}>
                I do not meet these requirements
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 24,
  },
  title: {
    color: GOLD,
    fontSize: 32,
    fontFamily: HEADLINE_SERIF, 
    fontWeight: '700',
    marginTop: 200,
    marginBottom: 24,
    textAlign: 'center',
  },
  subtitle: {
    color: TEXT,
    fontFamily: HEADLINE_SERIF, 
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: GOLD,
    marginTop: 8,
  },
  cardText: {
    color: MUTED,
    fontFamily: HEADLINE_SERIF, 
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: GOLD,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: DEEP,
    fontFamily: HEADLINE_SERIF, 
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 10,
  },
  secondaryBtnText: {
    color: TEXT,
   fontFamily: HEADLINE_SERIF, 
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  ghostBtn: {
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  ghostBtnText: {
    color: MUTED,
   fontFamily: HEADLINE_SERIF, 
    fontSize: 15,
  },
});

export default AgeGateScreen;
