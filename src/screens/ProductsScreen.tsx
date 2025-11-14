// app/src/screens/ProductsScreen.tsx
import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ImageBackground,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PRODUCTS, IMG } from './../data/products';

const BG = require('../../assets/bg/carta_pattern.png');

const GOLD = '#C9A86A',
  DEEP = '#0E1A16',
  CARD = '#121F1A',
  INK = '#E9EFEA',
  MUTED = '#9FB3A8';

function BackHeader({ title }: { title: string }) {
  const nav = useNavigation<any>();
  const goBack = () => {
    if (nav.canGoBack && nav.canGoBack()) nav.goBack();
    else nav.navigate('Tabs' as never, { screen: 'Home' } as never);
  };
  return (
    <View style={styles.header}>
      <Pressable
        onPress={goBack}
        style={({ pressed }) => [
          styles.backBtn,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={styles.backTxt}>{'\u25C0'}</Text>
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

export default function ProductsScreen() {
  const nav = useNavigation<any>();

  useLayoutEffect(() => {
    nav.setOptions?.({ headerShown: false });
  }, [nav]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: DEEP }}>
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFillObject}
        resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
        imageStyle={{ opacity: 0.5 }}
      />
<BackHeader title="Products" />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        

        <View style={styles.grid}>
          {PRODUCTS.map(p => (
            <View key={p.id} style={styles.card}>
              <Image
                source={IMG[p.imageKey]}
                style={styles.hero}
                resizeMode="contain"
              />
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.tag}>{p.tag}</Text>
              <Pressable
                onPress={() =>
                  nav.navigate(
                    'ProductDetails' as never,
                    { productId: p.id } as never,
                  )
                }
                style={({ pressed }) => [
                  styles.btn,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.btnTxt}>Details</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderBottomColor: '#233229',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(18, 31, 26, 0.9)',
    marginBottom: 16,
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
    marginBottom: 4,
  },
  backLabel: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },

  headerTitle: {
    color: GOLD,
    fontSize: 26,
    fontWeight: '800',
  },

  grid: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },

  hero: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#0F1713',
  },

  name: { color: INK, fontWeight: '800', marginBottom: 4 },
  tag: { color: MUTED, marginBottom: 10 },

  btn: {
    alignSelf: 'flex-start',
    backgroundColor: GOLD,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  btnTxt: {
    color: DEEP,
    fontWeight: '800',
  },
});
