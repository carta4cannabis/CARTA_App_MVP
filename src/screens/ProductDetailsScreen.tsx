// app/src/screens/ProductDetailsScreen.tsx
import React, { useCallback, useMemo, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ImageBackground,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PRODUCTS_BY_ID, PRODUCT_DETAILS, IMG } from './../data/products';

const BG = require('../../assets/bg/carta_pattern.png');

const GOLD = '#C9A86A',
  DEEP = '#0E1A16',
  CARD = '#121F1A',
  INK = '#E9EFEA',
  MUTED = '#9FB3A8';

// Brand-friendly serif without extra deps
const HEADLINE_SERIF =
  Platform.select({ ios: 'Palatino', android: 'serif' }) || 'serif';

type AnyNav = any;

export default function ProductDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<AnyNav>();

  const productId: string | undefined = route.params?.productId;

  const product = productId ? PRODUCTS_BY_ID[productId] : undefined;
  const detail = productId ? PRODUCT_DETAILS[productId] : undefined;
  const hero = useMemo(() => (detail ? IMG[detail.hero] : undefined), [detail]);

  // Make header/back look like other screens
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

  if (!product || !detail) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={[s.card, { margin: 16 }]}>
          <Text style={s.title}>Product not found</Text>
          <Text style={s.body}>Please return to Products and try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFillObject}
        resizeMode={Platform.OS === 'ios' ? 'repeat' : 'cover'}
        imageStyle={{ opacity: 0.5 }}
      />
      <View style={s.header}>
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={s.backBtn}
              >
                <Text style={s.backText}>{'\u25C0'}</Text>
                <Text style={s.backLabel}>Back</Text>
              </Pressable>
              <Text style={s.title}>Product Details</Text>
            </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={s.card}>
          <Image source={hero} style={s.hero} resizeMode="contain" />
          <Text style={s.name}>{product.name}</Text>
          <Text style={s.tag}>{product.tag}</Text>
          <Text style={s.body}>{detail.description}</Text>
        </View>

        {/* Composition */}
        {(detail.cannabinoids?.length ||
          detail.terpenes?.length ||
          detail.botanicals?.length ||
          detail.nutrients?.length) && (
          <View style={s.card}>
            <Text style={s.heading}>Composition</Text>
            {detail.cannabinoids?.length ? (
              <Text style={s.item}>
                <Text style={s.k}>Cannabinoids: </Text>
                {detail.cannabinoids.join(', ')}
              </Text>
            ) : null}
            {detail.terpenes?.length ? (
              <Text style={s.item}>
                <Text style={s.k}>Terpenes: </Text>
                {detail.terpenes.join(', ')}
              </Text>
            ) : null}
            {detail.botanicals?.length ? (
              <Text style={s.item}>
                <Text style={s.k}>Botanicals: </Text>
                {detail.botanicals.join(', ')}
              </Text>
            ) : null}
            {detail.nutrients?.length ? (
              <Text style={s.item}>
                <Text style={s.k}>Nutrients: </Text>
                {detail.nutrients.join(', ')}
              </Text>
            ) : null}
          </View>
        )}

        {/* Dosing */}
        <View style={s.card}>
          <Text style={s.heading}>Dosing</Text>
          <Text style={s.item}>
            <Text style={s.k}>Time: </Text>
            {detail.dosing.time}
          </Text>
          <Text style={s.item}>
            <Text style={s.k}>Start: </Text>
            {detail.dosing.start}
          </Text>
          <Text style={s.item}>
            <Text style={s.k}>Titration: </Text>
            {detail.dosing.titration}
          </Text>
          {detail.dosing.notes ? (
            <Text style={s.item}>
              <Text style={s.k}>Notes: </Text>
              {detail.dosing.notes}
            </Text>
          ) : null}
        </View>

        {/* Safety */}
        <View style={s.card}>
          <Text style={s.heading}>Safety</Text>
          {!!detail.precautions.length && (
            <Text style={s.item}>
              <Text style={s.k}>Precautions: </Text>
              {detail.precautions.join(' • ')}
            </Text>
          )}
          {!!detail.interactions?.length && (
            <Text style={s.item}>
              <Text style={s.k}>Interactions: </Text>
              {detail.interactions!.join(' • ')}
            </Text>
          )}
          {!!detail.allergies?.length && (
            <Text style={s.item}>
              <Text style={s.k}>Allergies: </Text>
              {detail.allergies!.join(' • ')}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DEEP },
   header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
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
      marginBottom: 4,
    },
    backLabel: {
      color: GOLD,
      fontFamily: HEADLINE_SERIF,
      fontSize: 15,
      fontWeight: '500',
      marginBottom: 0,
    },
  card: {
    backgroundColor: CARD,
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  hero: {
    width: '100%',
    height: 280,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#0F1713',
  },
  name: {
    color: INK,
    fontFamily: HEADLINE_SERIF,
    fontSize: 22,
    fontWeight: '800',
  },
  tag: { color: MUTED, fontFamily: HEADLINE_SERIF, marginBottom: 8 },
  title: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  heading: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  k: { color: INK, fontSize: 14, fontWeight: '700' },
  body: { color: INK, fontFamily: HEADLINE_SERIF, marginTop: 6 },
  item: { color: MUTED, fontWeight: '200', fontFamily: HEADLINE_SERIF, marginBottom: 6 },
});
