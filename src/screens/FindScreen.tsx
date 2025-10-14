import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Linking } from 'react-native';

export default function FindScreen() {
  const openMaps = () => {
    const q = encodeURIComponent('cannabis dispensary');
    const url = Platform.select({
      ios: `maps://?q=${q}`,
      android: `geo:0,0?q=${q}`,
      default: `https://www.google.com/maps/search/${q}`,
    }) as string;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Find a Dispensary</Text>
      <Text style={s.note}>We’ll open your maps app with nearby results.</Text>
      <Pressable style={s.btn} onPress={openMaps}><Text style={s.btnTxt}>Open Maps</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E1411', padding: 20 },
  title: { color: '#E9EFEA', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  note: { color: '#BFD4CB', marginBottom: 16, textAlign: 'center' },
  btn: { backgroundColor: '#C9A86A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  btnTxt: { color: '#111', fontWeight: '700' },
});
