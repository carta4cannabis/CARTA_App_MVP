// app/src/screens/ToolsHubScreen.tsx
import React, { useCallback, useState, useLayoutEffect } from 'react';
import {
  ImageBackground,
  ScrollView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import {
  refreshAtiAndCoach,
  buildClinicianSummaryHTML,
} from '../addons/CARTA_CoachExtras';
import { useProfiles } from '../context/ProfileContext';

const BG: ImageSourcePropType = require('../assets/bg/carta_pattern.png');
const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const INK = '#E9EFEA';
const BORDER = '#233229';
const TEXT = '#F5F5F5';

type TabsParamList = {
  Scanner: undefined;
  Find: undefined;
  More: undefined;
  Tabs: { screen: keyof TabsParamList } | undefined;
  Home: undefined;
};

export default function ToolsHubScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [busy, setBusy] = useState(false);
  const { activeProfile } = useProfiles();
  const profileId = activeProfile?.id ?? 'guest';

  // Match CohortViewScreen: hide stack header
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

  const openClinicianPdf = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { last14 } = await (refreshAtiAndCoach as any)(profileId);
      const html = (buildClinicianSummaryHTML as any)(last14, profileId);
      const file = await Print.printToFileAsync({ html });

      const cacheDir =
        (FileSystem as any).cacheDirectory ??
        (FileSystem as any).documentDirectory ??
        '';
      const suffix = profileId || 'guest';
      const finalUri = cacheDir
        ? `${cacheDir}CARTA_Clinician_Summary_${suffix}.pdf`
        : file.uri;

      if (cacheDir) {
        try {
          await FileSystem.moveAsync({ from: file.uri, to: finalUri });
        } catch {}
      }

      (navigation as any).navigate('HandoutViewer', {
        title: 'Clinician Summary',
        uri: finalUri || file.uri,
      });
    } catch {
      try {
        const { last14 } = await (refreshAtiAndCoach as any)(profileId);
        const html = (buildClinicianSummaryHTML as any)(last14, profileId);
        (navigation as any).navigate('SummaryPreview', {
          title: 'Clinician Summary',
          html,
        });
      } finally {
        setBusy(false);
      }
      return;
    }
    setBusy(false);
  }, [navigation, busy, profileId]);

  const goTab = useCallback(
    (screen: 'Scanner' | 'Find' | 'More') =>
      (navigation as any).navigate('Tabs', { screen }),
    [navigation],
  );

  return (
    <ImageBackground
      source={BG}
      style={{ flex: 1 }}
      resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
      imageStyle={s.bgImg}
    >
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <View style={s.header}>
          <Pressable
            onPress={backHome}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={s.backBtn}
          >
            <Text style={s.backText}>{'\u25C0'}</Text>
            <Text style={s.backLabel}>Back</Text>
          </Pressable>
          <Text style={s.title}>Tools &amp; Extras</Text>
        
        </View>

        <ScrollView
          style={s.body}
          contentContainerStyle={{ paddingBottom: 28, alignItems: 'center' }}
        >
          <View style={s.grid}>
            {/* Clinician PDF */}
            <Pressable
              style={s.btn}
              onPress={openClinicianPdf}
              disabled={busy}
            >
              <Text style={s.btnTxt}>Clinician PDF</Text>
              {busy ? (
                <ActivityIndicator style={s.spinRight} color={GOLD} />
              ) : null}
            </Pressable>
            <Text style={s.blurb}>
              Build a clinician-ready summary for                                            this user’s recent sessions.
            </Text>

            {/* Cultivar Profile Matching */}
            <Pressable
              style={s.btn}
              onPress={() =>
                (navigation as any).navigate('CultivarProfileMatching')
              }
            >
              <Text style={s.btnTxt}>Profile Matching</Text>
            </Pressable>
            <Text style={s.blurb}>
              Plug in a cultivar/strain COA (or scan its QR) to see                                chemotype and
              CARTA profile fit.
            </Text>

            {/* My Cultivars */}
            <Pressable
              style={s.btn}
              onPress={() => (navigation as any).navigate('MyCultivars')}
            >
              <Text style={s.btnTxt}>My Cultivars (COA Library)</Text>
            </Pressable>
            <Text style={s.blurb}>
              Save strains with photos, notes, and ratings                                to keep your COA
              library organized.
            </Text>

            {/* Cohort View */}
            <Pressable
              style={s.btn}
              onPress={() => (navigation as any).navigate('CohortView')}
            >
              <Text style={s.btnTxt}>Cohort View</Text>
            </Pressable>
            <Text style={s.blurb}>
              See how your saved cultivars perform across CARTA therapeutic
              profiles.
            </Text>

            {/* Existing tools */}
            <HubButton
              title="QR &amp; Barcode Scanner"
              onPress={() => goTab('Scanner')}
            />
            <Text style={s.blurb}>
              Scan product labels and COA-enabled                                           QR codes for instant details.
            </Text>

            <HubButton
              title="Find Dispensary"
              onPress={() => goTab('Find')}
            />
            <Text style={s.blurb}>
              See who carries CARTA nearby and get store information.
            </Text>

            <HubButton title="More" onPress={() => goTab('More')} />
            <Text style={s.blurb}>
              About CARTA, privacy policy, disclaimer, and contact info.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
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
  safe: { flex: 1, backgroundColor: 'transparent' },
  bgImg: { opacity: 0.5 },
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
    marginBottom: 8,
  },
  backLabel: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    color: GOLD,
    fontSize: 26,
    fontWeight: '700',
  },
  subTitle: {
    color: TEXT,
    fontSize: 16,
    marginTop: 14,
    marginBottom: 2,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    marginTop: 32
  },
  grid: {
    gap: 20,
    alignItems: 'center',
    width: '100%',
  } as any,
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
  btnTxt: {
    color: INK,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  spinRight: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -10,
  },
  blurb: {
    color: INK,
    opacity: 0.85,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: -2,
    marginBottom: 32,
  },
});
