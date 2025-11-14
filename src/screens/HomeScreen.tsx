// app/src/screens/HomeScreen.tsx
import React, { memo } from 'react';
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const INK  = '#E9EFEA';

type AnyNav = any;

export default memo(function HomeScreen() {
  const nav = useNavigation<AnyNav>();

  // Keep Dosing on Tabs so the bottom bar remains visible
  const navigateTab = (tabName: string) => {
    // Find the nearest navigator that knows about 'Tabs'
    let cur: any = nav;
    while (cur) {
      const state = cur.getState?.();
      if (state?.routeNames?.includes?.('Tabs')) {
        cur.navigate('Tabs' as never, { screen: tabName } as never);
        return;
      }
      cur = cur.getParent?.();
    }
    // Fallback: ask the current navigator
    (nav as any).navigate('Tabs' as never, { screen: tabName } as never);
  };

  // Button handlers — hubs are hidden tabs (so tab bar remains visible)
  const goDosing   = () => navigateTab('Dosing');
  const goOutcomes = () => (nav as any).navigate('OutcomesHub');
  const goProducts = () => (nav as any).navigate('ProductsHub');
  const goTools    = () => (nav as any).navigate('ToolsHub');

  return (
    <SafeAreaView style={s.safe}>
      <ImageBackground
        source={require('../../assets/poster/carta_poster.png')}
        resizeMode={Platform.OS === 'ios' ? 'cover' : 'cover'}
        style={s.bg}
      >
        <View style={s.card}>
          <View style={s.row}>
            <Block
              title="REGIMEN      BUILDER"
              blurb="Build a clinically sound, personalized regimen               in just a few clicks."
              onPress={goDosing}
            />
            <Block
              title="OUTCOME  TRACKING"
              blurb="Track sessions to see what works for you -                       optimize with AI Coach."
              onPress={goOutcomes}
            />
          </View>

          <View style={s.row}>
            <Block
              title="PRODUCTS  & EDUCATION"
              blurb="Explore CARTA products,           learn the science, and              conquer Quests."
              onPress={goProducts}
            />
            <Block
              title="PRO TOOLS  &           EXTRAS"
              blurb="COA scanning, chemotype matching, and cultivar                 library - all in one place"
              onPress={goTools}
            />
          </View>

          <View style={s.brandWrap}>
            <Text style={s.brandSub}>
              CHARTING THE PATH TO TAILORED CANNABIS
            </Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
});

function Block({
  title,
  blurb,
  onPress,
}: {
  title: string;
  blurb: string;
  onPress: () => void;
}) {
  return (
    <View style={s.block}>
      <Pressable style={({ pressed }) => [s.btn, pressed && s.pressed]} onPress={onPress}>
        <Text style={s.btnText}>{title}</Text>
      </Pressable>
      <Text style={s.blurb}>{blurb}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DEEP },
  // Full-height background with your poster; border gives the framed look you had
  bg: { flex: 1, justifyContent: 'flex-end', borderRadius: 1, borderColor: GOLD, borderWidth: 5, padding: 8 },

  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: GOLD,
    margin: 10,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },

  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  block: { flex: 1, alignItems: 'center' },

  btn: {
    width: '90%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1C2B24',
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  pressed: { opacity: 0.75 },
  btnText: { color: INK, fontWeight: '500', fontSize: 18, textAlign: 'center' },

  blurb: { color: '#B7C5BE', fontSize: 12, textAlign: 'center', marginTop: 10, marginBottom: 12 },

  brandWrap: { alignItems: 'center', paddingTop: 2 },
  brandSub: {
    color: GOLD,
    fontWeight: '900',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.2,
    marginTop: 0,
    marginBottom: 10,
  },
});
