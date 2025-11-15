// @ts-nocheck
// app/src/screens/ScannerScreen.tsx
import React, {
  useCallback,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ImageBackground,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import { lookupProductIdFromScan } from '../utils/scanMap';

const BG = require('../../assets/bg/carta_pattern.png');

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';
const INK = '#E9EFEA';
const MUTED = '#9FB0A5';
const BORDER = '#1E2B26';
// Brand-friendly serif without extra deps
const HEADLINE_SERIF =
  Platform.select({ ios: 'Palatino', android: 'serif' }) || 'serif';

type AnyNav = any;

function parseCoaFromScan(raw: string | undefined | null) {
  if (!raw) return null;
  const text = String(raw).trim();
  let initial: any = null;

  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      initial = parsed.coa || parsed;
    } catch {
      initial = null;
    }
  }

  if (!initial && text.startsWith('carta-coa?')) {
    const query = text.split('?', 2)[1] || '';
    const obj: Record<string, number> = {};
    query.split('&').forEach(pair => {
      if (!pair) return;
      const [k, v] = pair.split('=');
      if (!k || !v) return;
      const key = decodeURIComponent(k);
      const val = decodeURIComponent(v);
      const num = parseFloat(val);
      if (!isNaN(num)) obj[key] = num;
    });
    if (Object.keys(obj).length > 0) {
      initial = obj;
    }
  }

  return initial;
}

export default function ScannerScreen() {
  const nav = useNavigation();

  useLayoutEffect(() => {
    (nav as any).setOptions?.({ headerShown: false });
  }, [nav]);

  const [permission, requestPermission] = useCameraPermissions();
  const hasPerm = permission?.granted === true;

  const canScanRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      canScanRef.current = true;
      return () => {
        canScanRef.current = false;
      };
    }, []),
  );

  const [banner, setBanner] = useState<string | null>(null);

  const onScanned = useCallback(
    (res: BarcodeScanningResult) => {
      if (!canScanRef.current) return;
      canScanRef.current = false;

      const data = String(res?.data ?? '');

      const initialCoa = parseCoaFromScan(data);
      if (initialCoa) {
        nav.navigate('CultivarProfileMatching' as never, {
          initialCoa,
        } as never);
        return;
      }

      const productId = lookupProductIdFromScan(data);
      if (productId) {
        nav.navigate('ProductDetails' as never, { productId } as never);
      } else {
        setBanner(
          'Unrecognized code. Try a different label or open products or COA tools directly.',
        );
        setTimeout(() => {
          setBanner(null);
          canScanRef.current = true;
        }, 1400);
      }
    },
    [nav],
  );

  return (
    <ImageBackground
      source={BG}
      style={{ flex: 1 }}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.5 }}
    >
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Pressable
            onPress={() => nav.goBack()}
            style={s.backBtn}
          >
            <Text style={s.backIcon}>{'\u25C0'}</Text>
                    <Text style={s.backLabel}>Back</Text>
          </Pressable>
          <Text style={s.title}>Scan a Code</Text>
          <Text style={s.subTitle}>
            Center the barcode or QR inside the frame. COA-enabled QR codes
            will open the cultivar profile matcher; product barcodes open the
            details page.
          </Text>
        </View>

        <View style={s.card}>
          {!permission ? (
            <View style={{ padding: 12 }}>
              <Text style={s.cardTitle}>Requesting camera permission…</Text>
              <Text style={[s.body, { marginTop: 6 }]}>
                Please enable camera permissions to scan labels and COA QRs.
              </Text>
            </View>
          ) : hasPerm ? (
            <View style={s.scannerWrap}>
              <CameraView
                style={StyleSheet.absoluteFillObject as any}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['qr', 'ean13', 'upc_a', 'upc_e', 'code128'],
                }}
                onBarcodeScanned={onScanned}
              />
              <View pointerEvents="none" style={s.maskOuter}>
                <View style={s.maskRow} />
                <View style={s.maskCenterRow}>
                  <View style={s.maskSide} />
                  <View style={s.frame} />
                  <View style={s.maskSide} />
                </View>
                <View style={s.maskRow} />
              </View>
            </View>
          ) : (
            <View style={{ padding: 12 }}>
              <Text style={s.cardTitle}>Camera access needed</Text>
              <Text style={[s.body, { marginTop: 6 }]}>
                Please enable camera permissions to scan labels and COA QRs.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  s.btn,
                  pressed && s.pressed,
                  { marginTop: 12 },
                ]}
                onPress={requestPermission}
              >
                <Text style={s.btnText}>Grant permission</Text>
              </Pressable>
            </View>
          )}
        </View>

        {banner ? (
          <View style={s.banner}>
            <Text style={s.bannerText}>{banner}</Text>
          </View>
        ) : null}

        <View style={{ padding: 16 }}>
          <Pressable
            onPress={() => nav.navigate('Products' as never)}
            style={({ pressed }) => [s.btnGhost, pressed && s.pressed]}
          >
            <Text style={s.btnGhostText}>Browse Products Instead</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  safe: { backgroundColor: 'transparent', flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
 backIcon: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, 
    fontSize: 14,
    marginRight: 4,
    marginBottom: 0,
  },
   backLabel: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, fontSize: 15,
    fontWeight: '500',
    marginBottom: -4,
  },

  title: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, fontSize: 32,
    fontWeight: '800',
    textAlign: 'center'
  },
  subTitle: {
    color: INK,
   fontFamily: HEADLINE_SERIF,  marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 15,
  },

  card: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    margin: 16,
    marginTop: 12,
    overflow: 'hidden',
  },
  scannerWrap: { height: 360, backgroundColor: '#000' },

  maskOuter: { flex: 1 },
  maskRow: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  maskCenterRow: { height: 220, flexDirection: 'row' },
  maskSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  frame: {
    width: 260,
    borderColor: GOLD,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },

  banner: {
    alignSelf: 'center',
    backgroundColor: '#1F2D28',
    borderColor: GOLD,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bannerText: { color: INK, fontFamily: HEADLINE_SERIF,  fontWeight: '700' },

  btn: {
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnText: { color: GOLD, fontFamily: HEADLINE_SERIF, fontWeight: '700' },
  btnGhost: {
    borderColor: GOLD,
    borderWidth: 1,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },
  btnGhostText: { color: INK, fontFamily: HEADLINE_SERIF, fontSize: 15, fontWeight: '700' },

  pressed: { opacity: 0.7 },
  cardTitle: { color: INK, fontFamily: HEADLINE_SERIF, fontSize: 18, fontWeight: '800' },
  body: {
    color: INK,
   fontFamily: HEADLINE_SERIF,  fontSize: 14,
    lineHeight: 20,
    ...(Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }) as object),
  },
});
