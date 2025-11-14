import React, { useLayoutEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  ImageBackground,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const BG = require('../../assets/bg/carta_pattern.png');

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';

function BackHeader({ title }: { title: string }) {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        s.headerWrap,
        { paddingTop: insets.top - 26 },
      ]}
    >
      <Pressable
        onPress={() => nav.goBack()}
        style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.8 }]}
      >
        <Text style={s.backIcon}>{'\u25C0'}</Text>
        <Text style={s.backLabel}>Back</Text>
      </Pressable>
      <Text style={s.headerTitle}>{title}</Text>
    </View>
  );
}

export default function MoreScreen() {
  const nav = useNavigation<any>();

  useLayoutEffect(() => {
    nav.setOptions?.({ headerShown: false });
  }, [nav]);

  return (
    <SafeAreaView style={s.safe}>
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFillObject}
        resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
        imageStyle={{
          opacity: 0.5,
          resizeMode: Platform.OS === 'ios' ? 'repeat' : 'cover',
        }}
      />
      <BackHeader title="More Info" />
      <ScrollView contentContainerStyle={[s.content, { paddingTop: 12 }]}>
        <View style={s.card}>
          <Text style={s.h1}>About</Text>
          <Text style={s.body}>
            CARTA builds chemotype-guided formulations and simple, guided tools
            that help adults tailor cannabis and botanicals to their goals.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.h1}>Privacy</Text>
          <Text style={s.body}>
            We collect only the data necessary to operate the app (e.g., session
            entries you choose to save on your device). We do not sell personal
            data.
          </Text>
          <Text style={s.body}>
            Location access (if granted) is used to show nearby stores. You can
            revoke permissions at any time in your device settings.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.h1}>Disclaimer</Text>
          <Text style={s.body}>
            For adults 21+ where legal. Products are not intended to diagnose,
            treat, cure, or prevent any disease. App content is for education
            only and not a substitute for medical advice. Speak with a
            healthcare professional before use, especially if pregnant, nursing,
            or taking medications.
          </Text>
          <Text style={s.body}>
            Effects vary by individual; start low, go slow. Keep out of reach of
            children and pets.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.h1}>Contact</Text>
          <Text style={s.body}>
            Email: <Text style={s.bold}>carta4cannabis@gmail.com</Text>
          </Text>
          <Pressable
            onPress={() => Linking.openURL('https://carta4cannabis.com')}
            style={({ pressed }) => [s.link, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.linkText}>Visit Website</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DEEP },
  headerWrap: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomColor: '#233229',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(18, 31, 26, 0.9)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  backIcon: {
    color: GOLD,
    fontSize: 20,
    lineHeight: 20,
    marginRight: 4,
    marginBottom: 4,
  },
  backLabel: { color: GOLD, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  headerTitle: { color: GOLD, fontSize: 26, fontWeight: '800', marginTop: 2 },

  content: { paddingHorizontal: 16 },
  card: {
    backgroundColor: CARD,
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  h1: {
    color: '#E9EFEA',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: { color: '#DCE7E2', marginTop: 4, lineHeight: 20 },
  bold: { fontWeight: '700' },
  link: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1d3a21ff',
    backgroundColor: GOLD,
  },
  linkText: { color: DEEP, fontWeight: '600' },
});
