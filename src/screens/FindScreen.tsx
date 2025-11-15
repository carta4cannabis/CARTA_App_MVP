import React, { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect, useReducer, useContext } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Linking, ImageBackground} from 'react-native';

const BG = require('../../assets/bg/carta_pattern.png');
const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const INK = '#E9EFEA';
const MUTED = '#9FB0A5';
const BORDER = '#233229';
// Brand-friendly serif without extra deps
const HEADLINE_SERIF =
  Platform.select({ ios: 'Palatino', android: 'serif' }) || 'serif';

type AnyNav = any;

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
    <ImageBackground source={BG} style={{flex:1}} resizeMode="repeat" imageStyle={{opacity:0.50}}>
<View style={s.wrap}>
      <Text style={s.title}>Find a Dispensary</Text>
      <Text style={s.note}>We’ll open your maps app with nearby results.</Text>
      <Pressable style={s.btn} onPress={openMaps}><Text style={s.btnTxt}>Open Maps</Text></Pressable>
    </View>
</ImageBackground>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E1411', padding: 20 },
  backTxt: {
    color: GOLD,
    fontWeight: '800',
    fontFamily: HEADLINE_SERIF, fontSize: 16,
    marginRight: 4,
    marginBottom: 6,
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
  note: { color: '#BFD4CB', fontFamily: HEADLINE_SERIF, marginBottom: 16, textAlign: 'center' },
  btn: { backgroundColor: '#C9A86A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  btnTxt: { color: '#111', fontFamily: HEADLINE_SERIF, fontWeight: '700' },
});