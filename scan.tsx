import * as React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

export default function Scan() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = React.useState(false);

  React.useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const onBarcodeScanned = ({ data, type }: { data: string; type: string }) => {
    if (scanned) return;
    setScanned(true);
    Alert.alert('Barcode scanned', `Type: ${type}\nData: ${data}`, [
      { text: 'Copy', onPress: () => { try { navigator.clipboard?.writeText?.(data); } catch {} } },
      { text: 'Done', onPress: () => router.back() },
      { text: 'Scan Again', onPress: () => setScanned(false) }
    ]);
  };

  if (!permission) return <Centered><Text>Checking camera permission…</Text></Centered>;
  if (!permission.granted) {
    return (
      <Centered>
        <Text style={{ textAlign: 'center', padding: 16 }}>
          Camera access is required to scan barcodes. Please enable it in Settings.
        </Text>
      </Centered>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39']
        }}
        onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
      />
      <View style={styles.overlayTop}><Text style={styles.overlayText}>Align code within frame</Text></View>
      <View style={styles.frame} />
      <View style={styles.overlayBottom}><Text style={styles.overlayText}>{scanned ? 'Paused' : 'Scanning…'}</Text></View>
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>{children}</View>;
}

const FRAME_SIZE = 280;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 120,
  },
  overlayTop: {
    position: 'absolute',
    top: 60,
    left: 0, right: 0,
    alignItems: 'center'
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 60,
    left: 0, right: 0,
    alignItems: 'center'
  },
  overlayText: {
    color: 'white',
    fontSize: 16
  }
});
