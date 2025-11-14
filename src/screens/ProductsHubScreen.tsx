import React, { useCallback, useLayoutEffect } from 'react';
import {
  ImageBackground,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const BG: ImageSourcePropType = require('../assets/bg/carta_pattern.png');
const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const INK = '#E9EFEA';
const BORDER = '#233229';
const MUTED = '#C9C9C9';

/** Try to navigate to any route whose name includes "quest" (case-insensitive) */
function navigateToQuest(navigation: any): boolean {
  const tried: string[] = [];
  const want = (name: string) => name.toLowerCase().includes('quest');

  const tryNames = (nav: any, names: string[]): boolean => {
    for (const n of names) {
      try {
        nav.navigate(n);
        return true;
      } catch {
        tried.push(String(n));
      }
      try {
        nav.navigate('Tabs', { screen: n });
        return true;
      } catch {
        tried.push(`Tabs>${String(n)}`);
      }
    }
    return false;
  };

  let cur: any = navigation;
  for (let depth = 0; depth < 5 && cur; depth++) {
    const state = cur.getState?.();
    const routeNames: string[] = state?.routeNames ?? [];
    const questish = routeNames.filter(want);
    if (questish.length && tryNames(cur, questish)) return true;
    if (
      tryNames(cur, ['Quest', 'QuestScreen', 'CARTAQuest', 'CARTA_QuestScreen'])
    )
      return true;
    cur = cur.getParent?.();
  }

  try {
    (navigation as any).navigate('Tabs', { screen: 'Quest' });
    return true;
  } catch {
    tried.push('Tabs>Quest');
  }

  console.warn('[ProductsHub] Quest route not found. Tried:', tried.join(', '));
  return false;
}

export default function ProductsHubScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  const goProducts = useCallback(
    () => (navigation as any).navigate('Tabs', { screen: 'Products' }),
    [navigation],
  );

  const goEducation = useCallback(
    () => (navigation as any).navigate('Tabs', { screen: 'Education' }),
    [navigation],
  );

  const goQuest = useCallback(
    () => navigateToQuest(navigation),
    [navigation],
  );

  const backHome = useCallback(() => {
    const parent: any = (navigation as any).getParent?.() ?? navigation;
    const state = parent?.getState?.();
    const routeNames: string[] = state?.routeNames ?? [];
    if (routeNames.includes?.('Home')) {
      try {
        parent.navigate('Home');
        return;
      } catch {}
    }
    try {
      (navigation as any).navigate('Tabs', { screen: 'Home' });
      return;
    } catch {}
    try {
      (navigation as any).navigate('Home');
    } catch {}
  }, [navigation]);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: DEEP }]} />
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFillObject}
        resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
        imageStyle={s.bgImg}
      />
<View style={s.header}>
          <Pressable
            onPress={backHome}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={s.backIcon}>{'\u25C0'}</Text>
            <Text style={s.backLabel}>Back</Text>
          </Pressable>
          <Text style={s.title}>Products &amp; Education</Text>
          <Text style={s.subTitle}>
            Move between products, CARTA-U, and Quests with one hub.
          </Text>
        </View>
      <ScrollView
        contentContainerStyle={[
          s.container,
          { paddingTop: Math.max(6, insets.top - 6) },
        ]}
      >
        

        <View style={s.grid}>
          <HubButton title="Products" onPress={goProducts} />
          <Text style={s.blurb}>
            Browse the full lineup and deep-dive product pages.
          </Text>

          <HubButton title="CARTA-U" onPress={goEducation} />
          <Text style={s.blurb}>
            Fast reads to level up dosing, methods, and safety knowledge.
          </Text>

          <HubButton title="CARTA Quests" onPress={goQuest} />
          <Text style={s.blurb}>
            Mini-missions to learn, engage, and unlock perks.
          </Text>
        </View>

        <View style={s.rationale}>
          <Text style={s.rTitle}>Why this matters</Text>
          <Text style={s.rBody}>
            CARTA pairs product transparency with education so choices map to
            goals, tolerance, and context. “Products” gives specs and
            use-cases, “CARTA-U” explains the why behind dosing and safety, and
            “Quests” turns learning into quick wins. Together, they support
            Chemotype-Guided Dosing and your clinician-grade standards without
            information overload.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HubButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.btn} onPress={onPress}>
      <Text style={s.btnTxt}>{title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DEEP },
  bgImg: { opacity: 0.5 },
  container: { paddingHorizontal: 18, paddingBottom: 28 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomColor: BORDER,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(18, 31, 26, 0.9)',
    marginHorizontal: -2,
    marginBottom: 24,
  },
  backBtn: { paddingVertical: 8, paddingHorizontal: 2, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 6 },
  backIcon: { color: GOLD, fontSize: 16, marginRight: 4, marginBottom: 4 },
  backLabel: { color: GOLD, fontWeight: '900', fontSize: 16, marginBottom: 4 },

  title: { color: GOLD, fontSize: 26, fontWeight: '800' },
  subTitle: { color: INK, fontSize: 14, marginTop: 10 },

  grid: { gap: 20, alignItems: 'center', marginTop: 8 },
  btn: {
    backgroundColor: CARD,
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignSelf: 'center',
    width: '80%',
    maxWidth: 520,
  },
  btnTxt: { color: INK, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  blurb: {
    color: INK,
    opacity: 0.85,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: -2,
    marginBottom: 40,
  },
  rationale: {
    marginTop: 8,
    padding: 14,
  },
  rTitle: { color: GOLD, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  rBody: { color: INK, opacity: 0.9, lineHeight: 20, fontWeight: '600' },
});
