import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PRODUCTS, Product } from '../data/products';

type RootStackParamList = {
  Products: undefined;
  ProductDetails: { id: Product['id'] };
};

export default function ProductsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={s.safe}>
      <View style={s.headerRow}>
        <Text style={s.h1}>Products</Text>
        <Pressable
          onPress={() => Linking.openURL('https://carta4cannabis.com')}
          style={s.siteBtn}
        >
          <Text style={s.siteBtnText}>Visit Website</Text>
        </Pressable>
      </View>

      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Image source={item.image} style={s.img} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{item.title}</Text>
              {!!item.subtitle && <Text style={s.sub}>{item.subtitle}</Text>}
              <View style={s.row}>
                <Pressable
                  style={s.detailsBtn}
                  onPress={() => nav.navigate('ProductDetails', { id: item.id })}
                >
                  <Text style={s.detailsText}>Details</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C1512' },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h1: { color: '#E9EFEA', fontSize: 22, fontWeight: '700' },
  siteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#132822',
    borderWidth: 1,
    borderColor: '#29433A',
  },
  siteBtnText: { color: '#E9EFEA', fontWeight: '600' },
  card: {
    backgroundColor: '#0F1E1A',
    borderWidth: 1,
    borderColor: '#1F2C27',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  img: { width: 88, height: 88 },
  title: { color: '#E9EFEA', fontWeight: '700' },
  sub: { color: '#9FB0A8', marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  detailsBtn: {
    backgroundColor: '#C9A86A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailsText: { color: '#0C1512', fontWeight: '700' },
});
