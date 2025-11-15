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
// Brand-friendly serif without extra deps
const HEADLINE_SERIF =
  Platform.select({ ios: 'Palatino', android: 'serif' }) || 'serif';

type AnyNav = any;

export default function OutcomesHubScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

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
                      style={s.backBtn}
                    >
                      <Text style={s.backText}>{'\u25C0'}</Text>
                      <Text style={s.backLabel}>Back</Text>
                    </Pressable>
          <Text style={s.title}>Outcome Tracking</Text>
          <Text style={s.subTitle}>
            Log sessions and quick check-ins, then turn them into ATI trends and
            clinician-grade summaries.
          </Text>
        </View>
      <ScrollView
        contentContainerStyle={[
          s.container,
          { paddingTop: Math.max(6, insets.top - 6) },
        ]}
      >
       

        <View style={s.grid}>
          <Pressable
            style={s.btn}
            onPress={() =>
              (navigation as any).navigate('Tabs', { screen: 'Tracker' })
            }
          >
            <Text style={s.btnTxt}>Session Tracker</Text>
          </Pressable>
          <Text style={s.blurb}>
            Log complete sessions fast — methods, dosing, and outcomes.
          </Text>

          <Pressable
            style={s.btn}
            onPress={() =>
              (navigation as any).navigate('Tabs', { screen: 'Coach' })
            }
          >
            <Text style={s.btnTxt}>Quick Check-in</Text>
          </Pressable>
          <Text style={s.blurb}>
            Check in with AI Coach, see recent trends, and build a clinician
            summary PDF.
          </Text>
        </View>

        <View style={s.rationale}>
          <Text style={s.rTitle}>Why this matters</Text>
          <Text style={s.rBody}>
            Consistently logging your outcomes allows CARTA&apos;s Adaptive
            Therapeutic Index (ATI) to keep your recommended regimen tailored to
            your needs. Session logs + quick check-ins create a longitudinal
            view you can act on — what worked, what didn’t, and how to step up
            safely. The goal is tighter feedback loops, clearer decisions, and
            evidence you can share.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  subTitle: {
    color: INK,
    fontSize: 15,
    marginTop: 10,
    fontFamily: HEADLINE_SERIF, 
    textAlign: 'center'
  },

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
  btnTxt: { color: INK, fontFamily: HEADLINE_SERIF, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  blurb: {
    color: INK,
    opacity: 0.85,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: HEADLINE_SERIF,
    fontWeight: '600',
    marginTop: -2,
    marginBottom: 40,
  },
  rationale: {
    marginTop: 8,
    padding: 14,
  },
  rTitle: { color: GOLD, fontFamily: HEADLINE_SERIF, fontSize: 17, fontWeight: '800', marginBottom: 6 },
  rBody: { color: INK, opacity: 0.9, lineHeight: 20, fontSize: 15, fontFamily: HEADLINE_SERIF, fontWeight: '600' },
});
