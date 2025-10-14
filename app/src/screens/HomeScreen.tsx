import React from 'react';
import {
  Alert, ImageBackground, Linking, Platform, Pressable,
  SafeAreaView, StyleSheet, Text, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

type Nav = any;

// Edit these to match your route names
const ROUTES = {
  dosing: 'DosingEngine',
  tracker: 'SessionTracker',
  products: 'Products', // <-- matches the Stack.Screen name above
  education: 'Education',
  scan: 'Scanner',
  find: 'Find',
};

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  const safeGo = (name: string, params?: any) => {
    const exists = !!navigation.getState?.()?.routeNames?.includes?.(name);
    if (!exists) { Alert.alert('Not available', `Screen "${name}" isn’t registered.`); return; }
    navigation.navigate(name as never);
  
  // helper: does this navigator contain the route?
  const hasRoute = (nav: any, routeName: string) => {
    const st = nav?.getState?.();
    return !!st?.routeNames?.includes?.(routeName);
  };

  // try current navigator first
  // @ts-ignore
  let nav: any = navigation;
  while (nav) {
    if (hasRoute(nav, name)) {
      nav.navigate(name as never, params);
      return;
    }
    nav = nav.getParent?.(); // climb to parent navigator (e.g., from Tabs → Root Stack)
  }

  // last resort: try root container if available
  try {
    // @ts-ignore
    navigation.navigate(name as never, params);
  } catch {
    Alert.alert('Not available', `Screen "${name}" isn’t registered in any navigator.`);
  }
};

  return (
    <SafeAreaView style={s.safe}>
      <ImageBackground
        source={require('../../assets/posters/carta_poster.png')}
        style={s.bg}
        imageStyle={s.bgImage}
        resizeMode="cover"
      >
        {/* overlay spaces content to bottom so poster stays visible above */}
        <View style={s.overlay}>
          <View style={s.brandWrap}>
            <Text style={s.brand}>Welcome</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Charting the path to tailored cannabis</Text>
            <Text style={s.cardSubtitle}> </Text>

            <View style={s.grid}>
              <CTA label="Dosing Engine"      onPress={() => safeGo('Dosing')} />
              <CTA label="Session Tracker"    onPress={() => safeGo('Tracker')} />
              <CTA label="Products"           onPress={() => safeGo('Products')} />
              <CTA label="Education"          onPress={() => safeGo('Education')} />
              <CTA label="Scan a Product"     onPress={() => safeGo('Scanner')} />
              <CTA label="Find a Dispensary"  onPress={() => safeGo('Find')} />
            </View>

            <Pressable style={s.linkBtn} onPress={() => Linking.openURL('https://carta4cannabis.com')}>
              <Text style={s.linkText}>Visit Carta4Cannabis.com</Text>
            </Pressable>

            <Text style={s.disclaimer}>
              For adults 21+. Consume responsibly. This app does not provide medical advice.
            </Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

function CTA({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [s.cta, pressed && { opacity: 0.85 }]}
      android_ripple={{ color: 'rgba(201,168,106,0.15)' }}
      onPress={onPress}
    >
      <Text style={s.ctaText}>{label}</Text>
    </Pressable>
  );
}

const GOLD = '#C9A86A';
const BG = '#0E1411';
const CARD = '#101915';
const TEXT = '#E9EFEA';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  bg: { flex: 1 },
  bgImage: { opacity: 0.60 },

  // key piece: poster on top, card anchored to bottom
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 32,
  },

  brandWrap: { position: 'absolute', top: 28, alignSelf: 'center', alignItems: 'center' },
  brand: {
    fontSize: 30, letterSpacing: 2, color: GOLD, fontWeight: '500',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  brandSub: { fontSize: 18, lineHeight: 22, textAlign: 'center', letterSpacing: 0.5, color: TEXT, marginTop: 4 },

  card: {
    backgroundColor: CARD,
    borderColor: GOLD, borderWidth: 1, borderRadius: 18,
    padding: 12,
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  cardTitle: { color: GOLD, fontSize: 18, fontWeight: '400', marginBottom: 6, textAlign: 'center' },
  cardSubtitle: { color: GOLD, marginBottom: 6 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  cta: {
    flexBasis: '48%',
    backgroundColor: '#131E19',
    borderColor: GOLD, borderWidth: 1, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { color: TEXT, fontSize: 15, fontWeight: '600', textAlign: 'center' },

  linkBtn: { alignSelf: 'center', marginTop: 16, borderColor: GOLD, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  linkText: { color: GOLD, fontWeight: '700' },
  disclaimer: { color: '#A9B6B0', fontSize: 12, lineHeight: 16, textAlign: 'center', marginTop: 12 },
});
