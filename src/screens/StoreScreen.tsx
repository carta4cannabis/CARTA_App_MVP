
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// canonical data source
import { PRODUCT_LIST } from '../data/products';

export default function StoreScreen() {
  const nav = useNavigation<any>();

  return (
    <View style={s.wrap}>
      <FlatList
        contentContainerStyle={s.list}
        data={PRODUCT_LIST}
        keyExtractor={(it: any) => String(it.id)}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Image source={item.image} style={s.image} resizeMode="contain" />
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.price}>${item.priceUSD}</Text>
            <Pressable
              style={s.btn}
              onPress={() => nav.navigate('ProductDetails', { productId: item.id })}
            >
              <Text style={s.btnText}>Details</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0E1411' },
  list: { padding: 12 },
  card: {
    width: '48%', backgroundColor: '#101915',
    borderWidth: 1, borderColor: '#1F2C27', borderRadius: 12,
    padding: 10, margin: '1%', alignItems: 'center',
  },
  image: { width: '100%', height: 110 },
  title: { color: '#E9EFEA', fontWeight: '700', fontSize: 13, textAlign: 'center', marginTop: 8 },
  price: { color: '#BFD4CB', marginTop: 4, marginBottom: 8 },
  btn: { borderWidth: 1, borderColor: '#C9A86A', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  btnText: { color: '#C9A86A', fontWeight: '700' },
});
