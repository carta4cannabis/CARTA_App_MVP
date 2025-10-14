import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable, Linking } from 'react-native';

export default function MoreScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.h1}>About</Text>
          <Text style={s.body}>
            CARTA builds chemotype-guided formulations and simple, guided tools that help adults tailor cannabis and botanicals to their goals.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.h1}>Privacy</Text>
          <Text style={s.body}>
            We collect only the data necessary to operate the app (e.g., session entries you choose to save on your device). We do not sell personal data.
          </Text>
          <Text style={s.body}>
            Location access (if granted) is used to show nearby stores. You can revoke permissions at any time in your device settings.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.h1}>Disclaimer</Text>
          <Text style={s.body}>
            For adults 21+ where legal. Products are not intended to diagnose, treat, cure, or prevent any disease. App content is for education only and not a substitute for medical advice. Speak with a healthcare professional before use, especially if pregnant, nursing, or taking medications.
          </Text>
          <Text style={s.body}>
            Effects vary by individual; start low, go slow. Keep out of reach of children and pets.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.h1}>Contact</Text>
          <Text style={s.body}>Email: <Text style={s.bold}>carta4cannabis@gmail.com</Text></Text>
          <Pressable onPress={() => Linking.openURL('https://carta4cannabis.com')}
            style={({ pressed }) => [s.link, pressed && { opacity: 0.7 }]}>
            <Text style={s.linkText}>Visit Website</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1216' },
  content: { padding: 16 },
  card: { backgroundColor: '#101914', borderColor: '#2A3A34', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  h1: { color: '#E9EFEA', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  body: { color: '#DCE7E2', marginTop: 4, lineHeight: 20 },
  bold: { fontWeight: '700' },
  link: { marginTop: 10, paddingVertical: 8, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#C9A86A', backgroundColor: '#112018' },
  linkText: { color: '#E9EFEA', fontWeight: '600' },
});
