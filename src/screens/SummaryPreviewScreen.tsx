import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SummaryPreviewScreen({ route }: any) {
  const html = route?.params?.html as string | undefined;

  async function tryPrint() {
    if (!html) return;
    try {
      const { printToFileAsync } = await import('expo-print'); // optional
      const { uri } = await printToFileAsync({ html });
      try {
        const Sharing = await import('expo-sharing');
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
        else Alert.alert('PDF created', uri);
      } catch {
        Alert.alert('PDF created', uri);
      }
    } catch {
      Alert.alert('Printing not available', 'Install expo-print / expo-sharing to export a PDF.');
    }
  }

  return (
    <ScrollView contentContainerStyle={s.wrap} style={{ backgroundColor: '#0F1914' }}>
      <Text style={s.h1}>Clinician Summary (Preview)</Text>
      {!html ? (
        <Text style={s.body}>No content provided.</Text>
      ) : (
        <>
          <View style={s.card}>
            <Text selectable style={s.body}>
              This is a lightweight preview (plain text). Use **Clinician PDF** in Coach to export a formatted PDF.
            </Text>
          </View>
          <View style={s.card}>
            <Text selectable style={[s.body, { fontFamily: 'Menlo' }]}>{html.replace(/<[^>]+>/g, '')}</Text>
          </View>
          <Pressable style={s.btn} onPress={tryPrint}>
            <Text style={s.btnTxt}>Try Export to PDF</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 32 },
  h1: { color: '#E9EFEA', fontSize: 22, fontWeight: '700', marginBottom: 10 },
  card: { backgroundColor: '#12221A', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#3A4B40', marginBottom: 14 },
  body: { color: '#D9E2DC', fontSize: 14, lineHeight: 20 },
  btn: { backgroundColor: '#2A3A31', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#405247' },
  btnTxt: { color: '#E9EFEA', fontWeight: '600', textAlign: 'center' },
});