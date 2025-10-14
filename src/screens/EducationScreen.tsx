// app/src/screens/EducationScreen.tsx
// @ts-nocheck
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HANDOUT_SECTIONS } from '../data/handouts.generated';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EducationScreen() {
  const navigation = useNavigation();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // Convert handouts {items} to SectionList-friendly {data}
  const sections = useMemo(
    () =>
      (HANDOUT_SECTIONS || []).map((s: any) => ({
        id: String(s.id),
        title: String(s.title),
        data: open[String(s.id)] ? (s.items || []) : [], // only show items when expanded
        count: (s.items || []).length,
      })),
    [open]
  );

  const toggle = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const onOpen = useCallback((item: { title: string; asset: number }) => {
    if (typeof item?.asset !== 'number') {
      console.warn('Handout requires a require(...) numeric asset:', item?.title);
      return;
    }
    // Navigate inside the Education stack (registered in App.tsx)
    navigation.navigate('HandoutViewer' as never, {
      title: item.title,
      assetId: item.asset,
    } as never);
  }, [navigation]);

  const renderHeader = ({ section }: any) => {
    const expanded = !!open[section.id];
    return (
      <Pressable onPress={() => toggle(section.id)} style={styles.headerRow}>
        <Text style={styles.headerText}>{section.title}</Text>
        <Text style={styles.chev}>{expanded ? '▾' : '▸'}</Text>
      </Pressable>
    );
  };

  const renderItem = ({ item }: any) => (
    <Pressable onPress={() => onOpen(item)} style={({ pressed }) => [styles.itemRow, pressed && styles.pressed]}>
      <Text style={styles.itemText}>{item.title}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderSectionHeader={renderHeader}
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.content}
        ListFooterComponent={<View style={{ height: 28 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1916' },
  content: { padding: 16, paddingTop: 12 },
  headerRow: {
    backgroundColor: '#12221D',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { color: '#E9EFEA', fontSize: 16, fontWeight: '700', flex: 1 },
  chev: { color: '#C9A86A', fontSize: 16, marginLeft: 8 },
  itemRow: {
    backgroundColor: '#0F1B17',
    borderColor: '#1F2C27',
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  itemText: { color: '#E9EFEA', fontSize: 15 },
  pressed: { opacity: 0.6 },
});



