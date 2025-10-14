import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { NavHeader } from '../components/NavHeader';

export const PrivacyScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <NavHeader title="Privacy" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.h1}>Your Privacy</Text>
        <Text style={styles.p}>
          This MVP stores notes and scan history locally on your device. We do not
          collect personal information or share your data with third parties.
        </Text>

        <Text style={styles.h2}>Permissions we request</Text>
        <Text style={styles.p}>• Camera — for scanning product QR/barcodes</Text>
        <Text style={styles.p}>• Files/Share Sheet — to export handouts you choose</Text>

        <Text style={styles.h2}>Contact</Text>
        <Text
          onPress={() => Linking.openURL('mailto:info@cartamn.com')}
          style={[styles.p, styles.link]}
        >
          info@cartamn.com
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1f1c' },
  body: { padding: 16, gap: 8 },
  h1: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  h2: { color: '#cff7ee', fontSize: 16, fontWeight: '700', marginTop: 12 },
  p: { color: '#e9fffb', opacity: 0.9, lineHeight: 20 },
  link: { color: '#6ee7d2', textDecorationLine: 'underline' },
});

export default PrivacyScreen;
