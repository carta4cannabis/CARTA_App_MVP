// app/src/screens/ScannerScreen.tsx
// NOTE: this screen uses ONLY expo-camera. If you still have `expo-barcode-scanner`
// installed in package.json, uninstall it (npm uninstall expo-barcode-scanner) so
// Android stops failing on :expo-barcode-scanner:compileReleaseKotlin.

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  // ask once on load
  useEffect(() => {
    if (permission?.status === 'undetermined') {
      requestPermission();
    }
  }, [permission?.status, requestPermission]);

  const onScanned = useCallback(
    ({ data }: { data?: string }) => {
      // no data, ignore
      if (!data) return;

      setScanned(true);
      setLast(String(data));

      const isUrl = /^https?:\/\//i.test(data);

      Alert.alert(
        'Scanned',
        String(data),
        [
          isUrl
            ? {
                text: 'Open',
                onPress: () => Linking.openURL(data).catch(() => {}),
              }
            : undefined,
          {
            text: 'Scan again',
            onPress: () => setScanned(false),
          },
          { text: 'OK', style: 'cancel' },
        ].filter(Boolean) as any
      );
    },
    []
  );

  // still loading permission object
  if (!permission) {
    return (
      <SafeAreaView style={s.center}>
        <Text style={s.title}>Preparing camera…</Text>
        <Pressable onPress={requestPermission} style={s.button}>
          <Text style={s.buttonText}>Grant Permission</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // denied UI
  if (!permission.granted) {
    return (
      <SafeAreaView style={s.center}>
        <Text style={s.title}>Camera blocked</Text>
        <Text style={s.text}>
          Enable camera access to scan CARTA product codes.
        </Text>
        <View style={s.row}>
          <Pressable onPress={requestPermission} style={s.button}>
            <Text style={s.buttonText}>Ask Again</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openSettings()}
            style={[s.button, s.alt]}
          >
            <Text style={[s.buttonText, { color: '#E9EFEA' }]}>
              Open Settings
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // scanner UI
  return (
    <SafeAreaView style={s.container}>
      <View style={s.box}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          // pick the types you want
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'ean13', 'ean8', 'code128'],
          }}
          // when we already scanned, stop sending events
          onBarcodeScanned={scanned ? undefined : onScanned}
        />
        {/* visual frame */}
        <View style={s.frame} />
      </View>

      <View style={s.footer}>
        <Text style={s.hint}>Align the code inside the frame</Text>
        {last ? <Text style={s.last}>Last: {last}</Text> : null}

        <Pressable
          style={[s.button, !scanned && s.disabled]}
          onPress={() => setScanned(false)}
          disabled={!scanned}
        >
          <Text style={s.buttonText}>
            {scanned ? 'Scan Again' : 'Ready to Scan'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E1412' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0E1412',
  },
  title: {
    color: '#E9EFEA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  text: { color: '#C8D1CC', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  box: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  frame: {
    position: 'absolute',
    top: '18%',
    bottom: '18%',
    left: '10%',
    right: '10%',
    borderWidth: 3,
    borderColor: '#C9A86A',
    borderRadius: 12,
  },
  footer: { padding: 16, alignItems: 'center', gap: 8 },
  hint: { color: '#E9EFEA' },
  last: { color: '#9FB0A8', fontSize: 12 },
  button: {
    backgroundColor: '#C9A86A',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: { color: '#0E1412', fontWeight: '700' },
  alt: { backgroundColor: '#26352F' },
  disabled: { opacity: 0.6 },
});
