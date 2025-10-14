import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

type Nav = any;

type Product = {
  id: string;
  name: string;
  subtitle?: string;
  image: any;
  // keep a concise details payload so details screen never says "not found"
  cannabinoids?: string[];
  terpenes?: string[];
  botanicals?: string[];
  nutrients?: string[];
};

const PRODUCTS: Product[] = [
  {
    id: 'calm_focus',
    name: 'Calm & Focus — Capsules',
    image: require('../../assets/products/calm_focus_daytime.png'),
    cannabinoids: ['CBD-dominant', 'CBG (support)'],
    terpenes: ['Limonene', 'Pinene'],
    botanicals: ['L-Theanine', 'Rhodiola'],
    nutrients: ['B6', 'Magnesium'],
  },
  {
    id: 'mood_uplift',
    name: 'Mood & Uplift — Capsules',
    image: require('../../assets/products/mood_uplift_daytime.png'),
    cannabinoids: ['CBD balanced', 'Low THC'],
    terpenes: ['Limonene', 'Beta-Caryophyllene'],
    botanicals: ['Saffron', '5-HTP'],
    nutrients: ['B12', 'Folate'],
  },
  {
    id: 'mobility_function',
    name: 'Mobility & Function — Capsules',
    image: require('../../assets/products/mobility_function.png'),
    cannabinoids: ['CBD + CBDA'],
    terpenes: ['Myrcene', 'Humulene'],
    botanicals: ['Turmeric', 'Boswellia'],
    nutrients: ['D3', 'Omega-3 (concept)'],
  },
  {
    id: 'digestive_support',
    name: 'Digestive Support — Capsules',
    image: require('../../assets/products/digestive_support.png'),
    cannabinoids: ['CBD', 'CBG (support)'],
    terpenes: ['Linalool', 'Caryophyllene'],
    botanicals: ['Ginger', 'Peppermint'],
    nutrients: ['Electrolyte blend'],
  },
  {
    id: 'metabolic_wellness',
    name: 'Metabolic Wellness — Capsules',
    image: require('../../assets/products/metabolic_wellness.png'),
    cannabinoids: ['CBD'],
    terpenes: ['Terpinolene'],
    botanicals: ['Cinnamon', 'Berberine (concept)'],
    nutrients: ['Chromium'],
  },
  {
    id: 'mind_memory',
    name: 'Mind & Memory — Capsules',
    image: require('../../assets/products/mind_memory.png'),
    cannabinoids: ['CBD + CBG'],
    terpenes: ['Pinene', 'Limonene'],
    botanicals: ['Ginkgo', 'Bacopa'],
    nutrients: ['Choline'],
  },
  {
    id: 'rest_restore',
    name: 'Rest & Restore — Capsules',
    image: require('../../assets/products/rest_restore_nighttime.png'),
    cannabinoids: ['CBD + CBN'],
    terpenes: ['Linalool', 'Myrcene'],
    botanicals: ['Valerian', 'Chamomile'],
    nutrients: ['Glycine', 'Magnesium'],
  },
  {
    id: 'intimacy_caps',
    name: 'Intimacy & Vitality — Capsules',
    image: require('../../assets/products/intimacy_vitality_capsule.png'),
    cannabinoids: ['CBD + THCV (low)'],
    terpenes: ['Limonene', 'Caryophyllene'],
    botanicals: ['Maca', 'Ginseng'],
    nutrients: ['Zinc'],
  },
  {
    id: 'thc_stacker_spray',
    name: 'THC Stacker Spray',
    image: require('../../assets/products/thc_stacker_spray.jpg'),
    cannabinoids: ['THC concentrate (metered)'],
    terpenes: ['Neutral carrier'],
    botanicals: [],
    nutrients: [],
  },
  {
    id: 'booster_spray',
    name: 'Universal Booster Spray',
    image: require('../../assets/products/universal_booster_spray.jpg'),
    cannabinoids: ['CBD broad spectrum'],
    terpenes: ['Neutral carrier'],
    botanicals: [],
    nutrients: [],
  },
];

export default function ProductsScreen() {
  const navigation = useNavigation<Nav>();

  const openDetails = (product: Product) => {
    // Pass the full object so details can’t “miss”
    navigation.navigate('ProductDetails', { 
      id: item.id ?? item.key ?? item.detailsKey ?? item.slug ?? item.name,
      product: item,
     })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.name}>{item.name}</Text>
            <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={() => openDetails(item)}>
              <Text style={styles.btnText}>Details</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const GOLD = '#C9A86A';
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1A16' },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: '#15221D',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GOLD,
    margin: 6,
    padding: 10,
  },
  image: { width: '100%', height: 120, marginBottom: 8 },
  name: { color: '#E9EFEA', fontWeight: '700', marginBottom: 8 },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: '#1C2B25',
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  btnPressed: { opacity: 0.85 },
  btnText: { color: '#E9EFEA', fontWeight: '600' },
});

