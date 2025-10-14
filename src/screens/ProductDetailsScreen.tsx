import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

/** ----- Robust PRODUCTS import (array or dictionary) ----- */
let PRODUCTS_ANY: any = [];
try {
  // common location
  PRODUCTS_ANY = require('../data/products').PRODUCTS ??
                 require('../data/products').default ??
                 require('../data/products');
} catch {}
try {
  if (!PRODUCTS_ANY || (Array.isArray(PRODUCTS_ANY) && PRODUCTS_ANY.length === 0)) {
    // fallback location
    PRODUCTS_ANY = require('../products').PRODUCTS ??
                   require('../products').default ??
                   require('../products');
  }
} catch {}
const PRODUCTS: any = PRODUCTS_ANY ?? [];

/** ----- Helpers ----- */
type AnyRoute = RouteProp<Record<string, any>, string>;

const norm = (v: any) =>
  String(v ?? '')
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
    .trim();

const flattenProducts = (src: any): any[] =>
  Array.isArray(src) ? src : src && typeof src === 'object' ? Object.values(src) : [];

const tryMatch = (p: any, q: string) => {
  const keys = [
    p?.id,
    p?.key,
    p?.detailsKey,
    p?.slug,
    p?.sku,
    p?.name,
    p?.imageKey,
  ]
    .filter(Boolean)
    .map(norm);
  return keys.includes(norm(q));
};

const resolveProduct = (params: any) => {
  // 1) if the whole product was passed, just use it
  const direct = params?.product ?? params?.p;
  if (direct) return direct;

  const list = flattenProducts(PRODUCTS);

  // 2) by explicit id/key-ish fields
  const q =
    params?.id ??
    params?.productId ??
    params?.key ??
    params?.detailsKey ??
    params?.slug ??
    params?.name;
  if (q) {
    const byKey = list.find((p) => tryMatch(p, q));
    if (byKey) return byKey;
  }

  // 3) by numeric index (from grid)
  if (typeof params?.index === 'number' && list[params.index]) {
    return list[params.index];
  }

  // 4) last resort: first item (prevents crash, still shows “not found” UI if missing)
  return undefined;
};

/** ----- UI helpers ----- */
const SectionList = ({
  title,
  data,
}: {
  title: string;
  data?: string[] | string | null;
}) => {
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={s.sectionLabel}>{title}</Text>
      {Array.isArray(data) ? (
        <View style={{ marginTop: 6 }}>
          {data.map((it, i) => (
            <View key={`${title}-${i}`} style={s.bulletRow}>
              <Text style={s.bullet}>•</Text>
              <Text style={s.body}>{it}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[s.body, { marginTop: 6 }]}>{data}</Text>
      )}
    </View>
  );
};

export default function ProductDetailsScreen() {
  const route = useRoute<AnyRoute>();
  const product = useMemo(() => resolveProduct(route.params), [route.params]);

  if (!product) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={[s.container, { alignItems: 'center' }]}>
          <Text style={s.title}>Product not found</Text>
          {__DEV__ && (
            <Text style={[s.body, { marginTop: 8, textAlign: 'center' }]}>
              Params seen: {JSON.stringify(route.params)}
            </Text>
          )}
          <Text style={[s.muted, { marginTop: 6, textAlign: 'center' }]}>
            Go back to Products and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const imgSource =
    typeof product.image === 'number'
      ? product.image
      : product.image
      ? { uri: product.image }
      : undefined;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
        {imgSource && (
          <Image
            source={imgSource}
            resizeMode="contain"
            style={s.hero}
            accessibilityIgnoresInvertColors
          />
        )}

        <Text style={s.title}>{product.name}</Text>

        {product.description ? (
          <>
            <Text style={s.sectionLabel}>What it does</Text>
            <Text style={s.body}>{product.description}</Text>
          </>
        ) : null}

        {product.chemotype && (
          <View style={{ marginTop: 14 }}>
            <Text style={s.sectionLabel}>Major Cannabinoid Profile</Text>
            <Text style={s.body}>{product.chemotype}</Text>
          </View>
        )}

        {(product.bestTime ||
          product.dosing?.start ||
          product.dosing?.titrate ||
          product.dosing?.notes) && (
          <View style={{ marginTop: 14 }}>
            <Text style={s.sectionLabel}>Recommended Use</Text>
            <View style={{ marginTop: 6 }}>
              {product.bestTime ? (
                <View style={s.bulletRow}>
                  <Text style={s.bold}>Best time: </Text>
                  <Text style={s.body}>{product.bestTime}</Text>
                </View>
              ) : null}
              {product.dosing?.start ? (
                <View style={s.bulletRow}>
                  <Text style={s.bold}>Start: </Text>
                  <Text style={s.body}>{product.dosing.start}</Text>
                </View>
              ) : null}
              {product.dosing?.titrate ? (
                <View style={s.bulletRow}>
                  <Text style={s.bold}>Titrate: </Text>
                  <Text style={s.body}>{product.dosing.titrate}</Text>
                </View>
              ) : null}
              {product.dosing?.notes ? (
                <Text style={[s.muted, { marginTop: 6 }]}>{product.dosing.notes}</Text>
              ) : null}
            </View>
          </View>
        )}

        {/* Order: Cannabinoids → Terpenes → Botanicals → Nutrients */}
        <SectionList title="Cannabinoids" data={product.cannabinoids} />
        <SectionList title="Terpenes" data={product.terpenes} />
        <SectionList title="Botanicals" data={product.botanicals} />
        <SectionList title="Nutrients" data={product.nutrients} />

        {/* Optional extras if present */}
        <SectionList title="How to use" data={product.usageGuide} />
        <SectionList title="Precautions" data={product.precautions} />
        <SectionList title="Drug/Condition Interactions" data={product.interactions} />
        <SectionList title="Potential Allergies" data={product.allergies} />

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------- premium theme -------- */
const GOLD = '#D4AF37';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const TEXT = '#E9EFEA';
const MUTED = '#9FB3A8';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DEEP },
  container: { padding: 16, paddingBottom: 28 },
  hero: {
    width: '100%',
    height: 220,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: '#203129',
  },
  title: { fontSize: 22, fontWeight: '800', color: TEXT, marginBottom: 6 },
  sectionLabel: {
    color: TEXT,
    fontWeight: '700',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 4,
  },
  body: { color: TEXT, fontSize: 14, lineHeight: 20 },
  bold: { color: TEXT, fontWeight: '700', fontSize: 14 },
  muted: { color: MUTED, fontSize: 13 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, gap: 6 },
  bullet: { color: GOLD, marginTop: Platform.OS === 'ios' ? 1 : 0 },
});