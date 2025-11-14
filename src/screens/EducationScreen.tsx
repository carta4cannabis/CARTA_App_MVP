// @ts-nocheck
import React, {
  useCallback,
  useMemo,
  useState,
  useLayoutEffect,
} from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Platform,
  SectionList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HANDOUT_SECTIONS } from '../data/handouts.generated';

const BG = require('../../assets/bg/carta_pattern.png');

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const INK = '#E9EFEA';
const MUTED = '#9FB0A5';
const BORDER = '#233229';

if (
  Platform.OS === 'android' &&
  (require('react-native').UIManager
    .setLayoutAnimationEnabledExperimental as any)
) {
  require('react-native').UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EducationScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useLayoutEffect(() => {
    (navigation as any).setOptions?.({ headerShown: false });
  }, [navigation]);

  const sections = useMemo(
    () =>
      (HANDOUT_SECTIONS || []).map((s: any) => ({
        id: String(s.id),
        title: String(s.title),
        data: open[String(s.id)] ? (s.items || []) : [],
        count: (s.items || []).length,
      })),
    [open],
  );

  const toggle = useCallback((id: string) => {
    const { LayoutAnimation } = require('react-native');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const onOpen = useCallback(
    (item: { title: string; asset: number }) => {
      if (typeof item?.asset !== 'number') {
        console.warn(
          'Handout requires a require(...) numeric asset:',
          item?.title,
        );
        return;
      }
      navigation.navigate('HandoutViewer' as never, {
        title: item.title,
        assetId: item.asset,
      } as never);
    },
    [navigation],
  );

  const renderHeader = ({ section }: any) => {
    const expanded = !!open[section.id];
    return (
      <Pressable onPress={() => toggle(section.id)} style={s.headerRow}>
        <Text style={s.headerText}>{section.title}</Text>
        <Text style={s.chev}>{expanded ? '▾' : '▸'}</Text>
      </Pressable>
    );
  };

  const renderItem = ({ item }: any) => (
    <Pressable
      onPress={() => onOpen(item)}
      style={({ pressed }) => [s.itemRow, pressed && s.pressed]}
    >
      <Text style={s.itemText}>{item.title}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFillObject}
        resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
        imageStyle={{ opacity: 0.5 }}
      />
      <View style={{ flex: 1 }}>
        <View
          style={[
            s.header,
            { paddingTop: insets.top - 26},
          ]}
        >
          <Pressable
            onPress={() => (navigation as any)?.goBack?.()}
            style={s.backBtn}
          >
            <Text style={s.backTxt}>{'\u25C0'}</Text>
            <Text style={s.backLabel}>Back</Text>
          </Pressable>
          <Text style={s.title}>Education</Text>
          <Text style={s.subTitle}>
            CARTA-U quick reads on dosing, methods, and safety.
          </Text>
        </View>

        <ScrollView>
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => `${item.title}-${index}`}
            renderSectionHeader={renderHeader}
            renderItem={renderItem}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 32,
            }}
            ListFooterComponent={<View style={{ height: 28 }} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DEEP },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomColor: BORDER,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(18, 31, 26, 0.9)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  backTxt: {
    color: GOLD,
    fontWeight: '800',
    fontSize: 16,
    marginRight: 4,
    marginBottom: 6,
  },
  backLabel: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  title: {
    color: GOLD,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subTitle: {
    color: INK,
    fontSize: 14,
    marginTop: 4,
  },

  headerRow: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderColor: GOLD,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { color: INK, fontSize: 16, fontWeight: '700', flex: 1 },
  chev: { color: GOLD, fontSize: 24, marginLeft: 8 },

  itemRow: {
    backgroundColor: CARD,
    borderColor: '#3b3d22ff',
    borderWidth: 1,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  itemText: { color: INK, fontSize: 15 },
  pressed: { opacity: 0.6 },
});
