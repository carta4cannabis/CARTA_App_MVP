import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function RetailerScreen() {
  const nav = useNavigation<any>();
  const [query, setQuery] = useState('CARTA dispensary');

  const openMaps = () => {
    const q = encodeURIComponent(query.trim() || 'CARTA dispensary');
    // Works on iOS or Android – system will route to Apple/Google Maps
    Linking.openURL(`https://www.google.com/maps/search/${q}`);
  };

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()}><Text style={s.back}>&lt; Back</Text></Pressable>
        <Text style={s.title}>Find a Store</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={s.body}>
        <Text style={s.label}>Search</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Retailer or city/ZIP"
          placeholderTextColor="#8FA69A"
          style={s.input}
          returnKeyType="search"
          onSubmitEditing={openMaps}
        />
        <Pressable style={s.button} onPress={openMaps}>
          <Text style={s.buttonText}>Open in Maps</Text>
        </Pressable>

        <Text style={s.note}>
          Tip: Your device’s Maps app will show nearby results. You can refine the query above before opening.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E1C17' },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#0E1C17', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: '#C9D5CF', fontSize: 16 },
  title: { color: '#F7E8BE', fontSize: 18, fontWeight: '700' },
  body: { padding: 20, gap: 12 },
  label: { color: '#C9D5CF', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#2B584A', backgroundColor: '#11261F', color: '#F7E8BE',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12
  },
  button: { marginTop: 8, backgroundColor: '#F7E8BE', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#0E1C17', fontWeight: '700' },
  note: { marginTop: 10, color: '#8FA69A' }
});
